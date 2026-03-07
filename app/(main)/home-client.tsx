"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export function HomeClient() {
  return (
    <div className="flex min-h-screen flex-col @container">
      <section className="container px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Agende sua Mentoria
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Conecte-se com mentores especializados e alcance seus objetivos
            acadêmicos. Sistema de agendamento simples e eficiente para
            estudantes do ensino médio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/estudante/agendar" className="gap-2">
                <Calendar className="h-5 w-5" />
                Agendar Mentoria
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/50">
        <div className="container px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <GraduationCap className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Mentores Qualificados</CardTitle>
                <CardDescription>
                  Professores e especialistas prontos para ajudar você
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Horários da Tarde</CardTitle>
                <CardDescription>
                  Agende entre 14h e 18h, com sessões de 30 minutos
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Áreas do ENEM</CardTitle>
                <CardDescription>
                  Suporte em todas as grandes áreas do ENEM
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="sobre" className="container px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-3xl font-bold">
            Sobre o Sistema
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              O Futuro Mentoria é uma plataforma desenvolvida para facilitar o
              agendamento de sessões de mentoria entre estudantes do ensino
              médio e mentores qualificados.
            </p>
            <p>
              Nossa missão é proporcionar um ambiente de aprendizado
              colaborativo, onde estudantes possam receber orientação
              personalizada e suporte acadêmico de forma prática e acessível.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Agendamento Online
                  </h3>
                  <p className="text-sm">
                    Agende suas mentorias de forma rápida e simples
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Acompanhamento Personalizado
                  </h3>
                  <p className="text-sm">
                    Receba orientação focada nas suas necessidades
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Grandes Áreas do ENEM
                  </h3>
                  <p className="text-sm">
                    Foco nas áreas avaliadas no Exame Nacional
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Sessões de 30 Minutos
                  </h3>
                  <p className="text-sm">
                    Mentorias objetivas e focadas no aprendizado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/50">
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Pronto para começar?</h2>
            <p className="mt-2 text-muted-foreground">
              Agende sua primeira mentoria em poucos cliques. É gratuito e
              pensado para estudantes.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/estudante/agendar">Agendar Mentoria</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
