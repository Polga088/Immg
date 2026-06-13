import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAuthWithProfile } from "@/lib/auth/guards";
import { KANBAN_COLUMNS, type ApplicationStatus } from "@/lib/jobs/constants";
import { JobsClient } from "./jobs-client";

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
  ) as Record<(typeof KANBAN_COLUMNS)[number], string>;

  return (
    <JobsClient
      locale={locale}
      title={t("title")}
      addLabel={t("addApplication")}
      companyLabel={t("company")}
      jobTitleLabel={t("jobTitle")}
      jobUrlLabel={t("jobUrl")}
      jobDescriptionLabel={t("jobDescription")}
      generateLabel={t("generateLetter")}
      viewLetterLabel={t("viewLetter")}
      generatingLabel={t("generating")}
      emptyColumnLabel={t("emptyColumn")}
      kanbanTitle={t("kanbanTitle")}
      statusLabels={statusLabels}
      columnLabels={columnLabels}
      chatPlaceholder={chat("placeholder")}
      chatSend={chat("send")}
      chatThinking={chat("thinking")}
      chatError={chat("error")}
    />
  );
}
