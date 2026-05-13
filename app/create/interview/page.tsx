"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../../components/ui/PageLayout";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StepHeader } from "../../components/ui/StepHeader";
import { ArrowLeftIcon } from "../../components/icons";

const QUESTIONS = [
  "고인의 가장 그리운 표정은? (한줄로 묘사)",
  "고인이 행복할 때 자주 보이던 모습은?",
  "고인이 화내실 때의 반응은?\n(조용히 / 큰소리 / 회피 등)",
  "자주 쓰시던 말버릇이나 감탄사가 있다면?",
  "당신에게 가장 자주 해주신 말은?",
  "고인이 자랑스러워 하신던 일은?",
  "고인이 가장 좋아하시던 음식·장소·시간은?",
  "고인이 평생 바라셨던 것은?",
  "고인과 가장 따뜻했던 기억 한 장면은?",
  "지금 다시 만난다면 가장 듣고 싶은 한 마디는?",
];

export default function PersonaInterview() {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [skipped, setSkipped] = useState<boolean[]>(Array(QUESTIONS.length).fill(false));

  function handleAnswer(i: number, val: string) {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)));
  }

  function handleSkip(i: number) {
    setSkipped((prev) => prev.map((s, idx) => (idx === i ? true : s)));
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? "" : a)));
  }

  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <button onClick={() => router.back()} className="flex items-center">
        <ArrowLeftIcon />
      </button>

      <StepHeader step={3} title="인터뷰 진행" />
      <ProgressBar value={0.75} />

      <div className="bg-white flex flex-col gap-[26px] items-center px-5 py-[40px] rounded-[10px] w-full">
        <div className="w-full">
          <p className="text-[#474741] text-[18px] font-semibold leading-6">아래의 질문에 답변해주세요</p>
        </div>

        {QUESTIONS.map((q, i) => (
          <div key={i} className="flex flex-col gap-[10px] items-start pt-[10px] w-[314px]">
            <div className="pl-3 w-full">
              <p className="text-[#474741] text-[16px] font-semibold tracking-[0.7px] leading-normal whitespace-pre-line">{q}</p>
            </div>
            <input
              value={answers[i]}
              onChange={(e) => handleAnswer(i, e.target.value)}
              placeholder="답변을 입력해주세요"
              disabled={skipped[i]}
              className={`px-5 py-[10px] rounded-[6px] w-full text-[16px] tracking-[0.7px] placeholder:text-[#a3a3a3] outline-none ${
                skipped[i] ? "bg-[#d9d9d9] text-[#474741]" : "bg-[#f4f3f1] text-[#474741]"
              }`}
            />
            <button
              onClick={() => handleSkip(i)}
              className="bg-[#d9d9d9] flex items-center justify-center px-5 py-[10px] rounded-[6px] w-full cursor-pointer"
            >
              <span className="text-[#474741] text-[14px] tracking-[0.7px]">건너뛰기</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start py-[14px] w-full">
        <PrimaryButton onClick={() => router.push("/create/waiting")}>다음</PrimaryButton>
      </div>
    </PageLayout>
  );
}
