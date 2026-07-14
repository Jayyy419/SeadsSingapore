import type { Metadata } from "next";
import { SubmitStoryContent } from "./submit-content";

export const metadata: Metadata = {
  title: "Share Your Story",
  description: "Submit a community story to Seads for review and publication on our blog.",
};

export default function SubmitStoryPage() {
  return <SubmitStoryContent />;
}
