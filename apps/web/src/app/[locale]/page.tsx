import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AgentCard } from "@/components/agent-card";
import { AgentMascot } from "@/components/agent-mascot";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const agents = ["regulation", "cv", "job", "procedure"] as const;
  const hrefMap = {
    regulation: "/regulation",
    cv: "/cv",
    job: "/jobs",
    procedure: "/procedure",
  };

  return (
    <div className="space-y-12 pb-8">
      <section className="relative text-center space-y-6 py-10 animate-fade-up">
        <div className="flex justify-center items-end gap-2 md:gap-4 mb-2 opacity-90">
          {agents.map((id) => (
            <AgentMascot key={id} agent={id} size="sm" />
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          {t("cta")} →
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">
          {t("meetAgents")}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent}
              agent={agent}
              href={hrefMap[agent]}
              title={t(`agents.${agent}.title`)}
              description={t(`agents.${agent}.desc`)}
              locale={locale}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl glass border border-white/60 p-6 text-center text-sm text-zinc-500">
        {agents.map((id) => t(`agents.${id}.mascot`)).join(" · ")} — {t("teamSubtitle")}
      </section>
    </div>
  );
}
