# Task: prepare the repository for serious development (bootstrap W0)

Owner instruction 2026-11-24: model the repository on `my-face-pay-pos` (strict AI-agent
rules for Claude, Gemini, Codex and future models, docs, gitignore, hooks, CI) for the new
stack, connect the whole stack locally, verify it and publish to `main`. Work directly on
`main` for this task (owner exception); the original mockup moved to `docs/__arch__/`.
`+` done, `-` not done.

## Preparation

[+] Study the reference repository (rules, agents, skills, hooks, CI, docs, xtask)
[+] Archive the prototype into `docs/__arch__/reference/dmitrii-portfolio-prototype/`
[-] Commit this checklist before the main work (bootstrap exception: committed together with the work)

## Implementation

[+] Root configs: `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, Prettier, ESLint
[+] Stack: Astro 7, Tailwind v4, TypeScript strict, Lucide, Wrangler, Vitest; placeholder page
[+] Pages Function `POST /api/lead` with Turnstile and Telegram, WhatsApp link builder
[+] Task runner `tools/xtask` and git hooks (format on commit, message check, quick gate on push)
[+] Rule modules `.ai/universal` and `.ai/project`, `CLAUDE.md`, `GEMINI.md`, generated `AGENTS.md`
[+] `.claude/` and `.codex/` (agents, skills, settings), `.github/` (CI, templates, Dependabot)
[+] Documentation: README, SECURITY, overview, invariants, ROADMAP, open questions, stack register

## Verification

[ ] `npm run sync-agents` generates AGENTS.md within the budget
[ ] `npm run gate` green (rules sync, format, entry points, git clean, ESLint, types, tests, build)
[ ] Local runtime check: `wrangler pages dev` serves the page and `/api/lead` fails closed
[+] Hooks installed; the commit-msg hook rejected update; the pre-push quick gate caught an entry-point rule bug (fixed)

## Completion

[+] Fill this checklist honestly and commit
[ ] Push to `origin/main`; check the CI run
[+] Final report to the owner in Russian
