import { apiGet } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";
import type { PersonaStatusResponse } from "@/lib/types";

// 페르소나 생성 상태 조회 — Spring Boot GET /api/persona/{personaId}/status 프록시
// 클라이언트에서 5초 간격 폴링으로 사용
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ personaId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { personaId } = await params;

  try {
    const data = await apiGet<PersonaStatusResponse>(
      `/api/persona/${personaId}/status`,
      { accessToken },
    );
    return ok(data);
  } catch (err) {
    return toErrorResponse(err, "persona status GET");
  }
}
