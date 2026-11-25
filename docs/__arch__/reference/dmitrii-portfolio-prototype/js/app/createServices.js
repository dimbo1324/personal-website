import { hook } from "../core/dom.js";
import { ViewportObserver } from "../core/ViewportObserver.js";
import { createAppStore } from "./createAppStore.js";
import { createI18n } from "./createI18n.js";
import { ThemeService } from "../features/theme/ThemeService.js";
import { ScrollService } from "../features/scroll/ScrollService.js";
import { Toast } from "../features/ui/Toast.js";
import { CopyToClipboard } from "../features/ui/CopyToClipboard.js";
import { AnalyticsService } from "../features/analytics/AnalyticsService.js";
import { createAnalyticsProvider } from "../features/analytics/createAnalyticsProvider.js";
import { visitorOptedOut } from "../features/analytics/privacySignals.js";
import { ENV } from "../config/env.js";

/**
 * Shared, page-wide services. Created once by App and handed to the
 * feature modules (dependency injection — no feature creates its own).
 */
export function createServices() {
  const store = createAppStore();
  const i18n = createI18n();
  const toast = new Toast(hook("toast"));
  return {
    store,
    i18n,
    toast,
    viewport: new ViewportObserver({ threshold: 0.02 }),
    scroll: new ScrollService(),
    theme: new ThemeService(store),
    clipboard: new CopyToClipboard(toast, i18n),
    analytics: new AnalyticsService(createAnalyticsProvider(ENV.analytics, { optedOut: visitorOptedOut() })),
  };
}

/** @typedef {ReturnType<typeof createServices>} Services */
