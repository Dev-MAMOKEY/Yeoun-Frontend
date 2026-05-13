"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "../components/ui/PageLayout";
import { FormField } from "../components/ui/FormField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { ArrowDownIcon, CheckIcon } from "../components/icons";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    year: "",
    month: "",
    day: "",
    within100Days: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <PageLayout className="flex flex-col gap-[14px] items-start px-6 pt-6 pb-10">
      <div className="flex items-end px-5 w-full">
        <h1 className="text-foreground text-[18px] font-semibold tracking-brand">회원가입</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white flex flex-col gap-[18px] items-center px-5 py-[30px] rounded-sheet w-full"
      >
        <FormField
          label="이름"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="이름을 입력해주세요"
        />
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
        <FormField
          label="비밀번호 확인"
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={handleChange}
          placeholder="비밀번호를 입력해주세요"
        />

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3 text-foreground text-[16px] font-semibold tracking-brand w-full">사별 시점</div>

          <div className="flex gap-[10px] items-center w-full">
            {[
              { name: "year", placeholder: "년도", options: years },
              { name: "month", placeholder: "월", options: months },
              { name: "day", placeholder: "일", options: days },
            ].map(({ name, placeholder, options }) => (
              <div key={name} className="relative flex-1">
                <select
                  name={name}
                  value={form[name as keyof typeof form] as string}
                  onChange={handleChange}
                  className="bg-surface appearance-none px-5 py-[10px] rounded-card w-full text-[16px] tracking-brand text-placeholder outline-none cursor-pointer"
                >
                  <option value="" disabled>{placeholder}</option>
                  {options.map((o) => (
                    <option key={o} value={o} className="text-foreground">{o}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <ArrowDownIcon />
                </span>
              </div>
            ))}
          </div>

          <label className="flex items-center justify-between bg-surface px-5 py-[10px] rounded-card w-full cursor-pointer">
            <span className="text-placeholder text-[16px] tracking-brand font-medium">사별 후 100일 이내이신가요?</span>
            <div className="relative shrink-0 size-[22px]">
              <input
                type="checkbox"
                name="within100Days"
                checked={form.within100Days}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`size-[22px] rounded-[4px] border-[1.4px] border-solid flex items-center justify-center ${
                  form.within100Days ? "bg-muted border-muted" : "bg-white border-border"
                }`}
              >
                {form.within100Days && <CheckIcon size={14} color="white" />}
              </div>
            </div>
          </label>
        </div>

        <div className="flex flex-col items-start pb-[2px] pt-[14px] w-full">
          <PrimaryButton type="submit">가입하기</PrimaryButton>
        </div>

        <div className="flex gap-[6px] items-center text-[14px] font-medium tracking-brand">
          <span className="text-subtle">이미 회원이신가요?</span>
          <Link href="/login" className="text-foreground underline">로그인하기</Link>
        </div>
      </form>
    </PageLayout>
  );
}
