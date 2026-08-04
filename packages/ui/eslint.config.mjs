import { reactConfig } from "@repo/eslint-config/react";
import { testConfig } from "@repo/eslint-config/test";

export default [...reactConfig, ...testConfig];
