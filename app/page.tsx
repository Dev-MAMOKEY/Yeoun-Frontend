"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/login"), 2000);
    return () => clearTimeout(timer);
  }, [router]);

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
