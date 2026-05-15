import { apiUpload } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";

// 페르소나 사진 업로드 — Spring Boot POST /api/persona/{personaId}/photo 프록시
// 클라이언트의 multipart/form-data를 그대로 전달
export async function POST(
  request: Request,
  { params }: { params: Promise<{ personaId: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  const { personaId } = await params;

  try {
    // 클라이언트가 보낸 FormData를 그대로 forward
    const formData = await request.formData();

    const data = await apiUpload<unknown>(
      `/api/persona/${personaId}/photo`,
      formData,
      { accessToken },
    );

    return ok(data);
  } catch (err) {
    return toErrorResponse(err, "persona photo POST");
  }
}
