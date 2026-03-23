import type { Metadata } from "next";
import { MentoriasAdminClient } from "./mentorias-client";

export const metadata: Metadata = {
  title: "Mentorias | Admin",
  description: "Acompanhamento completo das mentorias e feedbacks",
};

export default function AdminMentoriasPage() {
  return <MentoriasAdminClient />;
}

