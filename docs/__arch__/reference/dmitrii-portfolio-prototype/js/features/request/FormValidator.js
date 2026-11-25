/**
 * Runs a schema (see RequestSchema.js) against a plain values object.
 * @typedef {import("./validationIssue.js").ValidationIssue} ValidationIssue
 */
export class FormValidator {
  #schema;

  /** @param {{ fields: Record<string, Function[]>, crossRules: { fields: string[], validate: Function }[] }} schema */
  constructor(schema) {
    this.#schema = schema;
  }

  get fieldNames() {
    return Object.keys(this.#schema.fields);
  }

  /**
   * First issue for one field, including cross-rules it participates in.
   * @returns {ValidationIssue | null}
   */
  validateField(name, values) {
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

  /** @returns {Map<string, ValidationIssue>} field name → issue (only invalid fields) */
  validateAll(values) {
    const errors = new Map();
    this.fieldNames.forEach((name) => {
      const problem = this.validateField(name, values);
      if (problem) errors.set(name, problem);
    });
    return errors;
  }
}
