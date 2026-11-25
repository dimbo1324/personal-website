---
name: code-review
description: Use before finalizing any non-trivial change — a structured self-review of the diff against the project rules.
---

# Code Review

1. Collect the diff: `git diff main...HEAD` and `git status --short`.
2. Run `npm run gate:quick`; a red quick gate ends the review — fix first.
3. Walk the checklist, most severe first:
   - **Security**: no secrets, tokens or visitor data in code, logs, responses or client
     bundles; fail-closed on every error path; CSP not loosened.
   - **Correctness**: edge cases, error handling without swallowing, upstream failures.
   - **Design**: behaviour in classes, `fetch` injected, no logic in components or entry
     files, entry points stay small.
   - **Tests**: new behaviour and fixed bugs covered, including failure paths.
   - **Accessibility**: labels, `alt`, focus states, keyboard operation.
   - **Scope**: nothing unrelated; no stray files; no debug leftovers.
   - **Docs**: `overview.md`, `ROADMAP.md`, `README.md`, `sources.md` updated if affected.
4. For changes touching the lead pipeline, headers or dependencies, also run the
   `site-security` agent.
5. Fix what you found, re-run `npm run gate`, and list remaining risks in the final report.
