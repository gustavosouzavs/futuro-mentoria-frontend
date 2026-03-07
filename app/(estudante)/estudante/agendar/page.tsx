import type { Metadata } from "next";
import { AgendarClient } from "./agendar-client";

export const metadata: Metadata = {
  title: "Agendar Mentoria | Futuro Mentoria",
  description: "Agende sua sessão de mentoria com um de nossos mentores.",
};

export default function AgendarMentoriaPage() {
  return <AgendarClient />;
}
