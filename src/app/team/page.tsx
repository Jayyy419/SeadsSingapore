import type { Metadata } from "next";
import { TeamContent } from "./team-content";

export const metadata: Metadata = {
  title: "Meet The Team",
  description: "Meet the people powering Seads across strategy, programs, and community partnerships.",
};

export default function TeamPage() {
  return <TeamContent />;
}
