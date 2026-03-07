"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { adminScheduleApi } from "@/lib/api";

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

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativa</h1>
            <p className="mt-1 text-muted-foreground">
              Configure os horários disponíveis para mentorias
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
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
