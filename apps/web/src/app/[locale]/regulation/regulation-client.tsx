"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat-panel";

interface RegulationClientProps {
  locale: string;
  title: string;
  searchPlaceholder: string;
  sourcesLabel: string;
  noSourcesLabel: string;
  chatPlaceholder: string;
  chatSend: string;
  chatThinking: string;
  chatError: string;
}

export function RegulationClient(props: RegulationClientProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ title: string; sourceUrl: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
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
      <h1 className="text-2xl font-bold">{props.title}</h1>

      <div className="rounded-xl border border-zinc-200 p-6 bg-white space-y-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={props.searchPlaceholder}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button
            onClick={search}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {answer && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm whitespace-pre-wrap">{answer}</p>
            {sources.length > 0 && (
              <div>
                <h3 className="font-medium text-sm">{props.sourcesLabel}</h3>
                <ul className="text-sm text-blue-600 list-disc pl-5">
                  {sources.map((s) => (
                    <li key={s.sourceUrl}>
                      <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sources.length === 0 && answer.includes("Aucune") && (
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
