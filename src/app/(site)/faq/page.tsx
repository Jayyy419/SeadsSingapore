import type { Metadata } from "next";
import { FaqContent } from "./faq-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about joining Seads, volunteering, and our programs.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <FaqContent />;
}
