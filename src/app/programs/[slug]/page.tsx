import type { Metadata } from "next";
import { programs } from "@/content/siteContent";
import { ProgramDetailContent } from "./program-detail-content";

export function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }));
}

function getProgram(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  return { title: program.name.en, description: program.description.en };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProgramDetailContent slug={slug} />;
}
