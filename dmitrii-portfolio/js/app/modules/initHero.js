import { hook, hooks, qsa } from "../../core/dom.js";
import { KineticTitle } from "../../features/text/KineticTitle.js";
import { RoleTicker } from "../../features/text/RoleTicker.js";
import { HeroBackdrop } from "../../features/hero/HeroBackdrop.js";
import { ROLE_PHRASES } from "../../data/roles.js";
import { SCENE_NAMES } from "../../data/scenes.js";
import { EFFECTS } from "../../data/effects.js";

/** @param {import("../App.js").AppContext} ctx */
export function initHero({ use, i18n, store, viewport }) {
  use(hook("kinetic-title"), (root) => new KineticTitle(root));
  use(
    hook("role-ticker"),
    (root) => new RoleTicker(root, { text: hook("role-ticker-text"), phrases: ROLE_PHRASES, i18n, viewport }),
  );
  use(
    hook("hero"),
    (root) =>
      new HeroBackdrop(root, {
        canvas: hook("raster-canvas"),
        slides: hooks("hero-slide"),
        buttons: qsa("[data-scene]"),
        status: hook("scene-status"),
        statusText: hook("scene-status-text"),
        sceneNames: SCENE_NAMES,
        cycle: EFFECTS.hero,
        i18n,
        store,
        viewport,
      }),
  );
}
