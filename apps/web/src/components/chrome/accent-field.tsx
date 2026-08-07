"use client";

import { useEffect } from "react";

/**
 * The site has two identities — warm for engineering, cool for IT — and the
 * accent glides between them as you scroll. Sections opt in with
 * `data-domain="engineering" | "it"`; the transition itself is a CSS
 * transition on the registered `--accent` property (see theme.css).
 */
const PALETTE = {
  engineering: { accent: "#e2a34a", deep: "#a8682a" },
  it: { accent: "#45d3c4", deep: "#17919b" },
} as const;

export function AccentField() {
  useEffect(() => {
    const root = document.documentElement;
    const zones = Array.from(document.querySelectorAll<HTMLElement>("[data-domain]"));
    if (zones.length === 0) return;

    let current = "";

    function sync() {
      const line = window.innerHeight * 0.45;
      let domain = zones[0]?.dataset.domain ?? "engineering";

      for (const zone of zones) {
        if (zone.getBoundingClientRect().top <= line) domain = zone.dataset.domain ?? domain;
      }

      if (domain === current) return;
      current = domain;

      const tone = PALETTE[domain as keyof typeof PALETTE] ?? PALETTE.engineering;
      root.style.setProperty("--accent", tone.accent);
      root.style.setProperty("--accent-deep", tone.deep);
      root.dataset.domain = domain;
    }

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return null;
}
