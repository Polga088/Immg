import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { JobsClient } from "./jobs-client";

export default async function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("jobs");
  const chat = await getTranslations("chat");

  return (
    <JobsClient
      locale={locale}
      title={t("title")}
      addLabel={t("addApplication")}
      companyLabel={t("company")}
      jobTitleLabel={t("jobTitle")}
      jobUrlLabel={t("jobUrl")}
      statusLabel={t("status")}
      generateLabel={t("generateLetter")}
      chatPlaceholder={chat("placeholder")}
      chatSend={chat("send")}
      chatThinking={chat("thinking")}
      chatError={chat("error")}
    />
  );
}
