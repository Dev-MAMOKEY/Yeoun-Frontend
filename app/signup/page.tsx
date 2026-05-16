"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout } from "../components/ui/PageLayout";
import { FormField } from "../components/ui/FormField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import type { RsData, SignUpResponse } from "@/lib/types";

// 이메일 형식 검사용 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  // 명세대로 필드별 에러 메시지를 분리 보관
  const [errors, setErrors] = useState<{
    email: string | null;
    password: string | null;
    passwordConfirm: string | null;
  }>({ email: null, password: null, passwordConfirm: null });
  // 검증 외 예기치 못한 API 오류는 별도 영역에 출력
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 사용자가 다시 입력하면 해당 필드 에러 해제
    setErrors((prev) =>
      name in prev ? { ...prev, [name]: null } : prev,
    );
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // 중복 제출 방지

    // 클라이언트 측 유효성 검사 — 명세 문구 그대로
    const nextErrors = {
      email: !EMAIL_REGEX.test(form.email)
        ? "올바른 이메일 형식이 아닙니다."
        : null,
      password:
        form.password.length < 8
          ? "비밀번호는 8자 이상 입력해주세요."
          : null,
      passwordConfirm:
        form.password.length >= 8 && form.password !== form.passwordConfirm
          ? "비밀번호가 일치하지 않습니다."
          : null,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password || nextErrors.passwordConfirm) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // 회원가입 요청 — API 스펙상 email/password/passwordConfirm만 전송
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          passwordConfirm: form.passwordConfirm,
        }),
      });
      const json = (await res.json()) as RsData<SignUpResponse>;

      if (!json.success) {
        // 이메일 중복 등 백엔드 오류 — 명세대로 이메일 필드 하단에 표시
        const code = json.error?.code ?? "";
        if (/EMAIL|DUPLICATE|EXIST/i.test(code)) {
          setErrors((prev) => ({
            ...prev,
            email: "이미 사용 중인 이메일입니다.",
          }));
        } else {
          setSubmitError(
            json.error?.message ?? "회원가입 중 오류가 발생했습니다.",
          );
        }
        return;
      }

      // 회원가입 성공 → 온보딩으로 이동
      router.push("/onboarding");
    } catch {
      setSubmitError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
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
          label="이메일"
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="이메일 주소를 입력해주세요"
          error={errors.email}
        />
        <FormField
          label="비밀번호"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="비밀번호를 입력해주세요"
          error={errors.password}
        />
        <FormField
          label="비밀번호 확인"
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={handleChange}
          placeholder="비밀번호를 입력해주세요"
          error={errors.passwordConfirm}
        />

        {/* 필드 외 일반 API 오류만 폼 하단에 표시 */}
        {submitError && (
          <p className="text-[#c44] text-[13px] font-medium w-full pl-3">{submitError}</p>
        )}

        <div className="flex flex-col items-start pb-[2px] pt-[14px] w-full">
          <PrimaryButton type="submit" active={!submitting}>
            {submitting ? "가입 중..." : "가입하기"}
          </PrimaryButton>
        </div>

        <div className="flex gap-[6px] items-center text-[14px] font-medium tracking-brand">
          <span className="text-subtle">이미 회원이신가요?</span>
          <Link href="/login" className="text-foreground underline">로그인하기</Link>
        </div>
      </form>
    </PageLayout>
  );
}
