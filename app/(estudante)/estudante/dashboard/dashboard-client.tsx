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
  AlertCircle,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { parseBrazilDate } from "@/lib/date-brazil";

interface Appointment {
  id: string;
  mentorName: string;
  subject: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  hasFeedback: boolean;
  hasMaterial: boolean;
  hasMessage: boolean;
  needsPreparation: boolean;
}

interface StudentAppointmentsResponse {
  appointments: Appointment[];
}

export function DashboardClient() {
  const { data, error, isLoading } = useSWR<StudentAppointmentsResponse>(
    "/api/student/appointments",
    fetcher
  );
  const appointments = data?.appointments ?? [];
  const loading = isLoading;

  const pendingItems = appointments.filter(
    (apt) =>
      apt.status === "completed" && !apt.hasFeedback
  ).length;

  const upcomingAppointments = appointments.filter(
    (apt) =>
      (apt.status === "confirmed" || apt.status === "pending") &&
      parseBrazilDate(apt.date) >= new Date()
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
        <p className="text-destructive">Não foi possível carregar suas mentorias.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Estudante</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie suas mentorias agendadas
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/horarios" className="gap-2">
            <Clock className="h-4 w-4" />
            Ver horários de hoje
          </Link>
        </Button>
      </div>

      {pendingItems > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  Você tem {pendingItems} mentoria(s) aguardando feedback
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Por favor, avalie suas mentorias concluídas para nos ajudar a melhorar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <CardTitle className="text-2xl">
              {appointments.filter((a) => a.status === "completed").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendências</CardDescription>
            <CardTitle className="text-2xl">{pendingItems}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minhas Mentorias</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas mentorias agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Horário</TableHead>
                <TableHead>Mentor</TableHead>
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
                      {appointment.mentorName}
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
                      {appointment.needsPreparation && (
                        <Badge variant="outline" className="text-xs">
                          Preparação
                        </Badge>
                      )}
                      {appointment.status === "completed" && !appointment.hasFeedback && (
                        <Badge variant="destructive" className="text-xs">
                          Feedback pendente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/estudante/mentoria/${appointment.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                      {appointment.status === "completed" && !appointment.hasFeedback && (
                        <Button size="sm" asChild>
                          <Link href={`/estudante/mentoria/${appointment.id}/feedback`}>
                            Dar Feedback
                          </Link>
                        </Button>
                      )}
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
