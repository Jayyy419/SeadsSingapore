import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Seads collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
