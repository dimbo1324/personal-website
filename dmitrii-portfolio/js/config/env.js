/**
 * Build-time settings. Vite replaces import.meta.env with the VITE_* values
 * from .env / CI secrets (see .env.example); a plain static server provides
 * none, so every setting has a safe default (features stay off).
 */
const env = /** @type {Record<string, string | undefined>} */ (import.meta.env ?? {});

const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

export const ENV = Object.freeze({
  siteUrl: text(env.VITE_SITE_URL),
  form: Object.freeze({
    provider: text(env.VITE_FORM_PROVIDER) ?? "web3forms",
    endpoint: text(env.VITE_FORM_ENDPOINT),
    accessKey: text(env.VITE_FORM_ACCESS_KEY),
  }),
  analytics: Object.freeze({
    provider: text(env.VITE_ANALYTICS_PROVIDER) ?? "none",
    domain: text(env.VITE_ANALYTICS_DOMAIN),
    src: text(env.VITE_ANALYTICS_SRC),
    websiteId: text(env.VITE_ANALYTICS_WEBSITE_ID),
  }),
});
