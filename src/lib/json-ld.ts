// JSON.stringify doesn't escape "<", so an admin-editable field containing "</script><script>"
// would break out of a JSON-LD <script> tag rendered via dangerouslySetInnerHTML and execute.
// < is valid inside a JSON string and parses back to "<" identically, so this is safe to
// do unconditionally with no effect on the data itself.
export function safeJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
