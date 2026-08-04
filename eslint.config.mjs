import { nodeConfig } from "@repo/eslint-config/node";

export default [
  { ignores: ["apps/**", "packages/**"] },
  ...nodeConfig,
  {
    name: "repo/root-tooling",
    files: ["scripts/**/*.mjs", "*.mjs"],
    rules: { "no-console": "off" },
  },
];
