import { hook } from "../../core/dom";
import { LanguageSwitcher } from "../../features/i18n/LanguageSwitcher";
import { ANALYTICS_EVENTS } from "../../features/analytics/events";
import { DomTranslator } from "../../i18n/translator";
import type { AppContext } from "../types";

/** Static text translation + the EN / ES / RU switch. */
export function initI18n({ i18n, analytics, use, dispose }: AppContext): void {
  const translator = new DomTranslator(i18n, {
    meta: {
      description: hook<HTMLMetaElement>("meta-description"),
      ogTitle: hook<HTMLMetaElement>("og-title"),
      ogDescription: hook<HTMLMetaElement>("og-description"),
      ogLocale: hook<HTMLMetaElement>("og-locale"),
    },
  });
  dispose(translator.start());

  use(
    hook("lang-switch"),
    (root) =>
      new LanguageSwitcher(root, {
        i18n,
        onChange: (lang) => analytics.track(ANALYTICS_EVENTS.langChange, { lang }),
      }),
  );
}
