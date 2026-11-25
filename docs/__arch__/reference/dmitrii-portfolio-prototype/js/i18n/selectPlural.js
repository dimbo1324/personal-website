const rulesCache = new Map();

/**
 * Chooses the plural form of a message by CLDR rules, e.g. Russian
 * { one: "{count} кадр", few: "{count} кадра", many: "{count} кадров" }.
 *
 * @param {Record<string, string>} forms  keys: zero | one | two | few | many | other
 * @param {number} count
 * @param {string} locale
 */
export function selectPlural(forms, count, locale) {
  if (!rulesCache.has(locale)) rulesCache.set(locale, new Intl.PluralRules(locale));
  const category = rulesCache.get(locale).select(count);
  return forms[category] ?? forms.other ?? forms.many ?? Object.values(forms)[0] ?? "";
}
