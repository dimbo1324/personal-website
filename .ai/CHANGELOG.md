# Rule Changelog

Newest first. Each entry: date (UTC), what changed, why, who decided.

## 2026-11-24

- Created the rule system for the Personal Website: universal modules 01–09 (ported from the
  owner's FacePay POS repository, with stack specifics removed) and project modules 10–16
  (project map, commands, engineering rules, progress tracking, logging, web and lead
  security, command reference). Why: the site is built mostly by AI assistants across
  sessions and models (Claude, Gemini, Codex and later others); every one must share one
  rule set. Decided by: owner.
- Stack fixed by the owner: Astro 7, TypeScript, Tailwind CSS v4, Lucide, Cloudflare Pages
  with Pages Functions, Turnstile, Telegram Bot API, WhatsApp Click-to-Chat, Node.js 22+.
- Owner exception for the bootstrap task only: work and publish directly on `main`
  (branch rule in `01-workflow.md` applies from the next task on).
- The task runner is a TypeScript `xtask` (`tools/xtask/`, `npm run xtask -- …`) instead of
  `cargo xtask`; the entry-point rule also covers `functions/api/*.ts` Pages Function entries.
