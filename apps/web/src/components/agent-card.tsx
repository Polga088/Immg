"use client";

import { Link } from "@/i18n/navigation";
import { AgentMascot } from "@/components/agent-mascot";
import {
  type AgentId,
  getAgent,
  localeName,
  localeTagline,
} from "@/lib/agents/mascots";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: AgentId;
  href: string;
  title: string;
  description: string;
  locale: string;
}

export function AgentCard({
  agent,
  href,
  title,
  description,
  locale,
}: AgentCardProps) {
  const meta = getAgent(agent);

  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/60 p-6",
        "bg-white/80 backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        meta.glow,
        "hover:shadow-lg",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          "bg-gradient-to-br",
          meta.gradient,
        )}
        style={{ opacity: 0.06 }}
      />
      <div
        className={cn(
          "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-40",
          "bg-gradient-to-br",
          meta.gradient,
        )}
      />
      <div className="relative flex flex-col items-center text-center gap-4">
        <div className="retro-card-frame rounded-none p-3 bg-zinc-900/5">
          <AgentMascot agent={agent} size="lg" framed={false} />
        </div>
        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-wider", meta.accent)}>
            {localeName(meta, locale)}
          </p>
          <h2 className="mt-1 text-lg font-bold text-zinc-900">{title}</h2>
          <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{description}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity",
            "group-hover:opacity-100",
            meta.accent,
          )}
        >
          → {locale === "en" ? "Open agent" : "Ouvrir l'agent"}
        </span>
      </div>
    </Link>
  );
}

interface AgentHeaderProps {
  agent: AgentId;
  title: string;
  locale: string;
  subtitle?: string;
}

export function AgentHeader({ agent, title, locale, subtitle }: AgentHeaderProps) {
  const meta = getAgent(agent);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/60 p-6 md:p-8",
        "bg-white/90 backdrop-blur-sm shadow-sm",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-[0.07]",
          meta.gradient,
        )}
      />
      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        <div className="retro-card-frame shrink-0 p-4 bg-zinc-900/5">
          <AgentMascot agent={agent} size="xl" framed={false} />
        </div>
        <div className="text-center sm:text-left">
          <p className={cn("text-sm font-bold uppercase tracking-widest", meta.accent)}>
            {localeName(meta, locale)}
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-zinc-900">{title}</h1>
          <p className="mt-2 text-zinc-600 max-w-lg">
            {subtitle ?? localeTagline(meta, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
