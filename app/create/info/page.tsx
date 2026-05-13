"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "../../components/ui/PageLayout";
import { FormField } from "../../components/ui/FormField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StepHeader } from "../../components/ui/StepHeader";
import { ArrowLeftIcon, CameraIcon, WarningIcon } from "../../components/icons";

export default function PersonaInfo() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", title: "" });
  const [photo, setPhoto] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  }

  return (
    <PageLayout className="flex flex-col gap-3 pt-8 pb-8 px-6">
      <button onClick={() => router.back()} className="flex items-center">
        <ArrowLeftIcon />
      </button>

      <StepHeader step={1} title="기본정보 입력" />
      <ProgressBar value={0.25} />

      <div className="bg-white flex flex-col gap-5 items-center px-5 py-[30px] rounded-[10px] w-full">
        <label className="border-2 border-[#a3a3a3] border-dashed flex flex-col gap-2 items-center justify-center p-2 rounded-[8px] size-[170px] cursor-pointer overflow-hidden relative">
          {photo ? (
            <img src={photo} alt="업로드된 사진" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <CameraIcon />
              <span className="text-[#474741] text-[16px] font-medium leading-6">사진 업로드</span>
            </>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
        </label>

        <div className="flex gap-1 items-center justify-center">
          <WarningIcon />
          <span className="text-[#474741] text-[12px] font-medium leading-6">얼굴이 선명하게 담긴 사진을 올려주세요</span>
        </div>

        <FormField
          label="고인의 이름"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="고인의 이름을 입력해주세요"
        />
        <FormField
          label="호칭"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="나를 부를 호칭을 입력해주세요"
        />
      </div>

      <div className="flex flex-col items-start py-[14px] w-full">
        <PrimaryButton onClick={() => router.push("/create/voice")}>다음</PrimaryButton>
      </div>

      <div className="flex items-center justify-center w-full">
        <span className="text-[#474741] text-[14px] leading-6">이 정보는 나중에 언제든 수정할 수 있어요</span>
      </div>
    </PageLayout>
  );
}
