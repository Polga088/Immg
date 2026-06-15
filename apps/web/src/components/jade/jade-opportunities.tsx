"use client";

import { useState } from "react";
import { ExternalLink, Plus, Search } from "lucide-react";

export interface JobListingResult {
  externalJobId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  jobUrl: string;
  postedAt: string;
}

interface JadeOpportunitiesProps {
  labels: {
    title: string;
    keywords: string;
    location: string;
    search: string;
    searching: string;
    import: string;
    results: string;
    noResults: string;
  };
  onImported: () => void;
}

export function JadeOpportunities({ labels, onImported }: JadeOpportunitiesProps) {
  const [keywords, setKeywords] = useState("software developer");
  const [location, setLocation] = useState("Montreal");
  const [results, setResults] = useState<JobListingResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, location }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  async function importListing(listing: JobListingResult) {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "importJobBank", listing }),
    });
    onImported();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Search className="h-5 w-5 text-emerald-600" />
        {labels.title}
      </h2>

      <div className="flex flex-wrap gap-2">
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder={labels.keywords}
          className="flex-1 min-w-[180px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={labels.location}
          className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={loading}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? labels.searching : labels.search}
        </button>
      </div>

      {results.length > 0 && (
        <p className="text-xs text-zinc-500">
          {labels.results}: {results.length} / {total}
        </p>
      )}

      <div className="space-y-2 max-h-[420px] overflow-y-auto">
        {results.length === 0 && !loading && (
          <p className="text-sm text-zinc-400 text-center py-8">{labels.noResults}</p>
        )}
        {results.map((job) => (
          <div
            key={job.externalJobId}
            className="rounded-lg border border-zinc-100 bg-white p-3 flex flex-wrap items-start justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm capitalize">{job.title}</p>
              <p className="text-xs text-zinc-600">{job.company}</p>
              <p className="text-xs text-zinc-400">
                {job.location}
                {job.salary ? ` · ${job.salary}` : ""}
              </p>
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
              >
                Job Bank <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <button
              type="button"
              onClick={() => void importListing(job)}
              className="shrink-0 text-xs rounded-full border border-amber-500 text-amber-700 px-3 py-1.5 hover:bg-amber-50 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              {labels.import}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
