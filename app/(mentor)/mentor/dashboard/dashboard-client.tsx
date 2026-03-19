"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { toast } from "sonner";
import {
  CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetcher } from "@/lib/fetcher";
import { parseBrazilDate } from "@/lib/date-brazil";
import { mentorAvailabilityApi } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-current-user";

interface AvailabilitySlot {
  id: string;
  date: Date;
  time: string;
  status: "available" | "booked" | "unavailable";
}

interface AvailabilityResponse {
  availabilities: Array<{
    id: string;
    date: string;
    time: string;
    status: "available" | "booked" | "unavailable";
  }>;
}

function mapAvailabilities(res: AvailabilityResponse): AvailabilitySlot[] {
  return (res.availabilities ?? []).map((a) => ({
    id: a.id,
    date: parseBrazilDate(a.date),
    time: a.time,
    status: a.status,
  }));
}

const timeSlots = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

export function DashboardClient() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const mentorId = user?.id ?? null;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availabilityKey = mentorId
    ? `/api/mentor/availability?mentorId=${encodeURIComponent(mentorId)}`
    : null;
  const { data, isLoading, mutate } = useSWR<AvailabilityResponse>(
    availabilityKey,
    fetcher,
  );
  const availabilities = data ? mapAvailabilities(data) : [];
  const loading = isLoading;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const visibleAvailabilities = availabilities.filter((a) => a.date >= todayStart);

  const handleTimeToggle = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  };

  const handleSelectAll = () => {
    if (selectedTimes.length === timeSlots.length) {
      setSelectedTimes([]);
    } else {
      setSelectedTimes([...timeSlots]);
    }
  };

  const handleAddAvailability = async () => {
    if (!mentorId || !selectedDate || selectedTimes.length === 0) {
      toast.warning("Por favor, selecione uma data e pelo menos um horário");
      return;
    }

    const existingTimes = availabilities
      .filter(
        (avail) => avail.date.toDateString() === selectedDate.toDateString(),
      )
      .map((avail) => avail.time);

    const newTimes = selectedTimes.filter(
      (time) => !existingTimes.includes(time),
    );

    if (newTimes.length === 0) {
      toast.info("Todos os horários selecionados já estão cadastrados!");
      return;
    }

    try {
      const res = await mentorAvailabilityApi.create({
        mentorId,
        date: `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1,
        ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
        times: newTimes,
        status: "available",
      });
      setSelectedDate(undefined);
      setSelectedTimes([]);
      if (newTimes.length < selectedTimes.length && res.skipped?.length) {
        toast.info(
          `${res.skipped.length} horário(s) já estavam cadastrados e foram ignorados.`,
        );
      }
      await mutate();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao adicionar disponibilidade.",
      );
    }
    mutate();
  };

  const handleRemoveAvailability = async (id: string) => {
    try {
      await mentorAvailabilityApi.delete(id);
      await mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover horário.");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const slot = availabilities.find((a) => a.id === id);
    if (!slot) return;
    const newStatus = slot.status === "available" ? "unavailable" : "available";
    try {
      await mentorAvailabilityApi.update(id, { status: newStatus });
      await mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status.");
    }
  };

  const groupedAvailabilities = visibleAvailabilities.reduce(
    (acc, avail) => {
      const dateKey = format(avail.date, "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(avail);
      return acc;
    },
    {} as Record<string, AvailabilitySlot[]>,
  );

  const sortedDates = Object.keys(groupedAvailabilities).sort();

  if (!userLoading && !mentorId) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">
          Faça login para gerenciar suas disponibilidades.
        </p>
      </div>
    );
  }

  if (loading && availabilities.length === 0) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">Carregando disponibilidades...</p>
      </div>
    );
  }

  const daysOfWeek = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
  ];

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel do Mentor</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie seus horários disponíveis para mentorias
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mentor/horarios" className="gap-2">
            <Clock className="h-4 w-4" />
            Ver horários
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Disponibilidade</CardTitle>
              <CardDescription>
                Selecione a data e os horários que deseja disponibilizar (você
                pode selecionar múltiplos)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  timeZone="America/Sao_Paulo"
                  disabled={(date) => (date ? date < today : false)}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Horários (30 minutos cada)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-auto py-1 text-xs"
                  >
                    {selectedTimes.length === timeSlots.length
                      ? "Desmarcar todos"
                      : "Selecionar todos"}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3 rounded-lg border p-3">
                  {timeSlots.map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${time}`}
                        checked={selectedTimes.includes(time)}
                        onCheckedChange={() => handleTimeToggle(time)}
                        disabled={!selectedDate}
                      />
                      <Label
                        htmlFor={`time-${time}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {time}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedTimes.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTimes.length} horário(s) selecionado(s)
                  </p>
                )}
              </div>

              <Button
                onClick={() => void handleAddAvailability()}
                className="w-full"
                disabled={!selectedDate || selectedTimes.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar{" "}
                {selectedTimes.length > 0 ? `${selectedTimes.length} ` : ""}
                Horário(s)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total de Horários:
                </span>
                <span className="font-semibold">{visibleAvailabilities.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disponíveis:</span>
                <span className="font-semibold text-green-600">
                  {
                    visibleAvailabilities.filter((a) => a.status === "available")
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agendados:</span>
                <span className="font-semibold text-blue-600">
                  {visibleAvailabilities.filter((a) => a.status === "booked").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Indisponíveis:</span>
                <span className="font-semibold text-gray-600">
                  {
                    visibleAvailabilities.filter((a) => a.status === "unavailable")
                      .length
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Horários Cadastrados</CardTitle>
              <CardDescription>
                Apenas datas a partir de hoje. Horários antigos não aparecem aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visibleAvailabilities.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhum horário cadastrado ainda.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use o calendário ao lado para adicionar horários
                    disponíveis.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDates.map((dateKey) => {
                    const dateAvailabilities = groupedAvailabilities[dateKey];
                    const date = parseBrazilDate(dateKey);

                    return (
                      <div key={dateKey} className="space-y-3">
                        <div className="flex items-center gap-2 border-b pb-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">
                            {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </h3>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          {dateAvailabilities
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((avail) => (
                              <div
                                key={avail.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{avail.time}</p>
                                    <Badge
                                      variant={
                                        avail.status === "available"
                                          ? "default"
                                          : avail.status === "booked"
                                            ? "secondary"
                                            : "outline"
                                      }
                                      className="mt-1"
                                    >
                                      {avail.status === "available"
                                        ? "Disponível"
                                        : avail.status === "booked"
                                          ? "Agendado"
                                          : "Indisponível"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleStatus(avail.id)}
                                    title={
                                      avail.status === "available"
                                        ? "Marcar como indisponível"
                                        : "Marcar como disponível"
                                    }
                                  >
                                    {avail.status === "available" ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-gray-600" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleRemoveAvailability(avail.id)
                                    }
                                    title="Remover horário"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
