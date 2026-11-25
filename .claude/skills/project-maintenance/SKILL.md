---
name: project-maintenance
description: Use for periodic upkeep — toolchain and dependency bumps, doctor check, stale documents, out/ cleanup, hooks reinstall, CI action pins.
---

# Project Maintenance

1. `npm run doctor` — every required tool present; hooks installed.
2. Toolchain: Node version in `.nvmrc`, `package.json` engines and CI together; bump one
   thing at a time.
3. Dependencies: `npm outdated`, then one group per commit (Astro and integrations,
   Tailwind, ESLint and Prettier plugins, Vitest, Wrangler); full gate green. Update
   `docs/__arch__/sources.md` for every changed version.
4. GitHub Actions: pins in `.github/workflows/` stay full commit SHAs with the tag in a
   comment; Dependabot moves both.
5. Documents: compare `docs/architecture/overview.md`, `README.md` and
   `docs/__arch__/ROADMAP.md` with the code; fix drift.
6. `out/` is disposable: delete it freely when it grows; nothing in it is a source.
7. Record anything learned in the rule modules via the `rules-evolution` skill.
