"use client";

import { useEffect, useState } from "react";

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
}

interface ProfileClientProps {
  title: string;
  labels: Record<string, string>;
}

export function ProfileClient({ title, labels }: ProfileClientProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile));
  }, []);

  async function save() {
    if (!profile) return;
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="rounded-xl border border-zinc-200 p-6 bg-white grid gap-4 sm:grid-cols-2">
        <Field
          label={labels.age}
          type="number"
          value={profile.age ?? 30}
          onChange={(v) => setProfile({ ...profile, age: Number(v) })}
        />
        <Field
          label={labels.education}
          value={profile.educationLevel ?? "bachelors"}
          onChange={(v) => setProfile({ ...profile, educationLevel: v })}
          options={[
            "secondary",
            "one_year_post_secondary",
            "two_year_post_secondary",
            "bachelors",
            "two_or_more_degrees",
            "masters",
            "phd",
          ]}
        />
        <Field
          label={labels.firstLanguageClb}
          type="number"
          value={profile.firstLanguageClb ?? 7}
          onChange={(v) => setProfile({ ...profile, firstLanguageClb: Number(v) })}
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
        className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
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
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  options?: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {options ? (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
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
