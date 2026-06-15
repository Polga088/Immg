"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, Link2, RefreshCw, Search, Unplug } from "lucide-react";

interface IntegrationCard {
  provider: string;
  connected: boolean;
  accountEmail: string | null;
  configured: boolean;
  note?: string;
  connectHint?: string;
}

interface JadeConnectionsProps {
  labels: {
    title: string;
    gmail: string;
    indeed: string;
    jobBank: string;
    connectGmail: string;
    connecting: string;
    connected: string;
    disconnect: string;
    syncAlerts: string;
    oneClickHint: string;
    gmailEmail: string;
    appPassword: string;
    appPasswordHint: string;
    appPasswordHelp: string;
    connectFailed: string;
    invalidCredentials: string;
    syncFailed: string;
    connectSuccess: string;
  };
  onGmailSynced: () => void;
}

export function JadeConnections({ labels, onGmailSynced }: JadeConnectionsProps) {
  const [integrations, setIntegrations] = useState<IntegrationCard[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

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
    setConnectSuccess(false);
    load();
  }

  async function connectGmail(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setConnectError(null);
    setConnectSuccess(false);
    try {
      const res = await fetch("/api/jobs/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "gmail", email, appPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "GMAIL_AUTH_FAILED" || data.error === "INVALID_GMAIL_CREDENTIALS") {
          setConnectError(labels.invalidCredentials);
        } else {
          setConnectError(labels.connectFailed);
        }
        return;
      }
      setAppPassword("");
      setConnectSuccess(true);
      load();
    } finally {
      setConnecting(false);
    }
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
        if (data.error === "GMAIL_NOT_CONNECTED" || data.error === "GMAIL_AUTH_FAILED") {
          setSyncError(labels.invalidCredentials);
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

      {connectSuccess && (
        <p className="text-sm rounded-lg px-3 py-2 bg-green-50 text-green-800">
          {labels.connectSuccess}
        </p>
      )}

      {connectError && (
        <p className="text-sm rounded-lg px-3 py-2 bg-red-50 text-red-800">{connectError}</p>
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
          ) : (
            <form onSubmit={(e) => void connectGmail(e)} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={labels.gmailEmail}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder={labels.appPassword}
                required
                autoComplete="off"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-zinc-500">{labels.appPasswordHint}</p>
              <a
                href="https://support.google.com/accounts/answer/185833"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline block"
              >
                {labels.appPasswordHelp}
              </a>
              <button
                type="submit"
                disabled={connecting || !email || !appPassword}
                className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {connecting ? labels.connecting : labels.connectGmail}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <Briefcase className="h-4 w-4 text-blue-600" />
            {labels.indeed}
          </div>
          <p className="text-xs text-zinc-600">{indeed?.connectHint ?? indeed?.note}</p>
          <p className="text-sm text-zinc-500">
            {gmail?.connected ? labels.connected : labels.connectGmail}
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
