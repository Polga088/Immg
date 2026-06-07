import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAuthWithProfile } from "@/lib/auth/guards";
import { RegulationClient } from "./regulation-client";

export default async function RegulationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuthWithProfile();
  const t = await getTranslations("regulation");
  const chat = await getTranslations("chat");

  return (
    <RegulationClient
      locale={locale}
      title={t("title")}
      searchPlaceholder={t("searchPlaceholder")}
      searchLabel={t("search")}
      sourcesLabel={t("sources")}
      noSourcesLabel={t("noSources")}
      watchTitle={t("watchTitle")}
      watchEmpty={t("watchEmpty")}
      watchNew={t("watchNew")}
      watchUpdated={t("watchUpdated")}
      chatPlaceholder={chat("placeholder")}
      chatSend={chat("send")}
      chatThinking={chat("thinking")}
      chatError={chat("error")}
    />
  );
}
