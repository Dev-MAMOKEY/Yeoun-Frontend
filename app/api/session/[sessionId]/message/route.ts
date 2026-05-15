import { BASE_URL } from "@/lib/api";
import { fail, getAccessToken, unauthorized } from "@/lib/server-auth";

// 음성 메시지 전송 — Spring Boot POST /api/session/{sessionId}/message 프록시
// 요청: multipart/form-data (audio 파일)
// 응답: SSE (text/event-stream) — Spring Boot 스트림을 그대로 passthrough
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { sessionId } = await params;

  try {
    // 클라이언트가 보낸 multipart FormData를 그대로 forward
    const formData = await request.formData();

    // SSE 스트리밍이므로 RsData 언랩 없이 raw fetch 사용
    const upstream = await fetch(
      `${BASE_URL}/api/session/${sessionId}/message`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // multipart의 Content-Type/boundary는 fetch가 자동 설정
          Accept: "text/event-stream",
        },
        body: formData,
        cache: "no-store",
        // SSE 응답이 끊기지 않도록 (Next.js 캐싱 비활성화)
      },
    );

    // 백엔드 오류 시 상태 코드 그대로 전달
    if (!upstream.ok) {
      return fail(
        "UPSTREAM_ERROR",
        "메시지 전송에 실패했습니다.",
        upstream.status,
      );
    }

    // SSE 헤더 보존 + 캐싱 방지 헤더 추가
    const headers = new Headers();
    const contentType =
      upstream.headers.get("Content-Type") ?? "text/event-stream";
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");
    // 프록시(예: nginx)에서 버퍼링 비활성화
    headers.set("X-Accel-Buffering", "no");

    // 이벤트 스트림 본문을 그대로 passthrough
    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error("[session message POST] 처리 실패", err);
    return fail("INTERNAL_ERROR", "메시지 처리 중 오류가 발생했습니다.", 500);
  }
}
