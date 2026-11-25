---
name: lead-api-change
description: Use when the request form payload, the POST /api/lead response, an error code or an environment variable changes — keeps client, server, tests and docs in step.
---

# Changing the Lead API Contract

The contract is the pair `LeadSubmission` / validation limits in `src/lib/lead.ts` and the
response codes in `functions/lib/leadHandler.ts`.

1. Write the change as a before/after note in `task-checklist.md`; name any breaking
   change (renamed field, new required field, changed status or error code).
2. Change `src/lib/lead.ts` first; client controller and server both consume it.
3. Update `functions/lib/` and `src/scripts/lead-form.ts` together; keep the pipeline
   order from `.ai/project/15-web-and-lead-security.md`.
4. Add or update Vitest tests for success, validation failure and every failing
   upstream.
5. New or renamed environment variable → `.env.example` or `.dev.vars.example`, the table
   in `.ai/project/16-command-reference.md`, and `docs/architecture/overview.md`.
6. Run `npm run gate`; report the change and any breaking effect in the final report.
