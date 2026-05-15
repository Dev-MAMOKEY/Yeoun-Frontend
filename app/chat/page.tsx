"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { HeadphoneIcon } from "../components/icons";
import { useSessionStore } from "@/store/sessionStore";
import { usePersonaStore } from "@/store/personaStore";
import type { RsData, SessionStartResponse, UserMeResponse } from "@/lib/types";

const WAVEFORM_HEIGHTS = [
  40, 26, 62, 44, 14, 44, 26, 40, 62, 40,
  26, 14, 26, 40, 62, 14, 44, 26, 40, 62,
  40, 14, 44, 26, 40, 14, 44, 62, 26,
];

const BAR_COUNT = WAVEFORM_HEIGHTS.length;
const BAR_MIN_HEIGHT = 6;
const BAR_MAX_HEIGHT = 62;

// 응답 지연 안내 임계값 (명세: 5초 / 30초)
const SLOW_RESPONSE_MS = 5_000;
const TIMEOUT_RESPONSE_MS = 30_000;

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// 고유 id 생성
function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

// SSE 이벤트 한 블록을 { type, data }로 파싱
function parseSseEvent(raw: string): { type: string; data: string } {
  let type = "message";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) type = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  return { type, data: dataLines.join("\n") };
}

// 응답 대기 상태
type ResponseState = "idle" | "waiting" | "slow" | "timeout";

export default function Chat() {
  const router = useRouter();

  // ── 세션 store ──
  const sessionId = useSessionStore((s) => s.sessionId);
  const setSessionId = useSessionStore((s) => s.setSessionId);
  const addMessage = useSessionStore((s) => s.addMessage);
  const setMediaReady = useSessionStore((s) => s.setMediaReady);
  const clearSession = useSessionStore((s) => s.clearSession);
  const persona = usePersonaStore((s) => s.persona);

  // ── 녹음 상태 ──
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(WAVEFORM_HEIGHTS);

  // ── 대화/응답 상태 ──
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [idleClips, setIdleClips] = useState<number[]>([]);
  const [idleIndex, setIdleIndex] = useState(0);
  // 답변 미디어 URL — 있으면 idle 영상 대신 재생
  const [responseMediaSrc, setResponseMediaSrc] = useState<string | null>(null);
  const [responseState, setResponseState] = useState<ResponseState>("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [crisisMessage, setCrisisMessage] = useState<string | null>(null);

  // ── refs ──
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  // 언마운트 cleanup에서 최신 sessionId 참조용
  const sessionIdRef = useRef<string | null>(null);
  // 응답 지연 타이머
  const slowTimerRef = useRef<number | null>(null);
  const timeoutTimerRef = useRef<number | null>(null);
  // 진행 중인 메시지 요청 중단용
  const abortRef = useRef<AbortController | null>(null);
  // 전송 실패 시 재시도용 마지막 녹음
  const lastBlobRef = useRef<Blob | null>(null);

  // sessionId가 바뀔 때마다 ref 동기화
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // 진입 시 세션 시작 + idle 영상 목록 로드, 이탈 시 세션 종료
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) personaId 확보 — store에 없으면 내 정보로 조회
        let pid = persona?.personaId ?? null;
        if (!pid) {
          const meRes = await fetch("/api/users/me");
          const meJson = (await meRes.json()) as RsData<UserMeResponse>;
          pid = meJson.success ? (meJson.data?.personas[0]?.id ?? null) : null;
        }
        if (cancelled) return;
        if (!pid) {
          // 페르소나가 없으면 온보딩으로
          router.replace("/onboarding");
          return;
        }
        setPersonaId(pid);

        // 2) 대화 세션 시작
        const startRes = await fetch("/api/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personaId: pid }),
        });
        const startJson = (await startRes.json()) as RsData<SessionStartResponse>;
        if (!cancelled && startJson.success && startJson.data) {
          setSessionId(startJson.data.sessionId);
        }

        // 3) idle 영상 목록 조회 (순환 재생용)
        const clipsRes = await fetch(`/api/persona/${pid}/idle-clips`);
        const clipsJson = (await clipsRes.json()) as RsData<{ idx: number }[]>;
        if (!cancelled && clipsJson.success && clipsJson.data) {
          setIdleClips(clipsJson.data.map((c) => c.idx));
        }
      } catch {
        if (!cancelled) setError("대화를 시작할 수 없어요. 잠시 후 다시 시도해주세요.");
      }
    })();

    return () => {
      cancelled = true;
      // 진행 중 요청 중단
      abortRef.current?.abort();
      // 세션 종료 — 언마운트 중에도 전송되도록 keepalive
      const sid = sessionIdRef.current;
      if (sid) {
        fetch(`/api/session/${sid}/end`, { method: "POST", keepalive: true }).catch(() => {});
      }
      clearSession();
    };
    // 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 마운트/언마운트 시 미디어 자원 정리
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (slowTimerRef.current) window.clearTimeout(slowTimerRef.current);
      if (timeoutTimerRef.current) window.clearTimeout(timeoutTimerRef.current);
      sourceRef.current?.disconnect();
      audioContextRef.current?.close();
    };
  }, []);

  // ── 웨이브폼 애니메이션 ──
  function startWaveAnimation() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      const current = analyserRef.current;
      if (!current) return;
      current.getByteFrequencyData(data);

      const next = new Array<number>(BAR_COUNT);
      for (let i = 0; i < BAR_COUNT; i++) {
        const value = data[i + 1] ?? 0;
        const normalized = Math.min(1, (value / 255) * 1.4);
        next[i] = BAR_MIN_HEIGHT + normalized * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT);
      }
      setWaveHeights(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopWaveAnimation() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    setWaveHeights(WAVEFORM_HEIGHTS);
  }

  // ── 응답 지연 타이머 ──
  function startResponseTimers() {
    setResponseState("waiting");
    slowTimerRef.current = window.setTimeout(() => {
      setResponseState("slow");
    }, SLOW_RESPONSE_MS);
    timeoutTimerRef.current = window.setTimeout(() => {
      // 30초 초과 — 요청 중단 후 에러 안내
      abortRef.current?.abort();
      setResponseState("timeout");
      setToast("응답을 받아오는 중 오류가 발생했어요");
    }, TIMEOUT_RESPONSE_MS);
  }

  function clearResponseTimers() {
    if (slowTimerRef.current) window.clearTimeout(slowTimerRef.current);
    if (timeoutTimerRef.current) window.clearTimeout(timeoutTimerRef.current);
    slowTimerRef.current = null;
    timeoutTimerRef.current = null;
  }

  // ── SSE 이벤트 처리 ──
  // 주의: 이벤트 type 이름은 백엔드 SSE 스펙에 맞춰 조정 필요
  function handleSseEvent(ev: { type: string; data: string }) {
    switch (ev.type) {
      case "message":
      case "text":
        // 페르소나의 텍스트 답변
        addMessage({
          messageId: makeId(),
          role: "persona",
          text: ev.data,
          mediaReady: false,
        });
        break;
      case "media":
      case "mediaReady":
        // 답변 미디어 준비 완료 → store 갱신 후 영상 재생
        if (ev.data && sessionIdRef.current) {
          setMediaReady(ev.data);
          setResponseState("idle");
          setResponseMediaSrc(
            `/api/session/${sessionIdRef.current}/messages/${ev.data}/media`,
          );
        }
        break;
      case "crisis":
        // 위기 키워드 감지 — 안내 카드 오버레이
        setCrisisMessage(
          ev.data ||
            "많이 힘드신 것 같아요. 도움이 필요하시면 자살예방상담전화 109로 연락해 주세요.",
        );
        break;
      default:
        // 알 수 없는 이벤트는 무시
        break;
    }
  }

  // 메시지 응답 SSE 스트림 읽기
  async function readSseStream(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let firstChunk = true;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      // 첫 응답이 도착하면 지연 타이머 해제
      if (firstChunk) {
        clearResponseTimers();
        firstChunk = false;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        if (part.trim()) handleSseEvent(parseSseEvent(part));
      }
    }
    // 남은 버퍼 처리
    if (buffer.trim()) handleSseEvent(parseSseEvent(buffer));
  }

  // 녹음된 음성 메시지 전송
  async function sendMessage(blob: Blob) {
    const sid = sessionIdRef.current;
    if (!sid) {
      setToast("전송 중 오류가 발생했습니다");
      return;
    }
    lastBlobRef.current = blob;

    // 사용자 메시지를 store에 추가
    addMessage({
      messageId: makeId(),
      role: "user",
      text: "음성 메시지",
      mediaReady: true,
    });

    setToast(null);
    startResponseTimers();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const fd = new FormData();
      fd.append("audio", blob, "message.webm");
      const res = await fetch(`/api/session/${sid}/message`, {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("message request failed");

      await readSseStream(res.body);
      clearResponseTimers();
      // 미디어 이벤트가 없었다면 idle 상태로 복귀
      setResponseState((prev) => (prev === "timeout" ? prev : "idle"));
    } catch (err) {
      clearResponseTimers();
      // 타임아웃으로 인한 abort는 이미 안내됨
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setResponseState("idle");
        setToast("전송 중 오류가 발생했습니다");
      }
    }
  }

  // 전송 재시도
  function retrySend() {
    setToast(null);
    if (lastBlobRef.current) sendMessage(lastBlobRef.current);
  }

  // ── 녹음 ──
  async function startRecording() {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저는 녹음을 지원하지 않아요.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextCtor();
      if (audioContext.state === "suspended") {
        await audioContext.resume().catch(() => {});
      }
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        // 녹음이 끝나면 곧바로 메시지 전송
        if (blob.size > 0) sendMessage(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      setIsRecording(true);

      tickRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 200);

      startWaveAnimation();
    } catch (err) {
      console.error("[chat] 녹음 시작 실패", err);
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "마이크 권한이 필요해요. 브라우저 설정을 확인해 주세요."
          : "녹음을 시작할 수 없어요.",
      );
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    stopWaveAnimation();
    setIsRecording(false);
  }

  function toggleRecording() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  // 영상 재생 종료 — 답변 미디어면 idle 복귀, idle이면 다음 클립으로 순환
  function handleVideoEnded() {
    if (responseMediaSrc) {
      setResponseMediaSrc(null);
    } else if (idleClips.length > 0) {
      setIdleIndex((i) => (i + 1) % idleClips.length);
    }
  }

  // 표시할 영상 — 답변 미디어 우선, 없으면 idle 클립 순환
  const idleSrc =
    idleClips.length > 0 && personaId
      ? `/api/persona/${personaId}/idle-clips/${idleClips[idleIndex % idleClips.length]}`
      : null;
  const displaySrc = responseMediaSrc ?? idleSrc;

  // 상단 배지 문구
  const badgeText = isRecording
    ? `녹음 중 ${formatDuration(elapsedMs)}`
    : responseState === "slow"
      ? "잠시만 기다려 주세요..."
      : responseState === "waiting"
        ? "답변을 준비하고 있어요"
        : "듣고 있어요";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-app flex flex-col gap-2 items-start pt-16 pb-[120px] relative">
        <div className="flex items-center px-6 w-full shrink-0">
          <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
        </div>

        <div className="flex items-start overflow-hidden pt-[6px] pb-4 shrink-0 w-full">
          <div className="relative h-[431px] w-full overflow-hidden">
            {/* 페르소나 영상 (idle 순환 / 답변 미디어) */}
            {displaySrc ? (
              <video
                key={displaySrc}
                src={displaySrc}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted={!responseMediaSrc}
                playsInline
                onEnded={handleVideoEnded}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-disabled to-surface" />
            )}
            <div className="absolute bottom-0 left-0 right-0 h-[137px] bg-gradient-to-b from-transparent to-surface" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[326px] bg-surface-muted flex gap-2 items-center justify-center px-[14px] py-2 rounded-[4px]">
              <HeadphoneIcon />
              <span className="text-muted text-[16px] font-semibold leading-6">{badgeText}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-[6px] items-center justify-center px-6 py-5 w-full shrink-0">
          {waveHeights.map((height, i) => (
            <div
              key={i}
              className="w-[6px] rounded-[4px] bg-[#775a19] shrink-0 transition-[height] duration-75 ease-out"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-2 px-6 w-full shrink-0">
          <button
            onClick={toggleRecording}
            className={`bg-[#775a19] flex items-center p-3 rounded-[12px] cursor-pointer transition ${
              isRecording ? "ring-4 ring-[#775a19]/30 animate-pulse" : ""
            }`}
            aria-label={isRecording ? "녹음 정지" : "녹음 시작"}
          >
            {isRecording ? (
              <div className="size-9 flex items-center justify-center">
                <div className="size-5 bg-white rounded-[3px]" />
              </div>
            ) : (
              <div className="size-9 flex items-center justify-center">
                <div className="size-5 bg-white rounded-full" />
              </div>
            )}
          </button>

          {error && (
            <p className="text-[#c44] text-[13px] font-medium text-center">{error}</p>
          )}
        </div>

        {/* 전송 실패 / 타임아웃 토스트 + 재시도 */}
        {toast && (
          <div className="fixed bottom-[140px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-[#2a2a2a] px-4 py-3 rounded-card">
            <span className="text-white text-[14px] font-medium">{toast}</span>
            <button
              onClick={retrySend}
              className="text-[#f0c674] text-[14px] font-semibold underline cursor-pointer"
            >
              재시도
            </button>
          </div>
        )}

        <BottomNav />
      </div>

      {/* 위기 안내 카드 오버레이 */}
      {crisisMessage && (
        <div className="fixed inset-0 bg-[rgba(19,19,19,0.55)] z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-[340px] bg-white flex flex-col gap-4 items-center px-6 py-8 rounded-sheet">
            <h2 className="text-foreground text-[18px] font-semibold tracking-brand text-center">
              잠시 마음을 살펴주세요
            </h2>
            <p className="text-subtle text-[14px] font-medium leading-6 text-center whitespace-pre-line">
              {crisisMessage}
            </p>
            <button
              onClick={() => setCrisisMessage(null)}
              className="bg-muted flex items-center justify-center px-[30px] py-[12px] rounded-card w-full cursor-pointer"
            >
              <span className="text-white text-[16px] font-medium tracking-brand">확인했어요</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
