import { ImageResponse } from "next/og";

// iOS 홈 화면 아이콘 — 180×180. 브랜드 색 + "Y"
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 100,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        Y
      </div>
    ),
    { ...size },
  );
}
