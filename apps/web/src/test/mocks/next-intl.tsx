import type { ReactNode } from "react";

import ruMessages from "../../../messages/ru.json";

function getByPath(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      source,
    );
}

export function useTranslations(namespace?: string) {
  return (key: string) => {
    const fullPath = namespace ? `${namespace}.${key}` : key;
    const value = getByPath(ruMessages, fullPath);
    return typeof value === "string" ? value : fullPath;
  };
}

export function NextIntlClientProvider({ children }: { children: ReactNode }) {
  return children;
}

export function hasLocale(locales: readonly string[], candidate: unknown): candidate is string {
  return typeof candidate === "string" && locales.includes(candidate);
}
