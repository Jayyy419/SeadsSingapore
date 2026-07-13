import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out to Seads for events, collaborations, media, and partnership opportunities.",
};

export default function ContactPage() {
  return <ContactContent />;
}
