import type { Metadata } from "next";
import { FeedbackClient } from "./feedback-client";

export const metadata: Metadata = {
  title: "Avaliar Mentoria | Futuro Mentoria",
  description: "Compartilhe sua experiência e nos ajude a melhorar.",
};

export default function StudentFeedbackPage() {
  return <FeedbackClient />;
}
