import { hook, qsa } from "../../core/dom.js";
import { ScrollSpy } from "../../features/nav/ScrollSpy.js";
import { NavLinks } from "../../features/nav/NavLinks.js";
import { MobileMenu } from "../../features/nav/MobileMenu.js";
import { ScrollTopButton } from "../../features/scroll/ScrollTopButton.js";

/** Sections in page order. "request" has no nav item of its own: it lights up "contact". */
const SECTION_IDS = Object.freeze(["overview", "telemetry", "cases", "gallery", "dossier", "contact", "request"]);
const NAV_ALIASES = Object.freeze({ request: "contact" });

/** @param {import("../App.js").AppContext} ctx */
export function initNavigation({ use, dispose, store, scroll, i18n }) {
  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  const spy = new ScrollSpy(sections, store, scroll, { aliases: NAV_ALIASES });
  dispose(spy.start());

  use(
    document.querySelector(".site-nav"),
    (root) => new NavLinks(root, { links: qsa("[data-nav]"), indicator: hook("nav-indicator"), spy, store, i18n }),
  );
  use(hook("menu-toggle"), (root) => new MobileMenu(root, hook("mobile-drawer"), i18n));
  use(
    hook("scroll-top"),
    (root) => new ScrollTopButton(root, { ring: hook("scroll-ring"), scroll, onNavigate: () => spy.navigateTo("overview") }),
  );
}
