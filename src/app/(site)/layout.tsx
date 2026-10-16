import { getPublicData } from "@/lib/public-data";
import { PublicDataProvider } from "@/lib/public-data-context";

// Every public page renders from the same once-a-minute server fetch of the public API (see
// src/lib/public-data.ts). The admin panel sits outside this route group: its pages are
// force-dynamic, which would turn these cached fetches into live calls on every admin request.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return <PublicDataProvider data={await getPublicData()}>{children}</PublicDataProvider>;
}
