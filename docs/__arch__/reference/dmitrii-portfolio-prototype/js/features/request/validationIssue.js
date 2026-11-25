/**
 * A validation problem described by a translation key (+ variables),
 * not by text: the UI translates it, so errors follow language switches
 * and the rules stay language-agnostic and easy to test.
 *
 * @typedef {{ key: string, vars?: Record<string, unknown> }} ValidationIssue
 */

/** @returns {ValidationIssue} */
export const issue = (key, vars) => Object.freeze(vars ? { key, vars: Object.freeze({ ...vars }) } : { key });
