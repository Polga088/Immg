"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Profile {
  age: number | null;
  educationLevel: string | null;
  firstLanguageClb: number | null;
  secondLanguageClb: number | null;
  foreignWorkYears: number;
  canadianWorkYears: number;
  hasCanadianEducation: boolean;
  hasCanadianJobOffer: boolean;
  hasSiblingInCanada: boolean;
  targetProgram: string | null;
  crsScore: number | null;
}

interface ProfileClientProps {
  title: string;
  labels: Record<string, string>;
  educationOptions: Record<string, string>;
  programOptions: Record<string, string>;
}

export function ProfileClient({
  title,
  labels,
  educationOptions,
  programOptions,
}: ProfileClientProps) {
  const searchParams = useSearchParams();
  const showIncomplete = searchParams.get("incomplete") === "1";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);
  const [complete, setComplete] = useState(false);
  const [crsScore, setCrsScore] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        setComplete(d.complete);
        setCrsScore(d.profile?.crsScore ?? null);
      });
  }, []);

  async function save() {
    if (!profile) return;
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    setProfile(data.profile);
    setComplete(data.complete);
    setCrsScore(data.crs?.total ?? data.profile.crsScore);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {crsScore != null && (
          <span className="rounded-full bg-sky-100 text-sky-800 px-4 py-1.5 text-sm font-semibold">
            CRS: {crsScore}
          </span>
        )}
      </div>

      {(showIncomplete || !complete) && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          {labels.incompleteBanner}
        </div>
      )}

      <div className="rounded-2xl glass border border-white/60 p-6 grid gap-4 sm:grid-cols-2">
        <Field
          label={labels.age}
          type="number"
          value={profile.age ?? ""}
          onChange={(v) => setProfile({ ...profile, age: v ? Number(v) : null })}
        />
        <Field
          label={labels.education}
          value={profile.educationLevel ?? ""}
          onChange={(v) => setProfile({ ...profile, educationLevel: v || null })}
          options={Object.keys(educationOptions)}
          optionLabels={educationOptions}
        />
        <Field
          label={labels.targetProgram}
          value={profile.targetProgram ?? ""}
          onChange={(v) => setProfile({ ...profile, targetProgram: v || null })}
          options={Object.keys(programOptions)}
          optionLabels={programOptions}
        />
        <Field
          label={labels.firstLanguageClb}
          type="number"
          value={profile.firstLanguageClb ?? ""}
          onChange={(v) =>
            setProfile({ ...profile, firstLanguageClb: v ? Number(v) : null })
          }
        />
        <Field
          label={labels.secondLanguageClb}
          type="number"
          value={profile.secondLanguageClb ?? 0}
          onChange={(v) => setProfile({ ...profile, secondLanguageClb: Number(v) })}
        />
        <Field
          label={labels.foreignWorkYears}
          type="number"
          value={profile.foreignWorkYears}
          onChange={(v) => setProfile({ ...profile, foreignWorkYears: Number(v) })}
        />
        <Field
          label={labels.canadianWorkYears}
          type="number"
          value={profile.canadianWorkYears}
          onChange={(v) => setProfile({ ...profile, canadianWorkYears: Number(v) })}
        />
        <Checkbox
          label={labels.canadianEducation}
          checked={profile.hasCanadianEducation}
          onChange={(v) => setProfile({ ...profile, hasCanadianEducation: v })}
        />
        <Checkbox
          label={labels.canadianJobOffer}
          checked={profile.hasCanadianJobOffer}
          onChange={(v) => setProfile({ ...profile, hasCanadianJobOffer: v })}
        />
        <Checkbox
          label={labels.siblingInCanada}
          checked={profile.hasSiblingInCanada}
          onChange={(v) => setProfile({ ...profile, hasSiblingInCanada: v })}
        />
      </div>
      <button
        onClick={save}
        className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-white font-semibold hover:opacity-90"
      >
        {saved ? labels.saved : labels.save}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  options,
  optionLabels,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  options?: string[];
  optionLabels?: Record<string, string>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {options ? (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {optionLabels?.[o] ?? o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm bg-white"
        />
      )}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
      />
      {label}
    </label>
  );
}
