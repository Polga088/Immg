import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <Suspense>
      <AuthForm
        mode="register"
        labels={{
          title: t("registerTitle"),
          email: t("email"),
          password: t("password"),
          name: t("name"),
          submit: t("registerSubmit"),
          switchPrompt: t("hasAccount"),
          switchLink: t("loginLink"),
          errorGeneric: t("errorGeneric"),
          errorCredentials: t("errorCredentials"),
          errorEmailTaken: t("errorEmailTaken"),
        }}
      />
    </Suspense>
  );
}
