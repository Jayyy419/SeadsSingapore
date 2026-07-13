import type { Metadata } from "next";
import { EventsContent } from "./events-content";

export const metadata: Metadata = {
  title: "Events",
  description: "Join upcoming Seads forums, workshops, and volunteer activations across Southeast Asia.",
};

export default function EventsPage() {
  return <EventsContent />;
}
