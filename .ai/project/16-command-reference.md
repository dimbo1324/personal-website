# Command Reference: Per-Tool Commands and Platform Notes

<!-- tier: extended -->

> **Essence.** Lookup material — raw tool commands behind xtask, Cloudflare Pages and Wrangler usage, environment variables, Windows quirks and reading a red CI run; the gate and always-apply policies live in `11-commands.md`.

## Raw commands behind xtask

```text
npx prettier --check .            npx eslint .
npx astro check                   npx tsc -p functions/tsconfig.json
npx vitest run                    npx astro build
npx wrangler pages dev dist       local Pages runtime with Functions (reads .dev.vars)
```

## Environment variables

| Variable                    | Where                     | Purpose                                  |
| --------------------------- | ------------------------- | ---------------------------------------- |
| `PUBLIC_SITE_URL`           | `.env`, CI / Pages build  | canonical URL, sitemap, Open Graph       |
| `PUBLIC_TURNSTILE_SITE_KEY` | `.env`, CI / Pages build  | public Turnstile widget key              |
| `PUBLIC_WHATSAPP_PHONE`     | `.env`, CI / Pages build  | digits for the `wa.me` link              |
| `TURNSTILE_SECRET_KEY`      | `.dev.vars`, Pages secret | server-side `siteverify`                 |
| `TELEGRAM_BOT_TOKEN`        | `.dev.vars`, Pages secret | Bot API token from @BotFather            |
| `TELEGRAM_CHAT_ID`          | `.dev.vars`, Pages secret | chat or channel receiving leads          |
| `ALLOWED_ORIGIN`            | `.dev.vars`, Pages secret | exact Origin allowed to call `/api/lead` |

Cloudflare publishes always-pass Turnstile test keys; use them locally, never real keys
in examples.

## Cloudflare Pages

Connect the GitHub repository in the Pages dashboard: build command `npm run build`,
output directory `dist`, Node 22+ (`NODE_VERSION`), production branch `main`. Functions in
`functions/` deploy automatically. Set the secrets above in the project settings.

## Windows notes

- Run commands from PowerShell or Git Bash at the repository root; the runner quotes
  arguments itself.
- Git hooks are bash scripts and need Git for Windows (bundled bash).
- If `npm install` reports blocked install scripts for `esbuild` or `workerd`, approve them
  with `npm install-scripts approve <pkg>` once per machine.

## Reading a red CI run

`gh run list --limit 5`, `gh run view <id> --log-failed`, or download the `out-gate`
artifact; the first failing gate step in `gate-latest.json` is the root cause.
