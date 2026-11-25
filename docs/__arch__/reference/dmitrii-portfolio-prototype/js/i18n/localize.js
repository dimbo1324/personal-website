/**
 * Resolves a localisable value:
 *   "Text"                          → "Text"
 *   { en: "Text", es: "Texto" }     → value for `lang`, falling back to en
 * @param {string|Record<string,string>|null|undefined} value
 * @param {string} lang
 */
export function localize(value, lang) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? Object.values(value)[0] ?? "";
}
