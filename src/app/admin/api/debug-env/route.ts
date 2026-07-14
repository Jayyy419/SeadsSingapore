import { NextResponse } from "next/server";

// TEMPORARY — diagnosing why ADMIN_PASSWORD comparisons fail in production regardless of
// value. Reports only presence/length, never actual secret values. Remove once resolved.
export async function GET() {
  const report = (name: string) => {
    const value = process.env[name];
    return { set: value !== undefined, length: value?.length ?? 0 };
  };

  return NextResponse.json({
    ADMIN_PASSWORD: report("ADMIN_PASSWORD"),
    ADMIN_SESSION_SECRET: report("ADMIN_SESSION_SECRET"),
    INTERNAL_API_KEY: report("INTERNAL_API_KEY"),
    INTERNAL_API_BASE_URL: report("INTERNAL_API_BASE_URL"),
    NEXT_PUBLIC_API_BASE_URL: report("NEXT_PUBLIC_API_BASE_URL"),
    NODE_ENV: process.env.NODE_ENV,
  });
}
