/**
 * Nome do cookie de sessão usado como autorização.
 * O backend (Adonis) define esse cookie no login; o cliente envia com withCredentials.
 * Para alterar, defina NEXT_PUBLIC_AUTH_COOKIE_NAME no .env.local.
 */
export const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "adonis-session";
