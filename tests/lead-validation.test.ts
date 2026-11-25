import { describe, expect, it } from "vitest";
import { LeadValidator } from "../src/lib/lead";

const VALID = {
  name: "Alex Rivera",
  contact: "alex@example.com",
  message: "Need help with a SCADA modernization project.",
  turnstileToken: "token",
};

describe("LeadValidator", () => {
  const validator = new LeadValidator();

  it("accepts and trims a valid submission", () => {
    const result = validator.validate({
      name: "  Alex Rivera  ",
      contact: "  alex@example.com  ",
      message: "  Need help with a SCADA modernization project.  ",
      turnstileToken: "  token  ",
      website: "",
    });

    expect(result).toEqual({ ok: true, data: VALID });
  });

  it("rejects non-object payloads", () => {
    expect(validator.validate(null)).toEqual({ ok: false, code: "invalid_payload" });
    expect(validator.validate("text")).toEqual({ ok: false, code: "invalid_payload" });
  });

  it("rejects honeypot submissions", () => {
    expect(validator.validate({ ...VALID, website: "https://spam.invalid" })).toEqual({
      ok: false,
      code: "honeypot_triggered",
    });
  });

  it("rejects a missing Turnstile token", () => {
    expect(validator.validate({ ...VALID, turnstileToken: "   " })).toEqual({
      ok: false,
      code: "missing_turnstile_token",
    });
  });

  it("rejects a too-short message and a too-long name", () => {
    expect(validator.validate({ ...VALID, message: "Hi" })).toEqual({
      ok: false,
      code: "invalid_message",
    });
    expect(validator.validate({ ...VALID, name: "x".repeat(121) })).toEqual({
      ok: false,
      code: "invalid_name",
    });
  });
});
