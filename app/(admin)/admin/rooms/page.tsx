import type { Metadata } from "next";
import { RoomsClient } from "./rooms-client";

export const metadata: Metadata = {
  title: "Salas | Futuro Mentoria Admin",
  description: "Cadastre as salas onde as mentorias acontecem.",
};

export default function AdminRoomsPage() {
  return <RoomsClient />;
}
