# Project: Personal Website

The personal website and engineering portfolio of Dmitrii Prikhodko (Industrial
Automation, IIoT and Software Engineer, based in Montevideo). Trilingual (EN / ES / RU),
static-first, deployed on Cloudflare Pages from GitHub `main`. Visitors reach the owner
through a request form (Turnstile-protected, delivered to Telegram) or WhatsApp
Click-to-Chat.

**Current phase: foundation.** The repository, rules and toolchain are ready; the site
itself is rebuilt from the archived prototype (`docs/__arch__/reference/dmitrii-portfolio-prototype/`,
read-only) in later tasks. The prototype is a design reference, never code to copy blindly.

## Stack (owner decision 2026-11-24)

- Astro 7 (static output), TypeScript strict, Tailwind CSS v4 (`@tailwindcss/vite`),
  Lucide icons (`@lucide/astro`); interactivity is vanilla TS, React or Svelte only
  point-wise when justified.
- Cloudflare Pages Functions (`functions/`) call Cloudflare Turnstile `siteverify` and the
  Telegram Bot API; WhatsApp is a plain `wa.me` link. Hosting and auto-deploy: Cloudflare
  Pages connected to GitHub. Node.js 22+ locally (`.nvmrc` pins 24).

## Repository map

- `src/` — Astro site: `pages/`, `layouts/`, `lib/` (framework-free domain logic shared with
  functions), `scripts/` (browser controllers), `styles/`.
- `functions/` — Pages Functions: `api/*.ts` are thin entries, `lib/` holds the logic.
- `public/` — static files copied as is, including `_headers` (CSP and security headers).
- `tests/` — Vitest unit tests; `tools/xtask/` — the task runner and quality gate.
- `docs/architecture/` — English, what is built; `docs/__arch__/` — Russian internal documents.
- `.ai/`, `.claude/`, `.codex/`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` — assistant rules.
- `out/` — git-ignored output of every run; `dist/` — build result (git-ignored).

## Language policy

- **English**: code, identifiers, comments, commit messages, tests, `.ai/`, `.claude/`,
  `.codex/`, `CLAUDE.md`, `AGENTS.md`, `task-checklist.md`, `README.md`, `docs/architecture/`.
- **Russian**: internal documents in `docs/__arch__/` and every report to the owner.
- Visitor-facing text is not hard-coded in components: it lives in per-language content
  files (EN, ES, RU) once the site content task begins.

Do not mix languages inside one file.
