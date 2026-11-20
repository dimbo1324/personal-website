import { hook, qsa } from "../../core/dom.js";
import { ScrollProgress } from "../../features/scroll/ScrollProgress.js";
import { RevealOnScroll } from "../../features/scroll/RevealOnScroll.js";

/** @param {import("../App.js").AppContext} ctx */
export function initUtilities({ use, dispose, scroll, clipboard, signal }) {
  use(hook("scroll-progress"), (root) => new ScrollProgress(root, scroll));
  clipboard.bind(qsa("[data-copy]"), signal);
  dispose(new RevealOnScroll(qsa(".reveal")).start());
}
