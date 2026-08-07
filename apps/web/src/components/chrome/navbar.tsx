"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowUpRightIcon, MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { CommandPalette } from "@/components/chrome/command-palette";
import { MobileNav } from "@/components/chrome/mobile-nav";
import { Magnetic } from "@/components/motion/magnetic";
import { nav, site } from "@/content/site";
import { useSectionSpy } from "@/lib/hooks";
import { ease, springSnappy } from "@/lib/motion";

/** The hero takes part in the scroll spy so nothing is highlighted at the top. */
const SECTION_IDS = ["hero", ...nav.map((item) => item.id)];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const active = useSectionSpy(SECTION_IDS);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  // Hide on the way down, reveal the moment the user scrolls back up.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 12);
    setHidden(latest > 240 && latest > previous && !mobileOpen);
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (event.key === "/" && document.activeElement === document.body) {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(id: string) {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const marker = hovered ?? active;

  return (
    <>
      {/* reading progress, pinned to the very top edge */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[70] h-px origin-left bg-linear-to-r from-accent via-accent to-accent-deep"
      />

      <motion.header
        initial={false}
        animate={{ y: hidden ? "-130%" : "0%" }}
        transition={{ duration: 0.45, ease: ease.expo }}
        className="fixed inset-x-0 top-0 z-[80] px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <div
          className={cn(
            "mx-auto flex h-15 max-w-5xl items-center gap-2 rounded-2xl border px-2.5 sm:px-3",
            "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-(--ease-expo)",
            scrolled
              ? "border-iron/90 bg-carbon/78 shadow-[0_18px_50px_-24px_rgb(0_0_0/0.9)] backdrop-blur-2xl"
              : "border-transparent bg-carbon/25 backdrop-blur-sm",
          )}
        >
          {/* wordmark */}
          <button
            type="button"
            onClick={() => go("hero")}
            className="group flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-1.5 outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
            aria-label="К началу страницы"
          >
            <span className="relative flex size-8 items-center justify-center">
              <span className="absolute inset-0 rounded-lg border border-accent/40 transition-transform duration-500 group-hover:rotate-45" />
              <span className="absolute inset-[5px] rounded-[5px] bg-accent/85 transition-transform duration-500 group-hover:scale-75" />
            </span>
            <span className="hidden font-display text-[13px] font-semibold tracking-tight text-chalk sm:block">
              {site.shortName}
            </span>
          </button>

          {/* section links with a shared sliding pill */}
          <nav
            className="relative mx-auto hidden items-center md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                className={cn(
                  "relative rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors duration-300",
                  active === item.id ? "text-chalk" : "text-mist hover:text-silver",
                )}
              >
                {marker === item.id ? (
                  <motion.span
                    layoutId="nav-marker"
                    transition={springSnappy}
                    className="absolute inset-0 -z-10 rounded-xl border border-accent/25 bg-accent/10"
                  />
                ) : null}
                <span className="relative">{item.label}</span>
                {active === item.id ? (
                  <motion.span
                    layoutId="nav-dot"
                    transition={springSnappy}
                    className="absolute -bottom-px left-1/2 h-px w-5 -translate-x-1/2 bg-accent"
                  />
                ) : null}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Поиск по сайту"
              className="group flex h-9 items-center gap-2 rounded-xl border border-iron/70 bg-steel/40 px-2.5 text-mist transition-colors duration-300 hover:border-accent/40 hover:text-chalk"
            >
              <SearchIcon className="size-3.5" strokeWidth={1.7} />
              <span className="hidden font-mono text-[10px] tracking-wider lg:block">поиск</span>
              <kbd className="hidden rounded border border-iron px-1 font-mono text-[9px] text-mist/80 lg:block">
                ⌘K
              </kbd>
            </button>

            {/* The hiding lives on a plain wrapper — see the note in <Magnetic>. */}
            <span className="hidden sm:inline-block">
              <Magnetic strength={0.3}>
                <button
                  type="button"
                  onClick={() => go("contact")}
                  className="group relative flex h-9 items-center gap-1.5 overflow-hidden rounded-xl bg-accent px-3.5 text-[12.5px] font-semibold text-void transition-transform duration-300 active:scale-95"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Заявка</span>
                  <ArrowUpRightIcon
                    className="relative size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.2}
                  />
                </button>
              </Magnetic>
            </span>

            <button
              type="button"
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((value) => !value)}
              className="flex size-9 items-center justify-center rounded-xl border border-iron/70 bg-steel/40 text-silver transition-colors duration-300 hover:text-chalk active:scale-90 md:hidden"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: ease.expo }}
                  className="flex"
                >
                  {mobileOpen ? <XIcon className="size-4.5" /> : <MenuIcon className="size-4.5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <MobileNav
          open={mobileOpen}
          active={active}
          onSelect={go}
          onSearch={() => setPaletteOpen(true)}
        />
      </motion.header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
