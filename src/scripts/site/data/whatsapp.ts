import { ENV } from "../config/env";
import { CONTACT } from "./contact";

export interface WhatsAppConfig {
  readonly phone: string;
  readonly mode: string;
  readonly greetingKey: string;
}

/**
 * WhatsApp channel configuration.
 * `PUBLIC_WHATSAPP_PHONE` overrides the built-in public number; the mode is
 * `auto` (default), `real`, `stub` or `off`. An invalid number never becomes
 * a link: the contact block shows an honest placeholder instead.
 */
export const WHATSAPP_CONFIG: WhatsAppConfig = Object.freeze({
  phone: ENV.whatsapp.phone ?? `${CONTACT.phone.country}${CONTACT.phone.groups.join("")}`,
  mode: ENV.whatsapp.mode,
  greetingKey: "contact.whatsapp.prefill",
});
