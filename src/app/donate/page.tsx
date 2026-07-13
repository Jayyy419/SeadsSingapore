import type { Metadata } from "next";
import { DonateContent } from "./donate-content";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support Seads' youth-led programs and community initiatives across Southeast Asia.",
};

export default function DonatePage() {
  return <DonateContent />;
}
