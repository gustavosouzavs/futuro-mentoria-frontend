import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Entrar | Futuro Mentoria",
  description: "Entre com sua conta para acessar o sistema.",
};

export default function LoginPage() {
  return <LoginClient />;
}
