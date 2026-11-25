import type { MessageVars } from "../../i18n/types";

export interface ValidationIssue {
  readonly key: string;
  readonly vars?: MessageVars;
}

export const issue = (key: string, vars?: MessageVars): ValidationIssue =>
  vars ? { key, vars: Object.freeze({ ...vars }) } : { key };
