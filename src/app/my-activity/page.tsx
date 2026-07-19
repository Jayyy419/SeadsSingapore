import type { Metadata } from "next";
import { MyActivityContent } from "./my-activity-content";

export const metadata: Metadata = {
  title: "My Activity",
  description: "Look up your RSVPs and applications with Seads by email.",
  alternates: { canonical: "/my-activity" },
};

export default function MyActivityPage() {
  return <MyActivityContent />;
}
