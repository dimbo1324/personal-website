# Architecture Overview — What Is Built Now

State as of 2026-11-24: repository foundation only. No production site content yet; the
archived prototype in `docs/__arch__/reference/dmitrii-portfolio-prototype/` is the design
reference for the rebuild.

## Site (`src/`)

- `pages/index.astro` — placeholder page that exercises the whole stack: Tailwind
  utilities, Lucide icons, the lead form, the Turnstile widget (rendered only when
  `PUBLIC_TURNSTILE_SITE_KEY` is set) and the WhatsApp link (only when
  `PUBLIC_WHATSAPP_PHONE` is a valid number). To be replaced by the real site.
- `layouts/BaseLayout.astro` — document shell, imports `styles/global.css`
  (`@import "tailwindcss"`).
- `lib/lead.ts` — `LeadValidator`: single source of validation limits and the honeypot rule,
  used by the browser and by the Function.
- `lib/whatsapp.ts` — `WhatsAppLinkBuilder`: builds `https://wa.me/<digits>?text=…`.
- `scripts/lead-form.ts` — `LeadFormController`: validates, posts JSON to `/api/lead`,
  reports status through `textContent`.

## Pages Functions (`functions/`)

- `api/lead.ts` — thin `POST /api/lead` entry; delegates to `LeadApiHandler`.
- `lib/leadHandler.ts` — pipeline: Origin check → content type and size → JSON → validation
  → Turnstile → Telegram; stable error codes, `cache-control: no-store`.
- `lib/turnstile.ts` — `TurnstileVerifier` (`siteverify`); `lib/telegram.ts` —
  `TelegramNotifier` (`sendMessage`); both take an injected `fetch`.
- `tsconfig.json` — Workers types; checked by `npm run typecheck`.

## Delivery and headers

- `public/_headers` — CSP (self + `challenges.cloudflare.com`), `nosniff`, referrer,
  permissions and framing policy, immutable cache for `/_astro/*`.
- `wrangler.jsonc` — Pages project config (`pages_build_output_dir: ./dist`).
- `.github/workflows/ci.yml` — runs `npm run gate` on every push and pull request;
  deployment is Cloudflare Pages' own GitHub integration.

## Tooling (`tools/xtask/`)

TypeScript task runner executed with Node's native type stripping: `gate`, `fmt`, `lint`,
`typecheck`, `test`, `build`, `sync-agents`, `install-hooks`, `commit-msg`, `doctor`. Git
hooks in `.githooks/` call it (format on commit, message check, quick gate on push).

## Tests

Vitest: `whatsapp`, `lead-validation`, `lead-handler` (fake `fetch`, success and every
failing step) and `xtask` (commit messages, entry-point rule, git-clean safety).

## Assistant rules

`.ai/` modules → `CLAUDE.md` (imports) and generated `AGENTS.md`; `.claude/agents` and
`.claude/skills` mirrored to `.codex/`; `GEMINI.md` imports `AGENTS.md`.
