import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError } from "./api";

// Route Handler에서 accessToken 쿠키 읽기
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

// 표준 성공 응답 (RsData 포맷)
export function ok<T>(data: T | null = null) {
  return NextResponse.json({
    success: true,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  });
}

// 표준 실패 응답 (RsData 포맷)
export function fail(code: string, message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: { code, message },
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

// 미인증 응답
export function unauthorized() {
  return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
}

// try/catch 블록에서 에러를 표준 응답으로 변환
// 401(인증 만료/무효)인 경우 인증 쿠키를 함께 정리해 클라이언트가 강제 로그아웃에 진입하도록 한다
export async function toErrorResponse(err: unknown, context: string) {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      const cookieStore = await cookies();
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
    }
    return fail(err.code, err.message, err.status);
  }
  console.error(`[${context}] 처리 실패`, err);
  return fail("INTERNAL_ERROR", "요청 처리 중 오류가 발생했습니다.", 500);
}
