"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DoorOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { adminRoomsApi, type RoomDto } from "@/lib/api";

export function RoomsClient() {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<RoomDto | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRooms = async () => {
    try {
      const res = await adminRoomsApi.list();
      setRooms(res.rooms);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar salas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormCode("");
    setFormLocation("");
    setOpenEdit(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminRoomsApi.create({
        name: formName.trim(),
        code: formCode.trim() || undefined,
        location: formLocation.trim() || undefined,
      });
      toast.success("Sala criada com sucesso.");
      setOpenCreate(false);
      resetForm();
      loadRooms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar sala.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openEdit) return;
    setSaving(true);
    try {
      await adminRoomsApi.update(openEdit.id, {
        name: formName.trim(),
        code: formCode.trim() || undefined,
        location: formLocation.trim() || undefined,
      });
      toast.success("Sala atualizada.");
      setOpenEdit(null);
      resetForm();
      loadRooms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar sala.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room: RoomDto) => {
    if (!confirm(`Remover a sala "${room.name}"?`)) return;
    try {
      await adminRoomsApi.delete(room.id);
      toast.success("Sala removida.");
      loadRooms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover sala.");
    }
  };

  const openEditDialog = (room: RoomDto) => {
    setOpenEdit(room);
    setFormName(room.name);
    setFormCode(room.code || "");
    setFormLocation(room.location || "");
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DoorOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Salas</h1>
            <p className="mt-1 text-muted-foreground">
              Cadastre as salas onde as mentorias acontecem
            </p>
          </div>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova sala
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Nova sala</DialogTitle>
                <DialogDescription>
                  Preencha os dados da sala. Código e localização são opcionais.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Sala 101"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Ex: S101"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ex: Bloco A, 1º andar"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando salas...</p>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DoorOpen className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Nenhuma sala cadastrada.</p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Nova sala&quot; para cadastrar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(room)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(room)}
                    title="Remover"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {room.code && (
                  <p className="text-sm text-muted-foreground">Código: {room.code}</p>
                )}
                {room.location && (
                  <p className="text-sm text-muted-foreground">{room.location}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!openEdit} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar sala</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Código</Label>
                <Input
                  id="edit-code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Localização</Label>
                <Input
                  id="edit-location"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => resetForm()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
