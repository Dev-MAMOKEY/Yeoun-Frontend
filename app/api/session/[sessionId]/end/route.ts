import { apiPost } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";

// 대화 세션 종료 — Spring Boot POST /api/session/{sessionId}/end 프록시
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { sessionId } = await params;

  try {
    // 본문 없이 호출, success 여부만 확인하면 됨
    await apiPost<unknown>(`/api/session/${sessionId}/end`, undefined, {
      accessToken,
    });
    return ok();
  } catch (err) {
    return toErrorResponse(err, "session end POST");
  }
}
