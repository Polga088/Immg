"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { AgentHeader } from "@/components/agent-card";

interface Application {
  id: string;
  company: string;
  title: string;
  jobUrl: string | null;
  status: string;
  coverLetter: string | null;
}

interface JobsClientProps {
  locale: string;
  title: string;
  addLabel: string;
  companyLabel: string;
  jobTitleLabel: string;
  jobUrlLabel: string;
  statusLabel: string;
  generateLabel: string;
  chatPlaceholder: string;
  chatSend: string;
  chatThinking: string;
  chatError: string;
}

export function JobsClient(props: JobsClientProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  function loadApps() {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? []));
  }

  useEffect(() => {
    loadApps();
  }, []);

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

  async function generateLetter(app: Application) {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "coverLetter",
        id: app.id,
        company: app.company,
        title: app.title,
      }),
    });
    const data = await res.json();
    alert(data.coverLetter?.slice(0, 500) + "…");
    loadApps();
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
          onClick={addApplication}
          disabled={!company || !title}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {props.addLabel}
        </button>

        <div className="space-y-2 pt-4 border-t">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-lg border border-zinc-100 p-3"
            >
              <div>
                <p className="font-medium">{app.title}</p>
                <p className="text-sm text-zinc-500">{app.company}</p>
                <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded">
                  {props.statusLabel}: {app.status}
                </span>
              </div>
              <button
                onClick={() => generateLetter(app)}
                className="text-sm text-blue-600 hover:underline"
              >
                {props.generateLabel}
              </button>
            </div>
          ))}
        </div>
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
