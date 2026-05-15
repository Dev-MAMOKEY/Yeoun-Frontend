import { BASE_URL } from "@/lib/api";
import { fail, getAccessToken, unauthorized } from "@/lib/server-auth";

// 메시지 미디어 스트리밍 — Spring Boot GET /api/session/{sessionId}/messages/{messageId}/media 프록시
// 응답이 음성/영상 바이너리이므로 RsData 언랩 없이 Response.body 그대로 전달
export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ sessionId: string; messageId: string }>;
  },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { sessionId, messageId } = await params;

  try {
    // 스트리밍이므로 lib/api fetch 래퍼 우회
    const upstream = await fetch(
      `${BASE_URL}/api/session/${sessionId}/messages/${messageId}/media`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    // 백엔드 오류 시 상태 코드 그대로 전달
    if (!upstream.ok) {
      return fail(
        "UPSTREAM_ERROR",
        "미디어를 불러올 수 없습니다.",
        upstream.status,
      );
    }

    // Content-Type 등 미디어 재생에 필요한 헤더 보존
    const headers = new Headers();
    const contentType =
      upstream.headers.get("Content-Type") ?? "application/octet-stream";
    headers.set("Content-Type", contentType);
    const contentLength = upstream.headers.get("Content-Length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const acceptRanges = upstream.headers.get("Accept-Ranges");
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);

    // 바이너리 body를 그대로 스트리밍
    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error("[session messages/media GET] 처리 실패", err);
    return fail("INTERNAL_ERROR", "미디어 스트리밍 중 오류가 발생했습니다.", 500);
  }
}
