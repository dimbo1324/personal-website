---
name: ci-fix
description: Use when CI or a local gate step is red — locate the failing step from the out/ artifacts, reproduce, fix the root cause, re-run.
---

# Fixing a Red Gate or CI Run

1. Locate the failure:
   - local: `out/reports/gate-latest.json`, newest `out/logs/xtask/*.log`;
   - CI: `gh run list --limit 5`, `gh run view <id> --log-failed`, or download the
     `out-gate` artifact (`gh run download <id>`).
2. Reproduce with the narrowest command from `.ai/project/16-command-reference.md`.
3. Classify: code defect, formatting drift (`npm run fmt`), generated-file drift
   (`npm run sync-agents`), lock-file drift, toolchain or environment problem.
4. Fix the root cause. Forbidden: deleting or skipping tests, `eslint-disable` without a
   reason, lowering lint levels, `--no-verify`, retrying until green.
5. Re-run the failing step, then `npm run gate:quick`.
6. If the cause was a missing or wrong rule, apply the `rules-evolution` skill.
