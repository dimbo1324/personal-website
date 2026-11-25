import { queryAll } from "../core/dom";
import type { I18nService } from "./service";

interface MetaElements {
  description?: HTMLMetaElement | null;
  ogTitle?: HTMLMetaElement | null;
  ogDescription?: HTMLMetaElement | null;
  ogLocale?: HTMLMetaElement | null;
}

interface DomTranslatorOptions {
  root?: ParentNode;
  meta?: MetaElements;
}

export class DomTranslator {
  readonly #i18n: I18nService;
  readonly #root: ParentNode;
  readonly #meta: MetaElements;

  constructor(i18n: I18nService, { root = document, meta = {} }: DomTranslatorOptions = {}) {
    this.#i18n = i18n;
    this.#root = root;
    this.#meta = meta;
  }

  start(): () => void {
    return this.#i18n.subscribe(() => this.apply());
  }

  apply(): void {
    for (const element of queryAll("[data-i18n]", this.#root)) {
      const key = element.getAttribute("data-i18n");
      if (key && this.#i18n.has(key)) element.textContent = this.#i18n.t(key);
    }

    for (const element of queryAll("[data-i18n-attr]", this.#root)) {
      const spec = element.getAttribute("data-i18n-attr");
      if (!spec) continue;
      for (const pair of spec.split(";")) {
        const [attribute, key] = pair.split(":").map((part) => part.trim());
        if (attribute && key && this.#i18n.has(key)) {
          element.setAttribute(attribute, this.#i18n.t(key));
        }
      }
    }

    this.#applyDocument();
    document.documentElement.removeAttribute("data-i18n-pending");
  }

  #applyDocument(): void {
    document.documentElement.lang = this.#i18n.lang;
    document.title = this.#i18n.t("meta.title");
    this.#meta.description?.setAttribute("content", this.#i18n.t("meta.description"));
    this.#meta.ogTitle?.setAttribute("content", this.#i18n.t("meta.title"));
    this.#meta.ogDescription?.setAttribute("content", this.#i18n.t("meta.description"));
    this.#meta.ogLocale?.setAttribute("content", this.#i18n.locale.replace("-", "_"));
  }
}
