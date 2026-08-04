import { nodeConfig } from "@repo/eslint-config/node";
import { testConfig } from "@repo/eslint-config/test";

export default [...nodeConfig, ...testConfig];
