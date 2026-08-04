import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { baseConfig } from "./base.js";

export const reactConfig = [
  ...baseConfig,
  {
    name: "repo/react",
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    name: "repo/react-tsx",
    files: ["**/*.tsx"],
    rules: {
      "no-nested-ternary": "warn",
    },
  },
];
