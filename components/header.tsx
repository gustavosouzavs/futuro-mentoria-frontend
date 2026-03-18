"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/navigation/user-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePathname } from "next/navigation";

const DASHBOARD_HREF = {
  student: "/estudante/dashboard",
  mentor: "/mentor/dashboard",
  admin: "/admin/dashboard",
} as const;

export function Header() {
  const { user, isLoading } = useCurrentUser();
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-10 w-[120px] object-contain"
          />
        </Link>

        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Início
          </Link>
          <Link
            href="/#sobre"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sobre
          </Link>
          {user && (
            <Link
              href="/horarios"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Horários
            </Link>
          )}
          <Link
            href="/estudante/agendar"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Agendar
          </Link>
        </nav>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-full md:h-10 md:w-10" />
          ) : user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                asChild
              >
                <Link href={DASHBOARD_HREF[user.role]}>Dashboard</Link>
              </Button>
              <UserMenu user={user} align="end" />
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                asChild
              >
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" className="text-xs sm:text-sm" asChild>
                <Link href="/estudante/agendar">
                  <span className="hidden sm:inline">Agendar Mentoria</span>
                  <span className="sm:hidden">Agendar</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
