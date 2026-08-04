const config = {
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: "lf",
  quoteProps: "as-needed",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./packages/ui/src/styles/theme.css",
  tailwindFunctions: ["cn", "clsx", "cva", "twMerge"],
  overrides: [
    { files: ["*.md", "*.mdx"], options: { proseWrap: "preserve" } },
    { files: ["*.json", "*.jsonc", "*.json5"], options: { trailingComma: "none" } },
  ],
};

export default config;
