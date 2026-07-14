import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import { ScrollProgress } from "@/components/scroll-progress";
import { LocaleProvider } from "@/lib/locale-context";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const siteName = "Seads Singapore";
const description =
  "Seads is a youth-led non-profit cultivating sustainability, mental health awareness, and personal growth across Southeast Asia.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";

// NonprofitOrganization structured data — only fields backed by real content on the site
// (see docs/CHANGELOG.md); no fabricated address/social links.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NonprofitOrganization",
  name: siteName,
  alternateName: "Seads",
  url: siteUrl,
  logo: `${siteUrl}/opengraph-image`,
  description,
  email: "hello@seads.sg",
  address: { "@type": "PostalAddress", addressCountry: "SG" },
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com"),
  title: {
    default: siteName,
    template: "%s | Seads Singapore",
  },
  description,
  openGraph: {
    siteName,
    title: siteName,
    description,
    type: "website",
    locale: "en_SG",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ScrollProgress />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
