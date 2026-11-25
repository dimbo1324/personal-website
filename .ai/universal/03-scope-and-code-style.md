# Scope Control and Code Style

Purpose: change only what the task requires, and keep code readable without decoration.

## Minimal changes

- Touch only what the current task needs. Forbidden without necessity:
  mass-reformatting other files, renaming things outside the task, changing
  architecture "while at it", rewriting working code without cause, changing UI when
  the task is not about the interface, deleting existing functionality without a
  direct requirement.
- If you discover an unrelated problem, record it separately (report it, or file it per
  the project's process) — do not mix it into the current diff.
- Do not create new documentation (README, `.md`, `.txt`) unless the task requires it
  directly. Exception: the project's designated architecture and progress documents,
  which must be kept current.

## Formatting is mechanical

- Formatting is done by the project's formatters, never by hand and never argued about.
  Run the project's format command before committing; the commit hook does it for staged
  files, and the gate rejects anything unformatted.
- Never fight a formatter with ad-hoc skip attributes. If its output is genuinely wrong,
  propose a configuration change instead.

## Comments

- No comments by default. Code must be clear through structure and naming.
- A comment is allowed only when the task demands it, or when important logic stays
  non-obvious even with good naming. It explains the non-obvious "why", never restates
  the code.
- Public API documentation is allowed where it states a contract the signature cannot:
  units, invariants, error conditions, thread-safety, security assumptions.
- Stale, false, or misleading comments are forbidden. No doc comments that merely
  repeat a function name.

## File size

- Regular code files: keep under roughly 1000 lines; split by meaning when approaching
  the limit. Projects may set a stricter limit — the stricter limit wins.
- Exemptions: test files, developer-tool scripts, and any files the project explicitly
  exempts.

## Entry points

An entry point in any language (`main`, build script, launcher, serverless handler,
script, hook) sits in a file of at most 10 lines of code, 15 at the very most (comments,
imports, attributes, blank lines not counted); the work goes to other files, however small.
The file opens with this marker in its comment syntax (after a required shebang):

```text
// -----------
// entry point
// -----------
```

## Interface restraint

- No visual polish (styling, animations, decorative elements, redesign) unless the task
  is explicitly about appearance.
- When a task needs an interface, build the minimum that exercises the business logic
  correctly.
- Never change visual style, interface structure, component behavior, or user flows
  without a direct requirement.
