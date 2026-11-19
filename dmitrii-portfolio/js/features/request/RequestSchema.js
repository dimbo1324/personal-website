import * as rules from "./validators.js";

/**
 * Declarative description of the request form: per-field rules plus
 * cross-field rules (at least one contact channel).
 * @param {{ limits: { name: number, email: number, message: number } }} config
 */
export function createRequestSchema({ limits }) {
  return {
    fields: {
      lastName: [rules.required("last name"), rules.maxLength(limits.name), rules.personName],
      firstName: [rules.required("first name"), rules.maxLength(limits.name), rules.personName],
      middleName: [rules.maxLength(limits.name), rules.personName],
      phone: [rules.phone],
      email: [rules.maxLength(limits.email), rules.email],
      message: [rules.maxLength(limits.message)],
      consent: [rules.checked("Please confirm to continue.")],
    },
    crossRules: [
      {
        fields: ["phone", "email"],
        validate: (values) =>
          rules.isBlank(values.phone) && rules.isBlank(values.email) ? "Add a phone or an email." : null,
      },
    ],
  };
}
