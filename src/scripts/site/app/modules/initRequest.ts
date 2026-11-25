import { hook } from "../../core/dom";
import { RequestForm } from "../../features/request/RequestForm";
import { FormAssembly } from "../../features/request/FormAssembly";
import { ANALYTICS_EVENTS } from "../../features/analytics/events";
import { REQUEST_CONFIG } from "../../data/request";
import type { AppContext } from "../types";

/** Request form: dot assembly, validation, draft and delivery. */
export function initRequest({ use, store, i18n, clipboard, analytics }: AppContext): void {
  use(
    hook("request-card"),
    (root) => new FormAssembly(root, { isDark: () => store.get("theme") === "dark" }),
  );
  use(
    hook<HTMLFormElement>("request-form"),
    (root) =>
      new RequestForm(root, {
        config: REQUEST_CONFIG,
        i18n,
        clipboard,
        onSent: (transport) => analytics.track(ANALYTICS_EVENTS.requestSubmit, { transport }),
        ui: {
          status: hook("request-status") ?? root,
          hint: hook("request-hint"),
          submit: hook<HTMLButtonElement>("request-submit") ?? document.createElement("button"),
          success: hook("request-success") ?? document.createElement("div"),
          successText: hook("request-success-text") ?? root,
          copyButton: hook<HTMLButtonElement>("request-copy") ?? document.createElement("button"),
          resetButton: hook<HTMLButtonElement>("request-reset") ?? document.createElement("button"),
          counter: hook("request-counter"),
        },
      }),
  );
}
