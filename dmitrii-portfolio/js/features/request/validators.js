/**
 * Pure validation rules. Each returns an error message or null,
 * so they are trivially composable and testable.
 */

const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}' .-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED = /^[+]?[\d\s().-]+$/;

export const isBlank = (value) => String(value ?? "").trim() === "";

export const required = (label) => (value) => (isBlank(value) ? `Please enter your ${label}.` : null);

export const maxLength = (limit) => (value) =>
  String(value ?? "").length > limit ? `Up to ${limit} characters.` : null;

export const personName = (value) =>
  isBlank(value) || NAME_PATTERN.test(value.trim()) ? null : "Letters, spaces and hyphens only.";

export const email = (value) =>
  isBlank(value) || EMAIL_PATTERN.test(value.trim()) ? null : "Check the email format.";

export const phone = (value) => {
  if (isBlank(value)) return null;
  if (!PHONE_ALLOWED.test(value.trim())) return "Digits, spaces, + and - only.";
  const digits = value.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15 ? null : "7 to 15 digits, please.";
};

export const checked = (message) => (value) => (value === true ? null : message);
