import type { Metadata } from "next";
import { MediaContent } from "./media-content";

export const metadata: Metadata = {
  title: "Media",
  description: "Photos from Seads programs, events, and youth-led community action across Southeast Asia.",
};

export default function MediaPage() {
  return <MediaContent />;
}
