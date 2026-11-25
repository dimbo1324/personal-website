import { hook } from "../../core/dom";
import { FlagBackdrop } from "../../features/footer/FlagBackdrop";
import { FlapBoard } from "../../features/footer/FlapBoard";
import { LocalClock } from "../../features/footer/LocalClock";
import { renderCurrentYear } from "../../features/footer/CurrentYear";
import { CONTACT } from "../../data/contact";
import type { AppContext } from "../types";

/** Footer flag, arrivals flap board, local clock and copyright year. */
export function initFooter({ use, viewport }: AppContext): void {
  use(
    hook("flag-backdrop"),
    (root) =>
      new FlagBackdrop(root, {
        video: hook<HTMLVideoElement>("flag-video") ?? document.createElement("video"),
        observeTarget: hook("site-footer") ?? root,
        viewport,
      }),
  );
  use(hook("flap-board"), (root) => new FlapBoard(root, { viewport }));
  use(
    hook<HTMLTimeElement>("local-clock"),
    (root) => new LocalClock(root, { timeZone: CONTACT.timeZone, viewport }),
  );
  renderCurrentYear(hook("current-year"));
}
