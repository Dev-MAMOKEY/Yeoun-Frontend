"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../../components/ui/PageLayout";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StepHeader } from "../../components/ui/StepHeader";
import { ArrowLeftIcon, RecordIcon, PlayIcon, RewindIcon, FastForwardIcon, AddIcon } from "../../components/icons";

export default function PersonaVoice() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setProgress(0);
    }
  }

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

              <div className="flex flex-col gap-[10px] items-center py-[10px] w-full">
                <div className="relative bg-white h-[6px] rounded-[4px] w-full">
                  <div
                    className="absolute bg-accent h-[6px] left-0 rounded-l-[4px]"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-[26px] w-full">
                <button onClick={() => setProgress(Math.max(0, progress - 0.1))} className="cursor-pointer">
                  <RewindIcon />
                </button>
                <button className="cursor-pointer">
                  <PlayIcon />
                </button>
                <button onClick={() => setProgress(Math.min(1, progress + 0.1))} className="cursor-pointer">
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
