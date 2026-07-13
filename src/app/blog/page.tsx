import type { Metadata } from "next";
import { BlogContent } from "./blog-content";

export const metadata: Metadata = {
  title: "Latest Stories",
  description: "Fresh stories from Seads programs, events, and community outcomes across Southeast Asia.",
};

export default function BlogPage() {
  return <BlogContent />;
}
