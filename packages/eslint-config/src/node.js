import { baseConfig } from "./base.js";

export const nodeConfig = [
  ...baseConfig,
  {
    name: "repo/node",
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message: "This is a framework-agnostic package; do not import React here.",
            },
            {
              name: "react-dom",
              message: "This is a framework-agnostic package; do not import React DOM here.",
            },
          ],
        },
      ],
    },
  },
];
