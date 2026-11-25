import * as rules from "./validators.js";
import { issue } from "./validationIssue.js";

/**
 * Declarative description of the request form: per-field rules plus
 * cross-field rules (at least one contact channel).
 * @param {{ limits: { name: number, email: number, message: number } }} config
 */
export function createRequestSchema({ limits }) {
  return {
    fields: {
      lastName: [rules.required("form.error.lastName"), rules.maxLength(limits.name), rules.personName],
      firstName: [rules.required("form.error.firstName"), rules.maxLength(limits.name), rules.personName],
      middleName: [rules.maxLength(limits.name), rules.personName],
      phone: [rules.phone],
      email: [rules.maxLength(limits.email), rules.email],
      message: [rules.maxLength(limits.message)],
      consent: [rules.checked("form.error.consent")],
    },
    crossRules: [
      {
        fields: ["phone", "email"],
        validate: (values) => (rules.isBlank(values.phone) && rules.isBlank(values.email) ? issue("form.error.contact") : null),
      },
    ],
  };
}
