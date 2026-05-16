import { ImageResponse } from "next/og";

// PWA·favicon 공통 아이콘 — 브랜드 색 배경 위 "Y" 글자
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#775a19",
          color: "#ffffff",
          fontSize: 280,
          fontWeight: 700,
          letterSpacing: 4,
        }}
      >
        Y
      </div>
    ),
    { ...size },
  );
}
