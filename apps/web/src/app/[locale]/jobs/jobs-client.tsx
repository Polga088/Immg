"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { AgentHeader } from "@/components/agent-card";
import { JobsKanban, type JobApplication } from "@/components/jobs-kanban";
import type { ApplicationStatus } from "@/lib/jobs/constants";

interface JobsClientProps {
  locale: string;
  title: string;
  addLabel: string;
  companyLabel: string;
  jobTitleLabel: string;
  jobUrlLabel: string;
  jobDescriptionLabel: string;
  generateLabel: string;
  viewLetterLabel: string;
  generatingLabel: string;
  emptyColumnLabel: string;
  kanbanTitle: string;
  statusLabels: Record<ApplicationStatus, string>;
  columnLabels: Record<"draft" | "ready" | "sent" | "interview", string>;
  chatPlaceholder: string;
  chatSend: string;
  chatThinking: string;
  chatError: string;
}

export function JobsClient(props: JobsClientProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const loadApps = useCallback(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? []));
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  async function addApplication() {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", company, title, jobUrl }),
    });
    setCompany("");
    setTitle("");
    setJobUrl("");
    loadApps();
  }

  async function updateStatus(id: string, status: ApplicationStatus) {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", id, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data.application } : a)),
      );
    }
  }

  async function generateLetter(app: JobApplication, jobDescription: string) {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "coverLetter",
        id: app.id,
        company: app.company,
        title: app.title,
        jobUrl: app.jobUrl,
        jobDescription,
        locale: props.locale,
      }),
    });
    const data = await res.json();
    if (data.coverLetter) {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? { ...a, coverLetter: data.coverLetter, status: "ready" }
            : a,
        ),
      );
    }
    return data.coverLetter ?? null;
  }

  return (
    <div className="space-y-6">
      <AgentHeader agent="job" title={props.title} locale={props.locale} />

      <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">{props.addLabel}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={props.companyLabel}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={props.jobTitleLabel}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder={props.jobUrlLabel}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void addApplication()}
          disabled={!company || !title}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {props.addLabel}
        </button>
      </div>

      <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">{props.kanbanTitle}</h2>
        <JobsKanban
          applications={applications}
          statusLabels={props.statusLabels}
          columnLabels={props.columnLabels}
          generateLabel={props.generateLabel}
          viewLetterLabel={props.viewLetterLabel}
          jobDescriptionLabel={props.jobDescriptionLabel}
          generatingLabel={props.generatingLabel}
          emptyColumnLabel={props.emptyColumnLabel}
          onStatusChange={updateStatus}
          onGenerateLetter={generateLetter}
        />
      </div>

      <ChatPanel
        agentId="job"
        locale={props.locale}
        placeholder={props.chatPlaceholder}
        sendLabel={props.chatSend}
        thinkingLabel={props.chatThinking}
        errorLabel={props.chatError}
      />
    </div>
  );
}
