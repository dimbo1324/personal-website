import type { RequestLimits } from "../../data/request";
import { issue } from "./validationIssue";
import type { ValidationIssue } from "./validationIssue";
import * as rules from "./validators";
import type { FieldValue, Validator } from "./validators";

export type RequestValues = Readonly<Record<string, FieldValue>>;

export interface CrossRule {
  readonly fields: readonly string[];
  readonly validate: (values: RequestValues) => ValidationIssue | null;
}

export interface RequestSchema {
  readonly fields: Readonly<Record<string, readonly Validator[]>>;
  readonly crossRules: readonly CrossRule[];
}

/** Declarative description of the request form. */
export function createRequestSchema({ limits }: { readonly limits: RequestLimits }): RequestSchema {
  return {
    fields: {
      lastName: [
        rules.required("form.error.lastName"),
        rules.maxLength(limits.name),
        rules.personName,
      ],
      firstName: [
        rules.required("form.error.firstName"),
        rules.maxLength(limits.name),
        rules.personName,
      ],
      middleName: [rules.maxLength(limits.name), rules.personName],
      phone: [rules.phone],
      email: [rules.maxLength(limits.email), rules.email],
      message: [rules.maxLength(limits.message)],
      consent: [rules.checked("form.error.consent")],
    },
    crossRules: [
      {
        fields: ["phone", "email"],
        validate: (values) =>
          rules.isBlank(values.phone) && rules.isBlank(values.email)
            ? issue("form.error.contact")
            : null,
      },
    ],
  };
}
