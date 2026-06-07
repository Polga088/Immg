import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
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
        mode="login"
        labels={{
          title: t("loginTitle"),
          email: t("email"),
          password: t("password"),
          name: t("name"),
          submit: t("loginSubmit"),
          switchPrompt: t("noAccount"),
          switchLink: t("registerLink"),
          errorGeneric: t("errorGeneric"),
          errorCredentials: t("errorCredentials"),
          errorEmailTaken: t("errorEmailTaken"),
        }}
      />
    </Suspense>
  );
}
