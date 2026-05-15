import { apiPost } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";
import type { PersonaCreateRequest, PersonaResponse } from "@/lib/types";

// 페르소나 생성 — Spring Boot POST /api/persona 프록시
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  try {
    // 클라이언트 본문 파싱 (name, nickname)
    const body = (await request.json()) as PersonaCreateRequest;

    const data = await apiPost<PersonaResponse>("/api/persona", body, {
      accessToken,
    });

    return ok(data);
  } catch (err) {
    return toErrorResponse(err, "persona POST");
  }
}
