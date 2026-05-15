import { apiPost } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";
import type { InterviewAnswerRequest } from "@/lib/types";

// 인터뷰 답변 저장 — Spring Boot POST /api/persona/{personaId}/interview 프록시
// body: InterviewAnswerRequest[] 배열 그대로 전송
// 답변 저장 후 백엔드에서 AI 생성 처리가 시작됨
export async function POST(
  request: Request,
  { params }: { params: Promise<{ personaId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { personaId } = await params;

  try {
    // 인터뷰 답변 배열 파싱
    const answers = (await request.json()) as InterviewAnswerRequest[];

    const data = await apiPost<unknown>(
      `/api/persona/${personaId}/interview`,
      answers,
      { accessToken },
    );

    return ok(data);
  } catch (err) {
    return toErrorResponse(err, "persona interview POST");
  }
}
