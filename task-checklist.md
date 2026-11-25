# Task: UI visual polish (calmer, cleaner, modern)

Owner instruction: improve visual styling — cleaner, calmer, more modern,
less cluttered — with point-wise CSS/token edits only. `+` done, `-` not done.

## Preparation

- [+] Branch `style/ui-polish-calm` from up-to-date `main`
- [+] Reviewed design-system files (tokens, palettes, typography, components, sections)

## Visual improvements

- [+] Narrow `--container-max` to 1160px (tokens.css)
- [+] Soften dark-theme backgrounds and card/window shadows (palette-dark.css)
- [+] Soften light-theme backgrounds and card/window shadows (palette-light.css)
- [+] Subtle lift on button hover (primary, secondary, ghost) + calmer letter-spacing (button.css)
- [+] Softer input focus-ring intensity (form-field.css)

## Verification and completion

- [+] `npm run fmt`, `npm run lint`, `npm run typecheck`, `npm run test`
- [+] Full `npm run gate` green
- [+] `task-checklist.md` filled and committed
- [+] Fast-forward merge into `main`, push to `origin/main`, branch deleted
- [-] Final short report (in final answer)
