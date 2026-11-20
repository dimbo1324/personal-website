import { hook } from "../../core/dom.js";
import { FlagBackdrop } from "../../features/footer/FlagBackdrop.js";
import { FlapBoard } from "../../features/footer/FlapBoard.js";
import { LocalClock } from "../../features/footer/LocalClock.js";
import { renderCurrentYear } from "../../features/footer/CurrentYear.js";
import { CONTACT } from "../../data/contact.js";

/** @param {import("../App.js").AppContext} ctx */
export function initFooter({ use, viewport }) {
  use(
    hook("flag-backdrop"),
    (root) => new FlagBackdrop(root, { video: hook("flag-video"), observeTarget: hook("site-footer"), viewport }),
  );
  use(hook("flap-board"), (root) => new FlapBoard(root, { viewport }));
  use(hook("local-clock"), (root) => new LocalClock(root, { timeZone: CONTACT.timeZone, viewport }));
  renderCurrentYear(hook("current-year"));
}
