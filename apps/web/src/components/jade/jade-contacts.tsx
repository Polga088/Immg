"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";

interface RecruiterContact {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  title: string | null;
  source: string;
}

interface JadeContactsProps {
  labels: {
    title: string;
    email: string;
    company: string;
    source: string;
    empty: string;
  };
  refreshKey: number;
}

export function JadeContacts({ labels, refreshKey }: JadeContactsProps) {
  const [contacts, setContacts] = useState<RecruiterContact[]>([]);

  const load = useCallback(() => {
    fetch("/api/jobs/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Users className="h-5 w-5 text-indigo-600" />
        {labels.title}
      </h2>
      {contacts.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-3 py-2">{labels.email}</th>
                <th className="px-3 py-2">{labels.company}</th>
                <th className="px-3 py-2">{labels.source}</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-zinc-100">
                  <td className="px-3 py-2 font-mono text-xs">{c.email}</td>
                  <td className="px-3 py-2">{c.company ?? "—"}</td>
                  <td className="px-3 py-2 capitalize">{c.source.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
