/**
 * Runs a schema (see RequestSchema.js) against a plain values object.
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

  /** First error for one field, including cross-rules it participates in. */
  validateField(name, values) {
    for (const rule of this.#schema.fields[name] ?? []) {
      const message = rule(values[name]);
      if (message) return message;
    }
    for (const cross of this.#schema.crossRules) {
      if (cross.fields.includes(name)) {
        const message = cross.validate(values);
        if (message) return message;
      }
    }
    return null;
  }

  /** @returns {Map<string, string>} field name → message (only invalid fields) */
  validateAll(values) {
    const errors = new Map();
    this.fieldNames.forEach((name) => {
      const message = this.validateField(name, values);
      if (message) errors.set(name, message);
    });
    return errors;
  }
}
