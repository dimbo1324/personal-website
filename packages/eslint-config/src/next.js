import nextPlugin from "@next/eslint-plugin-next";

import { reactConfig } from "./react.js";

export const nextConfig = [
  ...reactConfig,
  {
    name: "repo/next",
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    name: "repo/next-server-entrypoints",
    files: ["**/route.ts", "**/middleware.ts", "**/instrumentation.ts"],
    rules: { "no-console": "off" },
  },
];
