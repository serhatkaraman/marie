"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  tr: "TR",
  en: "EN",
  fr: "FR",
};

interface LanguageSwitcherProps {
  locale: string;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`text-xs tracking-wider transition-colors duration-200 ${
            locale === loc
              ? "text-accent font-medium"
              : "text-muted hover:text-body"
          }`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
