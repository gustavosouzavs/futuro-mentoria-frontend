import type { Metadata } from "next";
import { HorariosClient } from "./horarios-client";

export const metadata: Metadata = {
  title: "Horários de hoje | Futuro Mentoria",
  description: "Salas e mentores disponíveis para hoje.",
};

export default function HorariosPage() {
  return <HorariosClient />;
}
