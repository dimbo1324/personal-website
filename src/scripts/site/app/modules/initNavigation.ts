import { hook, queryAll } from "../../core/dom";
import { ScrollSpy } from "../../features/nav/ScrollSpy";
import { NavLinks } from "../../features/nav/NavLinks";
import { MobileMenu } from "../../features/nav/MobileMenu";
import { ScrollTopButton } from "../../features/scroll/ScrollTopButton";
import type { AppContext } from "../types";

const SECTION_IDS = Object.freeze([
  "overview",
  "telemetry",
  "cases",
  "gallery",
  "dossier",
  "contact",
  "request",
]);
const NAV_ALIASES = Object.freeze({ request: "contact" });

/** Desktop nav, mobile drawer, scroll spy and the floating back-to-top button. */
export function initNavigation({ use, dispose, store, scroll, i18n }: AppContext): void {
  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
    (element): element is HTMLElement => element !== null,
  );
  const spy = new ScrollSpy(sections, store, scroll, { aliases: NAV_ALIASES });
  dispose(spy.start());

  use(
    document.querySelector<HTMLElement>(".site-nav"),
    (root) =>
      new NavLinks(root, {
        links: queryAll<HTMLAnchorElement>("[data-nav]"),
        indicator: hook("nav-indicator"),
        spy,
        store,
        i18n,
      }),
  );
  use(
    hook<HTMLButtonElement>("menu-toggle"),
    (root) => new MobileMenu(root, hook("mobile-drawer") ?? document.createElement("div"), i18n),
  );
  use(
    hook<HTMLButtonElement>("scroll-top"),
    (root) =>
      new ScrollTopButton(root, {
        ring: document.querySelector<SVGCircleElement>('[data-js="scroll-ring"]'),
        scroll,
        onNavigate: () => spy.navigateTo("overview"),
      }),
  );
}
