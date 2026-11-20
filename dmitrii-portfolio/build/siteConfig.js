/**
 * Public URL of the deployed site (no trailing slash), used for canonical,
 * hreflang, Open Graph, JSON-LD, robots.txt and sitemap.xml.
 * Set VITE_SITE_URL (.env or CI variable) when you attach a custom domain.
 */
export const DEFAULT_SITE_URL = "https://dimbo1324.github.io/portfolio";

export const SITE_LANGUAGES = Object.freeze(["en", "es", "ru"]);

/** @param {Record<string, string | undefined>} env */
export function resolveSiteUrl(env) {
  const raw = (env.VITE_SITE_URL ?? "").trim() || DEFAULT_SITE_URL;
  const url = new URL(raw); // throws on garbage — better at build time than in production
  return url.href.replace(/\/+$/, "");
}
