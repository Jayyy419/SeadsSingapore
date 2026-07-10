import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ScrollProgress } from "@/components/scroll-progress";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seads Singapore",
  description:
    "Seads is a youth-led non-profit cultivating sustainability, mental health awareness, and personal growth across Southeast Asia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ScrollProgress />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
