"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Save, Users, Calendar, MessageSquare, Star, TrendingUp, AlertCircle } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { adminScheduleApi, adminMetricsApi } from "@/lib/api";

interface TimeSlotConfig {
  id: string;
  time: string;
  enabled: boolean;
}

interface DayConfig {
  day: string;
  enabled: boolean;
  timeSlots: TimeSlotConfig[];
}

interface ScheduleConfigResponse {
  days: DayConfig[];
}

const timeSlots = [
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

const daysOfWeek = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
];

const defaultConfig: DayConfig[] = daysOfWeek.map((day) => ({
  day: day.key,
  enabled: true,
  timeSlots: timeSlots.map((time) => ({
    id: `${day.key}-${time}`,
    time,
    enabled: true,
  })),
}));

export function DashboardClient() {
  const { data: metricsData, isLoading: metricsLoading } = useSWR(
    "admin-metrics",
    () => adminMetricsApi.get()
  );
  const { data, isLoading: loading, mutate } = useSWR<ScheduleConfigResponse>(
    "/api/admin/schedule-config",
    fetcher
  );
  const [scheduleConfig, setScheduleConfig] = useState<DayConfig[]>(defaultConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.days?.length) {
      setScheduleConfig(data.days as DayConfig[]);
    }
  }, [data]);

  const handleDayToggle = (dayKey: string) => {
    setScheduleConfig(
      scheduleConfig.map((day) =>
        day.day === dayKey ? { ...day, enabled: !day.enabled } : day
      )
    );
  };

  const handleTimeSlotToggle = (dayKey: string, slotId: string) => {
    setScheduleConfig(
      scheduleConfig.map((day) =>
        day.day === dayKey
          ? {
              ...day,
              timeSlots: day.timeSlots.map((slot) =>
                slot.id === slotId ? { ...slot, enabled: !slot.enabled } : slot
              ),
            }
          : day
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminScheduleApi.save({ days: scheduleConfig });
      await mutate();
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const enabledSlotsCount = scheduleConfig.reduce(
    (total, day) =>
      total + (day.enabled ? day.timeSlots.filter((slot) => slot.enabled).length : 0),
    0
  );

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  const m = metricsData;
  const statusLabels: Record<string, string> = {
    pending: "Pendentes",
    confirmed: "Confirmadas",
    completed: "Realizadas",
    cancelled: "Canceladas",
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativa</h1>
            <p className="mt-1 text-muted-foreground">
              Métricas das mentorias e configuração de horários
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/horarios" className="gap-2">
            <Calendar className="h-4 w-4" />
            Ver horários de hoje
          </Link>
        </Button>
      </div>

      {/* Métricas das mentorias */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Métricas das mentorias</h2>
        {metricsLoading ? (
          <p className="text-muted-foreground">Carregando métricas...</p>
        ) : m ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Total de usuários</CardDescription>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">{m.totalUsers}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {m.totalStudents} estudantes · {m.totalMentors} mentores
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Agendamentos totais</CardDescription>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">{m.totalAppointments}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias: {m.appointmentsLast30Days}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Feedbacks / Avaliação</CardDescription>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">{m.totalFeedbacks}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {m.averageRating != null ? (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> Média {m.averageRating.toFixed(1)}/5
                    </span>
                  ) : (
                    "Sem avaliações ainda"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Realizadas (30 dias)</CardDescription>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">{m.completedLast30Days}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Mentorias concluídas
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}
        {m && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Agendamentos por status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(m.appointmentsByStatus || {}).map(([status, count]) => (
                    <Badge key={status} variant={status === "completed" ? "default" : "secondary"}>
                      {statusLabels[status] ?? status}: {count}
                    </Badge>
                  ))}
                  {(!m.appointmentsByStatus || Object.keys(m.appointmentsByStatus).length === 0) && (
                    <span className="text-sm text-muted-foreground">Nenhum agendamento</span>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Aguardando feedback do estudante</CardDescription>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">{m.appointmentsWithoutStudentFeedback}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Mentorias sem feedback do estudante (máx. 2 por estudante para agendar nova)
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Estatísticas de horários */}
      <h2 className="mb-4 text-xl font-semibold">Configuração de horários</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dias Ativos</CardDescription>
            <CardTitle className="text-2xl">
              {scheduleConfig.filter((day) => day.enabled).length} / {scheduleConfig.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Horários Disponíveis</CardDescription>
            <CardTitle className="text-2xl">{enabledSlotsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Horários</CardDescription>
            <CardTitle className="text-2xl">
              {scheduleConfig.length * timeSlots.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Configuração de Horários */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Horários</CardTitle>
          <CardDescription>
            Ative ou desative dias da semana e horários específicos para mentorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {scheduleConfig.map((dayConfig) => {
              const dayLabel = daysOfWeek.find((d) => d.key === dayConfig.day)?.label;
              const enabledSlots = dayConfig.timeSlots.filter((slot) => slot.enabled).length;

              return (
                <div key={dayConfig.day} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={dayConfig.enabled}
                        onCheckedChange={() => handleDayToggle(dayConfig.day)}
                      />
                      <Label className="text-base font-semibold">{dayLabel}</Label>
                      <Badge variant={dayConfig.enabled ? "default" : "outline"}>
                        {enabledSlots} horários ativos
                      </Badge>
                    </div>
                  </div>

                  {dayConfig.enabled && (
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-9">
                      {dayConfig.timeSlots.map((slot) => (
                        <div key={slot.id} className="flex flex-col items-center gap-2">
                          <Switch
                            checked={slot.enabled}
                            onCheckedChange={() =>
                              handleTimeSlotToggle(dayConfig.day, slot.id)
                            }
                            size="sm"
                          />
                          <Label className="text-xs">{slot.time}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
