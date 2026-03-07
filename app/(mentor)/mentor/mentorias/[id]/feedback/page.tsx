import type { Metadata } from "next";
import { FeedbackClient } from "./feedback-client";

export const metadata: Metadata = {
  title: "Avaliar Mentoria | Futuro Mentoria",
  description: "Compartilhe sua experiência sobre a sessão.",
};

export default function MentorFeedbackPage() {
  return <FeedbackClient />;
}
