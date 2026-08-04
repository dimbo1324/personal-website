"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";

import { MobileNav } from "./mobile-nav";
import { SearchModal } from "./search-modal";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const links = [t("home"), t("about"), t("portfolio"), t("services"), t("contact")].map(
    (label) => ({ label }),
  );

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
        "sticky top-0 z-40 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/75 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          {t("brand")}
        </Link>

        <nav
          className="relative hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {links.map((link, index) => (
            <button
              key={link.label}
              type="button"
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeIndex === index
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {hoveredIndex === index ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-muted"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              ) : null}
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <SearchModal
            items={links.map((link, index) => ({ key: link.label + index, label: link.label }))}
          />
          <ThemeToggle />

          <button
            type="button"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-90 md:hidden"
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
      </div>

      <MobileNav
        open={mobileOpen}
        links={links}
        activeIndex={activeIndex}
        onSelect={(index) => {
          setActiveIndex(index);
          setMobileOpen(false);
        }}
      />
    </header>
  );
}
