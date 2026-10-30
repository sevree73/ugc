import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the edge-safe config only (no Prisma/bcrypt) so this middleware
// stays compatible with the Edge runtime.
const { auth } = NextAuth(authConfig);

type AppRole = "COMPANY" | "CREATOR" | "ADMIN";

const roleHome: Record<AppRole, string> = {
  COMPANY: "/company",
  CREATOR: "/creator",
  ADMIN: "/admin",
};

const protectedPrefixes: Array<{ prefix: string; role: AppRole }> = [
  { prefix: "/company", role: "COMPANY" },
  { prefix: "/creator", role: "CREATOR" },
  { prefix: "/admin", role: "ADMIN" },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const match = protectedPrefixes.find((p) => pathname.startsWith(p.prefix));

  if (match) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.user.role !== match.role) {
      return NextResponse.redirect(
        new URL(roleHome[session.user.role], req.nextUrl),
      );
    }
  }

  // /project/* is shared by both roles; only require authentication here —
  // the page itself checks whether this specific user (company owner or
  // assigned creator) may see this specific brief.
  if (pathname.startsWith("/project") && !session?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && session?.user) {
    return NextResponse.redirect(
      new URL(roleHome[session.user.role], req.nextUrl),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/company/:path*",
    "/creator/:path*",
    "/admin/:path*",
    "/project/:path*",
    "/login",
  ],
};
