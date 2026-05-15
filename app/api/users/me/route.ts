import { cookies } from "next/headers";
import { apiDelete, apiGet } from "@/lib/api";
import {
  getAccessToken,
  ok,
  toErrorResponse,
  unauthorized,
} from "@/lib/server-auth";
import type { DeleteAccountRequest, UserMeResponse } from "@/lib/types";

// 내 정보 조회 — Spring Boot GET /users/me 프록시
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  try {
    const data = await apiGet<UserMeResponse>("/users/me", { accessToken });
    return ok(data);
  } catch (err) {
    return toErrorResponse(err, "users/me GET");
  }
}

// 계정 삭제 — Spring Boot DELETE /users/me 프록시
// body: { password } 필수, 성공 시 인증 쿠키 제거
export async function DELETE(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) return unauthorized();

  try {
    // 비밀번호 본문 파싱
    const body = (await request.json()) as DeleteAccountRequest;

    await apiDelete<null>("/users/me", body, { accessToken });

    // 인증 쿠키 모두 제거
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return ok();
  } catch (err) {
    return toErrorResponse(err, "users/me DELETE");
  }
}
