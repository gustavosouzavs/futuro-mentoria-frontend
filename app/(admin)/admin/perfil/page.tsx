import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = {
  title: "Perfil | Futuro Mentoria",
  description: "Gerencie seu perfil e altere sua senha.",
};

export default function PerfilPage() {
  return <ProfileClient />;
}

