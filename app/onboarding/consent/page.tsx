"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../../components/ui/PageLayout";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { CheckIcon } from "../../components/icons";

export default function OnboardingConsent() {
  const router = useRouter();
  const [refusal, setRefusal] = useState<"yes" | "no" | null>(null);
  const [agreed, setAgreed] = useState(false);

  return (
    <PageLayout className="flex flex-col gap-2 pt-8 pb-8 px-6">
      <div className="flex items-center w-full">
        <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
      </div>

      <div className="flex flex-col gap-[31px] items-center overflow-y-auto py-5">
        <div className="bg-white flex flex-col gap-6 items-start px-5 py-[30px] rounded-sheet w-full">
          <div className="flex flex-col gap-1">
            <p className="text-foreground text-[18px] font-semibold tracking-brand">고인께서 생전에 디지털 추모에</p>
            <p className="text-foreground text-[18px] font-semibold tracking-brand">거부 의사를 표하신 적이 있으신가요?</p>
          </div>
          <div className="flex gap-5 items-center w-full">
            {(["yes", "no"] as const).map((val) => (
              <button
                key={val}
                onClick={() => setRefusal(val)}
                className={`flex-1 flex items-center justify-center px-5 py-[10px] rounded-card cursor-pointer transition-colors ${
                  refusal === val ? "bg-surface-selected" : "bg-surface-soft"
                }`}
              >
                <span className={`text-[16px] font-medium tracking-brand ${refusal === val ? "text-[#4b4b4b]" : "text-[#8a8a8a]"}`}>
                  {val === "yes" ? "예" : "아니요"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[14px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-foreground text-[18px] font-semibold tracking-brand">서비스 이용 약관 및 개인정보 처리 방침 동의</h2>
          </div>

          <div className="bg-surface-soft flex flex-col gap-[26px] items-start px-5 py-[30px] rounded-sheet w-full">
            <p className="text-foreground text-[16px] font-semibold tracking-brand">페르소나 생성 안내 및 동의 약관 내용</p>

            <div className="flex flex-col gap-2 w-full">
              {[
                "데이터는 AI 학습에 사용되지 않습니다",
                "언제든 전체 데이터를 내보낼 수 있습니다",
                "고인의 음성과 사진은 이 서비스 외 다른 목적으로 사용 되지 않습니다",
              ].map((text) => (
                <div key={text} className="flex items-start justify-between w-full">
                  <p className="text-foreground text-[14px] font-medium leading-6 flex-1 pr-4">{text}</p>
                  <CheckIcon />
                </div>
              ))}
            </div>

            <button
              onClick={() => setAgreed(!agreed)}
              className={`flex items-center justify-center px-[30px] py-[10px] rounded-card w-full cursor-pointer transition-colors ${
                agreed ? "bg-muted" : "bg-placeholder"
              }`}
            >
              <span className="text-white text-[16px] font-medium tracking-brand">네, 동의합니다</span>
            </button>
          </div>
        </div>

        <PrimaryButton active={agreed} onClick={() => agreed && router.push("/create/info")}>
          다음
        </PrimaryButton>
      </div>
    </PageLayout>
  );
}
