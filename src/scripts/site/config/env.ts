const env = import.meta.env;

const text = (value: string | undefined): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export interface FormEnvironment {
  readonly provider: string;
  readonly endpoint: string | null;
  readonly accessKey: string | null;
}

export interface AnalyticsEnvironment {
  readonly provider: string;
  readonly domain: string | null;
  readonly src: string | null;
  readonly websiteId: string | null;
}

export interface WhatsAppEnvironment {
  readonly phone: string | null;
  readonly mode: string;
}

export type LeadMode = "live" | "demo";

export interface SiteEnvironment {
  readonly siteUrl: string | null;
  readonly form: FormEnvironment;
  readonly analytics: AnalyticsEnvironment;
  readonly whatsapp: WhatsAppEnvironment;
  readonly leadMode: LeadMode;
}

/** Only an explicit "demo" turns the demo contour on; a typo stays live. */
export function resolveLeadMode(value: string | undefined): LeadMode {
  return value?.trim().toLowerCase() === "demo" ? "demo" : "live";
}

export const ENV: SiteEnvironment = Object.freeze({
  siteUrl: text(env.PUBLIC_SITE_URL),
  form: Object.freeze({
    provider: text(env.PUBLIC_FORM_PROVIDER) ?? "web3forms",
    endpoint: text(env.PUBLIC_FORM_ENDPOINT),
    accessKey: text(env.PUBLIC_FORM_ACCESS_KEY),
  }),
  analytics: Object.freeze({
    provider: text(env.PUBLIC_ANALYTICS_PROVIDER) ?? "none",
    domain: text(env.PUBLIC_ANALYTICS_DOMAIN),
    src: text(env.PUBLIC_ANALYTICS_SRC),
    websiteId: text(env.PUBLIC_ANALYTICS_WEBSITE_ID),
  }),
  whatsapp: Object.freeze({
    phone: text(env.PUBLIC_WHATSAPP_PHONE),
    mode: text(env.PUBLIC_WHATSAPP_MODE) ?? "auto",
  }),
  leadMode: resolveLeadMode(env.PUBLIC_LEAD_MODE),
});
