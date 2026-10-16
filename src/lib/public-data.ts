// Server-side: the public API data every public page renders from, fetched once per minute
// rather than by every visitor's browser. Before this, each page view made its own calls to
// the API (about six on the home page), so content arrived after a flash of the built-in
// fallback, search engines indexed the fallback, and two visitors arriving together could hit
// the API's shared rate limit and silently get stale content.
//
// Revalidated on a timer only: Amplify Hosting doesn't support on-demand revalidation
// (revalidateTag/revalidatePath), so an admin edit reaches the public site within a minute.
// RSVP counts aren't included — they need to be live, and stay a browser fetch.
//
// Off outside production builds: in `next dev` (and so in the e2e suite, whose tests mock the
// browser's API calls per test) the hooks keep fetching from the browser as before.

export const PUBLIC_ENDPOINTS = ["events", "team", "programs", "partners", "stories", "site-content", "impact-metrics"] as const;
export type PublicEndpoint = (typeof PUBLIC_ENDPOINTS)[number];
// Each endpoint's raw JSON body, as the browser would have fetched it. A missing key means the
// server fetch failed, and that hook falls back to fetching in the browser.
export type PublicData = Partial<Record<PublicEndpoint, unknown>>;

export const PUBLIC_DATA_REVALIDATE_SECONDS = 60;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

export async function getPublicData(): Promise<PublicData> {
  if (process.env.NODE_ENV !== "production") return {};
  const entries = await Promise.all(
    PUBLIC_ENDPOINTS.map(async (endpoint) => {
      try {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`, { next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS } });
        return res.ok ? ([endpoint, await res.json()] as const) : null;
      } catch (err) {
        console.error(`Prefetching /${endpoint} failed; the browser will fetch it instead:`, err);
        return null;
      }
    })
  );
  return Object.fromEntries(entries.filter((entry) => entry !== null));
}
