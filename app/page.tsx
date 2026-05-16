import { cookies } from "next/headers";
import { SplashClient } from "./components/SplashClient";

// 스플래시 — 진입 시 쿠키로 인증 여부를 판정해 클라이언트로 내려준다
// proxy가 "/"를 보호 경로에서 제외하므로 누구든 진입 가능
export default async function Splash() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("accessToken");
  return <SplashClient isAuthenticated={isAuthenticated} />;
}
