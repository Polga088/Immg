"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" },
  { href: "/procedure", key: "procedure" },
  { href: "/cv", key: "cv" },
  { href: "/regulation", key: "regulation" },
  { href: "/jobs", key: "jobs" },
  { href: "/profile", key: "profile" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-blue-700">
          Immg
        </Link>
        <nav className="flex items-center gap-1 flex-wrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-100 text-blue-700"
                  : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <LocaleSwitcher />
      </div>
    </header>
  );
}

function LocaleSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 text-xs">
      <Link
        href={pathname}
        locale="fr"
        className="rounded px-2 py-1 hover:bg-zinc-100 font-medium"
      >
        FR
      </Link>
      <Link
        href={pathname}
        locale="en"
        className="rounded px-2 py-1 hover:bg-zinc-100 font-medium"
      >
        EN
      </Link>
    </div>
  );
}
