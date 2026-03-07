import type { Metadata } from "next";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "Usuários | Futuro Mentoria Admin",
  description: "Gerencie todos os usuários do sistema.",
};

export default function UsersPage() {
  return <UsersClient />;
}
