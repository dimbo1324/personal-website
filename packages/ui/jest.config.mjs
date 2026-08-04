import { reactPreset } from "@repo/jest-config/react";

/** @type {import("jest").Config} */
export default {
  ...reactPreset,
  displayName: "ui",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/**/*.{test,spec}.{ts,tsx}"],
  moduleNameMapper: {
    ...reactPreset.moduleNameMapper,
    "^@repo/ui/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.{test,spec}.{ts,tsx}"],
};
