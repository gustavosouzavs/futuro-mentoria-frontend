import { postFormData } from "@/lib/api";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function getBlob(path: string): Promise<Blob> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${base}${p}`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    let msg = text || `Erro ${res.status}`;
    try {
      const json = text ? (JSON.parse(text) as { message?: string }) : null;
      if (json?.message) msg = json.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return await res.blob();
}

export const adminReportsApi = {
  async downloadPdf(from: string, to: string) {
    const blob = await getBlob(`/api/admin/reports/mentorias.pdf?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    downloadBlob(`relatorio-mentorias-${from}-a-${to}.pdf`, blob);
  },
  async downloadXlsx(from: string, to: string) {
    const blob = await getBlob(`/api/admin/reports/mentorias.xlsx?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    downloadBlob(`relatorio-mentorias-${from}-a-${to}.xlsx`, blob);
  },
};

export const adminBrandingApi = {
  uploadLogo(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    return postFormData<{ message: string; logoUrl: string; updatedAt: string | null }>("/api/admin/branding/logo", fd);
  },
};

