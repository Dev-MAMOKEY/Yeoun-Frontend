"use client";

import { BottomNav } from "../components/BottomNav";
import { MicIcon, HeadphoneIcon } from "../components/icons";

const WAVEFORM_HEIGHTS = [
  40, 26, 62, 44, 14, 44, 26, 40, 62, 40,
  26, 14, 26, 40, 62, 14, 44, 26, 40, 62,
  40, 14, 44, 26, 40, 14, 44, 62, 26,
];

export default function Chat() {
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
              <span className="text-muted text-[16px] font-semibold leading-6">듣고 있어요</span>
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

        <div className="flex flex-col items-center justify-center px-6 w-full shrink-0">
          <button
            className="bg-[#775a19] flex items-center p-3 rounded-[12px] cursor-pointer"
            aria-label="음성 입력"
          >
            <MicIcon size={36} color="#ffffff" />
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
