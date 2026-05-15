import type { RsData } from "./types";

// Spring Boot 서버 baseURL
const BASE_URL = "http://yeoun-be.d3h1.com";

// API 에러: success: false 응답을 표준화한 에러 객체
export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ApiError";
  }
}

// 요청 옵션 — accessToken 또는 커스텀 헤더 주입
export interface RequestOptions {
  accessToken?: string; // Bearer 토큰 (헤더에 자동 부착)
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// 내부 공통 처리: 헤더 조립 → fetch → RsData 언랩
async function request<T>(
  path: string,
  init: RequestInit,
  options?: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    ...options?.headers,
  };

  // 인증 토큰이 있으면 Authorization 헤더에 부착
  if (options?.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    signal: options?.signal,
    cache: "no-store",
  });

  // 응답 본문이 비어있을 수 있으므로 안전하게 파싱
  const text = await res.text();
  const json = (text ? JSON.parse(text) : {}) as RsData<T>;

  // success: false 시 표준 에러로 throw
  if (!json.success || json.error) {
    const code = json.error?.code ?? "UNKNOWN";
    const message =
      json.error?.message ?? "요청 처리 중 오류가 발생했습니다.";
    throw new ApiError(code, message, res.status);
  }

  return json.data as T;
}

// GET 요청
export function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { method: "GET" }, options);
}

// POST 요청 (JSON 본문)
export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    options,
  );
}

// DELETE 요청
export function apiDelete<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  return request<T>(path, { method: "DELETE" }, options);
}

// multipart/form-data 업로드
// Content-Type을 직접 지정하면 boundary가 깨지므로 생략 (브라우저/Node가 자동 설정)
export function apiUpload<T>(
  path: string,
  formData: FormData,
  options?: RequestOptions,
): Promise<T> {
  return request<T>(path, { method: "POST", body: formData }, options);
}
