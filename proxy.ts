import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 비로그인 상태에서 접근을 막을 보호 경로
// 스플래시("/")는 인증 상태와 무관하게 진입 가능하며, 페이지 내부에서 분기 라우팅한다
const PROTECTED_PATHS = ["/my", "/chat", "/create", "/onboarding"];

// 로그인 상태에서 접근 시 홈으로 보낼 인증 경로
const AUTH_PATHS = ["/login", "/signup"];

// 경로가 목록 중 하나와 정확히 일치하거나 하위 경로인지 검사
function matchPath(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// Next.js 16: 구 middleware → proxy 로 명칭 변경
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // accessToken 쿠키 존재 여부로 로그인 상태 판단
  const isAuthenticated = request.cookies.has("accessToken");

  const isProtected = matchPath(pathname, PROTECTED_PATHS);
  const isAuthPage = matchPath(pathname, AUTH_PATHS);

  // 비로그인 + 보호 경로 → 로그인 페이지로 리다이렉트
  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 로그인 상태 + 로그인/회원가입 페이지 → 홈으로 리다이렉트
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 그 외 요청은 그대로 통과
  return NextResponse.next();
}

export const config = {
  // API 라우트, 정적 파일, 이미지 최적화 경로는 검사 제외
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
