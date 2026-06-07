"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AgentMascot } from "@/components/agent-mascot";

interface DashboardClientProps {
  labels: {
    title: string;
    welcome: string;
    crsScore: string;
    profileComplete: string;
    profileIncomplete: string;
    checklistProgress: string;
    completeProfile: string;
    goToProcedure: string;
    agentsTitle: string;
  };
  agentLinks: Array<{ href: string; agent: "regulation" | "cv" | "job" | "procedure"; title: string }>;
}

interface DashboardData {
  profile: {
    crsScore: number | null;
    targetProgram: string | null;
  };
  complete: boolean;
  completionPercent: number;
  checklist: {
    progress: number;
    completed: number;
    total: number;
  } | null;
}

export function DashboardClient({ labels, agentLinks }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/procedure/steps").then((r) => r.json()),
    ])
      .then(([profileRes, checklist]) => {
        setData({
          profile: profileRes.profile,
          complete: profileRes.complete,
          completionPercent: profileRes.completionPercent,
          checklist: checklist.error
            ? null
            : {
                progress: checklist.progress,
                completed: checklist.completed,
                total: checklist.total,
              },
        });
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return <p className="text-zinc-400">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{labels.title}</h1>
        <p className="text-zinc-600 mt-1">{labels.welcome}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={labels.crsScore}
          value={data.profile.crsScore != null ? String(data.profile.crsScore) : "—"}
          accent="from-sky-500 to-blue-600"
        />
        <StatCard
          label={data.complete ? labels.profileComplete : labels.profileIncomplete}
          value={`${data.completionPercent}%`}
          accent={data.complete ? "from-emerald-400 to-teal-500" : "from-amber-400 to-orange-500"}
        />
        {data.checklist && (
          <StatCard
            label={labels.checklistProgress}
            value={`${data.checklist.completed}/${data.checklist.total}`}
            accent="from-violet-500 to-purple-600"
          />
        )}
      </div>

      {!data.complete && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-amber-900 text-sm">{labels.profileIncomplete}</p>
          <Link
            href="/profile"
            className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            {labels.completeProfile}
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/procedure"
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white"
        >
          {labels.goToProcedure}
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{labels.agentsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agentLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl glass border border-white/60 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-zinc-100 ring-1 ring-zinc-900/20">
                <AgentMascot agent={item.agent} size="sm" animated={false} framed={false} />
              </span>
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl glass border border-white/60 p-5 shadow-sm">
      <p className="text-sm text-zinc-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  );
}
