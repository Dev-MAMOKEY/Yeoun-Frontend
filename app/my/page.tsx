"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { ArrowRightIcon } from "../components/icons";

export default function My() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-app flex flex-col gap-[26px] items-center pt-16 pb-[130px] px-6">
        <div className="flex items-center w-full px-6">
          <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-foreground text-[18px] font-semibold leading-6">계정 정보</h2>
          </div>
          <div className="bg-white flex flex-col gap-[22px] items-start justify-center px-5 py-[30px] rounded-sheet w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex gap-2 items-center justify-center px-3 w-full">
                <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand">이름</span>
                <ArrowRightIcon color="var(--color-foreground)" />
              </div>
              <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">김신한</span>
              </div>
            </div>

            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex items-center justify-center pl-3 w-full">
                <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand">이메일</span>
              </div>
              <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">shinhan@gmail.com</span>
              </div>
            </div>

            <button className="flex gap-2 items-center justify-center px-3 w-full cursor-pointer">
              <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand text-left">비밀번호 변경하기</span>
              <ArrowRightIcon color="var(--color-foreground)" />
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="bg-surface-muted flex items-center justify-center px-5 py-[13px] rounded-card w-[346px] cursor-pointer"
        >
          <span className="text-muted text-[16px] font-medium tracking-brand">로그아웃</span>
        </button>

        <button className="bg-surface-muted flex items-center justify-center px-5 py-[13px] rounded-card w-[346px] cursor-pointer">
          <span className="text-muted text-[16px] font-medium tracking-brand">계정삭제</span>
        </button>

        <BottomNav />
      </div>
    </div>
  );
}
