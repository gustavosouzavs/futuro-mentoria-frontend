"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoorOpen, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { fetcher } from "@/lib/fetcher";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { parseBrazilDate } from "@/lib/date-brazil";

export function HorariosClient() {
  const searchParams = useSearchParams();
  const today = format(new Date(), "yyyy-MM-dd");
  const initialDate = searchParams.get("date") || today;
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const { data, isLoading } = useSWR<{
    date: string;
    reservations: Array<{
      roomId: number;
      roomName: string;
      roomCode: string | null;
      mentorId: number;
      mentorName: string;
      date: string;
      reservedUntil: string | null;
    }>;
  }>(
    `/api/rooms/reservations?date=${encodeURIComponent(selectedDate)}`,
    fetcher,
  );

  const reservations = data?.reservations ?? [];

  const selectedDateLabel = useMemo(() => {
    const d = parseBrazilDate(selectedDate);
    return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
  }, [selectedDate]);

  return (
    <div className="container px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Horários</h1>
            <p className="mt-2 text-muted-foreground">
              Salas e mentores para {selectedDateLabel}
            </p>
          </div>

          <div className="w-full md:w-auto">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="horarios-date">
              Selecione a data
            </label>
            <Input
              id="horarios-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : reservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Nenhuma sala reservada para a data selecionada.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <Card key={`${r.roomId}-${r.date}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DoorOpen className="h-5 w-5" />
                    {r.roomName}
                    {r.roomCode && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({r.roomCode})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{r.mentorName}</span>
                  </div>
                  {r.reservedUntil && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      até {r.reservedUntil}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
