"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { parseBrazilDate } from "@/lib/date-brazil";
import type { AdminAppointmentRow } from "@/lib/api";

function statusBadge(status: AdminAppointmentRow["status"]) {
  if (status === "confirmed") return <Badge>Confirmada</Badge>;
  if (status === "completed") return <Badge variant="secondary">Concluída</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Cancelada</Badge>;
  return <Badge variant="outline">Pendente</Badge>;
}

function DetailsDialog({ appointment }: { appointment: AdminAppointmentRow }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Ver detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Mentoria #{appointment.id}</DialogTitle>
          <DialogDescription>
            Todos os dados relacionados: contatos, preparação, materiais e feedbacks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-md border p-3">
            <p className="font-medium">Mentor</p>
            <p className="text-sm">{appointment.mentor.name}</p>
            <p className="text-sm text-muted-foreground">{appointment.mentor.email || "Sem e-mail"}</p>
            <p className="text-sm text-muted-foreground">{appointment.mentor.phone || "Sem telefone"}</p>
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <p className="font-medium">Estudante</p>
            <p className="text-sm">{appointment.student.name}</p>
            <p className="text-sm text-muted-foreground">{appointment.student.email || "Sem e-mail"}</p>
            <p className="text-sm text-muted-foreground">{appointment.student.phone || "Sem telefone"}</p>
            <p className="text-sm text-muted-foreground">Série: {appointment.student.grade || "Não informada"}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-md border p-3">
            <p className="font-medium">Mensagem da mentoria</p>
            <p className="text-sm whitespace-pre-wrap">{appointment.message || "Sem mensagem."}</p>
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <p className="font-medium">Itens de preparação</p>
            {appointment.preparationItems.length ? (
              <ul className="list-disc pl-5 text-sm">
                {appointment.preparationItems.map((item, idx) => (
                  <li key={`${appointment.id}-prep-${idx}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sem itens de preparação.</p>
            )}
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-3">
          <p className="font-medium">Materiais ({appointment.materials.length})</p>
          {appointment.materials.length ? (
            <ul className="space-y-1 text-sm">
              {appointment.materials.map((m) => (
                <li key={m.id} className="break-all">
                  {m.name} ({m.type}) - {m.url}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum material enviado.</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-md border p-3">
            <p className="font-medium">Feedback do estudante</p>
            {appointment.feedbacks.student ? (
              <>
                <p className="text-sm">Nota: {appointment.feedbacks.student.rating ?? "-"}</p>
                <p className="text-sm">Satisfação: {appointment.feedbacks.student.satisfaction ?? "-"}</p>
                <p className="text-sm whitespace-pre-wrap">
                  Comentário: {appointment.feedbacks.student.comment || "Sem comentário"}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sem feedback.</p>
            )}
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <p className="font-medium">Feedback do mentor</p>
            {appointment.feedbacks.mentor ? (
              <>
                <p className="text-sm">Nota: {appointment.feedbacks.mentor.rating ?? "-"}</p>
                <p className="text-sm">Satisfação: {appointment.feedbacks.mentor.satisfaction ?? "-"}</p>
                <p className="text-sm whitespace-pre-wrap">
                  Comentário: {appointment.feedbacks.mentor.comment || "Sem comentário"}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sem feedback.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns: ColumnDef<AdminAppointmentRow>[] = [
  {
    accessorKey: "date",
    header: "Data/Hora",
    cell: ({ row }) => (
      <div className="min-w-[160px]">
        <p className="font-medium">
          {format(parseBrazilDate(row.original.date), "dd/MM/yyyy", { locale: ptBR })}
        </p>
        <p className="text-xs text-muted-foreground">{row.original.time}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => statusBadge(row.original.status),
  },
  {
    accessorKey: "subject",
    header: "Área",
    cell: ({ row }) => <span className="min-w-[220px] inline-block">{row.original.subject}</span>,
  },
  {
    accessorKey: "mentor.name",
    header: "Mentor",
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <p className="font-medium">{row.original.mentor.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.mentor.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "student.name",
    header: "Estudante",
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <p className="font-medium">{row.original.student.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.student.email}</p>
      </div>
    ),
  },
  {
    id: "feedbacks",
    header: "Feedbacks",
    cell: ({ row }) => {
      const s = row.original.feedbacks.student?.rating;
      const m = row.original.feedbacks.mentor?.rating;
      return (
        <div className="text-xs">
          <p>Aluno: {s ?? "-"}</p>
          <p>Mentor: {m ?? "-"}</p>
        </div>
      );
    },
  },
  {
    id: "materials",
    header: "Materiais",
    cell: ({ row }) => <span>{row.original.materials.length}</span>,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <DetailsDialog appointment={row.original} />,
  },
];

