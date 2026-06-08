"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChatPanel } from "@/components/chat-panel";
import { AgentHeader } from "@/components/agent-card";

interface ATSResult {
  score: number;
  issues: string[];
  suggestions: string[];
  keywordMatches: string[];
  parsedLength?: number;
  filename?: string;
  extractedText?: string;
}

interface CvClientProps {
  locale: string;
}

const ACCEPT = ".pdf,.docx,.txt,.md";

export function CvClient({ locale }: CvClientProps) {
  const t = useTranslations("cv");
  const chat = useTranslations("chat");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const canAnalyze = Boolean(resumeFile) || resumeText.trim().length > 0;

  function onFileChange(file: File | null) {
    setResumeFile(file);
    setResult(null);
    setErrorKey(null);
    if (file) setResumeText("");
  }

  async function analyze() {
    if (!canAnalyze) return;
    setLoading(true);
    setErrorKey(null);
    setResult(null);

    try {
      const form = new FormData();
      if (resumeFile) {
        form.append("file", resumeFile);
      } else {
        form.append("text", resumeText);
      }
      if (jobDescription) form.append("jobDescription", jobDescription);

      const res = await fetch("/api/cv/score", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        const key = typeof data.error === "string" ? data.error : "analysis_failed";
        setErrorKey(key);
        return;
      }

      setResult(data);
      if (data.extractedText) {
        setResumeText(data.extractedText);
      }
    } catch {
      setErrorKey("analysis_failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <AgentHeader agent="cv" title={t("title")} locale={locale} />

      <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("upload")}</label>
          <p className="text-xs text-zinc-500 mb-2">{t("uploadHint")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              {t("upload")}
            </button>
            {resumeFile && (
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <span>
                  {t("selectedFile")}: <strong>{resumeFile.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onFileChange(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  {t("removeFile")}
                </button>
              </div>
            )}
          </div>
        </div>

        {!resumeFile && (
          <div>
            <label className="block text-sm font-medium mb-1">{t("pasteLabel")}</label>
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setErrorKey(null);
              }}
              rows={8}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder={t("pastePlaceholder")}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">{t("jobDescription")}</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        {errorKey && (
          <p className="text-sm text-red-600" role="alert">
            {t(`errors.${errorKey}` as "errors.no_content")}
          </p>
        )}

        <button
          type="button"
          onClick={analyze}
          disabled={loading || !canAnalyze}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? chat("thinking") : t("analyze")}
        </button>

        {result && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              {t("score")}: {result.score}/100
            </p>
            {result.parsedLength != null && (
              <p className="text-xs text-zinc-500">
                {t("extractedChars", { count: result.parsedLength })}
                {result.filename ? ` — ${result.filename}` : ""}
              </p>
            )}
            {result.issues.length > 0 && (
              <ul className="text-sm text-red-600 list-disc pl-5">
                {result.issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
            <h3 className="font-medium">{t("suggestions")}</h3>
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
        locale={locale}
        placeholder={chat("placeholder")}
        sendLabel={chat("send")}
        thinkingLabel={chat("thinking")}
        errorLabel={chat("error")}
        resumeText={resumeText}
        jobDescription={jobDescription}
      />
    </div>
  );
}
