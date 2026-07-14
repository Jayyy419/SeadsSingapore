const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";

// RFC 9116. Expires is a hard requirement — scanners treat an expired file as absent —
// so this is set a year out and needs bumping whenever it's revisited.
const body = `Contact: mailto:hello@seads.sg
Expires: 2027-07-14T00:00:00Z
Preferred-Languages: en
Canonical: ${SITE_URL}/.well-known/security.txt
`;

export async function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
