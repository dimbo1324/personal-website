"use client";

import { AnimatePresence, motion } from "framer-motion";

export function MobileNav({
  open,
  links,
  onSelect,
}: {
  open: boolean;
  links: string[];
  onSelect: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto max-w-4xl overflow-hidden md:hidden"
        >
          <nav className="mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-ink/90 p-2 backdrop-blur-xl">
            {links.map((label, index) => (
              <motion.button
                key={label}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={onSelect}
                className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-ash transition-colors duration-300 hover:text-paper active:scale-[0.98]"
              >
                {label}
              </motion.button>
            ))}
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
