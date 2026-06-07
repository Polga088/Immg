"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat-panel";

interface ATSResult {
  score: number;
  issues: string[];
  suggestions: string[];
  keywordMatches: string[];
}

interface CvClientProps {
  locale: string;
  title: string;
  uploadLabel: string;
  jobDescriptionLabel: string;
  scoreLabel: string;
  suggestionsLabel: string;
  analyzeLabel: string;
  chatPlaceholder: string;
  chatSend: string;
  chatThinking: string;
  chatError: string;
}

export function CvClient(props: CvClientProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("text", resumeText);
      if (jobDescription) form.append("jobDescription", jobDescription);
      const res = await fetch("/api/cv/score", { method: "POST", body: form });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{props.title}</h1>

      <div className="rounded-xl border border-zinc-200 p-6 bg-white space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{props.uploadLabel}</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Paste your resume text here…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {props.jobDescriptionLabel}
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={analyze}
          disabled={loading || !resumeText.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {props.analyzeLabel}
        </button>

        {result && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-2xl font-bold text-blue-600">
              {props.scoreLabel}: {result.score}/100
            </p>
            {result.issues.length > 0 && (
              <ul className="text-sm text-red-600 list-disc pl-5">
                {result.issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
            <h3 className="font-medium">{props.suggestionsLabel}</h3>
            <ul className="text-sm text-zinc-600 list-disc pl-5">
              {result.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ChatPanel
        agentId="cv"
        locale={props.locale}
        placeholder={props.chatPlaceholder}
        sendLabel={props.chatSend}
        thinkingLabel={props.chatThinking}
        errorLabel={props.chatError}
        resumeText={resumeText}
        jobDescription={jobDescription}
      />
    </div>
  );
}
