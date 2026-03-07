import type { Metadata } from "next";
import { MentoriaDetailsClient } from "./mentoria-details-client";

export const metadata: Metadata = {
  title: "Detalhes da Mentoria | Futuro Mentoria",
  description: "Informações completas sobre sua mentoria agendada.",
};

export default function MentoriaDetailsPage() {
  return <MentoriaDetailsClient />;
}
