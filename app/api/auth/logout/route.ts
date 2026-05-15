import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiPost } from "@/lib/api";

// 로그아웃 — Spring Boot POST /auth/logout 프록시
// 쿠키에서 accessToken을 읽어 Authorization 헤더로 전달, 처리 후 쿠키 제거
export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    // 토큰이 있을 때만 서버 로그아웃 요청 (Bearer 헤더 부착)
    if (accessToken) {
      await apiPost("/auth/logout", undefined, { accessToken });
    }
  } catch (err) {
    // 서버 호출 실패하더라도 로컬 쿠키 정리는 진행
    if (err instanceof ApiError) {
      console.warn("[auth/logout] 서버 응답 실패", err.code, err.message);
    } else {
      console.error("[auth/logout] 예상치 못한 오류", err);
    }
  }

  // 인증 쿠키 모두 제거
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return NextResponse.json({
    success: true,
    data: null,
    error: null,
    timestamp: new Date().toISOString(),
  });
}
