import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
