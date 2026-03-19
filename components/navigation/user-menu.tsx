"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api";
import type { UserType } from "@/lib/api";

const DASHBOARD_HREF: Record<UserType, string> = {
  student: "/estudante/dashboard",
  mentor: "/mentor/dashboard",
  admin: "/admin/dashboard",
};

const DASHBOARD_LABEL: Record<UserType, string> = {
  student: "Dashboard do Estudante",
  mentor: "Dashboard do Mentor",
  admin: "Dashboard Admin",
};

const PROFILE_HREF: Record<UserType, string> = {
  student: "/estudante/perfil",
  mentor: "/mentor/perfil",
  admin: "/admin/perfil",
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserMenuProps {
  user: { id: string; name: string; email: string; role: UserType };
  align?: "start" | "end";
}

export function UserMenu({ user, align = "end" }: UserMenuProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      await mutate("/api/auth/me", undefined, { revalidate: true });
    } finally {
      router.push("/login");
    }
  };

  const dashboardHref = DASHBOARD_HREF[user.role];
  const dashboardLabel = DASHBOARD_LABEL[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full md:h-10 md:w-10"
        >
          <Avatar className="h-9 w-9 md:h-10 md:w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56" sideOffset={8}>
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground text-xs font-normal">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {dashboardLabel}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={PROFILE_HREF[user.role]} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
