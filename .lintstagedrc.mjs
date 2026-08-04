export default {
  "*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --max-warnings=0 --no-warn-ignored",
    "prettier --write",
  ],
  "*.{json,jsonc,md,mdx,css,yml,yaml,html}": ["prettier --write"],
};
