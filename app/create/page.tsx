"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../components/ui/PageLayout";
import { FormField } from "../components/ui/FormField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StepHeader } from "../components/ui/StepHeader";
import { VoiceFileCard } from "../components/VoiceFileCard";
import {
  ArrowLeftIcon,
  CameraIcon,
  WarningIcon,
  RecordIcon,
  AddIcon,
  ImageIcon,
} from "../components/icons";
import { usePersonaStore } from "@/store/personaStore";
import type {
  RsData,
  PersonaResponse,
  PersonaStatus,
  PersonaStatusResponse,
  InterviewAnswerRequest,
} from "@/lib/types";

// 인터뷰 질문 (questionNumber 1~10에 매핑)
const QUESTIONS = [
  "고인의 가장 그리운 표정은? (한줄로 묘사)",
  "고인이 행복할 때 자주 보이던 모습은?",
  "고인이 화내실 때의 반응은?\n(조용히 / 큰소리 / 회피 등)",
  "자주 쓰시던 말버릇이나 감탄사가 있다면?",
  "당신에게 가장 자주 해주신 말은?",
  "고인이 자랑스러워 하신던 일은?",
  "고인이 가장 좋아하시던 음식·장소·시간은?",
  "고인이 평생 바라셨던 것은?",
  "고인과 가장 따뜻했던 기억 한 장면은?",
  "지금 다시 만난다면 가장 듣고 싶은 한 마디는?",
];

// 업로드 음성 파일 항목 (duration은 비동기 측정 — 측정 전 null)
interface VoiceFile {
  id: string;
  file: File;
  duration: number | null;
}

// 지원하는 음성/영상 확장자 화이트리스트
const VOICE_EXTENSIONS = ["mp4", "mov", "m4a", "mp3", "wav"] as const;
// accept 속성 — MIME 외 확장자 토큰도 포함해 빈/잘못된 MIME 환경에서 정상 파일이 가려지지 않게 한다
const VOICE_ACCEPT =
  "audio/mp4,audio/x-m4a,audio/mpeg,audio/wav,video/mp4,video/quicktime,.mp4,.mov,.m4a,.mp3,.wav";
// 업로드 가능한 최대 파일 크기 (500MB)
const VOICE_MAX_SIZE = 500 * 1024 * 1024;
// 음성 자료 총 길이 최소 요구치 (초)
const VOICE_MIN_TOTAL_DURATION = 60;

// 파일의 재생 시간을 비동기로 측정 (실패 시 null)
function measureDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement("video");
    media.preload = "metadata";
    const cleanup = () => {
      URL.revokeObjectURL(url);
      media.removeAttribute("src");
      media.load();
    };
    media.onloadedmetadata = () => {
      const d = Number.isFinite(media.duration) ? media.duration : null;
      cleanup();
      resolve(d);
    };
    media.onerror = () => {
      cleanup();
      resolve(null);
    };
    media.src = url;
  });
}

// 업로드 실패 공통 안내 문구
const UPLOAD_ERROR = "업로드 중 오류가 발생했습니다. 다시 시도해주세요.";

// 업로드 전 이미지를 리사이즈·압축 (서버 413 방지)
async function resizeImage(file: File, maxSize = 1600, quality = 0.85): Promise<File> {
  // 이미지가 아니면 원본 그대로 반환
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    // 긴 변을 maxSize 이하로 축소
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;
    // 압축 결과가 원본보다 크면 원본 사용
    if (blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    // 리사이즈 실패 시 원본 사용
    return file;
  }
}

// 고유 id 생성
function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export default function Create() {
  const creationStep = usePersonaStore((s) => s.creationStep);
  const persona = usePersonaStore((s) => s.persona);
  const setCreationStep = usePersonaStore((s) => s.setCreationStep);

  // 진입 시 단계가 없으면 basic으로 초기화
  useEffect(() => {
    if (!creationStep) setCreationStep("basic");
  }, [creationStep, setCreationStep]);

  // voice/interview/waiting 단계인데 페르소나가 없으면(새로고침 등) 처음으로
  if (
    (creationStep === "voice" ||
      creationStep === "interview" ||
      creationStep === "waiting") &&
    !persona
  ) {
    return <BasicStep />;
  }

  switch (creationStep) {
    case "voice":
      return <VoiceStep />;
    case "interview":
      return <InterviewStep />;
    case "waiting":
      return <WaitingStep />;
    default:
      return <BasicStep />;
  }
}

// ───────────────────────── 1단계: 기본정보 입력 ─────────────────────────
function BasicStep() {
  const router = useRouter();
  const setPersona = usePersonaStore((s) => s.setPersona);
  const setCreationStep = usePersonaStore((s) => s.setCreationStep);
  // 사진 미리보기 — 생성 중 화면과 공유하기 위해 store에 보관
  const photoPreview = usePersonaStore((s) => s.photoPreview);
  const setPhotoPreview = usePersonaStore((s) => s.setPhotoPreview);

  const [form, setForm] = useState({ name: "", nickname: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // 필드별 분리 에러 — 이름·호칭은 FormField error prop, 사진은 별도 노출
  const [nameError, setNameError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // 해당 필드 에러만 초기화
    if (e.target.name === "name") setNameError(null);
    if (e.target.name === "nickname") setNicknameError(null);
    setError(null);
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // 원본 크기 기준으로 10MB 초과 차단 (리사이즈 전 검증)
    if (file.size > 10 * 1024 * 1024) {
      // 이전에 선택된 정상 파일이 stale 상태로 남지 않도록 함께 초기화
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError("파일 크기가 너무 큽니다 (최대 10MB)");
      e.target.value = "";
      return;
    }
    // 업로드 전 리사이즈·압축
    const resized = await resizeImage(file);
    setPhotoFile(resized);
    // 미리보기 + 생성 중 화면 공유용 data URL 저장
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(resized);
    setPhotoError(null);
    setError(null);
  }

  async function handleNext() {
    if (submitting) return;
    // 이름·호칭·사진 각각 검증해 필드별 에러 노출
    const nextNameError = !form.name.trim() ? "고인의 이름을 입력해주세요" : null;
    const nextNicknameError = !form.nickname.trim() ? "나를 부를 호칭을 입력해주세요" : null;
    const nextPhotoError = !photoFile ? "사진은 페르소나 생성에 필요합니다" : null;
    setNameError(nextNameError);
    setNicknameError(nextNicknameError);
    setPhotoError(nextPhotoError);
    if (nextNameError || nextNicknameError || nextPhotoError) return;

    setSubmitting(true);
    setError(null);
    try {
      // 1단계: 페르소나 생성
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, nickname: form.nickname }),
      });
      const json = (await res.json()) as RsData<PersonaResponse>;
      if (!json.success || !json.data) {
        setError(UPLOAD_ERROR);
        return;
      }
      const created = json.data;

      // 2단계: 사진 업로드 (검증 통과 후이므로 photoFile 존재 보장)
      const fd = new FormData();
      fd.append("file", photoFile as File);
      const photoRes = await fetch(`/api/persona/${created.id}/photo`, {
        method: "POST",
        body: fd,
      });
      const photoJson = (await photoRes.json()) as RsData<unknown>;
      if (!photoJson.success) {
        setError(UPLOAD_ERROR);
        return;
      }

      // store에 페르소나 저장 후 음성 단계로 전환
      setPersona({
        personaId: created.id,
        name: created.name,
        nickname: created.nickname,
        status: created.status === "READY" ? "ready" : "draft",
      });
      setCreationStep("voice");
    } catch {
      setError(UPLOAD_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <button onClick={() => router.back()} className="flex items-center">
        <ArrowLeftIcon />
      </button>

      <StepHeader step={1} title="기본정보 입력" />
      <ProgressBar value={0.25} />

      <div className="bg-white flex flex-col gap-5 items-center px-5 py-[30px] rounded-sheet w-full">
        <label className="border-2 border-placeholder border-dashed flex flex-col gap-2 items-center justify-center p-2 rounded-tile size-[170px] cursor-pointer overflow-hidden relative">
          {photoPreview ? (
            <img src={photoPreview} alt="업로드된 사진" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <CameraIcon />
              <span className="text-foreground text-[16px] font-medium leading-6">사진 업로드</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhoto}
            aria-invalid={photoError ? true : undefined}
            aria-describedby={photoError ? "photo-error" : undefined}
          />
        </label>

        <div className="flex gap-1 items-center justify-center">
          <WarningIcon />
          <span className="text-foreground text-[12px] font-medium leading-6">얼굴이 선명하게 담긴 사진을 올려주세요</span>
        </div>

        {photoError && (
          <p
            id="photo-error"
            role="alert"
            className="text-[#c44] text-[13px] font-medium w-full pl-3"
          >
            {photoError}
          </p>
        )}

        <FormField
          label="고인의 이름"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="고인의 이름을 입력해주세요"
          error={nameError}
        />
        <FormField
          label="호칭"
          id="nickname"
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
          placeholder="나를 부를 호칭을 입력해주세요"
          error={nicknameError}
        />
      </div>

      {error && (
        <p className="text-[#c44] text-[13px] font-medium w-full pl-3">{error}</p>
      )}

      <div className="flex flex-col items-start py-[14px] w-full">
        <PrimaryButton onClick={handleNext} active={!submitting}>
          {submitting ? "처리 중..." : "다음"}
        </PrimaryButton>
      </div>

      <div className="flex items-center justify-center w-full">
        <span className="text-foreground text-[14px] leading-6">이 정보는 나중에 언제든 수정할 수 있어요</span>
      </div>
    </PageLayout>
  );
}

// ───────────────────────── 2단계: 음성 업로드 ─────────────────────────
function VoiceStep() {
  const persona = usePersonaStore((s) => s.persona);
  const setCreationStep = usePersonaStore((s) => s.setCreationStep);

  const [files, setFiles] = useState<VoiceFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 카드별 pause 핸들러 — 한 번에 하나만 재생되도록 조정
  const pauseHandlersRef = useRef<Map<string, () => void>>(new Map());

  // 측정된 duration을 모두 합산 (측정 전 항목은 0으로 취급)
  const totalDuration = files.reduce((sum, f) => sum + (f.duration ?? 0), 0);
  // 측정 완료 + 총합 1분 이상이어야 다음 진행 가능
  const allMeasured = files.every((f) => f.duration !== null);
  const meetsMinDuration = totalDuration >= VOICE_MIN_TOTAL_DURATION;
  const canProceed = files.length >= 1 && allMeasured && meetsMinDuration;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // 확장자 화이트리스트 검증 (대소문자 무시)
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!VOICE_EXTENSIONS.includes(ext as (typeof VOICE_EXTENSIONS)[number])) {
      setError("지원하지 않는 파일 형식입니다");
      return;
    }
    // 500MB 초과 차단
    if (file.size > VOICE_MAX_SIZE) {
      setError("파일 크기가 너무 큽니다 (최대 500MB)");
      return;
    }

    // 우선 duration null 상태로 추가 후 비동기로 측정 결과 반영
    const id = makeId();
    setFiles((prev) => [...prev, { id, file, duration: null }]);
    setError(null);
    const duration = await measureDuration(file);
    if (duration === null) {
      // 측정 실패 — 재생 가능한 음성으로 인식되지 않음. 파일 제거 + 안내
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setError("재생 가능한 음성을 확인하지 못했어요. 다른 파일을 선택해 주세요");
      return;
    }
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, duration } : f)));
  }

  const registerPause = useCallback((id: string, pause: () => void) => {
    pauseHandlersRef.current.set(id, pause);
    return () => {
      pauseHandlersRef.current.delete(id);
    };
  }, []);

  const handlePlayStart = useCallback((id: string) => {
    pauseHandlersRef.current.forEach((pause, otherId) => {
      if (otherId !== id) pause();
    });
  }, []);

  async function handleNext() {
    if (submitting) return;
    if (!canProceed) return;
    if (!persona) return;

    setSubmitting(true);
    setError(null);
    try {
      // 업로드한 음성 파일을 순차 전송
      for (const entry of files) {
        const fd = new FormData();
        fd.append("file", entry.file);
        const res = await fetch(`/api/persona/${persona.personaId}/voice`, {
          method: "POST",
          body: fd,
        });
        const json = (await res.json()) as RsData<unknown>;
        if (!json.success) {
          setError(UPLOAD_ERROR);
          return;
        }
      }
      setCreationStep("interview");
    } catch {
      setError(UPLOAD_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <button onClick={() => setCreationStep("basic")} className="flex items-center">
        <ArrowLeftIcon />
      </button>

      <StepHeader step={2} title="음성 업로드" />
      <ProgressBar value={0.5} />

      <div className="bg-white flex flex-col gap-5 items-center px-5 py-[30px] rounded-sheet w-full">
        <div className="flex flex-col gap-1 items-start text-foreground text-[18px] font-semibold w-full">
          <p className="leading-6">고인의 목소리가 담긴 영상이나</p>
          <p className="leading-6">음성 파일을 올려주세요 (1분 이상)</p>
        </div>

        {files.length === 0 ? (
          <label className="bg-surface-strong flex gap-[14px] items-start px-4 py-[22px] rounded-card w-full cursor-pointer">
            <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px] shrink-0">
              <RecordIcon />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-foreground text-[16px] font-semibold tracking-brand">음성 파일 업로드</p>
              <p className="text-subtle text-[12px] font-medium tracking-brand">mp4, mov, m4a, mp3, wav 형식 가능해요</p>
            </div>
            <input type="file" accept={VOICE_ACCEPT} className="sr-only" onChange={handleFileChange} />
          </label>
        ) : (
          <>
            {files.map((entry) => (
              <VoiceFileCard
                key={entry.id}
                id={entry.id}
                file={entry.file}
                registerPause={registerPause}
                onPlayStart={handlePlayStart}
              />
            ))}

            <label className="bg-surface-strong flex flex-col gap-[6px] items-center justify-center p-4 rounded-card w-full cursor-pointer">
              <AddIcon color="var(--color-subtle)" />
              <span className="text-subtle text-[14px] font-semibold tracking-brand">음성 파일 추가 업로드</span>
              <input type="file" accept={VOICE_ACCEPT} className="sr-only" onChange={handleFileChange} />
            </label>
          </>
        )}

        {/* 총 길이 미달 시 카드 영역 바로 아래 안내 */}
        {files.length >= 1 && allMeasured && !meetsMinDuration && (
          <p className="text-[#c44] text-[13px] font-medium w-full pl-3">
            음성 자료가 1분 미만입니다. 파일을 추가해 주세요
          </p>
        )}
      </div>

      {error && (
        <p className="text-[#c44] text-[13px] font-medium w-full pl-3">{error}</p>
      )}

      <div className="flex flex-col items-start py-[14px] w-full">
        <PrimaryButton onClick={handleNext} active={!submitting && canProceed}>
          {submitting ? "업로드 중..." : "다음"}
        </PrimaryButton>
      </div>
    </PageLayout>
  );
}

// ───────────────────────── 3단계: 인터뷰 진행 ─────────────────────────
function InterviewStep() {
  const persona = usePersonaStore((s) => s.persona);
  const setCreationStep = usePersonaStore((s) => s.setCreationStep);

  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [skipped, setSkipped] = useState<boolean[]>(Array(QUESTIONS.length).fill(false));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleAnswer(i: number, val: string) {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)));
    setError(null);
  }

  function handleSkip(i: number) {
    setSkipped((prev) => prev.map((s, idx) => (idx === i ? true : s)));
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? "" : a)));
    setError(null);
  }

  async function handleNext() {
    if (submitting || !persona) return;

    // 답변한 문항만 questionNumber와 함께 전송 (건너뛴 문항 제외)
    const payload: InterviewAnswerRequest[] = answers
      .map((answer, i) => ({ questionNumber: i + 1, answer: answer.trim() }))
      .filter((a) => a.answer.length > 0);

    // 모든 문항이 비어 있거나 건너뛰기 상태인 경우 진행 차단
    const hasAnyAnswer = payload.length > 0;
    const hasAnySkip = skipped.some((s) => s);
    if (!hasAnyAnswer && !hasAnySkip) {
      setError("답변을 입력하거나 건너뛰기를 선택해 주세요");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/persona/${persona.personaId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as RsData<unknown>;
      if (!json.success) {
        setError(UPLOAD_ERROR);
        return;
      }
      // 답변 저장 후 AI 생성 대기 단계로
      setCreationStep("waiting");
    } catch {
      setError(UPLOAD_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <button onClick={() => setCreationStep("voice")} className="flex items-center">
        <ArrowLeftIcon />
      </button>

      <StepHeader step={3} title="인터뷰 진행" />
      <ProgressBar value={0.75} />

      <div className="bg-white flex flex-col gap-[26px] items-center px-5 py-[40px] rounded-sheet w-full">
        <div className="w-full">
          <p className="text-foreground text-[18px] font-semibold leading-6">아래의 질문에 답변해주세요</p>
        </div>

        {error && (
          <p className="text-[#c44] text-[13px] font-medium w-full pl-3">{error}</p>
        )}

        {QUESTIONS.map((q, i) => (
          <div key={i} className="flex flex-col gap-[10px] items-start pt-[10px] w-[314px]">
            <div className="pl-3 w-full">
              <p className="text-foreground text-[16px] font-semibold tracking-brand leading-normal whitespace-pre-line">{q}</p>
            </div>
            <input
              value={answers[i]}
              onChange={(e) => handleAnswer(i, e.target.value)}
              placeholder="답변을 입력해주세요"
              disabled={skipped[i]}
              maxLength={500}
              className={`px-5 py-[10px] rounded-card w-full text-[16px] tracking-brand placeholder:text-placeholder outline-none ${
                skipped[i] ? "bg-disabled text-foreground" : "bg-surface text-foreground"
              }`}
            />
            <button
              onClick={() => handleSkip(i)}
              className="bg-disabled flex items-center justify-center px-5 py-[10px] rounded-card w-full cursor-pointer"
            >
              <span className="text-foreground text-[14px] tracking-brand">건너뛰기</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start py-[14px] w-full">
        <PrimaryButton onClick={handleNext} active={!submitting}>
          {submitting ? "제출 중..." : "다음"}
        </PrimaryButton>
      </div>
    </PageLayout>
  );
}

// ───────────────────────── 대기: 생성 상태 폴링 ─────────────────────────
function WaitingStep() {
  const router = useRouter();
  const persona = usePersonaStore((s) => s.persona);
  const setPersona = usePersonaStore((s) => s.setPersona);
  const setCreationStep = usePersonaStore((s) => s.setCreationStep);
  const clearPersona = usePersonaStore((s) => s.clearPersona);
  // 1단계에서 업로드한 고인 사진 미리보기
  const photoPreview = usePersonaStore((s) => s.photoPreview);

  const [status, setStatus] = useState<PersonaStatus | null>(null);
  // 'failed' = 생성 실패(처음부터), 'network' = 조회 실패(폴링 재시도)
  const [errorKind, setErrorKind] = useState<"failed" | "network" | null>(null);
  const [slow, setSlow] = useState(false); // 2분 초과 여부
  const [retryKey, setRetryKey] = useState(0); // 폴링 재시작 트리거

  // 10초 간격 상태 폴링
  useEffect(() => {
    if (!persona) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    const startedAt = Date.now();

    async function poll() {
      try {
        const res = await fetch(`/api/persona/${persona!.personaId}/status`);
        const json = (await res.json()) as RsData<PersonaStatusResponse>;
        if (cancelled) return;

        if (!json.success || !json.data) {
          setErrorKind("network");
          if (interval) clearInterval(interval);
          return;
        }

        const s = json.data.status;
        setStatus(s);

        if (s === "READY") {
          // 생성 완료 → 페르소나 확정 후 대화 화면으로
          if (interval) clearInterval(interval);
          setPersona({ ...persona!, status: "ready" });
          setCreationStep(null);
          router.push("/chat");
        } else if (s === "FAILED") {
          if (interval) clearInterval(interval);
          setErrorKind("failed");
        } else if (Date.now() - startedAt > 120_000) {
          // 2분 초과 — 안내만 표시하고 폴링은 계속
          setSlow(true);
        }
      } catch {
        if (!cancelled) {
          setErrorKind("network");
          if (interval) clearInterval(interval);
        }
      }
    }

    poll(); // 즉시 1회 실행
    interval = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [persona, setPersona, setCreationStep, router, retryKey]);

  // 생성 실패 → 처음부터 다시
  function handleRestart() {
    clearPersona();
    setCreationStep("basic");
  }

  // 조회 실패 → 폴링 재시작
  function handleRetryPolling() {
    setErrorKind(null);
    setSlow(false);
    setRetryKey((k) => k + 1);
  }

  // 생성 실패 화면
  if (errorKind === "failed") {
    return (
      <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
        <StepHeader step={4} title="페르소나 생성 실패" />
        <ProgressBar value={1} />
        <div className="bg-white flex flex-col gap-[18px] items-center px-5 py-[40px] rounded-sheet w-full">
          <WarningIcon />
          <p className="text-foreground text-[16px] font-semibold leading-6 text-center">
            페르소나 생성에 실패했어요.
          </p>
          <p className="text-subtle text-[14px] font-medium leading-6 text-center">
            입력 정보를 확인하고 다시 시도해주세요.
          </p>
        </div>
        <div className="flex flex-col items-start py-[14px] w-full">
          <PrimaryButton onClick={handleRestart}>처음부터 다시</PrimaryButton>
        </div>
      </PageLayout>
    );
  }

  // 상태 조회 실패 화면
  if (errorKind === "network") {
    return (
      <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
        <StepHeader step={4} title="페르소나 생성 중.." />
        <ProgressBar value={1} pulse />
        <div className="bg-white flex flex-col gap-[18px] items-center px-5 py-[40px] rounded-sheet w-full">
          <WarningIcon />
          <p className="text-foreground text-[16px] font-semibold leading-6 text-center">
            상태를 확인하는 중 오류가 발생했어요.
          </p>
        </div>
        <div className="flex flex-col items-start py-[14px] w-full">
          <PrimaryButton onClick={handleRetryPolling}>다시 확인</PrimaryButton>
        </div>
      </PageLayout>
    );
  }

  // 생성 진행 중 화면
  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <StepHeader step={4} title="페르소나 생성 중.." />
      <ProgressBar value={1} pulse />

      <div className="bg-white flex flex-col gap-[14px] items-center px-5 py-[40px] rounded-sheet w-full">
        <p className="text-foreground text-[18px] font-semibold leading-6">페르소나를 만날 준비를 하고 있어요</p>
        <p className="text-foreground text-[14px] font-medium leading-6">약 5분 정도 걸릴거예요</p>

        <div className="border-2 border-placeholder bg-surface-soft rounded-tile size-[170px] overflow-hidden">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="고인의 사진"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex items-center justify-center">
          <p className="text-foreground text-[14px] font-medium leading-6">
            {slow ? "조금 더 걸리고 있어요. 잠시 후 다시 확인해주세요" : "잠시만 기다려주세요"}
          </p>
        </div>

        <div className="bg-surface-strong flex gap-[14px] items-start opacity-60 px-4 py-[22px] rounded-card w-[314px]">
          <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px] shrink-0">
            <RecordIcon />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-foreground text-[16px] font-semibold tracking-brand">상태</p>
            <p className="text-subtle text-[14px] font-medium tracking-brand">목소리를 담고 있어요..</p>
          </div>
        </div>

        <div className="bg-surface-strong flex gap-[14px] items-start px-4 py-[22px] rounded-card w-[314px] animate-pulse">
          <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px] shrink-0">
            <ImageIcon />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-foreground text-[16px] font-semibold tracking-brand">진행 상황</p>
            <p className="text-subtle text-[14px] font-medium tracking-brand">
              {status === "PROCESSING" ? "기억을 새기고 있어요.." : "준비하고 있어요.."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center pt-[10px]">
          <p className="text-foreground text-[16px] font-semibold tracking-brand">곧 만날 수 있을거예요</p>
        </div>
      </div>
    </PageLayout>
  );
}
