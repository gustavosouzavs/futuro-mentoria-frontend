/**
 * Garante URL absoluta para materiais (links relativos ao backend, ex. /uploads/...).
 */
export function resolveMaterialUrl(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (trimmed.startsWith("/")) {
    return base ? `${base}${trimmed}` : trimmed;
  }
  return trimmed;
}
