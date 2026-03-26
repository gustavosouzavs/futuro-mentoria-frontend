import { resolveMaterialUrl } from "@/lib/material-url";

function apiOrigin(): string | null {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return null;
  try {
    return new URL(base).origin;
  } catch {
    return null;
  }
}

function resolvedOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Abre link externo em nova aba ou baixa via fetch com cookies (mesma origem da API),
 * para PDFs/caminhos protegidos que falham com <a target="_blank"> entre origens diferentes.
 */
export async function openOrDownloadMaterial(url: string, filename: string): Promise<void> {
  const resolved = resolveMaterialUrl(url).trim();
  if (!resolved) return;

  const origin = apiOrigin();
  const sameAsApi =
    origin != null &&
    (!/^https?:\/\//i.test(resolved) || resolvedOrigin(resolved) === origin);

  if (!sameAsApi) {
    window.open(resolved, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    const res = await fetch(resolved, { credentials: "include", mode: "cors" });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    const safeName = filename.replace(/[^\w.\s-]/g, "_").trim() || "arquivo";
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(resolved, "_blank", "noopener,noreferrer");
  }
}
