import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard | Futuro Mentoria Admin",
  description: "Configure os horários disponíveis para mentorias.",
};

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
