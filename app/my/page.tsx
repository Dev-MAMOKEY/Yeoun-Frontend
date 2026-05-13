"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { ArrowRightIcon, AddIcon, UserIcon } from "../components/icons";

export default function My() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-app flex flex-col gap-[26px] items-center pt-8 pb-[130px] px-6">
        <div className="flex items-center w-full">
          <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
        </div>

        <div className="flex flex-col gap-[10px] items-center pb-2 pt-[14px]">
          <div className="bg-disabled flex items-center justify-center overflow-hidden p-2 rounded-card size-[106px]">
            <UserIcon />
          </div>
          <button className="text-muted text-[14px] font-medium tracking-brand underline cursor-pointer">
            사진 수정하기
          </button>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-foreground text-[18px] font-semibold leading-6">계정 정보</h2>
          </div>
          <div className="bg-white flex flex-col gap-[22px] items-start px-5 py-[30px] rounded-sheet w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex gap-2 items-center justify-center pl-3 w-full">
                <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand">이름</span>
                <ArrowRightIcon color="var(--color-foreground)" />
              </div>
              <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand" />
              </div>
            </div>

            <div className="flex flex-col gap-[10px] w-full">
              <div className="pl-3">
                <span className="text-foreground text-[16px] font-semibold tracking-brand">이메일</span>
              </div>
              <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand" />
              </div>
            </div>

            <button className="flex gap-2 items-center justify-between pl-3 w-full cursor-pointer">
              <span className="text-foreground text-[16px] font-semibold tracking-brand">비밀번호 변경하기</span>
              <ArrowRightIcon color="var(--color-foreground)" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-foreground text-[18px] font-semibold leading-6">페르소나 정보</h2>
          </div>
          <div className="bg-white flex flex-col gap-[22px] items-start px-5 py-[30px] rounded-sheet w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <div className="pl-3">
                <span className="text-foreground text-[16px] font-semibold tracking-brand">고인의 이름</span>
              </div>
              <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand" />
              </div>
            </div>

            <div className="flex flex-col gap-[10px] w-full">
              <div className="pl-3">
                <span className="text-foreground text-[16px] font-semibold tracking-brand">생성일</span>
              </div>
              <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand" />
              </div>
            </div>

            <button className="bg-surface-strong flex gap-[6px] items-center justify-center px-4 py-3 rounded-card w-[314px] cursor-pointer">
              <AddIcon size={17} color="var(--color-subtle)" />
              <span className="text-subtle text-[14px] font-semibold tracking-brand">기억 추가하기</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-foreground text-[18px] font-semibold leading-6">데이터 내보내기</h2>
          </div>
          <div className="bg-white flex items-start px-5 py-[30px] rounded-sheet w-full">
            <button className="bg-surface-strong flex items-center justify-center px-4 py-3 rounded-card w-[314px] cursor-pointer">
              <span className="text-subtle text-[14px] font-semibold tracking-brand">전체 데이터 내보내기 (zip)</span>
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
