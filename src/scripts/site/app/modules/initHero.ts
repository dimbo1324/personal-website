import { hook, hooks, queryAll } from "../../core/dom";
import { KineticTitle } from "../../features/text/KineticTitle";
import { RoleTicker } from "../../features/text/RoleTicker";
import { HeroBackdrop } from "../../features/hero/HeroBackdrop";
import { ROLE_PHRASES } from "../../data/roles";
import { SCENE_NAMES } from "../../data/scenes";
import { EFFECTS } from "../../data/effects";
import type { AppContext } from "../types";

/** Hero title, role ticker and the rendered backdrop. */
export function initHero({ use, i18n, store, viewport }: AppContext): void {
  use(hook("kinetic-title"), (root) => new KineticTitle(root));
  use(
    hook<HTMLButtonElement>("role-ticker"),
    (root) =>
      new RoleTicker(root, {
        text: hook("role-ticker-text") ?? root,
        phrases: ROLE_PHRASES,
        i18n,
        viewport,
      }),
  );
  use(
    hook("hero"),
    (root) =>
      new HeroBackdrop(root, {
        canvas: hook<HTMLCanvasElement>("raster-canvas") ?? document.createElement("canvas"),
        slides: hooks<HTMLImageElement>("hero-slide"),
        buttons: queryAll<HTMLButtonElement>("[data-scene]"),
        status: hook("scene-status") ?? root,
        statusText: hook("scene-status-text") ?? root,
        sceneNames: SCENE_NAMES,
        cycle: EFFECTS.hero,
        i18n,
        store,
        viewport,
      }),
  );
}
