"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, Plus, Search, Sparkles } from "lucide-react";
import Link from "next/link";

export interface JobListingResult {
  externalJobId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  jobUrl: string;
  postedAt: string;
  fitScore?: number;
}

interface CvSuggestions {
  hasCv: boolean;
  cvFilename: string | null;
  suggestedTitles: string[];
  topSkills: string[];
}

interface JadeOpportunitiesProps {
  locale: string;
  labels: {
    title: string;
    keywords: string;
    location: string;
    search: string;
    searching: string;
    import: string;
    results: string;
    noResults: string;
    cvAnalysis: string;
    noCv: string;
    uploadCv: string;
    suggestedTitles: string;
    fitScore: string;
    rankedByCv: string;
  };
  onImported: () => void;
}

export function JadeOpportunities({ locale, labels, onImported }: JadeOpportunitiesProps) {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("Montreal");
  const [results, setResults] = useState<JobListingResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CvSuggestions | null>(null);
  const [rankedByCv, setRankedByCv] = useState(false);

  const loadSuggestions = useCallback(() => {
    fetch("/api/jobs/suggestions")
      .then((r) => r.json())
      .then((data: CvSuggestions) => {
        setSuggestions(data);
        if (data.suggestedTitles[0]) {
          setKeywords(data.suggestedTitles[0]);
        }
      });
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    if (suggestions?.hasCv && suggestions.suggestedTitles[0] && results.length === 0) {
      void search(suggestions.suggestedTitles[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when CV suggestions load
  }, [suggestions?.hasCv, suggestions?.suggestedTitles[0]]);

  async function search(query?: string) {
    const q = query ?? keywords;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: q,
          location,
          rankByCv: suggestions?.hasCv ?? false,
        }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
      setRankedByCv(Boolean(data.rankedByCv));
      if (query) setKeywords(query);
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

      {suggestions?.hasCv ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2 text-emerald-900">
            <Sparkles className="h-4 w-4" />
            {labels.cvAnalysis}
            {suggestions.cvFilename && (
              <span className="text-xs font-normal text-emerald-700">
                ({suggestions.cvFilename})
              </span>
            )}
          </p>
          <p className="text-xs text-emerald-800">{labels.suggestedTitles}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.suggestedTitles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => void search(title)}
                className="rounded-full bg-white border border-emerald-300 px-3 py-1 text-xs text-emerald-800 hover:bg-emerald-100"
              >
                {title}
              </button>
            ))}
          </div>
          {suggestions.topSkills.length > 0 && (
            <p className="text-xs text-zinc-600">
              Skills: {suggestions.topSkills.join(", ")}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-amber-900 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {labels.noCv}
          </p>
          <Link
            href={`/${locale}/cv`}
            className="text-sm rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            {labels.uploadCv}
          </Link>
        </div>
      )}

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
          {rankedByCv && ` · ${labels.rankedByCv}`}
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
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm capitalize">{job.title}</p>
                {job.fitScore != null && (
                  <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
                    {labels.fitScore}: {job.fitScore}%
                  </span>
                )}
              </div>
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
