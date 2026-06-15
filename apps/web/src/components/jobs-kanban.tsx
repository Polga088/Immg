"use client";

import { useState } from "react";
import { ExternalLink, FileText, GripVertical } from "lucide-react";
import { KANBAN_COLUMNS, type ApplicationStatus, type KanbanColumn } from "@/lib/jobs/constants";

export interface JobApplication {
  id: string;
  company: string;
  title: string;
  jobUrl: string | null;
  status: string;
  coverLetter: string | null;
  adaptedCv?: string | null;
  fitScore?: number | null;
  packageReady?: boolean;
  packageStatus?: string;
  packageError?: string | null;
}

interface JobsKanbanProps {
  applications: JobApplication[];
  statusLabels: Record<ApplicationStatus, string>;
  columnLabels: Record<KanbanColumn, string>;
  generateLabel: string;
  viewLetterLabel: string;
  jobDescriptionLabel: string;
  generatingLabel: string;
  emptyColumnLabel: string;
  onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>;
  onGenerateLetter: (
    app: JobApplication,
    jobDescription: string,
  ) => Promise<string | null>;
}

export function JobsKanban({
  applications,
  statusLabels,
  columnLabels,
  generateLabel,
  viewLetterLabel,
  jobDescriptionLabel,
  generatingLabel,
  emptyColumnLabel,
  onStatusChange,
  onGenerateLetter,
}: JobsKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<{
    app: JobApplication;
    text: string;
  } | null>(null);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  function appsInColumn(status: ApplicationStatus) {
    return applications.filter((a) => a.status === status);
  }

  async function handleDrop(status: ApplicationStatus) {
    if (!draggingId) return;
    const app = applications.find((a) => a.id === draggingId);
    if (!app || app.status === status) {
      setDraggingId(null);
      return;
    }
    await onStatusChange(draggingId, status);
    setDraggingId(null);
  }

  async function handleGenerate(app: JobApplication) {
    setGeneratingId(app.id);
    try {
      const text = await onGenerateLetter(app, descriptions[app.id] ?? "");
      if (text) {
        setActiveLetter({ app: { ...app, coverLetter: text, status: "ready" }, text });
      }
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-4">
        {KANBAN_COLUMNS.map((status) => (
          <div
            key={status}
            className="rounded-xl border border-zinc-200/80 bg-white/50 p-3 min-h-[280px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => void handleDrop(status)}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-800">
                {columnLabels[status]}
              </h3>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                {appsInColumn(status).length}
              </span>
            </div>

            <div className="space-y-2">
              {appsInColumn(status).length === 0 && (
                <p className="text-xs text-zinc-400 py-6 text-center">{emptyColumnLabel}</p>
              )}
              {appsInColumn(status).map((app) => (
                <article
                  key={app.id}
                  draggable
                  onDragStart={() => setDraggingId(app.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className={`rounded-lg border bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing ${
                    draggingId === app.id ? "opacity-50 border-amber-400" : "border-zinc-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 shrink-0 text-zinc-300 mt-0.5" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <p className="font-medium text-sm truncate">{app.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{app.company}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-zinc-400">
                          {statusLabels[app.status as ApplicationStatus] ?? app.status}
                        </span>
                      </div>

                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Offer
                        </a>
                      )}

                      <textarea
                        value={descriptions[app.id] ?? ""}
                        onChange={(e) =>
                          setDescriptions((prev) => ({ ...prev, [app.id]: e.target.value }))
                        }
                        placeholder={jobDescriptionLabel}
                        rows={2}
                        className="w-full rounded border border-zinc-200 px-2 py-1 text-xs resize-none"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleGenerate(app)}
                          disabled={generatingId === app.id}
                          className="text-xs rounded-full bg-amber-500 px-3 py-1 text-white hover:bg-amber-600 disabled:opacity-50"
                        >
                          {generatingId === app.id ? generatingLabel : generateLabel}
                        </button>
                        {app.coverLetter && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveLetter({ app, text: app.coverLetter ?? "" })
                            }
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            {viewLetterLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setActiveLetter(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-1">{activeLetter.app.title}</h3>
            <p className="text-sm text-zinc-500 mb-4">{activeLetter.app.company}</p>
            <pre className="whitespace-pre-wrap text-sm text-zinc-800 font-sans leading-relaxed">
              {activeLetter.text}
            </pre>
            <button
              type="button"
              onClick={() => setActiveLetter(null)}
              className="mt-4 rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
