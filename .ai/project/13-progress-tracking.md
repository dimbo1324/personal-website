# Project Progress Tracking

Purpose: any assistant, in any session, on any model, can locate exactly where the
project stands and where it is going — **from files, not from memory**.

## Where the truth lives

| Question                                     | File                                        |
| -------------------------------------------- | ------------------------------------------- |
| What is planned, in what order, what is done | `docs/__arch__/ROADMAP.md`                  |
| What is actually built right now             | `docs/architecture/overview.md`             |
| What must never break                        | `docs/architecture/invariants.md`           |
| Owner decisions and open questions           | `docs/__arch__/open-questions.md`           |
| Stack versions, sites and sources            | `docs/__arch__/sources.md`                  |
| The original design mockup                   | `docs/__arch__/reference/` (read-only)      |
| What the current or last task was            | `task-checklist.md`                         |
| What actually happened recently              | `git log`, as in the ritual below           |
| What the last gate run found                 | `out/reports/gate-latest.json` (local only) |
| How the rules themselves changed             | `.ai/CHANGELOG.md`                          |

## Orientation ritual — at the start of EVERY task

1. `git status --short --branch` and
   `git log -15 --date=iso-strict --pretty=format:"%h %cd %s"`.
2. `docs/__arch__/ROADMAP.md`: the next task is the first open step.
3. `docs/architecture/overview.md` — what exists in the code right now.
4. `task-checklist.md` — the previous task, and whether it finished cleanly.
5. `docs/__arch__/open-questions.md` — whether a decision changes the plan.
6. Only then plan the new task.

## For any model, however small

- Work in small steps; after each step run the narrowest relevant check, and the gate at
  the end. Do not batch many unverified edits.
- Never invent an API, file, command or package. Look it up in the repository or the
  dependency's documentation; if it cannot be confirmed, say so.
- When the task is ambiguous or touches an open decision, stop and ask the owner.
- Copy existing patterns: a new component looks like the existing ones, a new test like
  the neighbouring tests.

## Update duties when finishing work

- Completed a roadmap step → mark it in `docs/__arch__/ROADMAP.md` (Russian).
- Changed the system's shape → update `docs/architecture/overview.md`.
- Owner decision that constrains the future → `docs/__arch__/open-questions.md`.
- New invariant → `docs/architecture/invariants.md`.
- Changed a rule module → `.ai/CHANGELOG.md` and `npm run sync-agents`.
- Changed what a user can install or run → `README.md`.
- Stack changed (language, tool, library, service, API) → its row in
  `docs/__arch__/sources.md`.

## Drift guard

If the plan, the state document and the code disagree: the code is the fact, the plan
is the intent. Reconcile them in the same task or report the mismatch explicitly.

## Unfinished-task rule

If `task-checklist.md` still holds open `[ ]` items from a previous session, resolve them
first: finish them, or mark them `-` with an honest note.
