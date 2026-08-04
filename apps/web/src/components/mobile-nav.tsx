"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface NavLink {
  label: string;
}

export function MobileNav({
  open,
  links,
  activeIndex,
  onSelect,
}: {
  open: boolean;
  links: NavLink[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col gap-1 px-4 py-3">
            {links.map((link, index) => (
              <motion.button
                key={link.label}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onSelect(index)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors active:scale-[0.98]",
                  activeIndex === index
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </motion.button>
            ))}
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
