"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Eye, Mail, Phone, GraduationCap, User, Pencil, Upload, FileSpreadsheet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { fetcher } from "@/lib/fetcher";
import { adminUsersApi, adminStudentsImportApi } from "@/lib/api";
import { toast } from "sonner";

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

const grades = [
  "1º Ano do Ensino Médio",
  "2º Ano do Ensino Médio",
  "3º Ano do Ensino Médio",
];

const editUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  phone: z.string().optional(),
  role: z.enum(["student", "mentor", "admin"]),
  grade: z.string().optional(),
  specialties: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  password: z.union([z.string().min(6, "Mínimo 6 caracteres"), z.literal("")]).optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export function UsersClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const usersKey = `/api/admin/users?limit=50${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`;
  const { data, isLoading: loading, mutate } = useSWR<AdminUsersResponse>(usersKey, fetcher);
  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const filteredUsers = users;
  const students = filteredUsers.filter((u) => u.role === "student");
  const mentors = filteredUsers.filter((u) => u.role === "mentor");

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "student",
      grade: "",
      specialties: "",
      status: "active",
      password: "",
    },
  });

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setEditingUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      grade: user.grade || "",
      specialties: user.specialties?.join(", ") || "",
      status: user.status,
      password: "",
    });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setEditingUser(null);
  };

  const onEditSubmit = async (values: EditUserFormValues) => {
    if (!editingUser) return;
    try {
      await adminUsersApi.update(editingUser.id, {
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        role: values.role,
        grade: values.grade || undefined,
        specialties: values.specialties ? values.specialties.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        status: values.status,
        password: values.password && values.password.length >= 6 ? values.password : undefined,
      });
      toast.success("Usuário atualizado com sucesso.");
      await mutate();
      closeDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar usuário.");
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo .xlsx ou .csv");
      return;
    }
    setImporting(true);
    try {
      const result = await adminStudentsImportApi.import(importFile);
      toast.success(result.message);
      if (result.details?.skipped?.length) {
        toast.info(`${result.details.skipped.length} linha(s) ignorada(s).`, { description: result.details.skipped.map((s) => `Linha ${s.row}: ${s.reason}`).join("; ") });
      }
      setImportFile(null);
      await mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na importação.");
    } finally {
      setImporting(false);
    }
  };

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

      {/* Importação em lote */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar estudantes em lote
          </CardTitle>
          <CardDescription>
            Envie um arquivo .xlsx ou .csv com as colunas: <strong>Aluno</strong>, <strong>Série</strong> e opcionalmente <strong>E-mail</strong>. Senha padrão para novos usuários: trocar123
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="import-file">Arquivo</Label>
              <Input
                id="import-file"
                type="file"
                accept=".xlsx,.csv"
                className="mt-1"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              <Upload className="mr-2 h-4 w-4" />
              {importing ? "Enviando..." : "Enviar"}
            </Button>
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
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditingUser(null);
                          setDialogOpen(true);
                        }}
                        aria-label="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          openEdit(user);
                          setDialogOpen(true);
                        }}
                        aria-label="Editar usuário"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Ver detalhes / Editar usuário */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) closeDialog(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar usuário" : "Detalhes do Usuário"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Altere os dados e salve. Deixe a senha em branco para não alterar." : "Informações completas do usuário"}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && editingUser ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Estudante</SelectItem>
                          <SelectItem value="mentor">Mentor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("role") === "student" && (
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Série</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Série" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grades.map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {(form.watch("role") === "mentor" || selectedUser.specialties?.length) && (
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidades (separadas por vírgula)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Matemática, Física" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha (opcional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Deixe em branco para não alterar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : selectedUser ? (
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
                  <Badge variant={selectedUser.role === "mentor" ? "default" : selectedUser.role === "admin" ? "secondary" : "outline"}>
                    {selectedUser.role === "mentor" ? "Mentor" : selectedUser.role === "admin" ? "Admin" : "Estudante"}
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
                {selectedUser.specialties && selectedUser.specialties.length > 0 && (
                  <div className="space-y-2">
                    <Label>Especialidades</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.specialties.map((spec, idx) => (
                        <Badge key={idx} variant="outline">{spec}</Badge>
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
                        <span className="text-sm text-muted-foreground">Total de Mentorias: </span>
                        <p className="font-semibold">{selectedUser.totalMentorias ?? 0}</p>
                      </div>
                      {selectedUser.averageRating != null && (
                        <div>
                          <span className="text-sm text-muted-foreground">Avaliação Média: </span>
                          <p className="font-semibold">⭐ {selectedUser.averageRating.toFixed(1)} / 5.0</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <span className="text-sm text-muted-foreground">Total de Agendamentos: </span>
                      <p className="font-semibold">{selectedUser.totalAgendamentos ?? 0}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => { openEdit(selectedUser); setDialogOpen(true); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar usuário
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
