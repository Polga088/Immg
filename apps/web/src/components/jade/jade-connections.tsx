"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  Link2,
  Mail,
  RefreshCw,
  Search,
  Unplug,
} from "lucide-react";

interface IntegrationCard {
  provider: string;
  connected: boolean;
  accountEmail: string | null;
  configured: boolean;
  note?: string;
}

interface JadeConnectionsProps {
  labels: {
    title: string;
    gmail: string;
    indeed: string;
    jobBank: string;
    connect: string;
    connected: string;
    disconnect: string;
    notConfigured: string;
    syncAlerts: string;
  };
  onGmailSynced: () => void;
}

export function JadeConnections({ labels, onGmailSynced }: JadeConnectionsProps) {
  const [integrations, setIntegrations] = useState<IntegrationCard[]>([]);
  const [syncing, setSyncing] = useState(false);

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
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "syncGmail" }),
      });
      onGmailSynced();
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white/80 p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <Mail className="h-4 w-4 text-red-500" />
            {labels.gmail}
          </div>
          {gmail?.connected ? (
            <>
              <p className="text-sm text-green-700">{labels.connected}</p>
              <p className="text-xs text-zinc-500 truncate">{gmail.accountEmail}</p>
              <div className="flex flex-wrap gap-2">
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
            <a
              href="/api/jobs/oauth/gmail"
              className="inline-block text-sm rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              {labels.connect}
            </a>
          ) : (
            <p className="text-xs text-amber-700">{labels.notConfigured}</p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <Briefcase className="h-4 w-4 text-blue-600" />
            {labels.indeed}
          </div>
          <p className="text-xs text-zinc-600">{indeed?.note}</p>
          <p className="text-sm text-zinc-500">
            {gmail?.connected ? labels.connected : "Connectez Gmail pour importer les alertes Indeed"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <Search className="h-4 w-4 text-emerald-600" />
            {labels.jobBank}
          </div>
          <p className="text-sm text-green-700">
            {jobBank?.connected ? labels.connected : ""}
          </p>
          <p className="text-xs text-zinc-600">{jobBank?.note}</p>
        </div>
      </div>
    </div>
  );
}
