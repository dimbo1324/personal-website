import { issue } from "./validationIssue.js";

/**
 * Pure validation rules. Each returns a ValidationIssue or null,
 * so they are trivially composable and testable.
 */

const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}' .-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED = /^[+]?[\d\s().-]+$/;

export const PHONE_DIGITS = Object.freeze({ min: 7, max: 15 });

export const isBlank = (value) => String(value ?? "").trim() === "";

/** @param {string} key  message shown when the value is empty */
export const required = (key) => (value) => (isBlank(value) ? issue(key) : null);

export const maxLength = (limit) => (value) =>
  String(value ?? "").length > limit ? issue("form.error.maxLength", { limit }) : null;

export const personName = (value) => (isBlank(value) || NAME_PATTERN.test(value.trim()) ? null : issue("form.error.name"));

export const email = (value) => (isBlank(value) || EMAIL_PATTERN.test(value.trim()) ? null : issue("form.error.email"));

export const phone = (value) => {
  if (isBlank(value)) return null;
  if (!PHONE_ALLOWED.test(value.trim())) return issue("form.error.phoneChars");
  const digits = value.replace(/\D/g, "").length;
  return digits >= PHONE_DIGITS.min && digits <= PHONE_DIGITS.max ? null : issue("form.error.phoneDigits", PHONE_DIGITS);
};

/** @param {string} key  message shown when the box is not ticked */
export const checked = (key) => (value) => (value === true ? null : issue(key));
