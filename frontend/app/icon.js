import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          borderRadius: 16,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "white",
          fontSize: 42,
          fontWeight: 800,
        }}
      >
        L
      </div>
    ),
    size
  );
}
