"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, Link2, RefreshCw, Search, Unplug } from "lucide-react";

function GoogleSignInButton({ label, locale }: { label: string; locale: string }) {
  return (
    <a
      href={`/api/jobs/oauth/gmail?locale=${locale}`}
      className="inline-flex items-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.56 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      {label}
    </a>
  );
}

interface IntegrationCard {
  provider: string;
  connected: boolean;
  accountEmail: string | null;
  configured: boolean;
  note?: string;
  connectHint?: string;
}

interface JadeConnectionsProps {
  locale: string;
  oauthMessage?: string | null;
  labels: {
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
    oauthConnected: string;
    oauthFailed: string;
    syncFailed: string;
  };
  onGmailSynced: () => void;
}

export function JadeConnections({
  locale,
  oauthMessage,
  labels,
  onGmailSynced,
}: JadeConnectionsProps) {
  const [integrations, setIntegrations] = useState<IntegrationCard[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/jobs/integrations")
      .then((r) => r.json())
      .then((d) => setIntegrations(d.integrations ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function disconnect(provider: string) {
    await fetch("/api/jobs/integrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    load();
  }

  async function syncGmail() {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "syncGmail" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "GMAIL_NOT_CONNECTED") {
          setSyncError(labels.oauthFailed);
        } else {
          setSyncError(labels.syncFailed);
        }
        return;
      }
      onGmailSynced();
      load();
    } finally {
      setSyncing(false);
    }
  }

  const gmail = integrations.find((i) => i.provider === "gmail");
  const indeed = integrations.find((i) => i.provider === "indeed");
  const jobBank = integrations.find((i) => i.provider === "job_bank");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Link2 className="h-5 w-5 text-amber-600" />
        {labels.title}
      </h2>
      <p className="text-sm text-zinc-600">{labels.oneClickHint}</p>

      {oauthMessage && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            oauthMessage === "connected"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {oauthMessage === "connected" ? labels.oauthConnected : labels.oauthFailed}
        </p>
      )}

      {syncError && (
        <p className="text-sm rounded-lg px-3 py-2 bg-red-50 text-red-800">{syncError}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 space-y-3">
          <p className="font-medium">{labels.gmail}</p>
          <p className="text-xs text-zinc-500">{gmail?.connectHint}</p>
          {gmail?.connected ? (
            <>
              <p className="text-sm text-green-700 font-medium">{labels.connected}</p>
              <p className="text-xs text-zinc-600 truncate">{gmail.accountEmail}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void syncGmail()}
                  disabled={syncing}
                  className="text-xs rounded-full bg-amber-500 px-3 py-1.5 text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  <RefreshCw className={`inline h-3 w-3 mr-1 ${syncing ? "animate-spin" : ""}`} />
                  {labels.syncAlerts}
                </button>
                <button
                  type="button"
                  onClick={() => void disconnect("gmail")}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1"
                >
                  <Unplug className="h-3 w-3" />
                  {labels.disconnect}
                </button>
              </div>
            </>
          ) : gmail?.configured ? (
            <GoogleSignInButton label={labels.connectGoogle} locale={locale} />
          ) : (
            <p className="text-xs text-amber-700">{labels.serviceUnavailable}</p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <Briefcase className="h-4 w-4 text-blue-600" />
            {labels.indeed}
          </div>
          <p className="text-xs text-zinc-600">{indeed?.connectHint ?? indeed?.note}</p>
          <p className="text-sm text-zinc-500">
            {gmail?.connected ? labels.connected : labels.connectGoogle}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <Search className="h-4 w-4 text-emerald-600" />
            {labels.jobBank}
          </div>
          <p className="text-sm text-green-700 font-medium">{labels.connected}</p>
          <p className="text-xs text-zinc-600">{jobBank?.connectHint ?? jobBank?.note}</p>
        </div>
      </div>
    </div>
  );
}
