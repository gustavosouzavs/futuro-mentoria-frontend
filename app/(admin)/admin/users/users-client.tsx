"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Search, Eye, Mail, Phone, GraduationCap, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { fetcher } from "@/lib/fetcher";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "mentor" | "admin";
  grade?: string;
  specialties?: string[];
  status: "active" | "inactive";
  createdAt: string;
  totalMentorias?: number;
  totalAgendamentos?: number;
  averageRating?: number;
}

interface AdminUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export function UsersClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const usersKey = `/api/admin/users?limit=50${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`;
  const { data, isLoading: loading } = useSWR<AdminUsersResponse>(usersKey, fetcher);
  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const filteredUsers = users;
  const students = filteredUsers.filter((u) => u.role === "student");
  const mentors = filteredUsers.filter((u) => u.role === "mentor");

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Usuários Cadastrados</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie todos os usuários do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-2xl">{loading ? "..." : total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estudantes</CardDescription>
            <CardTitle className="text-2xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mentores</CardDescription>
            <CardTitle className="text-2xl">{mentors.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Carregando usuários...</p>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estatísticas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "mentor"
                          ? "default"
                          : user.role === "admin"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.role === "mentor"
                        ? "Mentor"
                        : user.role === "admin"
                        ? "Admin"
                        : "Estudante"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "outline"}>
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === "mentor" ? (
                      <div className="text-sm">
                        <div>{user.totalMentorias || 0} mentorias</div>
                        {user.averageRating && (
                          <div className="text-muted-foreground">
                            ⭐ {user.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm">
                        {user.totalAgendamentos || 0} agendamentos
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Usuário</DialogTitle>
                          <DialogDescription>
                            Informações completas do usuário
                          </DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Nome Completo
                                </Label>
                                <p className="text-sm">{selectedUser.name}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  E-mail
                                </Label>
                                <p className="text-sm">{selectedUser.email}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Telefone
                                </Label>
                                <p className="text-sm">{selectedUser.phone}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Tipo de Usuário</Label>
                                <Badge
                                  variant={
                                    selectedUser.role === "mentor"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {selectedUser.role === "mentor"
                                    ? "Mentor"
                                    : "Estudante"}
                                </Badge>
                              </div>
                              {selectedUser.grade && (
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Série
                                  </Label>
                                  <p className="text-sm">{selectedUser.grade}</p>
                                </div>
                              )}
                              {selectedUser.specialties && (
                                <div className="space-y-2">
                                  <Label>Especialidades</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedUser.specialties.map((spec, idx) => (
                                      <Badge key={idx} variant="outline">
                                        {spec}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="border-t pt-4">
                              <h3 className="mb-2 font-semibold">Estatísticas</h3>
                              <div className="grid gap-2 md:grid-cols-2">
                                {selectedUser.role === "mentor" ? (
                                  <>
                                    <div>
                                      <span className="text-sm text-muted-foreground">
                                        Total de Mentorias:
                                      </span>
                                      <p className="font-semibold">
                                        {selectedUser.totalMentorias || 0}
                                      </p>
                                    </div>
                                    {selectedUser.averageRating && (
                                      <div>
                                        <span className="text-sm text-muted-foreground">
                                          Avaliação Média:
                                        </span>
                                        <p className="font-semibold">
                                          ⭐ {selectedUser.averageRating.toFixed(1)} / 5.0
                                        </p>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div>
                                    <span className="text-sm text-muted-foreground">
                                      Total de Agendamentos:
                                    </span>
                                    <p className="font-semibold">
                                      {selectedUser.totalAgendamentos || 0}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
