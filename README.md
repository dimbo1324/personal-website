# Personal Website

Personal website and engineering portfolio of Dmitrii Prikhodko — Industrial Automation,
IIoT and Software Engineer. Static-first, trilingual (EN / ES / RU), deployed on
Cloudflare Pages. Visitors reach the owner through a Turnstile-protected request form
(delivered to Telegram) or WhatsApp Click-to-Chat.

## Stack

| Area          | Choice                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Framework     | Astro 7 (static output)                                                           |
| Language      | TypeScript (strict)                                                               |
| Styling       | Tailwind CSS v4 (`@tailwindcss/vite`)                                             |
| Icons         | Lucide (`@lucide/astro`)                                                          |
| Interactivity | Vanilla TypeScript; React or Svelte only point-wise                               |
| Spam defence  | Cloudflare Turnstile (verified server-side)                                       |
| Lead delivery | Cloudflare Pages Functions → Telegram Bot API; demo stub behind explicit env flag |
| WhatsApp      | `wa.me` Click-to-Chat link with `auto` / `real` / `stub` / `off` modes            |
| Hosting       | Cloudflare Pages, auto-deploy from GitHub `main`                                  |
| Tooling       | Node.js 22+, Vitest, ESLint, Prettier, Wrangler                                   |

## Demo modes (local development only)

| Mode              | Variable               | Default    | What it does                                                  |
| ----------------- | ---------------------- | ---------- | ------------------------------------------------------------- |
| Lead form demo    | `PUBLIC_LEAD_MODE`     | `live`     | `demo` validates and acknowledges in-browser, no network call |
| Telegram delivery | `LEAD_DELIVERY_MODE`   | `telegram` | `stub` acknowledges without calling Telegram                  |
| WhatsApp channel  | `PUBLIC_WHATSAPP_MODE` | `auto`     | `auto`/`real`/`stub`/`off` — link or honest placeholder       |

Demo modes are opt-in only, visibly marked "demo", never enabled by default or
by a typo, and must not be set in production. The full go-live order is in
`docs/__arch__/integrations.md`.

## Repository layout

| Path                | Contents                                                                      |
| ------------------- | ----------------------------------------------------------------------------- |
| `src/`              | Astro pages, layouts, `lib/` domain classes, `scripts/`, `styles/`            |
| `functions/`        | Pages Functions: thin `api/*.ts` entries and `lib/` logic                     |
| `public/`           | Static files, including `_headers` (CSP and security headers)                 |
| `tests/`            | Vitest unit tests                                                             |
| `tools/xtask/`      | Task runner and quality gate (`npm run xtask -- …`)                           |
| `docs/architecture` | What is built now and its invariants (English)                                |
| `docs/__arch__/`    | Internal plan, decisions, stack register (Russian) and the archived prototype |
| `out/`, `dist/`     | Run output and build result (git-ignored)                                     |

## Getting started

Requires Node.js 22+ (`.nvmrc` pins 24) and npm.

```bash
npm install
```

```bash
npm run xtask -- install-hooks
```

```bash
npm run doctor
```

```bash
npm run dev
```

Copy `.env.example` to `.env` (public build-time values) and `.dev.vars.example` to
`.dev.vars` (server secrets for local Functions). Neither file is ever committed. To run
the site together with Pages Functions locally:

```bash
npm run build
```

```bash
npm run preview:cf
```

## Everyday commands

| Command               | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `npm run gate`        | full quality gate (rules, format, ESLint, types, tests, build)  |
| `npm run gate:quick`  | what the pre-push hook runs                                     |
| `npm run fmt`         | format with Prettier (`fmt:check` verifies)                     |
| `npm run lint`        | ESLint                                                          |
| `npm run typecheck`   | `astro check` and the Functions type check                      |
| `npm run test`        | Vitest; JUnit result in `out/test-results/`                     |
| `npm run sync-agents` | regenerate `AGENTS.md` and `.codex/` from `.ai/` and `.claude/` |
| `npm run doctor`      | read-only toolchain diagnostics                                 |

## Deployment

Cloudflare Pages is connected to this GitHub repository: build command `npm run build`,
output directory `dist`, production branch `main`. Secrets (`TURNSTILE_SECRET_KEY`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ALLOWED_ORIGIN`) are set in the Pages project
settings; details in `.ai/project/16-command-reference.md`.

## Working with AI assistants

Rules for Claude Code, Codex, Gemini and other assistants live in `.ai/`. `CLAUDE.md`
imports them; `AGENTS.md` is generated from them (`npm run sync-agents`).

## Licence

Proprietary. All rights reserved. Third-party dependencies must allow commercial use.
