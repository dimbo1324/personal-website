import { nextConfig } from "@repo/eslint-config/next";
import { testConfig } from "@repo/eslint-config/test";

export default [{ ignores: [".next/**", "next-env.d.ts"] }, ...nextConfig, ...testConfig];
