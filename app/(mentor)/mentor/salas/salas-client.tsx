"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DoorOpen, Calendar, Trash2 } from "lucide-react";
import { mentorRoomsApi, type RoomDto } from "@/lib/api";

const TIME_OPTIONS = [
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
  "18:30", "19:00", "19:30", "20:00",
];

export function SalasClient() {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [reservations, setReservations] = useState<
    Array<{
      id: number;
      roomId: number;
      roomName: string;
      roomCode: string | null;
      date: string;
      reservedFrom: string | null;
      reservedUntil: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [reserveRoomId, setReserveRoomId] = useState<string>("");
  const [reserveDate, setReserveDate] = useState("");
  const [reserveFrom, setReserveFrom] = useState("14:00");
  const [reserveUntil, setReserveUntil] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, reservRes] = await Promise.all([
        mentorRoomsApi.listRooms(),
        mentorRoomsApi.myReservations(),
      ]);
      setRooms(roomsRes.rooms);
      setReservations(reservRes.reservations);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveRoomId || !reserveDate) {
      toast.error("Selecione a sala e a data.");
      return;
    }
    if (!reserveFrom || !reserveUntil) {
      toast.error("Informe horário de início e fim.");
      return;
    }
    if (reserveFrom >= reserveUntil) {
      toast.error("O horário inicial deve ser antes do horário final.");
      return;
    }
    setSubmitting(true);
    try {
      await mentorRoomsApi.reserve({
        roomId: Number(reserveRoomId),
        date: reserveDate,
        reservedFrom: reserveFrom,
        reservedUntil: reserveUntil,
      });
      toast.success("Sala reservada com sucesso.");
      setReserveRoomId("");
      setReserveDate("");
      setReserveFrom("14:00");
      setReserveUntil("17:00");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao reservar sala.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancelar esta reserva?")) return;
    try {
      await mentorRoomsApi.cancelReservation(id);
      toast.success("Reserva cancelada.");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cancelar.");
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <DoorOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reservar sala</h1>
            <p className="mt-1 text-muted-foreground">
              Defina início e fim da reserva. Outros mentores podem usar a mesma sala no mesmo dia em
              horários que não conflitem.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova reserva</CardTitle>
            <CardDescription>
              Apenas o intervalo escolhido fica indisponível para outros mentores; após o horário
              final a sala pode ser reservada novamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReserve} className="space-y-4">
              <div className="grid gap-2">
                <Label>Sala *</Label>
                <Select
                  value={reserveRoomId}
                  onValueChange={setReserveRoomId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                        {r.code ? ` (${r.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={reserveDate}
                  onChange={(e) => setReserveDate(e.target.value)}
                  min={today}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="from">Início *</Label>
                  <Select value={reserveFrom} onValueChange={setReserveFrom}>
                    <SelectTrigger id="from">
                      <SelectValue placeholder="Horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="until">Fim *</Label>
                  <Select value={reserveUntil} onValueChange={setReserveUntil}>
                    <SelectTrigger id="until">
                      <SelectValue placeholder="Horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Reservando..." : "Reservar sala"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas reservas</CardTitle>
            <CardDescription>
              Reservas de sala que você fez
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Você ainda não reservou nenhuma sala.
              </p>
            ) : (
              <ul className="space-y-3">
                {reservations.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{r.roomName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                          {(r.reservedFrom || r.reservedUntil) && (
                            <>
                              {" "}
                              · {r.reservedFrom ?? "—"} até {r.reservedUntil ?? "—"}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancel(r.id)}
                      title="Cancelar reserva"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
