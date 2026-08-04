"use client";

import { Dialog, DialogContent, DialogTitle } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SearchItem {
  key: string;
  label: string;
}

export function SearchModal({ items }: { items: SearchItem[] }) {
  const t = useTranslations("search");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        aria-label={t("open")}
        title={t("open")}
        onClick={() => setOpen(true)}
        className="group inline-flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 sm:pr-2"
      >
        <SearchIcon className="size-[15px]" />
        <span className="hidden sm:inline">{t("placeholder")}</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">{t("open")}</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("placeholder")}
            className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <ul className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">{t("empty")}</li>
          ) : (
            results.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))
          )}
        </ul>

        <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {t("hint")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
