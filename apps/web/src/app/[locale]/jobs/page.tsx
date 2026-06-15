import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAuthWithProfile } from "@/lib/auth/guards";
import { KANBAN_COLUMNS, type ApplicationStatus, type KanbanColumn } from "@/lib/jobs/constants";
import { JadeHub } from "@/components/jade/jade-hub";

export default async function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuthWithProfile();
  const t = await getTranslations("jobs");
  const chat = await getTranslations("chat");

  const statusLabels = Object.fromEntries(
    (["draft", "ready", "sent", "interview", "rejected", "offer"] as ApplicationStatus[]).map(
      (key) => [key, t(`statuses.${key}`)],
    ),
  ) as Record<ApplicationStatus, string>;

  const columnLabels = Object.fromEntries(
    KANBAN_COLUMNS.map((key) => [key, t(`columns.${key}`)]),
  ) as Record<KanbanColumn, string>;

  return (
    <Suspense>
      <JadeHub
      locale={locale}
      title={t("title")}
      tabs={{
        connections: t("tabs.connections"),
        opportunities: t("tabs.opportunities"),
        contacts: t("tabs.contacts"),
        workflow: t("tabs.workflow"),
      }}
      addApplication={t("addApplication")}
      company={t("company")}
      jobTitle={t("jobTitle")}
      jobUrl={t("jobUrl")}
      statusLabels={statusLabels}
      columnLabels={columnLabels}
      connectionsLabels={{
        title: t("connections.title"),
        gmail: t("connections.gmail"),
        indeed: t("connections.indeed"),
        jobBank: t("connections.jobBank"),
        connectGoogle: t("connections.connectGoogle"),
        connected: t("connections.connected"),
        disconnect: t("connections.disconnect"),
        serviceUnavailable: t("connections.serviceUnavailable"),
        syncAlerts: t("connections.syncAlerts"),
        oneClickHint: t("connections.oneClickHint"),
        oauthConnected: t("connections.oauthConnected"),
        oauthFailed: t("connections.oauthFailed"),
        syncFailed: t("connections.syncFailed"),
      }}
      opportunitiesLabels={{
        title: t("opportunities.title"),
        keywords: t("opportunities.keywords"),
        location: t("opportunities.location"),
        search: t("opportunities.search"),
        searching: t("opportunities.searching"),
        import: t("opportunities.import"),
        results: t("opportunities.results"),
        noResults: t("opportunities.noResults"),
        cvAnalysis: t("opportunities.cvAnalysis"),
        noCv: t("opportunities.noCv"),
        uploadCv: t("opportunities.uploadCv"),
        suggestedTitles: t("opportunities.suggestedTitles"),
        fitScore: t("opportunities.fitScore"),
        rankedByCv: t("opportunities.rankedByCv"),
      }}
      contactsLabels={{
        title: t("contacts.title"),
        email: t("contacts.email"),
        company: t("contacts.company"),
        source: t("contacts.source"),
        empty: t("contacts.empty"),
        autoAdded: t("contacts.autoAdded"),
      }}
      workflowLabels={{
        title: t("workflow.title"),
        generateLetter: t("generateLetter"),
        viewLetter: t("viewLetter"),
        jobDescription: t("jobDescription"),
        generating: t("generating"),
        emptyColumn: t("emptyColumn"),
        preparePackage: t("workflow.preparePackage"),
        preparing: t("workflow.preparing"),
        backgroundPreparing: t("workflow.backgroundPreparing"),
        packageReady: t("workflow.packageReady"),
        packageFailed: t("workflow.packageFailed"),
        noCv: t("workflow.noCv"),
        validateSend: t("workflow.validateSend"),
        packageTitle: t("workflow.packageTitle"),
        adaptedCv: t("workflow.adaptedCv"),
        coverLetter: t("workflow.coverLetter"),
        fitScore: t("workflow.fitScore"),
        createDraft: t("workflow.createDraft"),
        close: t("workflow.close"),
        disclaimer: t("workflow.disclaimer"),
        packageReadyToast: t("workflow.packageReadyToast"),
      }}
      chatPlaceholder={chat("placeholder")}
      chatSend={chat("send")}
      chatThinking={chat("thinking")}
      chatError={chat("error")}
      />
    </Suspense>
  );
}
