"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../../components/ui/PageLayout";
import { MicIcon, FolderIcon, MailOpenIcon, RecordIcon } from "../../components/icons";

export default function OnboardingVoice() {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

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
            <button
              onClick={() => router.push("/onboarding/consent")}
              className="bg-surface-soft flex items-center justify-center px-5 py-[10px] rounded-card w-full cursor-pointer"
            >
              <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">음성자료가 있어요</span>
            </button>
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
