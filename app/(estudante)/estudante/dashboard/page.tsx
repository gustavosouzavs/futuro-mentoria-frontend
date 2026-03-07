import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard do Estudante | Futuro Mentoria",
  description: "Gerencie suas mentorias agendadas.",
};

export default function StudentDashboardPage() {
  return <DashboardClient />;
}
