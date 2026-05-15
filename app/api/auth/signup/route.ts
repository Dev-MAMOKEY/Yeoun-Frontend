import { NextResponse } from "next/server";
import { ApiError, apiPost } from "@/lib/api";
import type { SignUpRequest, SignUpResponse } from "@/lib/types";

// 회원가입 — Spring Boot POST /auth/signup 프록시
export async function POST(request: Request) {
  try {
    // 클라이언트 요청 본문 파싱
    const body = (await request.json()) as SignUpRequest;

    // Spring Boot 서버로 프록시 호출
    const data = await apiPost<SignUpResponse>("/auth/signup", body);

    // { id, email } 형태로 응답
    return NextResponse.json({
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // 비즈니스 오류는 백엔드 메시지를 그대로 전달
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
    console.error("[auth/signup] 처리 실패", err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "회원가입 처리 중 오류가 발생했습니다.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
