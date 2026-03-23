"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { fetcher } from "@/lib/fetcher";
import type { AdminAppointmentRow } from "@/lib/api";

interface AdminAppointmentsResponse {
  appointments: AdminAppointmentRow[];
}

export function MentoriasAdminClient() {
  const { data, isLoading, error } = useSWR<AdminAppointmentsResponse>(
    "/api/admin/appointments",
    fetcher
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const appointments = data?.appointments ?? [];

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesStatus = status === "all" ? true : a.status === status;
      const matchesSearch =
        !normalized ||
        a.subject.toLowerCase().includes(normalized) ||
        a.mentor.name.toLowerCase().includes(normalized) ||
        a.mentor.email.toLowerCase().includes(normalized) ||
        a.student.name.toLowerCase().includes(normalized) ||
        a.student.email.toLowerCase().includes(normalized) ||
        a.id.includes(normalized);
      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, status]);

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <p className="text-muted-foreground">Carregando mentorias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8">
        <p className="text-destructive">Não foi possível carregar mentorias e feedbacks.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentorias e Feedbacks</h1>
        <p className="text-muted-foreground mt-1">
          Visualização completa das mentorias, feedbacks e dados relacionados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque por aluno, mentor, área, e-mail ou ID da mentoria.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por mentor, aluno, área ou ID..."
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de mentorias ({filtered.length})</CardTitle>
          <CardDescription>
            Use a coluna de ações para abrir todos os detalhes da mentoria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} globalFilter={search} />
        </CardContent>
      </Card>
    </div>
  );
}

