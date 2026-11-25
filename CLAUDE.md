# Personal Website — working notes for Claude Code

All rules live in shared modules under `.ai/` — the single source of truth for every AI
assistant in this repository. Codex, Gemini and other tools read the same modules
through the generated `AGENTS.md`; never edit that file by hand (edit a module, then run
`npm run sync-agents`).

Later modules override earlier ones; an explicit owner instruction in the current
conversation overrides everything. Reports to the owner are written in Russian.

## Starting a fresh session

Sessions often begin with no context. Before any work, run the orientation ritual from
`@.ai/project/13-progress-tracking.md`: git status and log → `docs/__arch__/ROADMAP.md`
→ `docs/architecture/overview.md` → `task-checklist.md` → `docs/__arch__/open-questions.md`.

Routine jobs go through `npm run xtask -- …` and its npm shortcuts (catalog in
`@.ai/project/11-commands.md`). Run `npm run gate` before declaring a task done.

## Universal rules

- @.ai/universal/01-workflow.md
- @.ai/universal/02-task-checklist.md
- @.ai/universal/03-scope-and-code-style.md
- @.ai/universal/04-architecture-boundaries.md
- @.ai/universal/05-security-and-secrets.md
- @.ai/universal/06-quality-and-testing.md
- @.ai/universal/07-multi-assistant.md
- @.ai/universal/08-rules-evolution.md
- @.ai/universal/09-time-and-timestamps.md

## Project rules

- @.ai/project/10-project-map.md
- @.ai/project/11-commands.md
- @.ai/project/12-engineering-rules.md
- @.ai/project/13-progress-tracking.md
- @.ai/project/14-logging.md
- @.ai/project/15-web-and-lead-security.md
- @.ai/project/16-command-reference.md

## Claude Code workspace

- `.claude/settings.json` — permission allow and deny lists.
- `.claude/agents/` — project subagents (`site-*`); the source for `.codex/agents/`.
- `.claude/skills/` — reusable workflows; the source for `.codex/skills/`.
