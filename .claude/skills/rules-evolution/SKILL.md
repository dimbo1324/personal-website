---
name: rules-evolution
description: Use when a rule proved stale, missing, contradictory or harmful, or the owner stated a constraint that must bind future sessions — changes the rule modules safely.
---

# Evolving the Rules

Read `.ai/universal/08-rules-evolution.md` first; it is binding.

1. Decide whether the change only clarifies or corrects (allowed autonomously) or
   loosens, removes or changes policy (needs the owner's explicit approval — ask and
   stop).
2. Edit exactly one concern in `.ai/universal/` (portable, no project specifics) or
   `.ai/project/`.
3. Add an entry to `.ai/CHANGELOG.md`: date (UTC), what, why, who decided.
4. Run `npm run sync-agents` — regenerates `AGENTS.md` and `.codex/`.
5. If agents or skills changed, edit them in `.claude/` only; the sync mirrors them.
6. Run `npm run sync-agents -- --check` and commit the module, the changelog and the
   generated files together.
