"use client";

import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { toast } from "sonner";
import { CalendarIcon, Download, FileSpreadsheet, ImageUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { adminBrandingApi, adminReportsApi } from "@/lib/reports-api";

const schema = z
  .object({
    from: z.date(),
    to: z.date(),
  })
  .refine((v) => v.from <= v.to, {
    message: "A data inicial deve ser menor ou igual à final",
    path: ["to"],
  });

type FormValues = z.infer<typeof schema>;

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function LogoDropzone({
  disabled,
  onFileSelected,
}: {
  disabled?: boolean;
  onFileSelected: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed transition-colors",
        drag
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20 bg-muted/40",
        disabled && "pointer-events-none opacity-60",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && !disabled) onFileSelected(f);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelected(f);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:py-10">
        <div className="rounded-full border bg-background p-3 shadow-sm">
          <ImageUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Envie a logo do estabelecimento</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            PNG, JPG ou WEBP — até 3 MB. Essa logo aparece no cabeçalho do PDF.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Escolher imagem
        </Button>
      </div>
    </div>
  );
}

export function RelatoriosClient() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    },
  });

  const { data: branding, mutate: mutateBranding } = useSWR<{
    hasLogo: boolean;
    logoUrl: string | null;
    updatedAt: string | null;
  }>("/api/admin/branding", fetcher);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [downloading, setDownloading] = useState<null | "pdf" | "xlsx">(null);

  const periodLabel = useMemo(() => {
    const from = form.getValues("from");
    const to = form.getValues("to");
    if (!from || !to) return null;
    return `${format(from, "dd/MM/yyyy", { locale: ptBR })} → ${format(to, "dd/MM/yyyy", { locale: ptBR })}`;
  }, [form.watch("from"), form.watch("to")]);

  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      await adminBrandingApi.uploadLogo(file);
      await mutateBranding();
      toast.success("Logo atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const download = async (kind: "pdf" | "xlsx") => {
    const values = form.getValues();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise o período.");
      return;
    }
    setDownloading(kind);
    try {
      const from = toYmd(parsed.data.from);
      const to = toYmd(parsed.data.to);
      if (kind === "pdf") await adminReportsApi.downloadPdf(from, to);
      else await adminReportsApi.downloadXlsx(from, to);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao baixar relatório.",
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="mt-2 text-muted-foreground">
            Selecione um período e gere os arquivos do relatório. O PDF inclui a
            logo do estabelecimento.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Período do relatório</CardTitle>
              <CardDescription>
                Escolha datas de início e fim. O período é inclusivo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Início</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "dd/MM/yyyy", {
                                      locale: ptBR,
                                    })
                                  : "Selecione"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fim</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "dd/MM/yyyy", {
                                      locale: ptBR,
                                    })
                                  : "Selecione"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      {periodLabel ? (
                        <div className="flex items-center gap-2">
                          <span>Período:</span>
                          <Badge variant="secondary">{periodLabel}</Badge>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        onClick={() => void download("pdf")}
                        disabled={downloading != null}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloading === "pdf"
                          ? "Gerando PDF..."
                          : "Baixar PDF"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void download("xlsx")}
                        disabled={downloading != null}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        {downloading === "xlsx"
                          ? "Gerando XLSX..."
                          : "Baixar XLSX"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo no PDF</CardTitle>
              <CardDescription>
                Atualize a marca que aparece no cabeçalho do relatório.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {branding?.logoUrl ? (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-2">Prévia</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${branding.logoUrl}`}
                    alt="Logo do estabelecimento"
                    className="h-14 w-auto max-w-full rounded bg-background p-2"
                  />
                  {branding.updatedAt ? (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Atualizada em {branding.updatedAt}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma logo configurada ainda.
                </p>
              )}

              <LogoDropzone
                disabled={uploadingLogo}
                onFileSelected={(f) => void handleUploadLogo(f)}
              />
              {uploadingLogo ? (
                <p className="text-center text-sm text-muted-foreground">
                  Enviando logo…
                </p>
              ) : null}
              <p className="text-xs">
                Dica: use uma imagem com fundo transparente (PNG) ou um fundo
                claro para melhor contraste.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>O que sai no relatório</CardTitle>
            <CardDescription>
              Resumo + detalhes das mentorias no período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-semibold">Resumo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Totais por status, média de notas e contagem de feedbacks.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-semibold">Detalhado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Data/hora, mentor, estudante, status, área, mensagens, materiais
                e preparação.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-semibold">Arquivos</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF (com logo) + XLSX (abas Resumo e Mentorias).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
