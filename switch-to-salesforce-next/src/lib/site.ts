/**
 * Canonical site origin for metadata / Open Graph (set NEXT_PUBLIC_SITE_URL in production).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  if (!path) return getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
