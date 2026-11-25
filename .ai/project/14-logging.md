# Logging and Observability

<!-- tier: extended -->

> **Essence.** Tooling logs into `out/` (git-ignored); the xtask runner transcribes every run to `out/logs/xtask/`; Functions log one structured line per meaningful step with a request id and an error code; never log secrets, tokens, the visitor's message text, contact details or IP addresses.

## Tooling

- Every xtask invocation writes a transcript to `out/logs/xtask/<UTC stamp>.log`; the gate
  writes `out/reports/gate-latest.json`; Vitest writes JUnit to `out/test-results/`.
- `out/` is disposable and never a source; nothing the build needs lives there.

## Pages Functions

- A function logs through one logger class (added together with the first logged step)
  as JSON lines: `{ "level", "component", "event", "requestId", "code" }`.
- Allowed fields: event name, stable error codes (`turnstile_rejected`,
  `telegram_upstream_error`), HTTP status, duration. Forbidden: Telegram token, Turnstile
  secret, visitor name, contact, message, IP address, full request bodies.
- Failures are logged once, at the layer that decides the response; no log-and-rethrow
  chains. Never leave `console.log` debugging in committed code (ESLint enforces it).

## Browser

- No third-party analytics or trackers without an owner decision recorded in
  `docs/__arch__/open-questions.md`; if added later it must honour Do Not Track.
