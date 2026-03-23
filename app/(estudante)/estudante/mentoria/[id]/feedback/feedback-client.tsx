"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Satisfaction } from "@/lib/api";
import { toast } from "sonner";
import { feedbackApi } from "@/lib/api";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface FeedbackFormData {
  rating: number;
  comment: string;
  satisfaction: string;
  topics: string[];
}

export function FeedbackClient() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [feedback, setFeedback] = useState<FeedbackFormData>({
    rating: 0,
    comment: "",
    satisfaction: "",
    topics: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { data: appointment } = useSWR<{ hasFeedback: boolean }>(
    appointmentId ? `/api/student/appointments/${appointmentId}` : null,
    fetcher
  );

  const topics = [
    "Conceitos fundamentais",
    "Resolução de exercícios",
    "Dúvidas específicas",
    "Estratégias de estudo",
    "Preparação para ENEM",
    "Outros",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.satisfaction || feedback.rating === 0) return;
    setIsSubmitting(true);
    try {
      await feedbackApi.create({
        appointmentId,
        userType: "student",
        rating: feedback.rating,
        comment: feedback.comment || undefined,
        topics: feedback.topics.length > 0 ? feedback.topics : undefined,
        satisfaction: feedback.satisfaction as Satisfaction,
      });
      setSubmitted(true);
      setTimeout(() => router.push(`/estudante/mentoria/${appointmentId}`), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setFeedback((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  if (submitted) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Feedback Enviado!</CardTitle>
            <CardDescription>
              Obrigado por compartilhar sua experiência. Redirecionando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (appointment?.hasFeedback) {
    return (
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Feedback já enviado</CardTitle>
              <CardDescription>
                Você já avaliou esta mentoria. Não é possível enviar o feedback novamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/estudante/mentoria/${appointmentId}`}>Voltar para mentoria</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/estudante/mentoria/${appointmentId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
      </Button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Avaliar Mentoria</h1>
          <p className="mt-2 text-muted-foreground">
            Compartilhe sua experiência e nos ajude a melhorar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feedback do Estudante</CardTitle>
            <CardDescription>
              Sua opinião é muito importante para nós
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Avaliação Geral *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= feedback.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {feedback.rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {feedback.rating === 5
                      ? "Excelente!"
                      : feedback.rating === 4
                      ? "Muito bom"
                      : feedback.rating === 3
                      ? "Bom"
                      : feedback.rating === 2
                      ? "Regular"
                      : "Ruim"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nível de Satisfação *</Label>
                <RadioGroup
                  value={feedback.satisfaction}
                  onValueChange={(value) =>
                    setFeedback({ ...feedback, satisfaction: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very_satisfied" id="very-satisfied" />
                    <Label htmlFor="very-satisfied" className="font-normal">
                      Muito satisfeito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="satisfied" id="satisfied" />
                    <Label htmlFor="satisfied" className="font-normal">
                      Satisfeito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="neutral" id="neutral" />
                    <Label htmlFor="neutral" className="font-normal">
                      Neutro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dissatisfied" id="dissatisfied" />
                    <Label htmlFor="dissatisfied" className="font-normal">
                      Insatisfeito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very_dissatisfied" id="very-dissatisfied" />
                    <Label htmlFor="very-dissatisfied" className="font-normal">
                      Muito insatisfeito
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Tópicos Abordados (Opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant={feedback.topics.includes(topic) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTopic(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comentários (Opcional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Compartilhe sua experiência, sugestões ou observações..."
                  value={feedback.comment}
                  onChange={(e) =>
                    setFeedback({ ...feedback, comment: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={feedback.rating === 0 || !feedback.satisfaction || isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
