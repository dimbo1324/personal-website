import { hook, hooks } from "../../core/dom";
import { HeaderScrollState } from "../../features/scroll/HeaderScrollState";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { BrandMark } from "../../features/brand/BrandMark";
import { EFFECTS } from "../../data/effects";
import type { AppContext } from "../types";

/** Header components: scroll state, theme orb and the two-sided brand. */
export function initHeader({ use, scroll, theme, store, i18n }: AppContext): void {
  use(hook("site-header"), (root) => new HeaderScrollState(root, scroll));
  use(hook<HTMLButtonElement>("theme-toggle"), (root) => new ThemeToggle(root, theme, store, i18n));
  use(
    hook<HTMLAnchorElement>("brand"),
    (root) =>
      new BrandMark(root, {
        name: hook("brand-name") ?? root,
        hint: hook("brand-hint") ?? root,
        letters: hooks("brand-letter"),
        emblem: EFFECTS.emblem,
      }),
  );
}
