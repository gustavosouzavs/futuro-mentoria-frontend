"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  Settings,
  DoorOpen,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/navigation/user-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { UserType } from "@/lib/api";

type NavItem = { title: string; href: string; icon: LucideIcon };

const studentNavItems: NavItem[] = [
  { title: "Dashboard", href: "/estudante/dashboard", icon: LayoutDashboard },
  { title: "Horários", href: "/horarios", icon: Clock },
  { title: "Agendar Mentoria", href: "/estudante/agendar", icon: Calendar },
];

const mentorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
  { title: "Horários", href: "/horarios", icon: Clock },
  { title: "Mentorias", href: "/mentor/mentorias", icon: BookOpen },
  { title: "Reservar Sala", href: "/mentor/salas", icon: DoorOpen },
];

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Horários", href: "/horarios", icon: Clock },
  { title: "Usuários", href: "/admin/users", icon: Users },
  { title: "Salas", href: "/admin/rooms", icon: DoorOpen },
  { title: "Configurações", href: "/admin/settings", icon: Settings },
];

function getNavItems(role: UserType): NavItem[] {
  switch (role) {
    case "student":
      return studentNavItems;
    case "mentor":
      return mentorNavItems;
    case "admin":
      return adminNavItems;
    default:
      return [];
  }
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const items = user ? getNavItems(user.role) : [];

  return (
    <Sidebar collapsible="icon" side="left" className="backdrop-blur-sm">
      <SidebarHeader className="border-b flex items-center">
        <Link href="/" className="flex items-center gap-2 px-1 py-[6px]">
          <Image
            src="/logo.png"
            alt="Logo"
            width={96}
            height={32}
            className=""
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t ">
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
          {user && (
            <>
              <UserMenu user={user} align="start" />
              <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                {user.name}
              </span>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
