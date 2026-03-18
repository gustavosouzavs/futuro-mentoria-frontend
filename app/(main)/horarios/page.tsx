import type { Metadata } from "next";
import { HorariosClient } from "./horarios-client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Horários | Futuro Mentoria",
  description: "Salas e mentores disponíveis para a data selecionada.",
};

export default function HorariosPage() {
  return (
    <Suspense fallback={<div className="container px-4 py-12 text-muted-foreground">Carregando...</div>}>
      <HorariosClient />
    </Suspense>
  );
}
