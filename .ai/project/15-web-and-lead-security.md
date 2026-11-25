# Web and Lead Security Guardrails

The request form is the only server-side surface and it forwards visitor data to a
third party (Telegram). These rules hold in every task and override convenience.

## Lead pipeline (`POST /api/lead`)

- Order is fixed and fail-closed: Origin check → content-type and size limit → JSON
  parse → schema validation (with honeypot) → Turnstile `siteverify` → Telegram delivery.
  A step that errors, times out or is unconfigured ends in a non-2xx answer, never success.
- Turnstile is verified server-side on every request; the token is single-use; the site
  key is public, the secret key exists only as a Cloudflare secret or in `.dev.vars`.
- The response never echoes visitor input or upstream error bodies; only stable codes.
- Telegram token and chat id live only in the Functions `env`. No secret is ever
  exposed through `PUBLIC_*` variables, `import.meta.env`, client bundles or logs.
- Validation limits live in `src/lib/lead.ts` and are the single source for client and
  server; the client check is a convenience, the server check is the authority.

## Transport and headers

- CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `nosniff` come from
  `public/_headers`. Allowed third-party origin: `https://challenges.cloudflare.com`
  (Turnstile) only. Adding any other origin needs an owner decision.
- No inline event handlers; no `eval`; user-supplied text is inserted with `textContent`,
  never `innerHTML`.
- External links opened in a new tab carry `rel="noopener noreferrer"`.

## Privacy

- Visitor data (name, contact, message) is forwarded to the owner's Telegram chat and
  stored nowhere else: no database, no logs, no analytics events.
- WhatsApp is a `wa.me` link built by `WhatsAppLinkBuilder`; the phone number is public
  by nature and comes from `PUBLIC_WHATSAPP_PHONE`.

## Supply chain

- Lock file committed; `npm install` changes are reviewed; new packages are justified
  (universal security module) and use permissive licences.
- GitHub Actions are pinned to full commit SHAs with the release tag in a comment.
