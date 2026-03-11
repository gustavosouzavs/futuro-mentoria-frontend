import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type UserType = "student" | "mentor" | "admin";

const PUBLIC_PATHS = ["/", "/login", "/register"];

const DASHBOARD_BY_ROLE: Record<UserType, string> = {
  student: "/estudante/dashboard",
  mentor: "/mentor/dashboard",
  admin: "/admin/dashboard",
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function getRequiredRole(pathname: string): UserType | null {
  if (pathname.startsWith("/estudante")) return "student";
  if (pathname.startsWith("/mentor")) return "mentor";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/agendar")) return "student";
  return null;
}

/** API retorna sempre .role no objeto user. */
interface AuthMeResponse {
  user?: { id: string; name: string; email: string; role?: UserType };
}

async function getCurrentUser(request: NextRequest): Promise<UserType | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const base = apiUrl ? apiUrl.replace(/\/$/, "") : request.nextUrl.origin;
  const url = `${base}/api/auth/me`;
  const cookie = request.cookies.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  try {
    const res = await fetch(url, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AuthMeResponse;
    const role = data.user?.role ?? null;
    if (role && ["student", "mentor", "admin"].includes(role)) return role as UserType;
    return null;
  } catch (error) {
    console.log(error)
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userRole = await getCurrentUser(request);
  console.log(userRole)

  if (isPublicPath(pathname)) {
    if (userRole) {
      return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[userRole], request.url));
    }
    return NextResponse.next();
  }

  if (!userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requiredRole = getRequiredRole(pathname);
  if (requiredRole && userRole !== requiredRole) {
    return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[userRole], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
