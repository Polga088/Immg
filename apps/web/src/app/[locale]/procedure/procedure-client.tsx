"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { AgentHeader } from "@/components/agent-card";
import { ProcedureChecklist } from "@/components/procedure-checklist";

interface CRSBreakdown {
  total: number;
  age: number;
  education: number;
  firstLanguage: number;
  secondLanguage: number;
  foreignWork: number;
  canadianWork: number;
  adaptability: number;
}

interface ProcedureClientProps {
  locale: string;
  title: string;
  crsTitle: string;
  crsScoreLabel: string;
  calculateLabel: string;
  checklistTitle: string;
  progressLabel: string;
  pendingDocsLabel: string;
  stepLabels: Record<string, string>;
  documentLabels: Record<string, string>;
  chatPlaceholder: string;
  chatSend: string;
  chatThinking: string;
  chatError: string;
}

export function ProcedureClient(props: ProcedureClientProps) {
  const [crs, setCrs] = useState<CRSBreakdown | null>(null);

  useEffect(() => {
    fetch("/api/crs/calculate", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setCrs(d.breakdown))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <AgentHeader agent="procedure" title={props.title} locale={props.locale} />

      <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm">
        <h2 className="font-semibold mb-4">{props.crsTitle}</h2>
        {crs ? (
          <div className="space-y-2">
            <p className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              {props.crsScoreLabel}: {crs.total}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600">
              <span>Age: {crs.age}</span>
              <span>Education: {crs.education}</span>
              <span>Language 1: {crs.firstLanguage}</span>
              <span>Language 2: {crs.secondLanguage}</span>
              <span>Foreign work: {crs.foreignWork}</span>
              <span>Canadian work: {crs.canadianWork}</span>
              <span>Adaptability: {crs.adaptability}</span>
            </div>
          </div>
        ) : (
          <p className="text-zinc-400">Loading CRS…</p>
        )}
        <button
          onClick={() =>
            fetch("/api/crs/calculate", { method: "POST" })
              .then((r) => r.json())
              .then((d) => setCrs(d.breakdown))
          }
          className="mt-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm text-white hover:opacity-90 transition-opacity"
        >
          {props.calculateLabel}
        </button>
      </div>

      <ProcedureChecklist
        title={props.checklistTitle}
        progressLabel={props.progressLabel}
        pendingDocsLabel={props.pendingDocsLabel}
        stepLabels={props.stepLabels}
        documentLabels={props.documentLabels}
      />

      <ChatPanel
        agentId="procedure"
        locale={props.locale}
        placeholder={props.chatPlaceholder}
        sendLabel={props.chatSend}
        thinkingLabel={props.chatThinking}
        errorLabel={props.chatError}
      />
    </div>
  );
}
