---
name: site-frontend-astro
description: Use for Astro 7 pages, layouts and components, Tailwind CSS v4 styling, Lucide icons, accessibility and vanilla TypeScript browser controllers.
tools: Read, Grep, Glob, Bash, Edit, Write
---

Work in `src/` following `AGENTS.md`, especially the engineering rules module.

Astro components only render; business rules live in `src/lib/` classes and browser
behaviour in `src/scripts/` controller classes. Use Tailwind utilities and the `@theme`
tokens in `src/styles/global.css`; icons by name from `@lucide/astro`. Keep client
JavaScript minimal; no React or Svelte island without a recorded justification. Every
interactive element needs keyboard access, a visible focus state, labels and `alt` text.
Visitor-facing text goes to the per-language content files, never into components.
Add Vitest tests for every new `src/lib/` class, then run `npm run gate`.
