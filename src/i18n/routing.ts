import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en", "fr"],
  defaultLocale: "tr",
  localeDetection: true,
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
