"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../../components/ui/PageLayout";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StepHeader } from "../../components/ui/StepHeader";
import { RecordIcon, ImageIcon } from "../../components/icons";

export default function PersonaWaiting() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/chat"), 8000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <StepHeader step={4} title="페르소나 생성 중.." />
      <ProgressBar value={1} pulse />

      <div className="bg-white flex flex-col gap-[14px] items-center px-5 py-[40px] rounded-[10px] w-full">
        <p className="text-[#474741] text-[18px] font-semibold leading-6">페르소나를 만날 준비를 하고 있어요</p>
        <p className="text-[#474741] text-[14px] font-medium leading-6">약 5분 정도 걸릴거예요</p>

        <div className="border-2 border-[#a3a3a3] bg-[#f0eeeb] rounded-[8px] size-[170px]" />

        <div className="flex items-center justify-center">
          <p className="text-[#474741] text-[14px] font-medium leading-6">잠시만 기다려주세요</p>
        </div>

        <div className="bg-[#e0ded9] flex gap-[14px] items-start opacity-60 px-4 py-[22px] rounded-[6px] w-[314px]">
          <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px] shrink-0">
            <RecordIcon />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[#474741] text-[16px] font-semibold tracking-[0.7px]">상태</p>
            <p className="text-[#808080] text-[14px] font-medium tracking-[0.7px]">목소리를 담고 있어요..</p>
          </div>
        </div>

        <div className="bg-[#e0ded9] flex gap-[14px] items-start px-4 py-[22px] rounded-[6px] w-[314px] animate-pulse">
          <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px] shrink-0">
            <ImageIcon />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[#474741] text-[16px] font-semibold tracking-[0.7px]">진행 상황</p>
            <p className="text-[#808080] text-[14px] font-medium tracking-[0.7px]">기억을 새기고 있어요..</p>
          </div>
        </div>

        <div className="flex items-center justify-center pt-[10px]">
          <p className="text-[#474741] text-[16px] font-semibold tracking-[0.7px]">곧 만날 수 있을거예요</p>
        </div>
      </div>
    </PageLayout>
  );
}
