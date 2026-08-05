"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { LanguageSelect } from "./language-select";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [t("home"), t("about"), t("portfolio"), t("services"), t("contact")];

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full px-3 sm:px-6",
        "transition-[padding-top] duration-500 ease-out",
        scrolled ? "pt-5" : "pt-3",
      )}
    >
      <motion.div
        initial={false}
        animate={{ scale: scrolled ? 1 : 0.99 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className={cn(
          "group/nav relative mx-auto flex h-14 max-w-4xl items-center gap-3 rounded-2xl border px-3",
          "transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled
            ? "border-border bg-ink/80 shadow-[0_12px_40px_-14px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            : "border-transparent bg-ink/40 backdrop-blur-md",
        )}
      >
        {/* animated perimeter glow, traced only while the cursor is inside the bar */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-border-spin rounded-2xl p-px opacity-0 transition-opacity duration-500 [animation-play-state:paused] group-hover/nav:opacity-100 group-hover/nav:[animation-play-state:running]"
          style={{
            background:
              "conic-gradient(from var(--border-angle), transparent 0%, var(--color-brass) 12%, transparent 28%, transparent 100%)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {links.map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-ash transition-colors duration-300 hover:text-paper active:scale-95"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
          <SearchBar items={links.map((label, index) => ({ key: label + index, label }))} />
          <LanguageSelect />
          <ThemeToggle />

          <button
            type="button"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex size-10 items-center justify-center rounded-full text-paper/80 transition-colors duration-300 hover:bg-paper/10 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60 active:scale-90 md:hidden"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {mobileOpen ? (
                  <XIcon className="size-[18px]" />
                ) : (
                  <MenuIcon className="size-[18px]" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      <MobileNav open={mobileOpen} links={links} onSelect={() => setMobileOpen(false)} />
    </header>
  );
}
