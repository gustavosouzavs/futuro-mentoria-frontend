"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoorOpen, User, Clock } from "lucide-react";
import { roomReservationsApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export function HorariosClient() {
  const [reservations, setReservations] = useState<
    Array<{
      roomId: number;
      roomName: string;
      roomCode: string | null;
      mentorId: number;
      mentorName: string;
      date: string;
      reservedUntil: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    let cancelled = false;
    roomReservationsApi
      .getByDate(today)
      .then((res) => {
        if (!cancelled) setReservations(res.reservations);
      })
      .catch(() => {
        if (!cancelled) setReservations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [today]);

  return (
    <div className="container px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Horários de hoje</h1>
          <p className="mt-2 text-muted-foreground">
            Salas e mentores para {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : reservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Nenhuma sala reservada para hoje.</p>
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
