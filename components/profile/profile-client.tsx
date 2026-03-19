"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ProfileClient() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success("Senha atualizada com sucesso.");
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar senha.");
    }
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center w-full">
                <CardTitle className="text-2xl">Perfil</CardTitle>
                <CardDescription>
                  Troque sua senha para manter sua conta segura
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha atual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showCurrent ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-9 pr-9"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowCurrent(!showCurrent)}
                            aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showCurrent ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showNew ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            className="pl-9 pr-9"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNew(!showNew)}
                            aria-label={showNew ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showNew ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repita a nova senha"
                            className="pl-9 pr-9"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirm(!showConfirm)}
                            aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Atualizando..." : "Atualizar senha"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

