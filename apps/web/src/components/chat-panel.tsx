"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  agentId?: string;
  locale: string;
  placeholder: string;
  sendLabel: string;
  thinkingLabel: string;
  errorLabel: string;
  resumeText?: string;
  jobDescription?: string;
}

export function ChatPanel({
  agentId,
  locale,
  placeholder,
  sendLabel,
  thinkingLabel,
  errorLabel,
  resumeText,
  jobDescription,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          agentId,
          locale,
          resumeText,
          jobDescription,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent } : m,
            ),
          );
        }
      }
    } catch {
      setError(errorLabel);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">{placeholder}</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-lg px-4 py-2 text-sm max-w-[85%] whitespace-pre-wrap",
              m.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-800",
            )}
          >
            {m.content || (isLoading && m.role === "assistant" ? "…" : "")}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <p className="text-sm text-zinc-400 animate-pulse">{thinkingLabel}</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {sendLabel}
        </button>
      </form>
    </div>
  );
}
