/**
 * Replaces {name} placeholders with values. Unknown placeholders are kept,
 * so a missing variable is visible instead of silently becoming "undefined".
 *
 * @param {string} template
 * @param {Record<string, unknown>} [vars]
 */
export function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}
