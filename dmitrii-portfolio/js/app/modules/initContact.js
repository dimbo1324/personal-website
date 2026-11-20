import { hook } from "../../core/dom.js";
import { PhoneReveal } from "../../features/contact/PhoneReveal.js";
import { ANALYTICS_EVENTS } from "../../features/analytics/events.js";
import { CONTACT } from "../../data/contact.js";

/** @param {import("../App.js").AppContext} ctx */
export function initContact({ use, i18n, analytics }) {
  use(
    hook("phone-reveal"),
    (root) =>
      new PhoneReveal(root, {
        slot: hook("phone-slot"),
        button: hook("phone-reveal-button"),
        phone: CONTACT.phone,
        i18n,
        onReveal: () => analytics.track(ANALYTICS_EVENTS.phoneReveal),
      }),
  );
}
