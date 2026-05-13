"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { ArrowRightIcon, AddIcon, UserIcon } from "../components/icons";

export default function My() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#faf9f6] flex justify-center">
      <div className="w-full max-w-[402px] flex flex-col gap-[26px] items-center pt-8 pb-[130px] px-6">
        <div className="flex items-center w-full">
          <span className="text-[24px] font-bold text-black tracking-[0.7px]">Yeoun</span>
        </div>

        <div className="flex flex-col gap-[10px] items-center pb-2 pt-[14px]">
          <div className="bg-[#d9d9d9] flex items-center justify-center overflow-hidden p-2 rounded-[6px] size-[106px]">
            <UserIcon />
          </div>
          <button className="text-[#5f5e5e] text-[14px] font-medium tracking-[0.7px] underline cursor-pointer">
            사진 수정하기
          </button>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-[#474741] text-[18px] font-semibold leading-6">계정 정보</h2>
          </div>
          <div className="bg-white flex flex-col gap-[22px] items-start px-5 py-[30px] rounded-[10px] w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex gap-2 items-center justify-center pl-3 w-full">
                <span className="flex-1 text-[#474741] text-[16px] font-semibold tracking-[0.7px]">이름</span>
                <ArrowRightIcon color="#474741" />
              </div>
              <div className="bg-[#f4f3f1] flex items-center px-5 py-[10px] rounded-[6px] w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-[0.7px]" />
              </div>
            </div>

            <div className="flex flex-col gap-[10px] w-full">
              <div className="pl-3">
                <span className="text-[#474741] text-[16px] font-semibold tracking-[0.7px]">이메일</span>
              </div>
              <div className="bg-[#f4f3f1] flex items-center px-5 py-[10px] rounded-[6px] w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-[0.7px]" />
              </div>
            </div>

            <button className="flex gap-2 items-center justify-between pl-3 w-full cursor-pointer">
              <span className="text-[#474741] text-[16px] font-semibold tracking-[0.7px]">비밀번호 변경하기</span>
              <ArrowRightIcon color="#474741" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-[#474741] text-[18px] font-semibold leading-6">페르소나 정보</h2>
          </div>
          <div className="bg-white flex flex-col gap-[22px] items-start px-5 py-[30px] rounded-[10px] w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <div className="pl-3">
                <span className="text-[#474741] text-[16px] font-semibold tracking-[0.7px]">고인의 이름</span>
              </div>
              <div className="bg-[#f4f3f1] flex items-center px-5 py-[10px] rounded-[6px] w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-[0.7px]" />
              </div>
            </div>

            <div className="flex flex-col gap-[10px] w-full">
              <div className="pl-3">
                <span className="text-[#474741] text-[16px] font-semibold tracking-[0.7px]">생성일</span>
              </div>
              <div className="bg-[#f4f3f1] flex items-center px-5 py-[10px] rounded-[6px] w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-[0.7px]" />
              </div>
            </div>

            <button className="bg-[#e0ded9] flex gap-[6px] items-center justify-center px-4 py-3 rounded-[6px] w-[314px] cursor-pointer">
              <AddIcon size={17} color="#808080" />
              <span className="text-[#808080] text-[14px] font-semibold tracking-[0.7px]">기억 추가하기</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-[#474741] text-[18px] font-semibold leading-6">데이터 내보내기</h2>
          </div>
          <div className="bg-white flex items-start px-5 py-[30px] rounded-[10px] w-full">
            <button className="bg-[#e0ded9] flex items-center justify-center px-4 py-3 rounded-[6px] w-[314px] cursor-pointer">
              <span className="text-[#808080] text-[14px] font-semibold tracking-[0.7px]">전체 데이터 내보내기 (zip)</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="bg-[#e9e8e5] flex items-center justify-center px-5 py-[13px] rounded-[6px] w-[346px] cursor-pointer"
        >
          <span className="text-[#5f5e5e] text-[16px] font-medium tracking-[0.7px]">로그아웃</span>
        </button>

        <button className="bg-[#e9e8e5] flex items-center justify-center px-5 py-[13px] rounded-[6px] w-[346px] cursor-pointer">
          <span className="text-[#5f5e5e] text-[16px] font-medium tracking-[0.7px]">계정삭제</span>
        </button>

        <BottomNav />
      </div>
    </div>
  );
}
