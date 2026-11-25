import { hook, qsa } from "../../core/dom.js";
import { Accordion } from "../../features/dossier/Accordion.js";
import { Tabs } from "../../features/dossier/Tabs.js";

/** @param {import("../App.js").AppContext} ctx */
export function initDossier({ use }) {
  use(hook("accordion"), (root) => new Accordion(root));
  use(hook("tabs"), (root) => new Tabs(root, qsa("[data-pane]")));
}
