import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1f2937",
          backgroundImage: "radial-gradient(circle at 25% 20%, #25594c 0%, #1f2937 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <div style={{ fontSize: 128, fontFamily: "serif", fontWeight: 700, color: "#ffffff" }}>Seads</div>
          <div style={{ fontSize: 40, fontFamily: "serif", fontStyle: "italic", color: "#8fa295" }}>/si:dz/</div>
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 760,
            textAlign: "center",
            fontSize: 30,
            color: "#dceadf",
            fontFamily: "sans-serif",
          }}
        >
          A youth-led movement seeding sustainability, mental health awareness, and growth
          across Southeast Asia.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#c8763f",
            fontFamily: "sans-serif",
            fontWeight: 700,
          }}
        >
          Seads Singapore &middot; est. across SEA
        </div>
      </div>
    ),
    { ...size }
  );
}
