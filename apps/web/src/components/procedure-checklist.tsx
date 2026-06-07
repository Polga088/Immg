"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistStep {
  stepKey: string;
  completed: boolean;
  completedAt: string | null;
  documents: string[];
}

interface ChecklistData {
  program: string;
  steps: ChecklistStep[];
  progress: number;
  completed: number;
  total: number;
  pendingDocuments: string[];
}

interface ProcedureChecklistProps {
  title: string;
  progressLabel: string;
  pendingDocsLabel: string;
  stepLabels: Record<string, string>;
  documentLabels: Record<string, string>;
}

export function ProcedureChecklist({
  title,
  progressLabel,
  pendingDocsLabel,
  stepLabels,
  documentLabels,
}: ProcedureChecklistProps) {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/procedure/steps")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  function toggleStep(stepKey: string, completed: boolean) {
    startTransition(async () => {
      const res = await fetch("/api/procedure/steps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepKey, completed: !completed }),
      });
      const updated = await res.json();
      setData(updated);
    });
  }

  if (!data) {
    return <p className="text-zinc-400 text-sm">Loading checklist…</p>;
  }

  return (
    <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-zinc-500">
          {progressLabel}: {data.completed}/{data.total}
        </span>
      </div>

      <div className="h-2 rounded-full bg-zinc-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
          style={{ width: `${data.progress}%` }}
        />
      </div>

      <ul className="space-y-2">
        {data.steps.map((step) => (
          <li key={step.stepKey}>
            <button
              type="button"
              disabled={pending}
              onClick={() => toggleStep(step.stepKey, step.completed)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                step.completed
                  ? "bg-emerald-50/80 text-emerald-900"
                  : "hover:bg-white/70 text-zinc-700",
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-zinc-300 mt-0.5" />
              )}
              <span className="text-sm">
                {stepLabels[step.stepKey] ?? step.stepKey}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {data.pendingDocuments.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-4 text-sm">
          <p className="font-medium text-amber-900 mb-2">{pendingDocsLabel}</p>
          <ul className="list-disc list-inside text-amber-800 space-y-1">
            {data.pendingDocuments.map((doc) => (
              <li key={doc}>{documentLabels[doc] ?? doc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
