import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiPost } from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/lib/types";

// 로그인 — Spring Boot POST /auth/login 프록시
// 응답 토큰을 HttpOnly 쿠키로 저장
export async function POST(request: Request) {
  try {
    // 클라이언트 요청 본문 파싱
    const body = (await request.json()) as LoginRequest;

    // Spring Boot 서버로 프록시 호출
    const data = await apiPost<LoginResponse>("/auth/login", body);

    // 쿠키 저장 옵션 (HttpOnly + SameSite Lax + 운영 환경에서 Secure)
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
    };

    // accessToken / refreshToken 모두 HttpOnly 쿠키로 저장
    cookieStore.set("accessToken", data.accessToken, cookieOptions);
    cookieStore.set("refreshToken", data.refreshToken, cookieOptions);

    // 토큰 값은 응답 본문에 노출하지 않음
    return NextResponse.json({
      success: true,
      data: null,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // 인증 실패 등 비즈니스 오류
    if (err instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: err.code, message: err.message },
          timestamp: new Date().toISOString(),
        },
        { status: err.status },
      );
    }

    // 예기치 못한 오류
    console.error("[auth/login] 처리 실패", err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "로그인 처리 중 오류가 발생했습니다.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
