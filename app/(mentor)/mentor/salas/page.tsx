import type { Metadata } from "next";
import { SalasClient } from "./salas-client";

export const metadata: Metadata = {
  title: "Reservar sala | Futuro Mentoria",
  description: "Escolha uma sala e a data para suas mentorias.",
};

export default function MentorSalasPage() {
  return <SalasClient />;
}
