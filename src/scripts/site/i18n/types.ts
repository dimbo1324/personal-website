import type { Language } from "./languages";

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other?: string };
export type Message = string | PluralForms;
export type Dictionary = Readonly<Record<string, Message>>;

export type LocalizedText = Readonly<Record<Language, string>>;

export type MessageVars = Readonly<Record<string, string | number | boolean | undefined>>;

export function interpolate(template: string, vars?: MessageVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

const rulesCache = new Map<string, Intl.PluralRules>();

export function selectPlural(forms: PluralForms, count: number, locale: string): string {
  const rules = rulesCache.get(locale) ?? new Intl.PluralRules(locale);
  rulesCache.set(locale, rules);
  const category = rules.select(count);
  const selected = forms[category];
  if (selected) return selected;
  if (forms.other) return forms.other;
  const fallback = Object.values(forms).find((value): value is string => typeof value === "string");
  return fallback ?? "";
}

export function localize(value: string | LocalizedText | null | undefined, lang: Language): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || Object.values(value)[0] || "";
}
