"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout } from "../components/ui/PageLayout";
import { FormField } from "../components/ui/FormField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuthStore } from "@/store/authStore";
import { usePersonaStore } from "@/store/personaStore";
import type { RsData, UserMeResponse } from "@/lib/types";

// 이메일 형식 검사용 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  // authStore의 setUser 액션 (로그인 성공 시 사용자 정보 저장)
  const setUser = useAuthStore((s) => s.setUser);
  // 로그인 직후 페르소나가 있으면 store에 캐싱해 chat의 중복 페치 방지
  const setPersona = usePersonaStore((s) => s.setPersona);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // 중복 제출 방지

    // 클라이언트 측 유효성 검사
    if (!EMAIL_REGEX.test(form.email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // 1) 로그인 요청 — 성공 시 토큰이 HttpOnly 쿠키로 저장됨
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const loginJson = (await loginRes.json()) as RsData<null>;
      if (!loginJson.success) {
        setError("이메일 또는 비밀번호를 확인해주세요.");
        return;
      }

      // 2) 내 정보 조회 — 페르소나 보유 여부를 같이 판정해 다음 화면을 정한다
      let hasPersona = false;
      try {
        const meRes = await fetch("/api/users/me");
        const meJson = (await meRes.json()) as RsData<UserMeResponse>;
        if (meJson.success && meJson.data) {
          setUser({ userId: meJson.data.id, email: meJson.data.email });
          const first = meJson.data.personas[0];
          if (first) {
            hasPersona = true;
            // chat 진입 시 즉시 사용할 수 있도록 store에 캐싱
            setPersona({
              personaId: first.id,
              name: first.name,
              nickname: first.nickname,
              status: first.status === "READY" ? "ready" : "draft",
            });
          }
        }
      } catch {
        // 내 정보 조회 실패는 무시 — 안전망으로 /chat이 다시 페르소나 체크
      }

      // 3) 명세대로 페르소나 보유 시 홈, 아니면 음성 자료 게이트로 1회 라우팅
      router.push(hasPersona ? "/chat" : "/onboarding");
    } catch {
      setError("이메일 또는 비밀번호를 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout className="flex flex-col gap-2 items-start pt-8 pb-8 px-6">
      <div className="flex items-center w-full">
        <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
      </div>

      <div className="flex-1 flex flex-col gap-[14px] items-start justify-center w-full py-8">
        <div className="flex items-end px-5 w-full">
          <h1 className="text-foreground text-[18px] font-semibold tracking-brand">로그인</h1>
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

          {/* 로그인 실패 / 유효성 검사 에러 메시지 */}
          {error && (
            <p className="text-[#c44] text-[13px] font-medium w-full pl-3">{error}</p>
          )}

          <div className="flex flex-col items-start py-[14px] w-full">
            <PrimaryButton type="submit" active={!submitting}>
              {submitting ? "로그인 중..." : "로그인하기"}
            </PrimaryButton>
          </div>
        </form>

        <div className="flex justify-center w-full">
          <div className="flex gap-[6px] items-center text-[14px] font-medium tracking-brand">
            <span className="text-subtle">아직 회원이 아니신가요?</span>
            <Link href="/signup" className="text-foreground underline">
              회원가입하기
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
