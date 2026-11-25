# Project Commands and Quality Gates

<!-- tier: extended -->

> **Essence.** Every routine job goes through `npm run xtask -- …` or its shortcuts (`npm run gate`, `fmt`, `lint`, `typecheck`, `test`, `sync-agents`, `doctor`); never bare `prettier`/`eslint` sequences; the full `npm run gate` must be green before merging to `main`, the quick gate before any push; edit `.ai/` and `.claude/` sources, then `npm run sync-agents`.

All commands run from the repository root (Windows: PowerShell or Git Bash). Requires
Node.js 22+ and npm; run `npm install` once per clone, then `npm run xtask -- install-hooks`.

## The xtask runner — the one door

```text
npm run gate                      full gate: rules sync, format, entry points, git-clean
                                  safety, ESLint, astro check + tsc, Vitest, astro build
npm run gate:quick                quick gate (what the pre-push hook runs): the first five
npm run fmt / fmt:check           Prettier write / verify
npm run lint                      ESLint
npm run typecheck                 astro check and functions/tsconfig.json
npm run test                      Vitest (JUnit result in out/test-results/)
npm run sync-agents               regenerate AGENTS.md and .codex/ from .ai/ and .claude/
npm run doctor                    read-only toolchain diagnostics
npm run xtask -- install-hooks    once per clone: format on commit, message check, gate on push
npm run dev                       Astro dev server
npm run build                     static build into dist/
npm run preview:cf                wrangler pages dev dist (runs Pages Functions locally)
```

Every xtask invocation leaves a transcript in `out/logs/xtask/` and the gate leaves
`out/reports/gate-latest.json`.

## Gate policy

- The full gate must be green before merging into `main`; the quick gate is the minimum
  for any push. Documentation- and configuration-only changes still run it.
- `sync-agents --check` is part of the gate: drift between `AGENTS.md`/`.codex/` and
  their sources breaks the build on purpose.
- CI (`.github/workflows/ci.yml`) runs the same gate. A red CI run is read through the
  uploaded `out/` artifact before guessing.

## Formatting

Prettier (with the Astro and Tailwind plugins) formats everything; never by hand. The
pre-commit hook formats staged files; a partially staged file is skipped and named.

## Assistant workspaces — source and mirrors

- `.ai/universal/*.md`, `.ai/project/*.md` → generated `AGENTS.md`.
- `.claude/agents/*.md` → generated `.codex/agents/*.toml`.
- `.claude/skills/<name>/SKILL.md` → generated `.codex/skills/<name>/SKILL.md`.
- Edit only the sources, then `npm run sync-agents` and commit both sides.

Local secrets for `wrangler pages dev` go to `.dev.vars` (copy `.dev.vars.example`);
build-time public values go to `.env` (copy `.env.example`). Neither is ever committed.
