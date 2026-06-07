import { useTranslations } from "next-intl";

export function Disclaimer() {
  const t = useTranslations("home");

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {t("disclaimer")}
    </div>
  );
}
