const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

// Defense-in-depth alongside the Lambda's own scheme check on write: guards against
// rendering a javascript: (or other unsafe-scheme) URL as href even if one somehow ended up
// stored, since these fields (social links, announcement banner link) are admin-supplied and
// rendered to every site visitor. allowRelative covers same-site links like the announcement
// banner's "/join" — a bare "/" path can never carry a scheme, so it's inherently safe.
export function isSafeUrl(value: string | null | undefined, opts: { allowRelative?: boolean } = {}): value is string {
  if (!value) return false;
  if (opts.allowRelative && value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return SAFE_SCHEMES.has(new URL(value).protocol);
  } catch {
    return false;
  }
}
