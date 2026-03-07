/**
 * Fetcher para useSWR usando o cliente axios já configurado (lib/api).
 * A chave deve ser o path completo da requisição GET (incluindo query string).
 * Ex.: "/api/auth/me", "/api/mentors?date=2025-01-01"
 */

import { api } from "@/lib/api";

export function fetcher<T = unknown>(path: string): Promise<T> {
  return api.get<T>(path);
}
