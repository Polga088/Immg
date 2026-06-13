import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const locales = routing.locales.join("|");

function stripLocale(pathname: string): string {
  const match = pathname.match(new RegExp(`^/(${locales})(/|$)`));
  if (match) {
    const rest = pathname.slice(match[0].length - (match[2] === "/" ? 1 : 0));
    return rest || "/";
  }
  return pathname;
}

const publicPaths = new Set(["/", "/login", "/register"]);

function isPublicApi(pathname: string, method: string): boolean {
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/health")) {
    return true;
  }
  // Read-only RAG search (no LLM) — useful for ops checks; POST stays authenticated
  if (pathname === "/api/regulations/search" && method === "GET") {
    return true;
  }
  return false;
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // API routes must never get a locale prefix (/fr/api/... breaks register & health)
  if (pathname.startsWith("/api/")) {
    if (!req.auth && !isPublicApi(pathname, req.method)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const pathWithoutLocale = stripLocale(pathname);
  const isPublic = publicPaths.has(pathWithoutLocale);

  if (!req.auth && !isPublic) {
    const localeMatch = pathname.match(new RegExp(`^/(${locales})`));
    const locale = localeMatch?.[1] ?? routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
