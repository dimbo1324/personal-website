"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_LANGUAGE = { code: "ru", label: "Русский" };

const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  { code: "pl", label: "Polski" },
  { code: "nl", label: "Nederlands" },
  { code: "uk", label: "Українська" },
];

export function LanguageSelect() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("ru");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const current = LANGUAGES.find((lang) => lang.code === selected) ?? DEFAULT_LANGUAGE;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 text-xs font-medium tracking-wide text-ash uppercase transition-colors duration-300 hover:text-paper"
      >
        <GlobeIcon className="size-[15px]" />
        {current.code}
        <ChevronDownIcon
          className={cn("size-3 transition-transform duration-300", open ? "rotate-180" : "")}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            className="absolute top-full right-0 z-50 mt-2 max-h-72 w-44 origin-top-right overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-2xl"
          >
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={lang.code === selected}
                  onClick={() => {
                    setSelected(lang.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-paper/90 transition-colors duration-150 hover:bg-paper/10"
                >
                  <span>{lang.label}</span>
                  {lang.code === selected ? <CheckIcon className="size-3.5 text-brass" /> : null}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
