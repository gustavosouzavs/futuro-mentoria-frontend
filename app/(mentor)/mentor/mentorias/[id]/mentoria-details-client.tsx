"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  MessageSquare,
  Save,
  ArrowLeft,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { fetcher } from "@/lib/fetcher";
import { parseBrazilDate } from "@/lib/date-brazil";
import { mentorAppointmentsApi, type AppointmentMaterialDto } from "@/lib/api";
import { openOrDownloadMaterial } from "@/lib/material-download";
import { AppointmentFileDropzone } from "@/components/appointment-file-dropzone";
import { AddAppointmentLinkMaterialDialog } from "@/components/add-appointment-link-material-dialog";

function materialSourceLabel(m: AppointmentMaterialDto): string {
  const s = m.source ?? "mentor";
  return s === "student" ? "Estudante" : "Mentor";
}

interface AppointmentDetails {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  subject: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  studentMessage?: string;
  message?: string;
  preparationItems?: string[];
  materials: AppointmentMaterialDto[];
  hasFeedback?: boolean;
}

export function MentoriaDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const { data: appointment, isLoading: loading, mutate } = useSWR<AppointmentDetails>(
    appointmentId ? `/api/mentor/appointments/${appointmentId}` : null,
    fetcher
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [statusLoading, setStatusLoading] = useState<null | "confirm" | "complete">(null);

  useEffect(() => {
    if (appointment) {
      setMessage(appointment.message || "");
    }
  }, [appointment]);

  const sessionEnded = useMemo(() => {
    if (!appointment?.date) return false;
    const startMs = new Date(appointment.date).getTime();
    if (Number.isNaN(startMs)) return false;
    return Date.now() > startMs + 30 * 60 * 1000;
  }, [appointment?.date]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await mentorAppointmentsApi.update(appointmentId, {
        message: message.trim(),
      });
      await mutate();
      toast.success("Alterações salvas com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async () => {
    setStatusLoading("confirm");
    try {
      await mentorAppointmentsApi.update(appointmentId, { status: "confirmed" });
      await mutate();
      toast.success("Mentoria confirmada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao confirmar.");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleEncerrarEAvaliar = async () => {
    setStatusLoading("complete");
    try {
      await mentorAppointmentsApi.update(appointmentId, { status: "completed" });
      await mutate();
      toast.success("Mentoria encerrada. Redirecionando para o feedback…");
      router.push(`/mentor/mentorias/${appointmentId}/feedback`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao encerrar.");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleMaterialUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      await mentorAppointmentsApi.uploadMaterial(appointmentId, file);
      await mutate();
      toast.success("Arquivo enviado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar arquivo.");
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }
  if (!appointment) {
    return (
      <div className="container px-4 py-8">
        <p className="text-destructive">Mentoria não encontrada.</p>
        <Button variant="ghost" asChild className="mt-4">
          <Link href="/mentor/mentorias">Voltar às Mentorias</Link>
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
        <Link href="/mentor/mentorias">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar às Mentorias
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Mentoria</h1>
        <p className="mt-2 text-muted-foreground">
          Edite informações e adicione materiais para o estudante
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
                    <p className="text-sm text-muted-foreground">Estudante</p>
                    <p className="font-medium">{appointment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.studentEmail}</p>
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
                  Mensagem do estudante (no agendamento)
                </CardTitle>
                <CardDescription>
                  Texto enviado pelo estudante ao solicitar a mentoria. Somente leitura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap rounded-md border bg-muted/40 p-3">
                  {appointment.studentMessage.trim()}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sua mensagem para o estudante
              </CardTitle>
              <CardDescription>
                Instruções ou orientações que o estudante vê em &quot;Detalhes da mentoria&quot;. Use
                &quot;Salvar alterações&quot; abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Digite sua mensagem para o estudante..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links e observações do estudante</CardTitle>
              <CardDescription>
                Uma linha por item (enviados no agendamento ou atualizados depois em &quot;Detalhes da
                mentoria&quot;). Não substitui arquivos: PDFs grandes combinam melhor por WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  O estudante ainda não enviou materiais/links.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Materiais de Estudo
              </CardTitle>
              <CardDescription>
                Envie arquivos (PDF, Word, imagens) ou adicione links. Arquivos ficam no servidor e
                podem ser baixados com a sessão da mentoria; links abrem em nova aba.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <AddAppointmentLinkMaterialDialog
                  trigger={
                    <Button type="button" variant="outline" className="w-full sm:w-auto shrink-0">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Adicionar link
                    </Button>
                  }
                  onSubmit={async (values) => {
                    try {
                      await mentorAppointmentsApi.addMaterial(appointmentId, {
                        name: values.name,
                        url: values.url.trim(),
                        type: values.type,
                      });
                      await mutate();
                      toast.success("Link adicionado.");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Erro ao adicionar link.");
                      throw err;
                    }
                  }}
                />
              </div>

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
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir / baixar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2 rounded-lg border border-dashed">
                  Nenhum material ainda. Use o envio acima ou um link.
                </p>
              )}
            </CardContent>
          </Card>

          <Button onClick={() => void handleSave()} className="w-full" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appointment.status === "pending" && (
                <Button
                  className="w-full"
                  disabled={!!statusLoading}
                  onClick={() => void handleConfirm()}
                >
                  {statusLoading === "confirm" ? "Confirmando..." : "Confirmar mentoria"}
                </Button>
              )}
              {appointment.status === "confirmed" && sessionEnded && (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={!!statusLoading}
                  onClick={() => void handleEncerrarEAvaliar()}
                >
                  {statusLoading === "complete" ? "Encerrando..." : "Encerrar e avaliar"}
                </Button>
              )}
              {appointment.status === "completed" && !appointment.hasFeedback && (
                <Button className="w-full" asChild>
                  <Link href={`/mentor/mentorias/${appointment.id}/feedback`}>
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
                    Contatar estudante
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Contato do estudante</DialogTitle>
                    <DialogDescription>
                      Copie e-mail ou telefone e use seu app de e-mail ou WhatsApp.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <div className="flex gap-2">
                        <p className="text-sm flex-1 break-all rounded-md border bg-muted/50 px-3 py-2">
                          {appointment.studentEmail || "—"}
                        </p>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => void copyText("E-mail", appointment.studentEmail)}
                          disabled={!appointment.studentEmail}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {appointment.studentPhone ? (
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <div className="flex gap-2">
                          <p className="text-sm flex-1 break-all rounded-md border bg-muted/50 px-3 py-2">
                            {appointment.studentPhone}
                          </p>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => void copyText("Telefone", appointment.studentPhone!)}
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
        </div>
      </div>
    </div>
  );
}
