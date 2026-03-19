"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  MessageSquare,
  AlertCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { fetcher } from "@/lib/fetcher";
import { parseBrazilDate } from "@/lib/date-brazil";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { studentAppointmentsApi } from "@/lib/api";
import { resolveMaterialUrl } from "@/lib/material-url";

interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface AppointmentDetails {
  id: string;
  mentorName: string;
  mentorEmail: string;
  subject: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  message?: string;
  preparationItems?: string[];
  materials: Material[];
  hasFeedback: boolean;
}

export function MentoriaDetailsClient() {
  const params = useParams();
  const appointmentId = params.id as string;
  const { data: appointment, error: swrError, isLoading: loading, mutate } = useSWR<AppointmentDetails>(
    appointmentId ? `/api/student/appointments/${appointmentId}` : null,
    fetcher
  );
  const error = swrError ? "Não foi possível carregar os detalhes da mentoria." : null;

  const [preparationText, setPreparationText] = useState("");
  const [savingPreparation, setSavingPreparation] = useState(false);

  useEffect(() => {
    if (!appointment) return;
    setPreparationText((appointment.preparationItems ?? []).join("\n"));
  }, [appointment]);

  const handleSavePreparation = async () => {
    setSavingPreparation(true);
    try {
      const items = preparationText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await studentAppointmentsApi.updatePreparationItems(appointmentId, items);
      await mutate();
      toast.success("Materiais atualizados com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar materiais.");
    } finally {
      setSavingPreparation(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }
  if (error || !appointment) {
    return (
      <div className="container px-4 py-8">
        <p className="text-destructive">{error ?? "Mentoria não encontrada."}</p>
        <Button variant="ghost" asChild className="mt-4">
          <Link href="/estudante/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: AppointmentDetails["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmada</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "completed":
        return <Badge variant="secondary">Concluída</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
    }
  };

  return (
    <div className="container px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/estudante/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Detalhes da Mentoria</h1>
        <p className="mt-2 text-muted-foreground">
          Informações completas sobre sua mentoria agendada
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Mentoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {format(parseBrazilDate(appointment.date), "EEEE, dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">{appointment.time} (30 minutos)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="mt-1 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mentor</p>
                    <p className="font-medium">{appointment.mentorName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.mentorEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-1 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Área do ENEM</p>
                    <p className="font-medium">{appointment.subject}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                {getStatusBadge(appointment.status)}
              </div>
            </CardContent>
          </Card>

          {appointment.message && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensagem do Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{appointment.message}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Materiais e links do estudante
              </CardTitle>
              <CardDescription>
                Cole links e/ou informações que serão enviados para o mentor (um por linha).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={preparationText}
                onChange={(e) => setPreparationText(e.target.value)}
                placeholder="Ex: https://... (link do material) (um por linha)"
                rows={4}
              />

              {appointment.preparationItems && appointment.preparationItems.length > 0 ? (
                <ul className="space-y-2">
                  {appointment.preparationItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Você ainda não enviou materiais/links.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingPreparation}
                  onClick={() =>
                    setPreparationText((appointment.preparationItems ?? []).join("\n"))
                  }
                >
                  Cancelar
                </Button>
                <Button type="button" disabled={savingPreparation} onClick={handleSavePreparation}>
                  {savingPreparation ? "Salvando..." : "Salvar materiais"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {appointment.materials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Materiais de Estudo
                </CardTitle>
                <CardDescription>
                  Arquivos e links compartilhados pelo mentor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointment.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{material.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Enviado em{" "}
                            {format(parseBrazilDate(material.uploadedAt), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={resolveMaterialUrl(material.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Baixar / Abrir
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appointment.status === "completed" && !appointment.hasFeedback && (
                <Button className="w-full" asChild>
                  <Link href={`/estudante/mentoria/${appointment.id}/feedback`}>
                    Dar Feedback
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`mailto:${appointment.mentorEmail}`}>
                  Contatar Mentor
                </Link>
              </Button>
            </CardContent>
          </Card>

          {appointment.status === "confirmed" && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                      Mentoria Confirmada
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Sua mentoria está confirmada. Verifique os materiais e itens de preparação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
