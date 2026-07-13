import type { Metadata } from "next";
import { ProgramsContent } from "./programs-content";

export const metadata: Metadata = {
  title: "Signature Programs",
  description: "Explore Seads initiatives across sustainability, mental health, leadership, innovation, media, and service.",
};

export default function ProgramsPage() {
  return <ProgramsContent />;
}
