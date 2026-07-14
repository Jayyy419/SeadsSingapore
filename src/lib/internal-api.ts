// Server-only. Calls the interest-form Lambda's /internal/* endpoints, which the admin
// panel's own Route Handlers use to reach DynamoDB — the Amplify Next.js compute has no IAM
// role of its own (see docs/LEARNING_GUIDE.md), so this proxies through the Lambda instead,
// which already has the right table permissions. Never called from the browser directly.
export async function internalApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const baseUrl = process.env.INTERNAL_API_BASE_URL;
  const apiKey = process.env.INTERNAL_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("INTERNAL_API_BASE_URL / INTERNAL_API_KEY not configured");
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { ...init?.headers, "X-Internal-Key": apiKey, "Content-Type": "application/json" },
    cache: "no-store",
  });
}
