import type { Metadata } from "next";
import { MentoriasClient } from "./mentorias-client";

export const metadata: Metadata = {
  title: "Mentorias | Futuro Mentoria",
  description: "Gerencie todas as suas mentorias agendadas.",
};

export default function MentorMentoriasPage() {
  return <MentoriasClient />;
}
