import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Seads is a youth-led non-profit cultivating sustainability, mental health awareness, and personal growth across Southeast Asia.",
};

export default function AboutPage() {
  return <AboutContent />;
}
