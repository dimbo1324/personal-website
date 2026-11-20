import { hook } from "../../core/dom.js";
import { DomTranslator } from "../../i18n/DomTranslator.js";
import { LanguageSwitcher } from "../../features/i18n/LanguageSwitcher.js";
import { ANALYTICS_EVENTS } from "../../features/analytics/events.js";

/**
 * Static text translation + the EN / ES / RU switch.
 * Runs first, so components that render text read the right language.
 * @param {import("../App.js").AppContext} ctx
 */
export function initI18n({ i18n, analytics, use, dispose }) {
  const translator = new DomTranslator(i18n, {
    meta: {
      description: hook("meta-description"),
      ogTitle: hook("og-title"),
      ogDescription: hook("og-description"),
      ogLocale: hook("og-locale"),
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
