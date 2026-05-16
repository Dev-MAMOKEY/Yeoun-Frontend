"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SplashClientProps {
  // 서버에서 쿠키로 미리 판정한 인증 상태
  isAuthenticated: boolean;
}

// 스플래시 본체 — 2초 노출 후 인증 상태에 맞춰 다음 화면으로 이동
export function SplashClient({ isAuthenticated }: SplashClientProps) {
  const router = useRouter();

  useEffect(() => {
    const target = isAuthenticated ? "/chat" : "/login";
    const timer = setTimeout(() => router.push(target), 2000);
    return () => clearTimeout(timer);
  }, [router, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-[30px] font-bold text-black tracking-brand">
          Yeoun
        </h1>
        <p className="text-[14px] text-black tracking-brand">여운</p>
      </div>
    </div>
  );
}
