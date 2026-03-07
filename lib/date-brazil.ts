/**
 * Datas vindas do servidor estão no timezone do Brasil (America/São Paulo, UTC-3).
 * Sem este helper, new Date("2025-02-22") é interpretado como UTC e vira o dia anterior ao formatar em PT.
 */

const BRAZIL_OFFSET = "-03:00";

/**
 * Interpreta uma string de data/datetime da API como horário do Brasil (UTC-3).
 * - "YYYY-MM-DD" → meia-noite do dia no Brasil
 * - "YYYY-MM-DDTHH:mm:ss" ou com .sss (sem timezone) → esse horário no Brasil
 * - Se já tiver sufixo (Z ou ±HH:MM), não altera (evita dupla conversão).
 */
export function parseBrazilDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date(dateStr);
  }
  const s = dateStr.trim();
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(s)) {
    return new Date(s);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T00:00:00${BRAZIL_OFFSET}`);
  }
  const withoutMs = s.replace(/\.\d{3}$/, "").replace(/\.\d+$/, "");
  return new Date(withoutMs + BRAZIL_OFFSET);
}
