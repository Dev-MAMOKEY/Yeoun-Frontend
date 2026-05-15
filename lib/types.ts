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

// 페르소나 상태
export type PersonaStatus = "DRAFT" | "PROCESSING" | "READY" | "FAILED";

// 페르소나 응답
export interface PersonaResponse {
  id: string;
  name: string;
  nickname: string;
  status: PersonaStatus;
  createdAt: string;
}

// 페르소나 요약 (내 정보 조회 시 포함)
export interface PersonaSummary {
  id: string;
  name: string;
  nickname: string;
  status: PersonaStatus;
  createdAt: string;
}

// 내 정보 조회 응답
export interface UserMeResponse {
  id: string;
  email: string;
  personas: PersonaSummary[];
}

// 페르소나 생성 상태 응답
export interface PersonaStatusResponse {
  id: string;
  status: PersonaStatus;
}

// Idle 영상 응답
export interface IdleClipResponse {
  idx: number;
}

// 인터뷰 답변 요청
export interface InterviewAnswerRequest {
  questionNumber: number; // 1~10
  answer: string;
}

// 페르소나 생성 요청
export interface PersonaCreateRequest {
  name: string;
  nickname: string;
}

// 계정 삭제 요청
export interface DeleteAccountRequest {
  password: string;
}
