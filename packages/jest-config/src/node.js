export const swcOptions = {
  jsc: {
    parser: { syntax: "typescript", tsx: false },
    target: "es2022",
    keepClassNames: true,
  },
  module: { type: "es6" },
};

export const ESM_ONLY_DEPENDENCIES = ["superjson", "copy-anything", "is-what"];

const esmPattern = ESM_ONLY_DEPENDENCIES.join("|");

export const nodePreset = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", swcOptions],
  },
  transformIgnorePatterns: [`node_modules/(?!(?:\\.pnpm/)?(?:@repo|${esmPattern})[@/])`],
  clearMocks: true,
  restoreMocks: true,
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
};
