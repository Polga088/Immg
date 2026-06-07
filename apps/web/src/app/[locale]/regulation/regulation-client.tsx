"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { AgentHeader } from "@/components/agent-card";
import { Bell, ExternalLink } from "lucide-react";

interface RegulationClientProps {
  locale: string;
  title: string;
  searchPlaceholder: string;
  searchLabel: string;
  sourcesLabel: string;
  noSourcesLabel: string;
  watchTitle: string;
  watchEmpty: string;
  watchNew: string;
  watchUpdated: string;
  chatPlaceholder: string;
  chatSend: string;
  chatThinking: string;
  chatError: string;
}

interface ChangeItem {
  id: string;
  sourceUrl: string;
  title: string;
  changeType: string;
  detectedAt: string;
  summary: string | null;
}

export function RegulationClient(props: RegulationClientProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<
    Array<{ title: string; sourceUrl: string; score?: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState<ChangeItem[]>([]);

  useEffect(() => {
    fetch("/api/regulations/changes?days=30&limit=8")
      .then((r) => r.json())
      .then((d) => setChanges(d.changes ?? []))
      .catch(console.error);
  }, []);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/regulations/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, locale: props.locale }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? data.message);
      setSources(data.sources ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <AgentHeader agent="regulation" title={props.title} locale={props.locale} />

      <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
          <Bell className="h-4 w-4" />
          {props.watchTitle}
        </div>
        {changes.length === 0 ? (
          <p className="text-sm text-zinc-500">{props.watchEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {changes.map((c) => (
              <li
                key={c.id}
                className="rounded-xl bg-white/60 border border-white/80 px-3 py-2 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-700 hover:underline flex items-center gap-1"
                  >
                    {c.title}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  <span className="shrink-0 text-xs rounded-full px-2 py-0.5 bg-violet-100 text-violet-700">
                    {c.changeType === "new" ? props.watchNew : props.watchUpdated}
                  </span>
                </div>
                {c.summary && (
                  <p className="text-zinc-600 mt-1 line-clamp-2">{c.summary}</p>
                )}
                <p className="text-xs text-zinc-400 mt-1">
                  {new Date(c.detectedAt).toLocaleDateString(props.locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl glass border border-white/60 p-6 shadow-sm space-y-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={props.searchPlaceholder}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm bg-white"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button
            onClick={search}
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "…" : props.searchLabel}
          </button>
        </div>

        {answer && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{answer}</p>
            {sources.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2">{props.sourcesLabel}</h3>
                <ul className="space-y-2">
                  {sources.map((s) => (
                    <li key={s.sourceUrl} className="text-sm">
                      <a
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {s.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {s.score != null && (
                        <span className="text-xs text-zinc-400 ml-1">
                          ({Math.round(s.score * 100)}%)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sources.length === 0 && (
              <p className="text-sm text-amber-600">{props.noSourcesLabel}</p>
            )}
          </div>
        )}
      </div>

      <ChatPanel
        agentId="regulation"
        locale={props.locale}
        placeholder={props.chatPlaceholder}
        sendLabel={props.chatSend}
        thinkingLabel={props.chatThinking}
        errorLabel={props.chatError}
      />
    </div>
  );
}
