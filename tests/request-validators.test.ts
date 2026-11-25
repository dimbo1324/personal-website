import { describe, expect, it } from "vitest";
import {
  PHONE_DIGITS,
  checked,
  email,
  isBlank,
  maxLength,
  personName,
  phone,
  required,
} from "../src/scripts/site/features/request/validators";

describe("request validators", () => {
  it("detects blank values", () => {
    expect(isBlank("")).toBe(true);
    expect(isBlank("   \n")).toBe(true);
    expect(isBlank(null)).toBe(true);
    expect(isBlank("x")).toBe(false);
  });

  it("builds required and max-length rules with translation keys", () => {
    expect(required("form.error.firstName")("")).toEqual({ key: "form.error.firstName" });
    expect(required("form.error.firstName")("Ana")).toBeNull();
    expect(maxLength(5)("abcdef")).toEqual({ key: "form.error.maxLength", vars: { limit: 5 } });
    expect(maxLength(5)("abcde")).toBeNull();
  });

  it("accepts Latin and Cyrillic names with hyphens and apostrophes", () => {
    expect(personName("Ana María")).toBeNull();
    expect(personName("Дмитрий Приходько")).toBeNull();
    expect(personName("O'Brien-Smith")).toBeNull();
    expect(personName("Ana123")).toEqual({ key: "form.error.name" });
    expect(personName("   ")).toBeNull();
  });

  it("validates emails and phone numbers", () => {
    expect(email("user@example.com")).toBeNull();
    expect(email("bad@address")).toEqual({ key: "form.error.email" });
    expect(email("")).toBeNull();

    expect(phone("+598 96 671 725")).toBeNull();
    expect(phone("abc")).toEqual({ key: "form.error.phoneChars" });
    expect(phone("12345")).toEqual({
      key: "form.error.phoneDigits",
      vars: { min: PHONE_DIGITS.min, max: PHONE_DIGITS.max },
    });
    expect(phone("")).toBeNull();
  });

  it("validates the consent checkbox", () => {
    expect(checked("form.error.consent")(true)).toBeNull();
    expect(checked("form.error.consent")(false)).toEqual({ key: "form.error.consent" });
  });
});
