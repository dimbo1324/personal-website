import { hook } from "../core/dom";
import { ViewportObserver } from "../core/viewport";
import { AnalyticsService } from "../features/analytics/AnalyticsService";
import { createAnalyticsProvider } from "../features/analytics/createAnalyticsProvider";
import { visitorOptedOut } from "../features/analytics/privacySignals";
import { ScrollService } from "../features/scroll/ScrollService";
import { ThemeService } from "../features/theme/ThemeService";
import { CopyToClipboard } from "../services/clipboard";
import { Toast } from "../services/toast";
import { ENV } from "../config/env";
import { createAppStore } from "./createAppStore";
import { createI18n } from "./createI18n";

/** Shared, page-wide services created once by App. */
export function createServices() {
  const store = createAppStore();
  const i18n = createI18n();
  const toastElement = hook("toast") ?? document.createElement("div");
  const toast = new Toast(toastElement);
  return {
    store,
    i18n,
    toast,
    viewport: new ViewportObserver({ threshold: 0.02 }),
    scroll: new ScrollService(),
    theme: new ThemeService(store),
    clipboard: new CopyToClipboard(toast, i18n),
    analytics: new AnalyticsService(
      createAnalyticsProvider(ENV.analytics, { optedOut: visitorOptedOut() }),
    ),
  };
}
