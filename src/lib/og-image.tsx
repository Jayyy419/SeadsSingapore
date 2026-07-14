import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

// Shared branded card for every per-route opengraph-image.tsx (programs/[slug],
// events/[slug], blog/[slug]) — same visual treatment as the site-wide root
// opengraph-image.tsx, but showing the specific page's title/eyebrow instead of the generic
// tagline, so social shares of a specific program/event/story actually reflect its content.
export function buildOgImage(title: string, eyebrow: string) {
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
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#c8763f",
            fontFamily: "sans-serif",
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 20,
            maxWidth: 980,
            textAlign: "center",
            fontSize: 64,
            fontFamily: "serif",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 40 }}>
          <div style={{ fontSize: 40, fontFamily: "serif", fontWeight: 700, color: "#dceadf" }}>Seads</div>
          <div style={{ fontSize: 20, fontFamily: "serif", fontStyle: "italic", color: "#8fa295" }}>/si:dz/</div>
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}
