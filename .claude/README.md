# Claude Code Project Configuration

Durable rules live in the shared modules under `.ai/`; `CLAUDE.md` imports them. Codex,
Gemini and other tools read the same modules through the generated `AGENTS.md`.

## Files

- `settings.json` — allowlist for routine read and verification commands; denylist for
  destructive git operations, hook bypass, deploys, secret commands and reading
  `.env`/`.dev.vars`.
- `agents/` — project subagents. **Source of truth**: `npm run sync-agents` generates
  `.codex/agents/*.toml` from them.
- `skills/` — reusable workflows. **Source of truth** for `.codex/skills/`.

## Delegation

Do task-owning work on the main thread; delegate independent work:

| Agent                   | Use for                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `site-task-planner`     | scope a roadmap step before coding                          |
| `site-frontend-astro`   | Astro pages, layouts, Tailwind, Lucide, browser controllers |
| `site-edge-functions`   | Pages Functions, Turnstile, Telegram, WhatsApp, `_headers`  |
| `site-security`         | security review and security-sensitive implementation       |
| `site-quality-reviewer` | review a diff before finalizing                             |
| `site-ci-triage`        | a red gate step or CI job                                   |
| `site-repo-maintainer`  | rules sync, state documents, dependency bumps               |

Skills: `task-episode`, `code-review`, `ci-fix`, `lead-api-change`, `rules-evolution`,
`project-maintenance`.

Personal overrides go to `settings.local.json` (git-ignored).
