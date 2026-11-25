import type { RequestSchema } from "./RequestSchema";
import type { RequestValues } from "./RequestSchema";
import type { ValidationIssue } from "./validationIssue";

/** Runs a schema against a plain values object. */
export class FormValidator {
  readonly #schema: RequestSchema;

  constructor(schema: RequestSchema) {
    this.#schema = schema;
  }

  get fieldNames(): string[] {
    return Object.keys(this.#schema.fields);
  }

  /** First issue for one field, including cross-rules it participates in. */
  validateField(name: string, values: RequestValues): ValidationIssue | null {
    for (const rule of this.#schema.fields[name] ?? []) {
      const problem = rule(values[name]);
      if (problem) return problem;
    }
    for (const cross of this.#schema.crossRules) {
      if (cross.fields.includes(name)) {
        const problem = cross.validate(values);
        if (problem) return problem;
      }
    }
    return null;
  }

  validateAll(values: RequestValues): Map<string, ValidationIssue> {
    const errors = new Map<string, ValidationIssue>();
    for (const name of this.fieldNames) {
      const problem = this.validateField(name, values);
      if (problem) errors.set(name, problem);
    }
    return errors;
  }
}
