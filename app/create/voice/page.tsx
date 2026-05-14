"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

export default function PersonaVoice() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = useMemo(
    () => (uploadedFile ? URL.createObjectURL(uploadedFile) : null),
    [uploadedFile],
  );

  useEffect(() => {
    if (!audioUrl) return;
    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      audioRef.current?.pause();
      setUploadedFile(file);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function seekBy(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.min(Math.max(audio.currentTime + seconds, 0), duration || audio.duration || 0);
    audio.currentTime = next;
    setCurrentTime(next);
  }

  const progress = duration > 0 ? currentTime / duration : 0;

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

        {!uploadedFile ? (
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
            <div className="bg-surface-strong flex flex-col gap-2 items-start px-5 py-[22px] rounded-card w-full">
              <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px]">
                <RecordIcon />
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <p className="text-foreground text-[16px] font-semibold tracking-brand">{uploadedFile.name}</p>
                <p className="text-subtle text-[14px] font-medium">업로드 완료</p>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl ?? undefined}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
              />

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
                <button
                  onClick={() => seekBy(-10)}
                  className="cursor-pointer"
                  aria-label="10초 뒤로"
                >
                  <RewindIcon />
                </button>
                <button
                  onClick={togglePlay}
                  className="cursor-pointer"
                  aria-label={isPlaying ? "일시정지" : "재생"}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button
                  onClick={() => seekBy(10)}
                  className="cursor-pointer"
                  aria-label="10초 앞으로"
                >
                  <FastForwardIcon />
                </button>
              </div>
            </div>

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
