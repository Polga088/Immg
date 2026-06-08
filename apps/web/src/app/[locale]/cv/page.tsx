import { setRequestLocale } from "next-intl/server";
import { requireAuthWithProfile } from "@/lib/auth/guards";
import { CvClient } from "./cv-client";

export default async function CvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuthWithProfile();

  return <CvClient locale={locale} />;
}
