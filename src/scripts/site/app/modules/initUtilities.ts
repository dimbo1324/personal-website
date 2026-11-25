import { hook, queryAll } from "../../core/dom";
import { ScrollProgress } from "../../features/scroll/ScrollProgress";
import { RevealOnScroll } from "../../features/scroll/RevealOnScroll";
import type { AppContext } from "../types";

/** Page-wide utilities: scroll progress, copy buttons and reveal animations. */
export function initUtilities({ use, dispose, scroll, clipboard, signal }: AppContext): void {
  use(hook("scroll-progress"), (root) => new ScrollProgress(root, scroll));
  clipboard.bind(queryAll<HTMLElement>("[data-copy]"), signal);
  dispose(new RevealOnScroll(queryAll<HTMLElement>(".reveal")).start());
}
