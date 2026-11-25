# AI Assistant Rule Modules

Single source of truth for the rules that govern every AI assistant (Claude Code, Codex,
Gemini CLI, Cursor, GitHub Copilot, and any future agent — Anthropic, OpenAI, Google,
open-source or boxed) working in this repository.

## How it works

```text
.ai/universal/*.md   Portable rules, valid for any project. No project names, paths or
                     stack specifics.
.ai/project/*.md     Rules specific to this website: map, commands, engineering rules,
                     progress tracking, logging, web and lead security, command reference.
CLAUDE.md            Claude Code entry point. Imports every module with @path syntax.
AGENTS.md            Entry point for Codex, Gemini (through GEMINI.md), Cursor, Copilot.
                     GENERATED from the modules. Never edit by hand.
.ai/CHANGELOG.md     History of rule changes: what, why, when, who decided.
```

Modules load in filename order: `universal/01..09`, then `project/10..`. Later content
overrides earlier content, so project rules win over universal rules when they conflict.

## Editing rules

1. Edit or add a module under `.ai/universal/` or `.ai/project/`.
2. Record the change in `.ai/CHANGELOG.md`.
3. Regenerate: `npm run sync-agents`.
4. Commit the module, the changelog entry and the regenerated files together.

`npm run gate` fails when `AGENTS.md` or `.codex/` drift from their sources. The protocol
for changing rules lives in `universal/08-rules-evolution.md`.

## Size budget and tiers

Codex reads at most 32 KiB of project instructions; the sync fails above 30 KiB.

- **inline** (default) — the module is embedded in `AGENTS.md` in full.
- **extended** — only title, path and a one-line essence are embedded. Opt in with
  `<!-- tier: extended -->` in the first five lines and a single-line
  `> **Essence.** …` right after the title.

Extended rules bind exactly like inline ones. `CLAUDE.md` imports every module in full.
