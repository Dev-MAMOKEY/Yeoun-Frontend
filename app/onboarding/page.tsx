"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../components/ui/PageLayout";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import {
  MicIcon,
  FolderIcon,
  MailOpenIcon,
  RecordIcon,
  CheckIcon,
} from "../components/icons";
import { usePersonaStore } from "@/store/personaStore";

// 온보딩 내부 단계 — 음성 자료 안내 → 약관 동의
type OnboardingStep = "voice" | "consent";

export default function Onboarding() {
  const router = useRouter();
  // 이미 페르소나가 있으면 온보딩 불필요
  const persona = usePersonaStore((s) => s.persona);

  const [step, setStep] = useState<OnboardingStep>("voice");
  const [showSheet, setShowSheet] = useState(false);
  const [refusal, setRefusal] = useState<"yes" | "no" | null>(null);
  const [agreed, setAgreed] = useState(false);

  // 페르소나 보유 시 홈으로 리다이렉트
  useEffect(() => {
    if (persona) router.replace("/");
  }, [persona, router]);

  // 음성 자료 안내 단계
  if (step === "voice") {
    return (
      <PageLayout className="flex flex-col gap-2 pt-8 pb-8 px-6 relative">
        <div className="flex items-center w-full">
          <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
        </div>

        <div className="flex-1 flex items-center justify-center py-5">
          <div className="bg-white flex flex-col gap-[30px] items-start justify-center px-5 py-[30px] rounded-sheet w-full">
            <MicIcon size={24} />

            <div className="flex flex-col gap-[4px] items-start text-foreground text-[18px] font-semibold tracking-brand">
              <p>페르소나를 만들려면</p>
              <p>고인의 음성 자료가 1분이상 필요해요</p>
            </div>

            <div className="flex flex-col gap-5 items-start w-full">
              {/* 음성 자료 보유 → 약관 동의 단계로 */}
              <button
                onClick={() => setStep("consent")}
                className="bg-surface-soft flex items-center justify-center px-5 py-[10px] rounded-card w-full cursor-pointer"
              >
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">음성자료가 있어요</span>
              </button>
              {/* 음성 자료 없음 → 안내 시트 */}
              <button
                onClick={() => setShowSheet(true)}
                className="bg-surface-soft flex items-center justify-center px-5 py-[10px] rounded-card w-full cursor-pointer"
              >
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">아직 없어요</span>
              </button>
            </div>
          </div>
        </div>

        {showSheet && (
          <div
            className="fixed inset-0 bg-[rgba(19,19,19,0.3)] z-40 flex items-end justify-center"
            onClick={() => setShowSheet(false)}
          >
            <div
              className="w-full max-w-app bg-white flex flex-col gap-5 items-start pb-14 pt-[22px] px-[30px] rounded-tl-sheet rounded-tr-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-full">
                <div className="bg-border h-[4px] rounded-full w-8" />
              </div>

              <div className="pt-[9px]">
                <h2 className="text-foreground text-[18px] font-semibold tracking-brand">음성 자료를 찾아보세요</h2>
              </div>

              <div className="flex flex-col gap-5 w-full">
                {[
                  { icon: <FolderIcon />, title: "가족 행사 영상", desc: "갤러리에 담긴 영상 속 목소리를 확인해보세요" },
                  { icon: <MailOpenIcon />, title: "메신저 앱", desc: "카톡에서 주고 받은 음성 메세지를 확인해보세요" },
                  { icon: <RecordIcon />, title: "통화 녹음", desc: "음성 메모 앱이나 통화 녹음 파일을 확인해보세요" },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="bg-surface-strong flex gap-[14px] items-start px-4 py-[22px] rounded-card w-full">
                    <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px] shrink-0">
                      {icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-foreground text-[16px] font-semibold tracking-brand">{title}</p>
                      <p className="text-subtle text-[12px] font-medium">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center pt-[6px] w-full">
                <button
                  onClick={() => setShowSheet(false)}
                  className="text-foreground text-[14px] font-medium tracking-brand underline"
                >
                  준비되면 다시 올게요
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    );
  }

  // 약관 동의 단계
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

        {/* 약관 동의 시 페르소나 생성 플로우로 이동 */}
        <PrimaryButton active={agreed} onClick={() => agreed && router.push("/create")}>
          다음
        </PrimaryButton>
      </div>
    </PageLayout>
  );
}
