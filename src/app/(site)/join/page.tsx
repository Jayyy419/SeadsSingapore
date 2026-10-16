import type { Metadata } from "next";
import { JoinContent } from "./join-content";

export const metadata: Metadata = {
  title: "Join Seads",
  description: "Start your journey with Seads as a participant, volunteer, contributor, or community partner.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return <JoinContent />;
}
