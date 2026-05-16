// 인증 필요 페이지에서 사용할 fetch 헬퍼
// 응답이 401이면 BFF가 이미 인증 쿠키를 정리했으므로 풀 리로드로 /login으로 이동
// (풀 리로드 시 Zustand store도 자동 초기화되므로 별도 정리 없이 일관 상태 보장)
export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401 && typeof window !== "undefined") {
    // 이미 로그인 화면에 있다면 굳이 이동시키지 않는다(예: 로그인 시도 실패의 401)
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  return res;
}
