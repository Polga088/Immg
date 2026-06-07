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

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const pathWithoutLocale = stripLocale(pathname);
  const isPublic = publicPaths.has(pathWithoutLocale);
  const isAuthApi = pathname.startsWith("/api/auth");
  const isHealthApi = pathname.startsWith("/api/health");

  if (!req.auth && !isPublic && !isAuthApi && !isHealthApi) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const localeMatch = pathname.match(new RegExp(`^/(${locales})`));
    const locale = localeMatch?.[1] ?? routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    if (!pathname.startsWith("/api/")) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
