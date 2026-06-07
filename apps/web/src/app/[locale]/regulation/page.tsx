import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { RegulationClient } from "./regulation-client";

export default async function RegulationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("regulation");
  const chat = await getTranslations("chat");

  return (
    <RegulationClient
      locale={locale}
      title={t("title")}
      searchPlaceholder={t("searchPlaceholder")}
      sourcesLabel={t("sources")}
      noSourcesLabel={t("noSources")}
      chatPlaceholder={chat("placeholder")}
      chatSend={chat("send")}
      chatThinking={chat("thinking")}
      chatError={chat("error")}
    />
  );
}
