import type { Metadata } from "next";
import { MentoriaDetailsClient } from "./mentoria-details-client";

export const metadata: Metadata = {
  title: "Detalhes da Mentoria | Futuro Mentoria",
  description: "Gerenciar mentoria e materiais.",
};

export default function MentorMentoriaDetailsPage() {
  return <MentoriaDetailsClient />;
}
