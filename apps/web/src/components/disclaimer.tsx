import { useTranslations } from "next-intl";

export function Disclaimer() {
  const t = useTranslations("home");

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 backdrop-blur-sm px-4 py-2.5 text-xs text-amber-900">
      ⚖️ {t("disclaimer")}
    </div>
  );
}
