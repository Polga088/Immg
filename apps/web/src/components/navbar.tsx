"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { AgentMascot } from "@/components/agent-mascot";
import { cn } from "@/lib/utils";
import type { AgentId } from "@/lib/agents/mascots";

const navItems = [
  { href: "/dashboard", key: "dashboard", agent: null },
  { href: "/procedure", key: "procedure", agent: "procedure" as AgentId },
  { href: "/cv", key: "cv", agent: "cv" as AgentId },
  { href: "/regulation", key: "regulation", agent: "regulation" as AgentId },
  { href: "/jobs", key: "jobs", agent: "job" as AgentId },
  { href: "/profile", key: "profile", agent: null },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-4">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-lg font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent"
        >
          <span className="text-xl">🍁</span>
          Immg
        </Link>
        <nav className="flex items-center gap-0.5 flex-wrap justify-center">
          {(isAuthenticated ? navItems : [{ href: "/", key: "home", agent: null }]).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-white shadow-md text-zinc-900 ring-1 ring-zinc-200"
                  : "text-zinc-600 hover:bg-white/60",
              )}
            >
              {"agent" in item && item.agent && (
                <span className="h-6 w-6 shrink-0 overflow-hidden rounded-sm bg-zinc-100 ring-1 ring-zinc-900/20">
                  <AgentMascot agent={item.agent} size="sm" animated={false} framed={false} />
                </span>
              )}
              <span className="hidden sm:inline">{t(item.key)}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {isAuthenticated ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-white/60"
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function LocaleSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex gap-0.5 rounded-full bg-white/60 p-0.5 ring-1 ring-zinc-200 text-xs font-semibold">
      <Link
        href={pathname}
        locale="fr"
        className="rounded-full px-2.5 py-1 hover:bg-white transition-colors"
      >
        FR
      </Link>
      <Link
        href={pathname}
        locale="en"
        className="rounded-full px-2.5 py-1 hover:bg-white transition-colors"
      >
        EN
      </Link>
    </div>
  );
}
