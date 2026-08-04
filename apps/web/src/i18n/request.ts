import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import ruMessages from "../../messages/ru.json";
import { routing } from "./routing";

const messagesByLocale = {
  ru: ruMessages,
} satisfies Record<(typeof routing.locales)[number], unknown>;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
