import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth/guards";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuth();
  const t = await getTranslations("dashboard");
  const home = await getTranslations("home");

  const agents = ["regulation", "cv", "job", "procedure"] as const;
  const hrefMap = {
    regulation: "/regulation",
    cv: "/cv",
    job: "/jobs",
    procedure: "/procedure",
  };

  return (
    <DashboardClient
      labels={{
        title: t("title"),
        welcome: t("welcome"),
        crsScore: t("crsScore"),
        profileComplete: t("profileComplete"),
        profileIncomplete: t("profileIncomplete"),
        checklistProgress: t("checklistProgress"),
        completeProfile: t("completeProfile"),
        goToProcedure: t("goToProcedure"),
        agentsTitle: t("agentsTitle"),
      }}
      agentLinks={agents.map((agent) => ({
        href: hrefMap[agent],
        agent,
        title: home(`agents.${agent}.title`),
      }))}
    />
  );
}
