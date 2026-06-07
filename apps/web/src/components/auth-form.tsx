"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

interface AuthFormProps {
  mode: "login" | "register";
  labels: {
    title: string;
    email: string;
    password: string;
    name: string;
    submit: string;
    switchPrompt: string;
    switchLink: string;
    errorGeneric: string;
    errorCredentials: string;
    errorEmailTaken: string;
  };
}

export function AuthForm({ mode, labels }: AuthFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            data.error === "Email already registered"
              ? labels.errorEmailTaken
              : data.error === "Invalid input"
                ? labels.errorGeneric
                : `${labels.errorGeneric}${data.error ? ` (${data.error})` : ""}`,
          );
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(labels.errorCredentials);
        return;
      }

      const path =
        mode === "register"
          ? "/fr/profile"
          : callbackUrl.startsWith("/fr") || callbackUrl.startsWith("/en")
            ? callbackUrl
            : `/fr${callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`}`;

      window.location.href = path;
    } catch {
      setError(labels.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <h1 className="text-2xl font-bold text-center">{labels.title}</h1>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl glass border border-white/60 p-6 shadow-sm space-y-4"
      >
        {mode === "register" && (
          <Field
            label={labels.name}
            type="text"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
        )}
        <Field
          label={labels.email}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label={labels.password}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
          minLength={8}
        />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "…" : labels.submit}
        </button>
      </form>
      <p className="text-center text-sm text-zinc-600">
        {labels.switchPrompt}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="text-blue-600 font-medium">
          {labels.switchLink}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm bg-white"
      />
    </div>
  );
}
