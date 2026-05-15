import { apiGet } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";
import type { IdleClipResponse } from "@/lib/types";

// Idle 영상 목록 조회 — Spring Boot GET /api/persona/{personaId}/idle-clips 프록시
// 응답: [{ idx }] 형태의 배열
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ personaId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { personaId } = await params;

  try {
    const data = await apiGet<IdleClipResponse[]>(
      `/api/persona/${personaId}/idle-clips`,
      { accessToken },
    );
    return ok(data);
  } catch (err) {
    return toErrorResponse(err, "persona idle-clips GET");
  }
}
