<!--
GENERATED FILE - DO NOT EDIT.
Source of truth: .ai/universal/*.md and .ai/project/*.md.
Edit a module, then run: npm run sync-agents
-->

# Personal Website - working notes for Codex, Gemini and other AI assistants

This file is assembled from the shared rule modules in `.ai/`, so every assistant follows
identical rules. Later sections override earlier ones; an explicit owner instruction in the
current conversation overrides everything. Start every task with the orientation ritual in
the progress-tracking module.

---

<!-- module: .ai/universal/01-workflow.md -->

# Workflow: Git, Branches, Commits

Purpose: every task follows one predictable git cycle. No exceptions without an
explicit owner instruction in the current conversation.

## Branch discipline

- NEVER develop directly on `main`.
- Start every task from up-to-date `main`:
  `git checkout main` → `git pull --ff-only origin main` → `git checkout -b <branch>`.
- Branch name format: `type/short-task-description`
  (types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `ci`, `perf`, `security`).
- Uninformative branch names (`test`, `fix`, `work`, `final`, `new`) are forbidden.
- Merge into `main` only fast-forward (`git merge --ff-only`) and only after the
  project's full quality gate is green.
- Push to `origin/main` only when the owner explicitly asked for a publish within the
  current task. Work-in-progress branch pushes are allowed (for example, to publish
  the task checklist before starting work).
- Delete the task branch after it is merged.

## Commits

- Message format: `type: short description of what and why`.
- One commit = one logically complete unit. Do not mix a bug fix, a refactor,
  formatting, and new features in a single commit unless they are one inseparable task.
- Forbidden messages: `fix`, `update`, `wip`, `changes`, `final`, `123`.
- Keep commits attributable: include the assistant identity trailer the project already
  uses (check a recent `git log` for the convention).

## Quality gate before merge

- Run the project's checks (see the project commands module) before merging.
- If mandatory checks fail, merging into `main` is forbidden until fixed or the owner
  explicitly decides otherwise.
- Before merging, self-review the diff: changes match the task, no stray files, no
  debug leftovers, no secrets, no accidental unrelated edits.

When unsure whether an action counts as "explicitly requested": ask, or stop after the
branch commit and report instead of pushing.

---

<!-- module: .ai/universal/02-task-checklist.md -->

# Task Checklist and Definition of Done

Purpose: every task is planned before it starts and honestly accounted for after it
ends, in a file any reviewer can read without the conversation.

## task-checklist.md protocol

A file named `task-checklist.md` lives in the repository root and is always tracked by
git (never in `.gitignore`).

Before starting a task:

1. Clear or recreate `task-checklist.md` for the new task.
2. Write the main stages, checks, and expected outcomes as `[ ]` items, grouped into
   short sections (preparation / implementation / verification / completion).
   Moderate detail — stages, not keystrokes.
3. Commit the checklist BEFORE doing the main work.

After finishing the task:

4. Mark every item: `+` done, `-` not done or partially done.
5. Commit the filled checklist together with the completed work.
6. Never hide unfinished items — a `-` with an honest note is correct; a silently
   ignored item is a violation.

## Definition of Done

A task is complete only when ALL of the following hold:

- code written and matching the task, without unrequested scope;
- code formatted; lint and type checks pass;
- tests added or updated where reasonable; existing tests pass;
- project builds; no obvious errors in logs;
- no secrets, no temp files, no accidental changes in unrelated files;
- architecture and state docs updated if the task changed the system's shape;
- task checklist filled with `+`/`-`;
- final report written.

## Final report

The final report is ALWAYS the last step of a task. It states: what was done; which
files and areas changed; which checks ran and their results; dependency, API, database,
or config changes; security, performance, and compatibility risks; and — explicitly and
honestly — anything that was not done or failed.

---

<!-- module: .ai/universal/03-scope-and-code-style.md -->

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

---

<!-- module: .ai/universal/05-security-and-secrets.md -->

# Security, Secrets, Dependencies, Portability

Purpose: nothing sensitive in the repo; every change safe within its area; the project
runs on any machine.

## Secrets — absolute ban

- NEVER put in code, git, tests, docs, or examples: passwords, API keys, tokens,
  private keys, real credentials, cookies, production `.env`, or personal user data.
- Secrets live only in `.env` / `.dev.vars` (untracked), environment variables, secret
  managers, or CI/CD secrets. The repo may contain only safe `*.example` files.
- A secret that ever reached git is compromised: rotate it; deleting the line in a new
  commit is not enough.

## Security in every task

Check within the area you touch: authorization and access rights, input validation,
injection, XSS and CSRF where applicable, unsafe redirects, file uploads, personal data
handling, public endpoints, token storage and transport, and access to admin functions.
Security is part of every task.

## Dependencies

- No new dependency without justification: what for, can it be done without, is it
  maintained, known vulnerabilities, stack compatibility, does it duplicate an existing
  dependency, is it too heavy for the need.
- No heavy library for one small function.
- After changing dependencies: update the lock file and verify the build.
- A new production dependency must be named in the final report.

## Portability

- No machine-specific values in code (paths, usernames): they go to
  configuration.
- Runnable by someone else with the documented tools: nothing needed to build may be
  git-ignored; `git clean -fdX` must leave the project rebuildable (a gate stage checks).

---

<!-- module: .ai/universal/06-quality-and-testing.md -->

# Quality: Tests, Errors, Data, Contracts, Performance

Purpose: changes are verified, honest about failure, and safe to release.

## Tests

- Cover new or changed code where reasonable: the happy path, validation errors, edge
  cases, access rights, service and storage behavior, and regressions for fixed bugs.
- NEVER delete, disable, or weaken tests just to make a build green.
- If tests were not added, say why in the final report.
- Prefer the project's designated check runner over ad-hoc command sequences, and keep
  that runner updated when a task adds an important new part of the system.

## Errors and logging

- Handle errors explicitly. Forbidden: silently swallowed errors, empty catch blocks,
  debug logs left after the task, secrets or personal data in logs, print-style
  debugging instead of real handling.
- Logs must say where it broke, which component, what context matters, and how critical
  it is. Useful, not noisy.

## Contracts

- When a task changes an API or an artifact format, update the contract and generated
  types.
- Never silently change field names, data types, response structure, error codes,
  parameter requiredness, or endpoint behavior.
- Any breaking change must be named explicitly in the final report.

## Performance and releases

- No premature optimization, but no obviously wasteful patterns: redundant calls,
  heavy per-request computation, render loops, blocking operations in responsive paths.
- If a change may affect performance, say so in the final report.
- Every change should be revertible; for risky changes plan the rollback before merging.
- Large new features ship behind a feature flag where the project supports them;
  unfinished functionality must not be reachable by accident; stale flags get removed
  after stabilization.

---

<!-- module: .ai/universal/07-multi-assistant.md -->

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

---

<!-- module: .ai/project/10-project-map.md -->

# Project: Personal Website

The personal website and engineering portfolio of Dmitrii Prikhodko (Industrial
Automation, IIoT and Software Engineer, based in Montevideo). Trilingual (EN / ES / RU),
static-first, deployed on Cloudflare Pages from GitHub `main`. Visitors reach the owner
through a request form (Turnstile-protected, delivered to Telegram) or WhatsApp
Click-to-Chat.

**Current phase: foundation.** The repository, rules and toolchain are ready; the site
itself is rebuilt from the archived prototype (`docs/__arch__/reference/dmitrii-portfolio-prototype/`,
read-only) in later tasks. The prototype is a design reference, never code to copy blindly.

## Stack (owner decision 2026-11-24)

- Astro 7 (static output), TypeScript strict, Tailwind CSS v4 (`@tailwindcss/vite`),
  Lucide icons (`@lucide/astro`); interactivity is vanilla TS, React or Svelte only
  point-wise when justified.
- Cloudflare Pages Functions (`functions/`) call Cloudflare Turnstile `siteverify` and the
  Telegram Bot API; WhatsApp is a plain `wa.me` link. Hosting and auto-deploy: Cloudflare
  Pages connected to GitHub. Node.js 22+ locally (`.nvmrc` pins 24).

## Repository map

- `src/` — Astro site: `pages/`, `layouts/`, `lib/` (framework-free domain logic shared with
  functions), `scripts/` (browser controllers), `styles/`.
- `functions/` — Pages Functions: `api/*.ts` are thin entries, `lib/` holds the logic.
- `public/` — static files copied as is, including `_headers` (CSP and security headers).
- `tests/` — Vitest unit tests; `tools/xtask/` — the task runner and quality gate.
- `docs/architecture/` — English, what is built; `docs/__arch__/` — Russian internal documents.
- `.ai/`, `.claude/`, `.codex/`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` — assistant rules.
- `out/` — git-ignored output of every run; `dist/` — build result (git-ignored).

## Language policy

- **English**: code, identifiers, comments, commit messages, tests, `.ai/`, `.claude/`,
  `.codex/`, `CLAUDE.md`, `AGENTS.md`, `task-checklist.md`, `README.md`, `docs/architecture/`.
- **Russian**: internal documents in `docs/__arch__/` and every report to the owner.
- Visitor-facing text is not hard-coded in components: it lives in per-language content
  files (EN, ES, RU) once the site content task begins.

Do not mix languages inside one file.

---

<!-- module: .ai/project/12-engineering-rules.md -->

# Engineering Rules and House Style

These sharpen the universal rules for this codebase. Stricter wins.

## Priorities, in order

1. **Security and privacy** — the lead endpoint is public and holds third-party secrets
   (Telegram token, Turnstile secret). A convenience that weakens protection is wrong.
2. **Correctness** — fail closed: an error, timeout or unverified token never becomes
   "delivered". No mock-success paths outside test code.
3. **Clean, readable code** — strict TypeScript, small cohesive classes, clear names.
4. **Accessibility and performance** — semantic HTML, keyboard and screen-reader support,
   static-first pages, minimal client JavaScript, measured rather than guessed.
5. **Visual polish** — only when the task is about appearance.

## Design

- Behaviour lives in classes with `#private` state and explicit methods (as in
  `WhatsAppLinkBuilder`, `LeadValidator`); free functions only for tiny pure helpers.
- Depend on abstractions at boundaries: `fetch` is injected (`FetchLike`) so every
  external call is testable with a fake. Domain logic in `src/lib/` and `functions/lib/`
  never touches the DOM or `process`.
- Astro components render; they do not hold business rules. Browser behaviour is a
  controller class in `src/scripts/` mounted by a small inline script.
- Make illegal states unrepresentable: discriminated unions for results (`{ ok: true }`
  | `{ ok: false; code }`), no `any`, no non-null assertions to silence the compiler.

## TypeScript

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `erasableSyntaxOnly` (no enums, no parameter properties) — the xtask runs under
  Node's native type stripping and relative imports there end in `.ts`.
- ESLint forbids `console`, `eval`, `any` and loose equality outside `tools/`.

## Layout

- Pages Functions: `functions/api/*.ts` only wire a handler (entry-point rule); logic in
  `functions/lib/`. Code shared with the browser stays in `src/lib/` and has no runtime
  dependencies.
- Env access: public build-time values via `import.meta.env.PUBLIC_*`; secrets only from
  the Functions `env` object, never bundled into client code.

## Frontend

- Icons come from `@lucide/astro`; import by name, no icon fonts or copied SVG sprites.
- Tailwind v4 utilities in markup; tokens and theme in `src/styles/global.css`
  (`@theme`). No inline `style` for static values.
- Interactivity is vanilla TS by default. React or Svelte only for an island that
  genuinely needs it; adding a UI framework needs a justification in the final report.
- Every interactive element is keyboard reachable with a visible focus state; images
  have `alt`; forms have labels.

## Dependencies and licences

- Every new dependency is justified in the final report (why, maintenance, licence) and
  recorded in `docs/__arch__/sources.md`. Only licences that allow commercial use
  (MIT, ISC, Apache-2.0, BSD) are accepted.

---

<!-- module: .ai/project/13-progress-tracking.md -->

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

---

<!-- module: .ai/project/15-web-and-lead-security.md -->

# Web and Lead Security Guardrails

The request form is the only server-side surface and it forwards visitor data to a
third party (Telegram). These rules hold in every task and override convenience.

## Lead pipeline (`POST /api/lead`)

- Order is fixed and fail-closed: Origin check → content-type and size limit → JSON
  parse → schema validation (with honeypot) → Turnstile `siteverify` → Telegram delivery.
  A step that errors, times out or is unconfigured ends in a non-2xx answer, never success.
- Turnstile is verified server-side on every request; the token is single-use; the site
  key is public, the secret key exists only as a Cloudflare secret or in `.dev.vars`.
- The response never echoes visitor input or upstream error bodies; only stable codes.
- Telegram token and chat id live only in the Functions `env`. No secret is ever
  exposed through `PUBLIC_*` variables, `import.meta.env`, client bundles or logs.
- Validation limits live in `src/lib/lead.ts` and are the single source for client and
  server; the client check is a convenience, the server check is the authority.

## Transport and headers

- CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `nosniff` come from
  `public/_headers`. Allowed third-party origin: `https://challenges.cloudflare.com`
  (Turnstile) only. Adding any other origin needs an owner decision.
- No inline event handlers; no `eval`; user-supplied text is inserted with `textContent`,
  never `innerHTML`.
- External links opened in a new tab carry `rel="noopener noreferrer"`.

## Privacy

- Visitor data (name, contact, message) is forwarded to the owner's Telegram chat and
  stored nowhere else: no database, no logs, no analytics events.
- WhatsApp is a `wa.me` link built by `WhatsAppLinkBuilder`; the phone number is public
  by nature and comes from `PUBLIC_WHATSAPP_PHONE`.

## Supply chain

- Lock file committed; `npm install` changes are reviewed; new packages are justified
  (universal security module) and use permissive licences.
- GitHub Actions are pinned to full commit SHAs with the release tag in a comment.

---

<!-- module index: extended -->

# Modules loaded on demand

These rules bind exactly like the inlined ones; only their full text lives outside this
file, to stay within the instruction budget. Read the file itself when a task touches it -
that is an obligation, not a suggestion.

## Architecture Boundaries, Workarounds, Tech Debt

File: `.ai/universal/04-architecture-boundaries.md`

Follow the existing layering (no business logic in handlers or UI, no storage access around repositories, no circular dependencies); propose a structural change instead of hacking around it; every workaround and tech-debt item is recorded explicitly, never hidden.

## Rules Evolution: Keeping the Instructions Current

File: `.ai/universal/08-rules-evolution.md`

Never weaken a rule to make a task easier — propose changes instead; autonomous edits may only clarify or correct, never loosen; every change needs a changelog entry and a regenerated entry point.

## Time and Timestamps: Never Take a Date Without Its Moment

File: `.ai/universal/09-time-and-timestamps.md`

Read and report every date at full precision — hours, minutes, seconds, zone. For git use `--date=iso-strict` (`git log --pretty=format:"%h %cd %s"`); `--oneline`, `--date=short` and "2 days ago" never answer _when_.

## Project Commands and Quality Gates

File: `.ai/project/11-commands.md`

Every routine job goes through `npm run xtask -- …` or its shortcuts (`npm run gate`, `fmt`, `lint`, `typecheck`, `test`, `sync-agents`, `doctor`); never bare `prettier`/`eslint` sequences; the full `npm run gate` must be green before merging to `main`, the quick gate before any push; edit `.ai/` and `.claude/` sources, then `npm run sync-agents`.

## Logging and Observability

File: `.ai/project/14-logging.md`

Tooling logs into `out/` (git-ignored); the xtask runner transcribes every run to `out/logs/xtask/`; Functions log one structured line per meaningful step with a request id and an error code; never log secrets, tokens, the visitor's message text, contact details or IP addresses.

## Command Reference: Per-Tool Commands and Platform Notes

File: `.ai/project/16-command-reference.md`

Lookup material — raw tool commands behind xtask, Cloudflare Pages and Wrangler usage, environment variables, Windows quirks and reading a red CI run; the gate and always-apply policies live in `11-commands.md`.
