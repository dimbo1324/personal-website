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
