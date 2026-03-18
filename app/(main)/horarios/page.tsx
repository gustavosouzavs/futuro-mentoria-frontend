import type { Metadata } from "next";
import { HorariosClient } from "./horarios-client";

export const metadata: Metadata = {
  title: "Horários | Futuro Mentoria",
  description: "Salas e mentores disponíveis para a data selecionada.",
};

export default function HorariosPage() {
  return <HorariosClient />;
}
