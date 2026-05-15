import { apiDelete } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";

// 페르소나 삭제 — Spring Boot DELETE /api/persona/{personaId} 프록시
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ personaId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { personaId } = await params;

  try {
    await apiDelete<null>(`/api/persona/${personaId}`, undefined, {
      accessToken,
    });
    return ok();
  } catch (err) {
    return toErrorResponse(err, "persona DELETE");
  }
}
