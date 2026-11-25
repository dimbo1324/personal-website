---
name: task-episode
description: Use to plan and execute one roadmap step end to end — orientation, scoping, branch, implementation, verification, status update and report.
---

# Executing a Roadmap Step

One step of `docs/__arch__/ROADMAP.md` is one task. Do not merge two steps, and do not
skip the order without an owner decision recorded in `docs/__arch__/open-questions.md`.

## 1. Orientation (mandatory)

```text
git status --short --branch
git log -15 --date=iso-strict --pretty=format:"%h %cd %s"
```

Then read: `docs/__arch__/ROADMAP.md` (the first open step is yours),
`docs/architecture/overview.md`, `task-checklist.md`, `docs/__arch__/open-questions.md`.
Resolve open `[ ]` items of a previous task first.

## 2. Planning

For a large step, delegate scoping to the `site-task-planner` agent. Write
`task-checklist.md` (preparation / implementation / verification / completion) and commit
it before writing code.

## 3. Branch

```text
git checkout main
git pull --ff-only origin main
git checkout -b feat/short-description
```

## 4. Implementation

Small verified steps. Delegate to `site-frontend-astro` or `site-edge-functions` where it
helps. Every new behaviour gets tests; every lead API change goes through the
`lead-api-change` skill.

## 5. Verification

`npm run gate`, then the `code-review` skill. Changes touching the lead pipeline, headers
or dependencies also go through the `site-security` agent.

## 6. Completion

- Mark checklist items `+`/`-` honestly.
- Mark the step in `docs/__arch__/ROADMAP.md` (Russian).
- Update `docs/architecture/overview.md` if the system's shape changed.
- Apply the `rules-evolution` skill if the step exposed stale or missing rules.
- Fast-forward merge into `main` only with a green full gate and the owner's go-ahead.
- Final report to the owner in Russian: done, verified, not done.
