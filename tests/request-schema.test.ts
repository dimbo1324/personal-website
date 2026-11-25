import { describe, expect, it } from "vitest";
import { createRequestSchema } from "../src/scripts/site/features/request/RequestSchema";
import { FormValidator } from "../src/scripts/site/features/request/FormValidator";
import type { RequestValues } from "../src/scripts/site/features/request/RequestSchema";

const validator = new FormValidator(
  createRequestSchema({ limits: { name: 60, email: 120, message: 1000 } }),
);

const complete: RequestValues = {
  lastName: "Prikhodko",
  firstName: "Dmitrii",
  middleName: "",
  phone: "+598 96 671 725",
  email: "",
  message: "Hello",
  consent: true,
  website: "",
};

describe("RequestSchema / FormValidator", () => {
  it("lists every declared field", () => {
    expect(validator.fieldNames).toEqual([
      "lastName",
      "firstName",
      "middleName",
      "phone",
      "email",
      "message",
      "consent",
    ]);
  });

  it("reports the first issue for a field", () => {
    expect(validator.validateField("lastName", { ...complete, lastName: "" })).toEqual({
      key: "form.error.lastName",
    });
    expect(validator.validateField("lastName", complete)).toBeNull();
    expect(validator.validateField("consent", { ...complete, consent: false })).toEqual({
      key: "form.error.consent",
    });
  });

  it("enforces the phone-or-email cross rule on both fields", () => {
    const noContact = { ...complete, phone: "", email: "" };
    expect(validator.validateField("phone", noContact)).toEqual({ key: "form.error.contact" });
    expect(validator.validateField("email", noContact)).toEqual({ key: "form.error.contact" });
    expect(validator.validateField("email", { ...complete, email: "a@b.com" })).toBeNull();
  });

  it("collects only invalid fields into a map", () => {
    const errors = validator.validateAll({
      ...complete,
      lastName: "",
      consent: false,
      phone: "",
    });
    expect(errors.has("lastName")).toBe(true);
    expect(errors.has("consent")).toBe(true);
    expect(errors.has("phone")).toBe(true);
    expect(errors.has("email")).toBe(true);
    expect(errors.has("firstName")).toBe(false);
  });

  it("accepts a fully valid request", () => {
    expect(validator.validateAll(complete).size).toBe(0);
  });
});
