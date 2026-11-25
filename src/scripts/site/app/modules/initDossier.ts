import { hook, queryAll } from "../../core/dom";
import { Accordion } from "../../features/dossier/Accordion";
import { Tabs } from "../../features/dossier/Tabs";
import type { AppContext } from "../types";

/** Dossier accordion and the skills tab set. */
export function initDossier({ use }: AppContext): void {
  use(hook("accordion"), (root) => new Accordion(root));
  use(hook("tabs"), (root) => new Tabs(root, queryAll<HTMLElement>("[data-pane]")));
}
