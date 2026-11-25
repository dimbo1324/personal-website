import { hook, hooks } from "../../core/dom.js";
import { HeaderScrollState } from "../../features/scroll/HeaderScrollState.js";
import { ThemeToggle } from "../../features/theme/ThemeToggle.js";
import { BrandMark } from "../../features/brand/BrandMark.js";
import { EFFECTS } from "../../data/effects.js";

/** @param {import("../App.js").AppContext} ctx */
export function initHeader({ use, scroll, theme, store, i18n }) {
  use(hook("site-header"), (root) => new HeaderScrollState(root, scroll));
  use(hook("theme-toggle"), (root) => new ThemeToggle(root, theme, store, i18n));
  use(
    hook("brand"),
    (root) =>
      new BrandMark(root, {
        name: hook("brand-name"),
        hint: hook("brand-hint"),
        letters: hooks("brand-letter"),
        emblem: EFFECTS.emblem,
      }),
  );
}
