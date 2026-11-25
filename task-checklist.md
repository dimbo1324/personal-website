# Task: port the vanilla prototype to the Astro stack

Owner instruction 2026-11-25: reproduce the archived prototype
(`docs/__arch__/reference/dmitrii-portfolio-prototype/`) end to end on the current
stack, one-to-one visually and behaviorally. All assets from the prototype. Messaging
integrations stay as placeholders. No new tests, no documentation updates. `+` done,
`-` not done.

## Preparation

- [+] Study the prototype: markup, 100 CSS files, 100 JS modules, locales, assets
- [+] Branch `feat/port-prototype-to-astro` from up-to-date `main`
- [+] Record this checklist before the main work

## Implementation

- [ ] Copy every asset (fonts, icons, images, videos, CVs, social) into `public/assets`
- [ ] Bring the design system CSS over intact; Tailwind v4 stays the base layer
- [ ] Rebuild the page as Astro layout, components and page composition
- [ ] Port the client application to strict TypeScript classes and controllers
- [ ] Wire i18n (EN/ES/RU), theme, navigation, scroll and reveal behavior
- [ ] Wire hero backdrop, video reel, theater mode and gallery lightbox
- [ ] Wire telemetry charts, SCADA window, dossier tabs/accordion and request form
- [ ] Keep Telegram/WhatsApp/request delivery as a placeholder, fail-safe path

## Verification

- [ ] Visual comparison against the prototype at desktop and mobile widths
- [ ] `npm run fmt`, `npm run lint`, `npm run typecheck`, `npm run build`
- [ ] Full `npm run gate` green (existing tests included)
- [ ] `task-checklist.md` filled and committed with the work
- [ ] Final report to the owner in Russian
