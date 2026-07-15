import { NextResponse } from "next/server";
import { internalApiFetch } from "@/lib/internal-api";

// Thin proxy to the interest-form Lambda's POST /internal/uploads — a client component can't
// call internalApiFetch directly (it reads the session cookie via next/headers, a server-only
// API), so this Route Handler does that server-side and hands the presigned URL back to the
// browser, which then PUTs the actual file bytes straight to S3.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const contentType = body?.contentType;

  const lambdaRes = await internalApiFetch("/internal/uploads", {
    method: "POST",
    body: JSON.stringify({ contentType }),
  });

  if (!lambdaRes.ok) {
    const data = await lambdaRes.json().catch(() => null);
    return NextResponse.json({ error: data?.error ?? "Could not create upload URL" }, { status: lambdaRes.status });
  }

  const data = await lambdaRes.json();
  return NextResponse.json(data);
}
