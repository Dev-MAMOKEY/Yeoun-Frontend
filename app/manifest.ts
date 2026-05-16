import type { MetadataRoute } from "next";

// PWA 웹 앱 매니페스트 — Next.js가 /manifest.webmanifest로 자동 노출한다
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yeoun | 여운",
    short_name: "Yeoun",
    description:
      "고인의 디지털 페르소나를 생성하고 대화할 수 있는 모바일 웹 추모 서비스",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf9f6",
    theme_color: "#775a19",
    lang: "ko",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
