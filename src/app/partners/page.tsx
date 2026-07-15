import type { Metadata } from "next";
import { PartnersContent } from "./partners-content";

export const metadata: Metadata = {
  title: "Partners",
  description: "Seads collaborates with schools, NGOs, and private sector partners across Southeast Asia to multiply community outcomes.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  return <PartnersContent />;
}
