import { hook } from "../../core/dom";
import { PhoneReveal } from "../../features/contact/PhoneReveal";
import { ANALYTICS_EVENTS } from "../../features/analytics/events";
import { CONTACT } from "../../data/contact";
import type { AppContext } from "../types";

/** On-demand phone number reveal. */
export function initContact({ use, i18n, analytics }: AppContext): void {
  use(
    hook("phone-reveal"),
    (root: HTMLElement) =>
      new PhoneReveal(root, {
        slot: hook("phone-slot") ?? root,
        button: hook<HTMLButtonElement>("phone-reveal-button") ?? document.createElement("button"),
        phone: CONTACT.phone,
        i18n,
        onReveal: () => analytics.track(ANALYTICS_EVENTS.phoneReveal),
      }),
  );
}
