"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  Edit,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { parseBrazilDate } from "@/lib/date-brazil";

interface Appointment {
  id: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  hasFeedback: boolean;
  hasMaterial: boolean;
  hasMessage: boolean;
}

interface MentorAppointmentsResponse {
  appointments: Appointment[];
}

export function MentoriasClient() {
  const { data, error, isLoading } = useSWR<MentorAppointmentsResponse>(
    "/api/mentor/appointments",
    fetcher
  );
  const appointments = data?.appointments ?? [];
  const loading = isLoading;

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">Carregando mentorias...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container px-4 py-8">
        <p className="text-destructive">Não foi possível carregar as mentorias.</p>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (apt) =>
      (apt.status === "confirmed" || apt.status === "pending") &&
      parseBrazilDate(apt.date) >= new Date()
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  const getStatusBadge = (status: Appointment["status"]) => {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Minhas Mentorias</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie todas as suas mentorias agendadas
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Mentorias</CardDescription>
            <CardTitle className="text-2xl">{appointments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximas Mentorias</CardDescription>
            <CardTitle className="text-2xl">{upcomingAppointments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Concluídas</CardDescription>
            <CardTitle className="text-2xl">{completedAppointments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendências</CardDescription>
            <CardTitle className="text-2xl">
              {appointments.filter((a) => a.status === "completed" && !a.hasFeedback).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentorias Agendadas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas mentorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Horário</TableHead>
                <TableHead>Estudante</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Informações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(parseBrazilDate(appointment.date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{appointment.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.studentEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[200px] truncate">
                        {appointment.subject}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {appointment.hasMaterial && (
                        <Badge variant="outline" className="text-xs">
                          Material
                        </Badge>
                      )}
                      {appointment.hasMessage && (
                        <Badge variant="outline" className="text-xs">
                          Mensagem
                        </Badge>
                      )}
                      {appointment.status === "completed" && !appointment.hasFeedback && (
                        <Badge variant="destructive" className="text-xs">
                          Feedback pendente
                        </Badge>
                      )}
                      {appointment.status === "completed" && appointment.hasFeedback && (
                        <Badge variant="secondary" className="text-xs">
                          Feedback enviado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/mentor/mentorias/${appointment.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Gerenciar
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
