# Task: maximize automated test coverage

Owner instruction 2026-11-25: cover the ported site and the existing foundation with as many
meaningful automated tests as possible. Follow the project gate; no feature changes. `+` done,
`-` not done.

## Preparation

- [ ] Branch `test/maximize-coverage` from up-to-date `main`
- [ ] Record this checklist before the main work
- [ ] Choose the DOM test environment and justify the dependency

## Implementation

- [ ] Add a jsdom test environment for DOM modules (dev dependency, licence recorded)
- [ ] Cover the framework-free core: store, math/easing, tween/ticker, dom helpers, lifecycle
- [ ] Cover i18n, theme, language switch, navigation and scroll behaviour
- [ ] Cover request validation, payload, gateways, draft and form interactions
- [ ] Cover data helpers, clip catalog, gallery, theater, video carousel
- [ ] Cover telemetry charts/simulation and the SCADA widget
- [ ] Cover browser services (toast, clipboard, analytics) and canvas rendering

## Verification

- [ ] `npm run fmt`, `npm run lint`, `npm run typecheck`, `npm run test`
- [ ] Full `npm run gate` green
- [ ] `task-checklist.md` filled and committed with the work
- [ ] Final report to the owner in Russian
