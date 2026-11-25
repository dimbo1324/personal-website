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
- `lib/whatsapp.ts` — `WhatsAppLinkBuilder` and `WhatsAppChannel`: builds `https://wa.me/<digits>?text=…`
  and resolves the channel mode (`auto` | `real` | `stub` | `off`).
- `scripts/lead-form.ts` — `LeadFormController`: validates, posts JSON to `/api/lead`,
  reports status through `textContent`.
- `scripts/site/config/env.ts` — public build-time values: `PUBLIC_SITE_URL`,
  `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_FORM_*`, `PUBLIC_ANALYTICS_*`,
  `PUBLIC_WHATSAPP_PHONE`, `PUBLIC_WHATSAPP_MODE`, `PUBLIC_LEAD_MODE`.
- `scripts/site/data/request.ts` — `REQUEST_CONFIG` and transport settings, including
  `"demo"` transport for local demo delivery.
- `scripts/site/data/whatsapp.ts` — `WHATSAPP_CONFIG`: phone, mode and greeting key.
- `scripts/site/features/contact/PhoneReveal.ts` — on-demand phone/WhatsApp reveal
  (link or honest placeholder, no secrets in HTML).
- `scripts/site/features/request/gateways/DemoGateway.ts` — client-side demo delivery:
  validates and acknowledges without network call, selected only by `PUBLIC_LEAD_MODE=demo`.

## Pages Functions (`functions/`)

- `api/lead.ts` — thin `POST /api/lead` entry; delegates to `LeadApiHandler`.
- `lib/leadHandler.ts` — pipeline: Origin check → content type and size → JSON → validation
  → Turnstile → Telegram/stub delivery; stable error codes, `cache-control: no-store`,
  response field `delivery: "telegram" | "stub"`.
- `lib/turnstile.ts` — `TurnstileVerifier` (`siteverify`); `lib/telegram.ts` —
  `TelegramNotifier` (`sendMessage`); `lib/notifier.ts` — `LeadNotifier` port,
  `StubLeadNotifier` demo notifier and `createLeadNotifier()` factory; both adapters take
  an injected `fetch`.
- `lib/types.ts` — `LeadEnv`, `FetchLike`, `TurnstileResult`; `LeadEnv` now also carries
  `LEAD_DELIVERY_MODE`.
- `tsconfig.json` — Workers types; checked by `npm run typecheck`.

## Delivery and headers

- `public/_headers` — CSP (self + `challenges.cloudflare.com`), `nosniff`, referrer,
  permissions and framing policy, immutable cache for `/_astro/*`.
- `wrangler.jsonc` — Pages project config (`pages_build_output_dir: ./dist`).
- `.github/workflows/ci.yml` — runs `npm run gate` on every push and pull request;
  deployment is Cloudflare Pages' own GitHub integration.
- `.env.example` / `.dev.vars.example` — documented placeholder variables (never committed),
  including `PUBLIC_LEAD_MODE`, `PUBLIC_WHATSAPP_MODE`, `LEAD_DELIVERY_MODE`.

## Delivery, stubs and security

- Client-side demo delivery (`DemoGateway`, kind `demo`) acknowledges a validated request
  without any network call and never stores visitor data. Enabled only by explicit
  `PUBLIC_LEAD_MODE=demo`; anything else stays live.
- Server-side demo delivery (`StubLeadNotifier`, mode `stub`) acknowledges without calling
  Telegram. Enabled only by explicit `LEAD_DELIVERY_MODE=stub`; anything else keeps the real
  Telegram path, which fails closed without credentials.
- WhatsApp resolves to a real `wa.me` link only with a valid phone and mode `auto`/`real`;
  `stub` and `off` render an honest placeholder instead of a fake link.
- All three modes are off by default; no typo can turn a demo mode on.

## Tooling (`tools/xtask/`)

TypeScript task runner executed with Node's native type stripping: `gate`, `fmt`, `lint`,
`typecheck`, `test`, `build`, `sync-agents`, `install-hooks`, `commit-msg`, `doctor`. Git
hooks in `.githooks/` call it (format on commit, message check, quick gate on push).

## Tests

Vitest: `whatsapp`, `phone-reveal`, `env`, `i18n-parity`, `lead-validation`,
`lead-handler` (fake `fetch`, success and every failing step), `lead-notifier`
(stub notifier, factory), `request-gateways` (demo gateway) and `xtask`
(commit messages, entry-point rule, git-clean safety).

## Assistant rules

`.ai/` modules → `CLAUDE.md` (imports) and generated `AGENTS.md`; `.claude/agents` and
`.claude/skills` mirrored to `.codex/`; `GEMINI.md` imports `AGENTS.md`.
