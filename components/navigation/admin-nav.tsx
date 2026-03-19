"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  Clock,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Horários",
    href: "/admin/horarios",
    icon: Clock,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              asChild
              className={cn(
                "justify-start",
                isActive && "bg-secondary"
              )}
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu Administrativo</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "justify-start w-full",
                    isActive && "bg-secondary"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              );
            })}
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" size="sm" className="justify-start w-full text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

