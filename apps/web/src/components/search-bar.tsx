"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

interface SearchItem {
  key: string;
  label: string;
}

export function SearchBar({ items }: { items: SearchItem[] }) {
  const t = useTranslations("search");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const expanded = hovered || focused || query.length > 0;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ width: 40 }}
        animate={{ width: expanded ? 220 : 40 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="flex h-10 w-10 items-center overflow-hidden rounded-full border border-border bg-surface/60"
      >
        <button
          type="button"
          aria-label={t("open")}
          onClick={() => inputRef.current?.focus()}
          className="flex size-10 shrink-0 items-center justify-center text-ash transition-colors duration-300 hover:text-paper"
        >
          <SearchIcon className="size-4" />
        </button>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          className={cn(
            "h-full w-full bg-transparent pr-4 text-sm text-paper transition-opacity duration-200 outline-none",
            expanded ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      </motion.div>

      <AnimatePresence>
        {query.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-2xl"
          >
            {results.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-ash">{t("empty")}</li>
            ) : (
              results.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.blur();
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-paper/90 transition-colors duration-150 hover:bg-paper/10"
                  >
                    {item.label}
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
