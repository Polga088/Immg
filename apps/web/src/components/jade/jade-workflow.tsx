"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Package, Send } from "lucide-react";
import { JobsKanban, type JobApplication } from "@/components/jobs-kanban";
import type { ApplicationStatus, KanbanColumn } from "@/lib/jobs/constants";

interface JadeWorkflowProps {
  locale: string;
  applications: JobApplication[];
  statusLabels: Record<ApplicationStatus, string>;
  columnLabels: Record<KanbanColumn, string>;
  labels: {
    title: string;
    generateLetter: string;
    viewLetter: string;
    jobDescription: string;
    generating: string;
    emptyColumn: string;
    preparePackage: string;
    preparing: string;
    backgroundPreparing: string;
    packageReady: string;
    packageFailed: string;
    noCv: string;
    validateSend: string;
    packageTitle: string;
    adaptedCv: string;
    coverLetter: string;
    fitScore: string;
    createDraft: string;
    close: string;
    disclaimer: string;
  };
  onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>;
  onRefresh: () => void;
  onPackageReady?: (app: JobApplication) => void;
}

export function JadeWorkflow({
  locale,
  applications,
  statusLabels,
  columnLabels,
  labels,
  onStatusChange,
  onRefresh,
  onPackageReady,
}: JadeWorkflowProps) {
  const [packageModal, setPackageModal] = useState<{
    app: JobApplication;
    adaptedCv: string;
    coverLetter: string;
    fitScore: number;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const notifiedReady = useRef<Set<string>>(new Set());

  const processingApps = applications.filter((a) => a.packageStatus === "processing");

  useEffect(() => {
    for (const app of applications) {
      if (
        app.packageStatus === "ready" &&
        app.packageReady &&
        app.adaptedCv &&
        !notifiedReady.current.has(app.id)
      ) {
        notifiedReady.current.add(app.id);
        onPackageReady?.(app);
      }
    }
  }, [applications, onPackageReady]);

  async function startPreparePackage(app: JobApplication) {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preparePackage", id: app.id, locale }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.error === "NO_CV") {
      alert(labels.noCv);
      return;
    }
    onRefresh();
  }

  function openPackageModal(app: JobApplication) {
    if (!app.adaptedCv || !app.coverLetter) return;
    setPackageModal({
      app,
      adaptedCv: app.adaptedCv,
      coverLetter: app.coverLetter,
      fitScore: app.fitScore ?? 0,
    });
  }

  async function createGmailDraft() {
    if (!packageModal) return;
    setSending(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createGmailDraft",
          id: packageModal.app.id,
          locale,
        }),
      });
      if (!res.ok) return;
      onRefresh();
      setPackageModal(null);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Package className="h-5 w-5 text-amber-600" />
        {labels.title}
      </h2>
      <p className="text-xs text-zinc-500">{labels.disclaimer}</p>

      {processingApps.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          {labels.backgroundPreparing} ({processingApps.map((a) => a.title).join(", ")})
        </div>
      )}

      <div className="space-y-3 mb-4">
        {applications
          .filter((a) => a.status === "draft" || !a.packageReady)
          .slice(0, 8)
          .map((app) => {
            const isProcessing = app.packageStatus === "processing";
            const isFailed = app.packageStatus === "failed";
            const isReady = app.packageStatus === "ready" && app.packageReady;

            return (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50/50 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{app.title}</p>
                  <p className="text-xs text-zinc-500">{app.company}</p>
                  {isFailed && (
                    <p className="text-xs text-red-600 mt-1">
                      {labels.packageFailed}
                      {app.packageError ? `: ${app.packageError}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isReady ? (
                    <button
                      type="button"
                      onClick={() => openPackageModal(app)}
                      className="text-xs rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {labels.packageReady}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void startPreparePackage(app)}
                      disabled={isProcessing}
                      className="text-xs rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {isProcessing ? labels.preparing : labels.preparePackage}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <JobsKanban
        applications={applications}
        statusLabels={statusLabels}
        columnLabels={columnLabels}
        generateLabel={labels.generateLetter}
        viewLetterLabel={labels.viewLetter}
        jobDescriptionLabel={labels.jobDescription}
        generatingLabel={labels.generating}
        emptyColumnLabel={labels.emptyColumn}
        onStatusChange={onStatusChange}
        onGenerateLetter={async (app, desc) => {
          const res = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "coverLetter",
              id: app.id,
              company: app.company,
              title: app.title,
              jobUrl: app.jobUrl,
              jobDescription: desc,
              locale,
            }),
          });
          const data = await res.json();
          onRefresh();
          return data.coverLetter ?? null;
        }}
      />

      {packageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{labels.packageTitle}</h3>
                <p className="text-sm text-zinc-600">
                  {packageModal.app.title} — {packageModal.app.company}
                </p>
                <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {labels.fitScore}: {packageModal.fitScore}/100
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">{labels.adaptedCv}</h4>
              <pre className="text-xs bg-zinc-50 rounded-lg p-3 max-h-40 overflow-auto whitespace-pre-wrap">
                {packageModal.adaptedCv}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">{labels.coverLetter}</h4>
              <pre className="text-xs bg-zinc-50 rounded-lg p-3 max-h-40 overflow-auto whitespace-pre-wrap">
                {packageModal.coverLetter}
              </pre>
            </div>

            <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2">
              {labels.disclaimer}
            </p>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPackageModal(null)}
                className="rounded-full border px-4 py-2 text-sm"
              >
                {labels.close}
              </button>
              <button
                type="button"
                onClick={() => void createGmailDraft()}
                disabled={sending}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="h-4 w-4" />
                {labels.createDraft}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
