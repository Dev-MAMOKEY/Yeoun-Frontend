// 공통 응답 래퍼 — 모든 API 응답에 사용
export interface RsData<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  timestamp: string;
}

// 회원가입 요청
export interface SignUpRequest {
  email: string; // 이메일
  password: string; // 비밀번호 (최소 8자)
  passwordConfirm: string; // 비밀번호 확인
}

// 회원가입 응답
export interface SignUpResponse {
  id: string; // UUID
  email: string;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string; // Bearer 토큰
  refreshToken: string; // 리프레시 토큰
}
