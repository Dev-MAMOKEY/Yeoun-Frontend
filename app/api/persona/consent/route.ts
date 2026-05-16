import { apiPost } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";
import type { PersonaConsentRequest } from "@/lib/types";

// 페르소나 생성 동의 기록 — Spring Boot POST /api/persona/consent 프록시
// body: { consentVersion, termsAgreed, declinedIntentAnswered }
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  try {
    const body = (await request.json()) as PersonaConsentRequest;
    await apiPost<null>("/api/persona/consent", body, { accessToken });
    return ok();
  } catch (err) {
    return toErrorResponse(err, "persona consent POST");
  }
}
