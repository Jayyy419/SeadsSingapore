import QRCode from "qrcode";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";

// UTM-tagged so scans at physical events/print materials show up distinctly from other
// traffic in analytics, rather than being indistinguishable from a normal page visit.
export function buildTrackedUrl(path: string, campaign: string): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", "qr");
  url.searchParams.set("utm_medium", "print");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export async function buildQrPng(targetUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(targetUrl, { type: "png", width: 512, margin: 2 });
}
