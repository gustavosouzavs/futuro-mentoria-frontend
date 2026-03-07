import type { Metadata } from "next";
import { RegisterClient } from "./register-client";

export const metadata: Metadata = {
  title: "Criar conta | Futuro Mentoria",
  description: "Registre-se para começar a agendar mentorias.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
