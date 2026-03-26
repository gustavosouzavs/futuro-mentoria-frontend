"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Informe um nome"),
  url: z
    .string()
    .min(1, "Informe a URL")
    .refine((u) => /^https?:\/\//i.test(u.trim()), {
      message: "Use um link começando com http:// ou https://",
    }),
  type: z.enum(["link", "pdf", "doc", "other"]),
});

export type LinkMaterialFormValues = z.infer<typeof schema>;

type Props = {
  trigger: React.ReactNode;
  onSubmit: (values: LinkMaterialFormValues) => Promise<void> | void;
};

export function AddAppointmentLinkMaterialDialog({ trigger, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<LinkMaterialFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", url: "", type: "link" },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Adicionar link
          </DialogTitle>
          <DialogDescription>
            Materiais hospedados em Google Drive, nuvem ou qualquer URL pública.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await onSubmit(values);
                form.reset();
                setOpen(false);
              } catch {
                /* erros tratados no pai (ex.: toast); mantém o diálogo aberto */
              }
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Lista de exercícios" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="link">Link / páginas</SelectItem>
                      <SelectItem value="pdf">PDF (link direto)</SelectItem>
                      <SelectItem value="doc">Documento</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
