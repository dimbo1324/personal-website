import { test } from "node:test";
import assert from "node:assert/strict";
import * as rules from "../js/features/request/validators.js";
import { createRequestSchema } from "../js/features/request/RequestSchema.js";
import { FormValidator } from "../js/features/request/FormValidator.js";

test("isBlank treats whitespace, null and undefined as empty", () => {
  for (const value of ["", "   ", null, undefined, "\n\t"]) assert.equal(rules.isBlank(value), true);
  assert.equal(rules.isBlank(" a "), false);
});

test("required returns the given key only for blank values", () => {
  const rule = rules.required("form.error.firstName");
  assert.deepEqual(rule(""), { key: "form.error.firstName" });
  assert.equal(rule("Ana"), null);
});

test("maxLength reports the limit as a variable", () => {
  const rule = rules.maxLength(3);
  assert.equal(rule("abc"), null);
  assert.deepEqual(rule("abcd"), { key: "form.error.maxLength", vars: { limit: 3 } });
});

test("personName accepts letters from any script, hyphens and apostrophes", () => {
  for (const name of ["Ana", "Приходько", "José-María", "O'Neil", "Dmitrii P."]) assert.equal(rules.personName(name), null, name);
  for (const name of ["R2D2", "<script>", "-Ana"]) assert.equal(rules.personName(name)?.key, "form.error.name", name);
  assert.equal(rules.personName(""), null, "blank is handled by required()");
});

test("email checks the basic shape", () => {
  assert.equal(rules.email("name@company.com"), null);
  assert.equal(rules.email("name@company")?.key, "form.error.email");
  assert.equal(rules.email("no-at-sign.com")?.key, "form.error.email");
});

test("phone allows formatting characters and 7–15 digits", () => {
  assert.equal(rules.phone("+598 96 671 725"), null);
  assert.equal(rules.phone("(099) 123-4567"), null);
  assert.equal(rules.phone("+598 abc")?.key, "form.error.phoneChars");
  assert.deepEqual(rules.phone("12345"), { key: "form.error.phoneDigits", vars: { min: 7, max: 15 } });
  assert.equal(rules.phone("1".repeat(16))?.key, "form.error.phoneDigits");
});

test("checked passes only a real true", () => {
  const rule = rules.checked("form.error.consent");
  assert.equal(rule(true), null);
  assert.equal(rule("true")?.key, "form.error.consent");
});

test("schema: at least one contact channel is required", () => {
  const validator = new FormValidator(createRequestSchema({ limits: { name: 60, email: 120, message: 1000 } }));
  const base = { lastName: "Prikhodko", firstName: "Dmitrii", middleName: "", phone: "", email: "", message: "", consent: true };

  const errors = validator.validateAll(base);
  assert.deepEqual([...errors.keys()], ["phone", "email"]);
  assert.equal(errors.get("phone").key, "form.error.contact");

  assert.equal(validator.validateAll({ ...base, email: "a@b.co" }).size, 0);
  assert.equal(validator.validateAll({ ...base, phone: "+598 96 671 725" }).size, 0);
});

test("schema: field rules run before the cross rule", () => {
  const validator = new FormValidator(createRequestSchema({ limits: { name: 60, email: 120, message: 1000 } }));
  assert.equal(validator.validateField("email", { email: "broken" }).key, "form.error.email");
});
