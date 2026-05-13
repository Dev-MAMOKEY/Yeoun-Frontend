"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout } from "../components/ui/PageLayout";
import { FormField } from "../components/ui/FormField";
import { PrimaryButton } from "../components/ui/PrimaryButton";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/chat");
  }

  return (
    <PageLayout className="flex flex-col gap-2 items-start pt-8 pb-8 px-6">
      <div className="flex items-center w-full">
        <span className="text-[24px] font-bold text-black tracking-[0.7px]">Yeoun</span>
      </div>

      <div className="flex-1 flex flex-col gap-[14px] items-start justify-center w-full py-8">
        <div className="flex items-end px-5 w-full">
          <h1 className="text-[#474741] text-[18px] font-semibold tracking-[0.7px]">로그인</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white flex flex-col gap-[18px] items-center px-5 py-[30px] rounded-[10px] w-full"
        >
          <FormField
            label="이메일"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="이메일 주소를 입력해주세요"
          />
          <FormField
            label="비밀번호"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력해주세요"
          />

          <div className="flex flex-col items-start py-[14px] w-full">
            <PrimaryButton type="submit">로그인하기</PrimaryButton>
          </div>
        </form>

        <div className="flex justify-center w-full">
          <div className="flex gap-[6px] items-center text-[14px] font-medium tracking-[0.7px]">
            <span className="text-[#7f7e7a]">아직 회원이 아니신가요?</span>
            <Link href="/signup" className="text-[#474741] underline">
              회원가입하기
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
