import { motion } from "../../core/MotionPreference.js";

/**
 * Fades `.reveal` blocks in as they enter the viewport.
 * The hidden state is only enabled after JS boots (html.js-ready).
 */
export class RevealOnScroll {
  #elements;

  /** @param {Element[]} elements */
  constructor(elements) {
    this.#elements = elements;
  }

  start() {
    if (motion.reduced || !("IntersectionObserver" in window)) {
      this.#elements.forEach((element) => element.classList.add("is-inview"));
      return () => {};
    }

    document.documentElement.classList.add("js-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    this.#elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }
}
