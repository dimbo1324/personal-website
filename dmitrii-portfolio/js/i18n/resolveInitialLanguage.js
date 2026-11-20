import { DEFAULT_LANGUAGE, isSupportedLanguage } from "./languages.js";

/**
 * Picks the starting language, most explicit source first:
 *   1. ?lang=xx in the URL (shareable links, hreflang alternates)
 *   2. the visitor's previous choice
 *   3. the browser's preferred languages ("es-UY" → "es")
 *   4. English
 *
 * @param {{ search?: string, stored?: string | null, preferred?: readonly string[] }} sources
 */
export function resolveInitialLanguage({ search = "", stored = null, preferred = [] } = {}) {
  const fromUrl = new URLSearchParams(search).get("lang");
  if (isSupportedLanguage(fromUrl)) return fromUrl;
  if (isSupportedLanguage(stored)) return stored;
  for (const tag of preferred) {
    const primary = String(tag).toLowerCase().split("-")[0];
    if (isSupportedLanguage(primary)) return primary;
  }
  return DEFAULT_LANGUAGE;
}
