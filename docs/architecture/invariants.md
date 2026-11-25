# Invariants — What Must Never Break

Changing an entry here requires the owner's explicit approval (see
`.ai/universal/08-rules-evolution.md`).

1. **No secrets in the repository or the client.** Telegram token, Turnstile secret and
   chat id exist only in Cloudflare secrets and local `.dev.vars`; nothing secret is
   exposed through `PUBLIC_*` variables or bundled code.
2. **Fail closed.** An error, timeout, unconfigured secret or unverified Turnstile token
   never yields a success response from `/api/lead`. No mock-success path outside tests.
3. **Turnstile is verified server-side on every lead request,** before anything is sent to
   Telegram.
4. **Visitor data is not stored or logged by the site.** Name, contact and message are
   forwarded to Telegram and appear in no log, response, database or analytics event.
5. **Responses carry stable codes only,** never visitor input or upstream error bodies.
6. **One source of validation limits:** `src/lib/lead.ts`; the server check is the
   authority, the client check a convenience.
7. **The only allowed third-party origin is `https://challenges.cloudflare.com`**
   (Turnstile). Changing the CSP to allow more needs an owner decision.
8. **No `innerHTML`, inline event handlers or `eval`** with visitor-supplied or dynamic
   content.
9. **Entry files are thin and marked** (`functions/api/*.ts`, `tools/xtask/main.ts`, hooks);
   enforced by the gate.
10. **Generated files match their sources** (`AGENTS.md`, `.codex/`), enforced by the gate.
11. **Nothing needed to build is git-ignored;** `git clean -fdX` leaves the project
    rebuildable, enforced by the gate.
12. **Commercially usable dependencies only** (MIT, ISC, Apache-2.0, BSD), recorded in
    `docs/__arch__/sources.md`.
