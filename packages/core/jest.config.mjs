import { nodePreset } from "@repo/jest-config/node";

/** @type {import("jest").Config} */
export default {
  ...nodePreset,
  displayName: "core",
  testMatch: ["<rootDir>/src/**/*.{test,spec}.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.{test,spec}.ts",
    "!src/index.ts",
    "!src/schemas/index.ts",
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 75, functions: 80, lines: 80 },
  },
};
