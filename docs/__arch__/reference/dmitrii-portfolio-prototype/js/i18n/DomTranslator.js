import { qsa } from "../core/dom.js";

/**
 * Applies translations to static markup:
 *   data-i18n="key"                      → element.textContent
 *   data-i18n-attr="aria-label:key;title:key2" → attributes
 *
 * The HTML keeps English text, so the page reads fine without JavaScript
 * and for crawlers; this only swaps text, never markup (no innerHTML).
 * Also keeps <html lang>, the document title and description meta in sync.
 */
export class DomTranslator {
  #i18n;
  #root;
  #meta;

  /**
   * @param {import("./I18nService.js").I18nService} i18n
   * @param {{ root?: ParentNode, meta?: { description?: HTMLMetaElement | null, ogTitle?: HTMLMetaElement | null,
   *           ogDescription?: HTMLMetaElement | null, ogLocale?: HTMLMetaElement | null } }} [options]
   */
  constructor(i18n, { root = document, meta = {} } = {}) {
    this.#i18n = i18n;
    this.#root = root;
    this.#meta = meta;
  }

  start() {
    return this.#i18n.subscribe(() => this.apply());
  }

  apply() {
    const i18n = this.#i18n;
    qsa("[data-i18n]", this.#root).forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (key && i18n.has(key)) element.textContent = i18n.t(key);
    });
    qsa("[data-i18n-attr]", this.#root).forEach((element) => {
      for (const pair of element.getAttribute("data-i18n-attr").split(";")) {
        const [attribute, key] = pair.split(":").map((part) => part.trim());
        if (attribute && key && i18n.has(key)) element.setAttribute(attribute, i18n.t(key));
      }
    });
    this.#applyDocument();
    document.documentElement.removeAttribute("data-i18n-pending");
  }

  #applyDocument() {
    const i18n = this.#i18n;
    document.documentElement.lang = i18n.lang;
    document.title = i18n.t("meta.title");
    this.#meta.description?.setAttribute("content", i18n.t("meta.description"));
    this.#meta.ogTitle?.setAttribute("content", i18n.t("meta.title"));
    this.#meta.ogDescription?.setAttribute("content", i18n.t("meta.description"));
    this.#meta.ogLocale?.setAttribute("content", i18n.locale.replace("-", "_"));
  }
}
