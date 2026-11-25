# Codex Project Configuration

Codex reads the rules through the generated `AGENTS.md` in the repository root.

- `config.toml` — project defaults (hand-edited; no secrets, no machine paths).
- `agents/*.toml` — **generated** from `.claude/agents/*.md`.
- `skills/<name>/SKILL.md` — **generated** from `.claude/skills/<name>/SKILL.md`.

Never edit the generated files. Change the source under `.ai/` or `.claude/`, then run:

```text
npm run sync-agents
```

The quality gate fails when the generated files drift from their sources.
