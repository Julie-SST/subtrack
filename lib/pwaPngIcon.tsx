import { ImageResponse } from "next/og";

export function pwaPngIconResponse(px: 192 | 512) {
  const fontSize = Math.round((110 * px) / 180);
  const letterSpacing = Math.round((-4 * px) / 180);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          color: "white",
          fontSize,
          fontWeight: 900,
          letterSpacing,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        S
      </div>
    ),
    { width: px, height: px }
  );
}
