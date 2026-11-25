# Multi-Assistant Collaboration

Purpose: several AI assistants and humans work in this repository across separate
sessions; git is the coordination surface and the rule modules are shared.

## Coordination through git

- Before non-trivial work, check
  `git log -10 --date=iso-strict --pretty=format:"%h %cd %s"` and
  `git status --short --branch`: recent commits may be another assistant's finished
  work — not yours to redo or second-guess.
- Never rewrite history on another assistant's in-flight branch. Build on top of it or
  ask first.
- Keep commits attributable: include the assistant identity trailer the project already
  uses (see recent `git log` for the convention).

## Shared rule modules

- All assistants obey the same rules from `.ai/universal/` and `.ai/project/`. There is
  exactly one source of truth.
- Claude Code loads the modules through `CLAUDE.md` imports. Every other assistant
  (Codex, Gemini, Cursor, Copilot and any tool that reads `AGENTS.md`) gets the same
  modules through the GENERATED `AGENTS.md`. Never hand-edit a generated file; edit the
  source and run the project's sync command (see the commands module).
- Per-assistant workspaces follow the same principle: one hand-edited source, generated
  mirrors. The project commands module names which side is the source.
- When a task changes shared behavior (workflow, gates, style, guardrails), change the
  module once — every assistant picks it up after the sync.

## Session hygiene for any model

- Re-read plans and rule files from disk instead of trusting memory of a previous
  session — files change between sessions.
- When context is shaky or the task is large, restate the task's acceptance criteria in
  the checklist before coding, and verify against files, not recollection.
- If two rules appear to conflict: the project module wins over the universal module;
  an explicit owner instruction in the current conversation wins over both. Say out
  loud which rule you chose and why.
