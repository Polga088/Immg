"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AgentHeader } from "@/components/agent-card";
import { ChatPanel } from "@/components/chat-panel";
import { JadeConnections } from "@/components/jade/jade-connections";
import { JadeContacts } from "@/components/jade/jade-contacts";
import { JadeOpportunities } from "@/components/jade/jade-opportunities";
import { JadeWorkflow } from "@/components/jade/jade-workflow";
import type { JobApplication } from "@/components/jobs-kanban";
import type { ApplicationStatus, KanbanColumn } from "@/lib/jobs/constants";

type JadeTab = "connections" | "opportunities" | "contacts" | "workflow";

export interface JadeHubProps {
  locale: string;
  title: string;
  tabs: Record<JadeTab, string>;
  addApplication: string;
  company: string;
  jobTitle: string;
  jobUrl: string;
  statusLabels: Record<ApplicationStatus, string>;
  columnLabels: Record<KanbanColumn, string>;
  connectionsLabels: {
    title: string;
    gmail: string;
    indeed: string;
    jobBank: string;
    connectGoogle: string;
    connected: string;
    disconnect: string;
    serviceUnavailable: string;
    syncAlerts: string;
    oneClickHint: string;
  };
  opportunitiesLabels: {
    title: string;
    keywords: string;
    location: string;
    search: string;
    searching: string;
    import: string;
    results: string;
    noResults: string;
    cvAnalysis: string;
    noCv: string;
    uploadCv: string;
    suggestedTitles: string;
    fitScore: string;
    rankedByCv: string;
  };
  contactsLabels: {
    title: string;
    email: string;
    company: string;
    source: string;
    empty: string;
    autoAdded: string;
  };
  workflowLabels: {
    title: string;
    generateLetter: string;
    viewLetter: string;
    jobDescription: string;
    generating: string;
    emptyColumn: string;
    preparePackage: string;
    preparing: string;
    validateSend: string;
    packageTitle: string;
    adaptedCv: string;
    coverLetter: string;
    fitScore: string;
    createDraft: string;
    close: string;
    disclaimer: string;
  };
  chatPlaceholder: string;
  chatSend: string;
  chatThinking: string;
  chatError: string;
}

export function JadeHub(props: JadeHubProps) {
  const [tab, setTab] = useState<JadeTab>("connections");
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const loadApps = useCallback(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? []));
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  async function addManual() {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", company, title, jobUrl, source: "manual" }),
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
    if (res.ok) loadApps();
  }

  const tabOrder: JadeTab[] = ["connections", "opportunities", "contacts", "workflow"];

  return (
    <div className="space-y-6">
      <AgentHeader agent="job" title={props.title} locale={props.locale} />

      <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-100/80 p-1">
        {tabOrder.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-white text-amber-800 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900",
            )}
          >
            {props.tabs[key]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm min-h-[320px]">
        {tab === "connections" && (
          <JadeConnections
            labels={props.connectionsLabels}
            onGmailSynced={loadApps}
          />
        )}
        {tab === "opportunities" && (
          <JadeOpportunities
            locale={props.locale}
            labels={props.opportunitiesLabels}
            onImported={loadApps}
          />
        )}
        {tab === "contacts" && (
          <JadeContacts labels={props.contactsLabels} refreshKey={refreshKey} />
        )}
        {tab === "workflow" && (
          <JadeWorkflow
            locale={props.locale}
            applications={applications}
            statusLabels={props.statusLabels}
            columnLabels={props.columnLabels}
            labels={props.workflowLabels}
            onStatusChange={updateStatus}
            onRefresh={loadApps}
          />
        )}
      </div>

      {tab === "workflow" && (
        <div className="rounded-2xl glass border border-white/60 p-4 shadow-sm">
          <p className="text-sm font-medium mb-2">{props.addApplication}</p>
          <div className="grid gap-2 sm:grid-cols-4">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={props.company}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={props.jobTitle}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder={props.jobUrl}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void addManual()}
              disabled={!company || !title}
              className="rounded-full bg-amber-500 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {props.addApplication}
            </button>
          </div>
        </div>
      )}

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
