"use client";

import { useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { fetcher } from "@/lib/fetcher";
import { appointmentsApi } from "@/lib/api";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
  {
    loading: () => <p className="text-muted-foreground">Carregando...</p>,
    ssr: false,
  },
);

const grades = [
  "1º Ano do Ensino Médio",
  "2º Ano do Ensino Médio",
  "3º Ano do Ensino Médio",
];

const enemAreas = [
  "Linguagens, Códigos e suas Tecnologias",
  "Matemática e suas Tecnologias",
  "Ciências da Natureza e suas Tecnologias",
  "Ciências Humanas e suas Tecnologias",
  "Redação",
];

interface MentorsListResponse {
  mentors: Array<{
    id: string;
    name: string;
    specialties: string[];
    availableSlots: number;
    availableTimes: string[];
  }>;
}

const agendarSchema = z
  .object({
    date: z.date().optional(),
    mentor: z.string(),
    time: z.string(),
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    grade: z.string().min(1, "Selecione a série"),
    subject: z.string().optional(),
    message: z.string().optional(),
    preparationItemsText: z.string().optional(),
  })
  .refine((data) => data.date !== undefined, {
    message: "Selecione a data da mentoria",
    path: ["date"],
  })
  .refine((data) => !!data.mentor?.trim(), {
    message: "Selecione o mentor",
    path: ["mentor"],
  })
  .refine((data) => !!data.time?.trim(), {
    message: "Selecione o horário",
    path: ["time"],
  });

type AgendarFormValues = z.infer<typeof agendarSchema>;

export function AgendarClient() {
  const form = useForm<AgendarFormValues>({
    resolver: zodResolver(agendarSchema),
    defaultValues: {
      date: undefined,
      mentor: "",
      time: "",
      name: "",
      email: "",
      grade: "",
      message: "",
      preparationItemsText: "",
    },
  });

  const { user } = useCurrentUser();

  const date = form.watch("date");
  const mentor = form.watch("mentor");
  const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;
  const mentorsKey = dateStr
    ? `/api/mentors?date=${encodeURIComponent(dateStr)}`
    : null;
  const {
    data,
    isLoading: mentorsLoading,
    mutate,
  } = useSWR<MentorsListResponse>(mentorsKey, fetcher, {
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (!dateStr) {
      form.setValue("time", "");
      form.setValue("mentor", "");
    }
  }, [dateStr, form]);

  const mentorList = data?.mentors ?? [];
  const mentorsWithSlots = mentorList.filter(
    (m) => (m.availableTimes?.length ?? 0) > 0,
  );
  const availableTimesByMentorId = mentorList.reduce<Record<string, string[]>>(
    (acc, m) => {
      if (m.availableTimes?.length) {
        acc[m.id] = [...m.availableTimes].sort();
      }
      return acc;
    },
    {},
  );
  const availableTimeSlotsForMentor = mentor
    ? (availableTimesByMentorId[mentor] ?? []).sort()
    : [];

  const isSubmitting = form.formState.isSubmitting;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const onSubmit = async (values: AgendarFormValues) => {
    if (!values.date) return;
    try {
      const preparationItems = values.preparationItemsText
        ? values.preparationItemsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      const dateOnly = `${values.date.getFullYear()}-${String(
        values.date.getMonth() + 1,
      ).padStart(2, "0")}-${String(values.date.getDate()).padStart(2, "0")}`;

      await appointmentsApi.create({
        studentName: values.name,
        studentEmail: values.email,
        grade: values.grade,
        mentorId: values.mentor,
        subject: values.subject ?? "",
        date: dateOnly,
        time: values.time,
        message: values.message || undefined,
        preparationItems,
        studentId: user?.id ?? 0,
      });
      await mutate();
      toast.success(
        "Agendamento enviado com sucesso! Entraremos em contato em breve.",
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao enviar agendamento. Tente novamente.",
      );
    }
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Agendar Mentoria</h1>
          <p className="mt-2 text-muted-foreground">
            Preencha o formulário para agendar sua sessão de mentoria com um de
            nossos mentores. Disponível para estudantes do ensino médio.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Agendamento</CardTitle>
            <CardDescription>
              Selecione a data, o mentor e o horário disponível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1. Data da Mentoria</FormLabel>
                        <FormControl>
                          <div className="flex justify-center">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(d) => (d ? d < today : false)}
                              className="rounded-md border"
                            />
                          </div>
                        </FormControl>
                        {field.value && (
                          <p className="text-center text-sm text-muted-foreground">
                            {format(field.value, "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mentor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2. Mentor</FormLabel>
                        {mentorsLoading ? (
                          <p className="text-sm text-muted-foreground">
                            Carregando mentores...
                          </p>
                        ) : !dateStr ? (
                          <p className="text-sm text-muted-foreground">
                            Selecione primeiro uma data.
                          </p>
                        ) : mentorsWithSlots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Nenhum mentor com horários nesta data. Escolha outra
                            data.
                          </p>
                        ) : (
                          <>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("time", "");
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o mentor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mentorsWithSlots.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    <div className="flex w-full items-center justify-between">
                                      <span>{m.name}</span>
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        (
                                        {availableTimesByMentorId[m.id]
                                          ?.length ?? 0}{" "}
                                        horários)
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {field.value && (
                              <div className="mt-2 rounded-md border bg-muted/50 p-3">
                                <div className="flex items-start gap-2">
                                  <User className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {
                                        mentorsWithSlots.find(
                                          (m) => m.id === field.value,
                                        )?.name
                                      }
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Especialidades:{" "}
                                      {mentorsWithSlots
                                        .find((m) => m.id === field.value)
                                        ?.specialties.join(", ")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Horário (30 min)</FormLabel>
                      {!mentor ? (
                        <p className="text-sm text-muted-foreground">
                          Selecione o mentor para ver os horários disponíveis.
                        </p>
                      ) : availableTimeSlotsForMentor.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum horário disponível para este mentor na data.
                        </p>
                      ) : (
                        <FormControl>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {availableTimeSlotsForMentor.map((timeSlot) => (
                              <Button
                                key={timeSlot}
                                type="button"
                                variant={
                                  field.value === timeSlot
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => field.onChange(timeSlot)}
                                className="w-full"
                              >
                                {timeSlot}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Série</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione sua série" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área do ENEM</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área do ENEM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {enemAreas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva brevemente o que você gostaria de trabalhar na mentoria..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preparationItemsText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materiais e links (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cole links e/ou informações para o mentor. Um por linha."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(date ||
                  form.watch("time") ||
                  mentor ||
                  form.watch("subject")) && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <h3 className="mb-3 text-sm font-semibold">
                      Resumo do Agendamento
                    </h3>
                    <div className="space-y-2 text-sm">
                      {date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-medium">
                            {format(date, "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      )}
                      {form.watch("time") && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Horário:
                          </span>
                          <span className="font-medium">
                            {form.watch("time")} (30 minutos)
                          </span>
                        </div>
                      )}
                      {mentor && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mentor:</span>
                          <span className="font-medium">
                            {
                              mentorsWithSlots.find((m) => m.id === mentor)
                                ?.name
                            }
                          </span>
                        </div>
                      )}
                      {form.watch("subject") && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Área:</span>
                          <span className="max-w-[60%] text-right font-medium">
                            {form.watch("subject")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Confirmar Agendamento"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
