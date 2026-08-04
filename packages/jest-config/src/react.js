import { fileURLToPath } from "node:url";

import { nodePreset, swcOptions } from "./node.js";

const styleMockPath = fileURLToPath(new URL("./style-mock.cjs", import.meta.url));

const reactSwcOptions = {
  ...swcOptions,
  jsc: {
    ...swcOptions.jsc,
    parser: { syntax: "typescript", tsx: true },
    transform: { react: { runtime: "automatic" } },
  },
};

export const reactPreset = {
  ...nodePreset,
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", reactSwcOptions],
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": styleMockPath,
  },
};
