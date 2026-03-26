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
  Copy,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetcher } from "@/lib/fetcher";
import { parseBrazilDate } from "@/lib/date-brazil";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { studentAppointmentsApi, type AppointmentMaterialDto } from "@/lib/api";
import { openOrDownloadMaterial } from "@/lib/material-download";
import { AppointmentFileDropzone } from "@/components/appointment-file-dropzone";

function materialSourceLabel(m: AppointmentMaterialDto): string {
  const s = m.source ?? "mentor";
  return s === "mentor" ? "Mentor" : "Você";
}

interface AppointmentDetails {
  id: string;
  mentorName: string;
  mentorEmail: string;
  mentorPhone?: string;
  subject: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  studentMessage?: string;
  message?: string;
  preparationItems?: string[];
  materials: AppointmentMaterialDto[];
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
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (!appointment) return;
    setPreparationText((appointment.preparationItems ?? []).join("\n"));
  }, [appointment]);

  const copyText = async (label: string, text: string) => {
    if (!text) {
      toast.error("Nada para copiar.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado para a área de transferência.`);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
  };

  const handleMaterialUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      await studentAppointmentsApi.uploadMaterial(appointmentId, file);
      await mutate();
      toast.success("Arquivo enviado. O mentor verá na mesma lista de materiais.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar arquivo.");
    } finally {
      setUploadingFile(false);
    }
  };

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

          {appointment.studentMessage?.trim() ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Sua mensagem no agendamento
                </CardTitle>
                <CardDescription>O que você escreveu ao solicitar a mentoria (somente leitura).</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap rounded-md border bg-muted/40 p-3">
                  {appointment.studentMessage.trim()}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {appointment.message?.trim() ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensagem do mentor
                </CardTitle>
                <CardDescription>Orientações enviadas pelo mentor.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{appointment.message.trim()}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Links e observações para o mentor
              </CardTitle>
              <CardDescription>
                Uma URL ou observação por linha. Clique em &quot;Salvar&quot; para o mentor ver aqui.
                Para arquivos (PDF, imagens, etc.), use a seção &quot;Materiais da mentoria&quot; abaixo.
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Materiais da mentoria
              </CardTitle>
              <CardDescription>
                Arquivos e links compartilhados por você e pelo mentor. Envie seus próprios arquivos
                aqui; links externos abrem em nova aba e anexos do sistema usam sua sessão para
                baixar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AppointmentFileDropzone
                disabled={uploadingFile}
                onFileSelected={(file) => void handleMaterialUpload(file)}
              />
              {uploadingFile ? (
                <p className="text-center text-sm text-muted-foreground">Enviando arquivo…</p>
              ) : null}

              {appointment.materials.length > 0 ? (
                <div className="space-y-3">
                  {appointment.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{material.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {materialSourceLabel(material)}
                            </Badge>
                            {material.isFile ? (
                              <Badge variant="outline" className="text-xs font-normal">
                                Arquivo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs font-normal">
                                Link
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(parseBrazilDate(material.uploadedAt), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="shrink-0 w-full sm:w-auto"
                        onClick={() =>
                          void openOrDownloadMaterial(material.url, material.name || "material")
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar / abrir
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2 rounded-lg border border-dashed">
                  Nenhum material ainda. O mentor pode enviar links ou arquivos; você também pode
                  enviar arquivos acima.
                </p>
              )}
            </CardContent>
          </Card>
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
              {appointment.status === "completed" && appointment.hasFeedback && (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  Feedback já enviado
                </Badge>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Contatar mentor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Contato do mentor</DialogTitle>
                    <DialogDescription>
                      Copie e-mail ou telefone e use seu app de e-mail ou WhatsApp.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <div className="flex gap-2">
                        <p className="text-sm flex-1 break-all rounded-md border bg-muted/50 px-3 py-2">
                          {appointment.mentorEmail || "—"}
                        </p>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => void copyText("E-mail", appointment.mentorEmail)}
                          disabled={!appointment.mentorEmail}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {appointment.mentorPhone ? (
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <div className="flex gap-2">
                          <p className="text-sm flex-1 break-all rounded-md border bg-muted/50 px-3 py-2">
                            {appointment.mentorPhone}
                          </p>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => void copyText("Telefone", appointment.mentorPhone!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </DialogContent>
              </Dialog>
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
