import type { MessageVars } from "../../i18n/types";
import { issue } from "./validationIssue";
import type { ValidationIssue } from "./validationIssue";

export type FieldValue = string | boolean | null | undefined;
export type Validator = (value: FieldValue) => ValidationIssue | null;

const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}' .-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED = /^[+]?[\d\s().-]+$/;

export const PHONE_DIGITS = Object.freeze({ min: 7, max: 15 });

export const isBlank = (value: FieldValue): boolean => String(value ?? "").trim() === "";

export const required =
  (key: string): Validator =>
  (value) =>
    isBlank(value) ? issue(key) : null;

export const maxLength =
  (limit: number): Validator =>
  (value) =>
    String(value ?? "").length > limit ? issue("form.error.maxLength", { limit }) : null;

export const personName: Validator = (value) =>
  isBlank(value) || NAME_PATTERN.test(String(value).trim()) ? null : issue("form.error.name");

export const email: Validator = (value) =>
  isBlank(value) || EMAIL_PATTERN.test(String(value).trim()) ? null : issue("form.error.email");

export const phone: Validator = (value) => {
  if (isBlank(value)) return null;
  const text = String(value).trim();
  if (!PHONE_ALLOWED.test(text)) return issue("form.error.phoneChars");
  const digits = text.replace(/\D/g, "").length;
  const vars: MessageVars = { min: PHONE_DIGITS.min, max: PHONE_DIGITS.max };
  return digits >= PHONE_DIGITS.min && digits <= PHONE_DIGITS.max
    ? null
    : issue("form.error.phoneDigits", vars);
};

export const checked =
  (key: string): Validator =>
  (value) =>
    value === true ? null : issue(key);
