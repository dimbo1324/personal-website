# Task: Telegram and WhatsApp demo stubs

Owner instruction 2026-11-25: add explicit demo stubs for the Telegram lead delivery and
the WhatsApp channel, cover them with tests, document the contour in Russian and keep the
English architecture docs in sync. Production must stay fail-closed. `+` done, `-` not done.

## Preparation

- [ ] Branch `feat/telegram-whatsapp-stubs` from up-to-date `main`
- [ ] Design decisions recorded: explicit modes, no PII retention in stubs, production ignores demo
- [ ] Checklist committed before the main work

## Server-side Telegram stub

- [ ] `LeadNotifier` port with `TelegramNotifier` and `StubLeadNotifier`
- [ ] `createLeadNotifier` selects the stub only via `LEAD_DELIVERY_MODE=stub`
- [ ] `/api/lead` reports `delivery: "telegram" | "stub"` and keeps the fail-closed statuses
- [ ] Tests: factory, stub, handler success/failure, no outbound call in stub mode

## Client-side demo delivery

- [ ] `DemoGateway` with no network calls and no stored visitor data
- [ ] `createGateway` honours `demo` only when the caller explicitly allows it
- [ ] `PUBLIC_LEAD_MODE` config and a demo hint/success message in EN / ES / RU
- [ ] Tests: gateway selection, production fallback, form demo flow

## WhatsApp channel

- [ ] `WhatsAppChannel` with `auto | real | stub | off` modes and a safe fallback
- [ ] `PhoneReveal` renders a real `wa.me` link or an honest disabled placeholder
- [ ] `PUBLIC_WHATSAPP_PHONE` / `PUBLIC_WHATSAPP_MODE` config, prefilled greeting, labels
- [ ] Tests: mode resolution, prefill and encoding, reveal rendering, language switch

## Documentation and configuration

- [ ] New Russian `docs/__arch__/integrations.md` with the contour, env vars and go-live steps
- [ ] `ROADMAP.md`, `open-questions.md`, `sources.md` updated in Russian
- [ ] `docs/architecture/overview.md` and `invariants.md` kept accurate in English
- [ ] `README.md`, `.env.example`, `.dev.vars.example` reflect the new modes
- [ ] Locale parity test for the three dictionaries

## Verification and completion

- [ ] `npm run fmt`, `npm run lint`, `npm run typecheck`, `npm run test`
- [ ] Full `npm run gate` green
- [ ] Dev server and the stub lead endpoint checked manually
- [ ] `task-checklist.md` filled and committed
- [ ] Fast-forward merge into `main`, push to `origin/main`, branch deleted
- [ ] Final report to the owner in Russian
