import type { Metadata } from "next";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: "Futuro Mentoria | Agende sua Mentoria",
  description:
    "Conecte-se com mentores especializados e alcance seus objetivos acadêmicos.",
};

export default function Home() {
  return <HomeClient />;
}
