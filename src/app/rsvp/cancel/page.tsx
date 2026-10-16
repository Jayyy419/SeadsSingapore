import type { Metadata } from "next";
import { RsvpCancelContent } from "./rsvp-cancel-content";

export const metadata: Metadata = {
  title: "Cancel your RSVP",
  description: "Can't make it to a Seads event? Cancel your RSVP so someone on the waitlist can have your spot.",
  // Only ever reached from a personal link in an RSVP email.
  robots: { index: false, follow: false },
};

export default function RsvpCancelPage() {
  return <RsvpCancelContent />;
}
