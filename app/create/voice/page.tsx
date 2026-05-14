"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../../components/ui/PageLayout";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StepHeader } from "../../components/ui/StepHeader";
import {
  ArrowLeftIcon,
  RecordIcon,
  PlayIcon,
  PauseIcon,
  RewindIcon,
  FastForwardIcon,
  AddIcon,
} from "../../components/icons";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface VoiceFile {
  id: string;
  file: File;
}

interface VoiceFileCardProps {
  id: string;
  file: File;
  registerPause: (id: string, pause: () => void) => () => void;
  onPlayStart: (id: string) => void;
}

function VoiceFileCard({ id, file, registerPause, onPlayStart }: VoiceFileCardProps) {
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (mediaUrl) mediaRef.current?.load();
  }, [mediaUrl]);

  useEffect(() => {
    return registerPause(id, () => {
      mediaRef.current?.pause();
    });
  }, [id, registerPause]);

  function togglePlay() {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) {
      onPlayStart(id);
      media
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setIsPlaying(false);
          setError(err?.message ?? "재생할 수 없는 파일입니다.");
        });
    } else {
      media.pause();
    }
  }

  function seekBy(seconds: number) {
    const media = mediaRef.current;
    if (!media) return;
    const max = duration || media.duration || 0;
    const next = Math.min(Math.max(media.currentTime + seconds, 0), max);
    media.currentTime = next;
    setCurrentTime(next);
  }

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="bg-surface-strong flex flex-col gap-2 items-start px-5 py-[22px] rounded-card w-full">
      <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px]">
        <RecordIcon />
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <p className="text-foreground text-[16px] font-semibold tracking-brand break-all">{file.name}</p>
        <p className="text-subtle text-[14px] font-medium">업로드 완료</p>
      </div>

      {mediaUrl && (
        <video
          ref={mediaRef}
          src={mediaUrl}
          style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            setError(null);
          }}
          onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => setError("이 파일은 브라우저에서 재생할 수 없어요.")}
          preload="metadata"
          playsInline
        />
      )}
      {error && (
        <p className="text-[#c44] text-[13px] font-medium w-full">{error}</p>
      )}

      <div className="flex flex-col gap-[10px] items-center py-[10px] w-full">
        <div className="relative bg-white h-[6px] rounded-[4px] w-full">
          <div
            className="absolute bg-accent h-[6px] left-0 rounded-l-[4px]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between w-full text-subtle text-[12px] font-medium tracking-brand">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-[26px] w-full">
        <button onClick={() => seekBy(-10)} className="cursor-pointer" aria-label="10초 뒤로">
          <RewindIcon />
        </button>
        <button
          onClick={togglePlay}
          className="cursor-pointer"
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button onClick={() => seekBy(10)} className="cursor-pointer" aria-label="10초 앞으로">
          <FastForwardIcon />
        </button>
      </div>
    </div>
  );
}

export default function PersonaVoice() {
  const router = useRouter();
  const [files, setFiles] = useState<VoiceFile[]>([]);
  const pauseHandlersRef = useRef<Map<string, () => void>>(new Map());

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setFiles((prev) => [...prev, { id, file }]);
    }
    e.target.value = "";
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

  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <button onClick={() => router.back()} className="flex items-center">
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
              <p className="text-subtle text-[12px] font-medium tracking-brand">mp4, mov, m4a, wav 형식 가능해요</p>
            </div>
            <input type="file" accept="audio/*,video/*" className="sr-only" onChange={handleFileChange} />
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
              <input type="file" accept="audio/*,video/*" className="sr-only" onChange={handleFileChange} />
            </label>
          </>
        )}
      </div>

      <div className="flex flex-col items-start py-[14px] w-full">
        <PrimaryButton onClick={() => router.push("/create/interview")}>다음</PrimaryButton>
      </div>
    </PageLayout>
  );
}
