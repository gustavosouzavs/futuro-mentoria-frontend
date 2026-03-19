import type { Metadata } from "next";
import { Suspense } from "react";
import { HorariosClient } from "@/app/(main)/horarios/horarios-client";

export const metadata: Metadata = {
  title: "Horários | Futuro Mentoria",
  description: "Salas e mentores disponíveis para a data selecionada.",
};

export default function EstudanteHorariosPage() {
  return (
    <Suspense
      fallback={
        <div className="container px-4 py-12 text-muted-foreground">Carregando...</div>
      }
    >
      <HorariosClient />
    </Suspense>
  );
}
