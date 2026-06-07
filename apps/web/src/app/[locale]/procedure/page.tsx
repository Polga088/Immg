import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAuthWithProfile } from "@/lib/auth/guards";
import { ProcedureClient } from "./procedure-client";

export default async function ProcedurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuthWithProfile();
  const t = await getTranslations("procedure");
  const chat = await getTranslations("chat");

  const stepKeys = [
    "language_test",
    "education_assessment",
    "gather_documents",
    "create_express_entry_profile",
    "submit_profile",
    "wait_for_ita",
    "medical_exam",
    "submit_application",
    "check_province_criteria",
    "apply_to_province",
    "receive_nomination",
    "update_crs_score",
  ] as const;

  const stepLabels = Object.fromEntries(
    stepKeys.map((key) => [key, t(`steps.${key}`)]),
  );

  const docKeys = [
    "language_test_results",
    "eca_report",
    "passport",
    "work_references",
    "police_certificate",
    "medical_exam",
    "proof_of_funds",
    "employment_letter",
    "province_application",
    "nomination_certificate",
  ] as const;

  const documentLabels = Object.fromEntries(
    docKeys.map((key) => [key, t(`documents.${key}`)]),
  );

  return (
    <ProcedureClient
      locale={locale}
      title={t("title")}
      crsTitle={t("crsTitle")}
      crsScoreLabel={t("crsScore")}
      calculateLabel={t("calculate")}
      checklistTitle={t("checklist")}
      progressLabel={t("progress")}
      pendingDocsLabel={t("pendingDocuments")}
      stepLabels={stepLabels}
      documentLabels={documentLabels}
      chatPlaceholder={chat("placeholder")}
      chatSend={chat("send")}
      chatThinking={chat("thinking")}
      chatError={chat("error")}
    />
  );
}
