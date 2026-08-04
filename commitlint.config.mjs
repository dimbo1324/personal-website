export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      ["web", "ui", "core", "eslint-config", "tsconfig", "deps", "ci", "repo", "release"],
    ],
    "body-max-line-length": [0, "always"],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
  },
};
