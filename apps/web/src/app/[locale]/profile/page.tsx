import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth/guards";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuth();
  const t = await getTranslations("profile");

  return (
    <Suspense>
      <ProfileClient
        title={t("title")}
        labels={{
          age: t("age"),
          education: t("education"),
          targetProgram: t("targetProgram"),
          firstLanguageClb: t("firstLanguageClb"),
          secondLanguageClb: t("secondLanguageClb"),
          foreignWorkYears: t("foreignWorkYears"),
          canadianWorkYears: t("canadianWorkYears"),
          canadianEducation: t("canadianEducation"),
          canadianJobOffer: t("canadianJobOffer"),
          siblingInCanada: t("siblingInCanada"),
          save: t("save"),
          saved: t("saved"),
          incompleteBanner: t("incompleteBanner"),
        }}
        educationOptions={{
          secondary: t("educationLevels.secondary"),
          one_year_post_secondary: t("educationLevels.one_year"),
          two_year_post_secondary: t("educationLevels.two_year"),
          bachelors: t("educationLevels.bachelors"),
          two_or_more_degrees: t("educationLevels.two_or_more"),
          masters: t("educationLevels.masters"),
          phd: t("educationLevels.phd"),
        }}
        programOptions={{
          express_entry: t("programs.express_entry"),
          pnp: t("programs.pnp"),
        }}
      />
    </Suspense>
  );
}
