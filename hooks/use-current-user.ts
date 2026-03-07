"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { UserType } from "@/lib/api";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserType;
}

/** API retorna sempre .role no objeto user (ver API_DOCUMENTATION.md / API.md). */
interface AuthMeResponse {
  user: { id: string; name: string; email: string; role: UserType };
}

export function useCurrentUser(): {
  user: CurrentUser | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
} {
  const { data, error, isLoading, mutate } = useSWR<AuthMeResponse>(
    "/api/auth/me",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      dedupingInterval: 5000,
    }
  );

  const raw = data?.user ?? null;
  const user: CurrentUser | null =
    raw && raw.role
      ? {
          id: raw.id,
          name: raw.name,
          email: raw.email,
          role: raw.role,
        }
      : null;

  return {
    user,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
