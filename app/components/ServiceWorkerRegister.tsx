"use client";

import { useEffect } from "react";

// 서비스 워커 등록 — 마운트 시 한 번만 시도하고 실패는 조용히 무시한다
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // 등록 실패는 PWA 미사용 환경/HTTP 환경 등에서 정상 발생 — 침묵
      });
  }, []);
  return null;
}
