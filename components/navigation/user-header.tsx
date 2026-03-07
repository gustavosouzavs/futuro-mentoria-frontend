"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/navigation/user-menu";
import { StudentNav } from "./student-nav";
import { MentorNav } from "./mentor-nav";
import { AdminNav } from "./admin-nav";
import { useCurrentUser } from "@/hooks/use-current-user";

export function UserHeader() {
  const { user, isLoading } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

        {/* Nav por tipo de usuário (só quando temos user) */}
        {user && (
          <>
            {user.role === "student" && <StudentNav />}
            {user.role === "mentor" && <MentorNav />}
            {user.role === "admin" && <AdminNav />}
          </>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-full md:h-10 md:w-10" />
          ) : user ? (
            <UserMenu user={user} align="end" />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
