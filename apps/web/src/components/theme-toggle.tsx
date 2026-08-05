"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const [isDark, setIsDark] = useState(true);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={t("toggle")}
      title={t("toggle")}
      onClick={() => setIsDark((prev) => !prev)}
      className="relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full border border-border bg-surface/60 px-[3px] transition-colors duration-300 hover:border-brass/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="relative flex size-[22px] items-center justify-center rounded-full bg-brass text-ink shadow-sm"
        style={{ marginLeft: isDark ? 0 : "auto" }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -110, scale: 0.3 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 110, scale: 0.3 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="flex"
          >
            {isDark ? <MoonIcon className="size-3.5" /> : <SunIcon className="size-3.5" />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
