import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

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
    <div className="space-y-8">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold text-zinc-900">{t("title")}</h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        <Link
          href="/procedure"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
        >
          {t("cta")}
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent) => (
          <Link
            key={agent}
            href={hrefMap[agent]}
            className="rounded-xl border border-zinc-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <h2 className="font-semibold text-zinc-900">
              {t(`agents.${agent}.title`)}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              {t(`agents.${agent}.desc`)}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
