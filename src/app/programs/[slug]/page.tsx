import type { Metadata } from "next";
import { ProgramDetailContent } from "./program-detail-content";

// Programs moved from siteContent.ts (static) to DynamoDB so admins can create/edit/delete
// them without a code change + deploy — that means generateStaticParams can no longer
// enumerate them at build time, so this route renders dynamically per request instead of SSG.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

async function getProgram(slug: string) {
  const res = await fetch(`${API_BASE_URL}/programs`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.programs ?? []).find((program: { slug: string }) => program.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return {};
  return { title: program.name.en, description: program.description.en };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProgramDetailContent slug={slug} />;
}
