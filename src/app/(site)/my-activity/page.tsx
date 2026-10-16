import type { Metadata } from "next";
import { MyActivityContent } from "./my-activity-content";

export const metadata: Metadata = {
  title: "My Activity",
  description: "Get a secure link by email to see your RSVPs and applications with Seads.",
  alternates: { canonical: "/my-activity" },
};

export default function MyActivityPage() {
  return <MyActivityContent />;
}
