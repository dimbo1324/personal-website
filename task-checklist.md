# Task: maximize automated test coverage

Owner instruction 2026-11-25: cover the ported site and the existing foundation with as many
meaningful automated tests as possible. Follow the project gate; no feature changes. `+` done,
`-` not done.

## Preparation

- [+] Branch `test/maximize-coverage` from up-to-date `main`
- [+] Record this checklist before the main work
- [+] jsdom chosen for DOM modules, pure logic stays in the node environment

## Implementation

- [+] Added jsdom as a dev dependency (MIT, licence and version recorded in `docs/__arch__/sources.md`)
- [+] Covered the framework-free core: store, math/easing, tween/ticker, dom helpers, lifecycle, SafeStorage
- [+] Covered i18n, theme, language switch, navigation and scroll behaviour
- [+] Covered request validation, payload, gateways, draft and form interactions
- [+] Covered data helpers, clip catalog, gallery, theater, video carousel
- [+] Covered telemetry charts/simulation and the SCADA widget
- [+] Covered browser services (toast, clipboard, analytics) and canvas rendering
- [+] Covered the server-side foundation: Turnstile verifier and Telegram notifier
- [+] Fixed two defects uncovered by the tests: unknown remote image id did not throw,
  and the Open Graph locale was not switched with the language

## Verification

- [+] `npm run fmt`, `npm run lint`, `npm run typecheck`, `npm run test`
- [+] Full `npm run gate` green: 37 test files, 149 tests, all 8 stages PASS
- [+] `task-checklist.md` filled and committed with the work
- [+] Final report to the owner in Russian
