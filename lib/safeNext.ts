const ORIGIN = "http://localhost";

// Same-site paths only; parsing like a browser catches what prefix checks miss ("/\t/evil.com", "/a/..//evil.com").
export function safeNext(next: string | null | undefined, fallback = "/proizvodi"): string {
  if (!next || !next.startsWith("/")) return fallback;

  let url: URL;
  try {
    url = new URL(next, ORIGIN);
  } catch {
    return fallback;
  }

  const path = url.pathname + url.search + url.hash;
  // "/a/..//evil.com" normalises to "//evil.com", which is protocol-relative once used as a redirect.
  if (url.origin !== ORIGIN || path.startsWith("//") || url.pathname.startsWith("/prijava")) return fallback;
  return path;
}
