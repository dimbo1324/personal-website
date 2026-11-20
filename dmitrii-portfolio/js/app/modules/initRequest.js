import { hook } from "../../core/dom.js";
import { RequestForm } from "../../features/request/RequestForm.js";
import { FormAssembly } from "../../features/request/FormAssembly.js";
import { ANALYTICS_EVENTS } from "../../features/analytics/events.js";
import { REQUEST_CONFIG } from "../../data/request.js";

/** @param {import("../App.js").AppContext} ctx */
export function initRequest({ use, store, i18n, clipboard, analytics }) {
  use(hook("request-card"), (root) => new FormAssembly(root, { isDark: () => store.get("theme") === "dark" }));
  use(
    hook("request-form"),
    (root) =>
      new RequestForm(root, {
        config: REQUEST_CONFIG,
        i18n,
        clipboard,
        onSent: (transport) => analytics.track(ANALYTICS_EVENTS.requestSubmit, { transport }),
        ui: {
          status: hook("request-status"),
          hint: hook("request-hint"),
          submit: hook("request-submit"),
          success: hook("request-success"),
          successText: hook("request-success-text"),
          copyButton: hook("request-copy"),
          resetButton: hook("request-reset"),
          counter: hook("request-counter"),
        },
      }),
  );
}
