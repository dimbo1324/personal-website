import { motion } from "../../core/motion";

/** Fades `.reveal` blocks in as they enter the viewport. */
export class RevealOnScroll {
  readonly #elements: readonly Element[];

  constructor(elements: readonly Element[]) {
    this.#elements = elements;
  }

  start(): () => void {
    if (motion.reduced || !("IntersectionObserver" in window)) {
      for (const element of this.#elements) element.classList.add("is-inview");
      return () => undefined;
    }

    document.documentElement.classList.add("js-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    for (const element of this.#elements) observer.observe(element);
    return () => observer.disconnect();
  }
}
