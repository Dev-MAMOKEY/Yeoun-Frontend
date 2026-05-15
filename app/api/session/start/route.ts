import { apiPost } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";
import type {
  SessionStartRequest,
  SessionStartResponse,
} from "@/lib/types";

// 대화 세션 시작 — Spring Boot POST /api/session/start 프록시
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  try {
    // 클라이언트 본문 파싱 (personaId)
    const body = (await request.json()) as SessionStartRequest;

    const data = await apiPost<SessionStartResponse>(
      "/api/session/start",
      body,
      { accessToken },
    );

    return ok(data);
  } catch (err) {
    return toErrorResponse(err, "session start POST");
  }
}
