import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Painel do Mentor | Futuro Mentoria",
  description: "Gerencie seus horários disponíveis para mentorias.",
};

export default function MentorDashboardPage() {
  return <DashboardClient />;
}
