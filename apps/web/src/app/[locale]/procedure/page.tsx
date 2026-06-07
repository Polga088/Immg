import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ProcedureClient } from "./procedure-client";

export default async function ProcedurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("procedure");
  const chat = await getTranslations("chat");

  return (
    <ProcedureClient
      locale={locale}
      title={t("title")}
      crsTitle={t("crsTitle")}
      crsScoreLabel={t("crsScore")}
      calculateLabel={t("calculate")}
      chatPlaceholder={chat("placeholder")}
      chatSend={chat("send")}
      chatThinking={chat("thinking")}
      chatError={chat("error")}
    />
  );
}
