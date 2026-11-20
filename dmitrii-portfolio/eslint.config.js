import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**", ".lighthouseci/**", "assets/**"] },
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      // data must never become markup
      "no-restricted-properties": [
        "error",
        { property: "innerHTML", message: "Build DOM with createElement / textContent instead." },
        { property: "outerHTML", message: "Build DOM with createElement / textContent instead." },
        { object: "document", property: "write", message: "Never." },
      ],
      "no-eval": "error",
      "no-implied-eval": "error",
    },
  },
  {
    // classic scripts that run in <head> before modules
    files: ["js/boot/**/*.js"],
    languageOptions: { sourceType: "script", globals: { ...globals.browser } },
    rules: { "no-var": "off" },
  },
  {
    files: ["build/**/*.js", "scripts/**/*.mjs", "tests/**/*.js", "*.config.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.node } },
  },
];
