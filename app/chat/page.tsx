"use client";

import { useEffect, useRef, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { MicIcon, HeadphoneIcon } from "../components/icons";

const WAVEFORM_HEIGHTS = [
  40, 26, 62, 44, 14, 44, 26, 40, 62, 40,
  26, 14, 26, 40, 62, 14, 44, 26, 40, 62,
  40, 14, 44, 26, 40, 14, 44, 62, 26,
];

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Chat() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  async function startRecording() {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저는 녹음을 지원하지 않아요.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const duration = Date.now() - startTimeRef.current;
        setLastDurationMs(duration);
        console.log("[chat] 녹음 완료", {
          mimeType: recorder.mimeType,
          sizeKB: Math.round(blob.size / 1024),
          durationMs: duration,
        });

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      setLastDurationMs(null);
      setIsRecording(true);

      tickRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 200);
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
    setIsRecording(false);
  }

  function toggleRecording() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-app flex flex-col gap-2 items-start pt-16 pb-[120px] relative">
        <div className="flex items-center px-6 w-full shrink-0">
          <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
        </div>

        <div className="flex items-start overflow-hidden pt-[6px] pb-4 shrink-0 w-full">
          <div className="relative h-[431px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-disabled to-surface" />
            <div className="absolute bottom-0 left-0 right-0 h-[137px] bg-gradient-to-b from-transparent to-surface" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[326px] bg-surface-muted flex gap-2 items-center justify-center px-[14px] py-2 rounded-[4px]">
              <HeadphoneIcon />
              <span className="text-muted text-[16px] font-semibold leading-6">
                {isRecording ? `녹음 중 ${formatDuration(elapsedMs)}` : "듣고 있어요"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-[6px] items-center justify-center px-6 py-5 w-full shrink-0">
          {WAVEFORM_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="w-[6px] rounded-[4px] bg-[#775a19] shrink-0"
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
              <MicIcon size={36} color="#ffffff" />
            )}
          </button>

          {error && (
            <p className="text-[#c44] text-[13px] font-medium text-center">{error}</p>
          )}
          {!isRecording && lastDurationMs !== null && !error && (
            <p className="text-subtle text-[13px] font-medium">
              녹음 완료 · {formatDuration(lastDurationMs)}
            </p>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
