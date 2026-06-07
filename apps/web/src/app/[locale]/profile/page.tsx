import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  return (
    <ProfileClient
      title={t("title")}
      labels={{
        age: t("age"),
        education: t("education"),
        firstLanguageClb: t("firstLanguageClb"),
        secondLanguageClb: t("secondLanguageClb"),
        foreignWorkYears: t("foreignWorkYears"),
        canadianWorkYears: t("canadianWorkYears"),
        canadianEducation: t("canadianEducation"),
        canadianJobOffer: t("canadianJobOffer"),
        siblingInCanada: t("siblingInCanada"),
        save: t("save"),
        saved: t("saved"),
      }}
    />
  );
}
