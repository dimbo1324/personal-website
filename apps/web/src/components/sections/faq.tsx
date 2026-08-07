"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/chrome/section-heading";
import { faq } from "@/content/site";
import { ease, viewportOnce } from "@/lib/motion";

export function Faq() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" data-domain="engineering" className="relative py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <SectionHeading
            index="06"
            eyebrow="Вопросы"
            title="Что обычно спрашивают"
            lede="Если вашего вопроса здесь нет — напишите, отвечу лично."
            className="lg:sticky lg:top-28 lg:self-start"
          />

          <ul className="border-t border-hairline">
            {faq.map((item, index) => {
              const expanded = open === index;

              return (
                <motion.li
                  key={item.q}
                  initial={reduced ? undefined : { opacity: 0, y: 16 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.55, delay: index * 0.06, ease: ease.expo }}
                  className="border-b border-hairline"
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? null : index)}
                      className="group flex w-full items-start gap-4 py-5 text-left"
                    >
                      <span
                        className={cn(
                          "mt-0.5 font-mono text-[10px] tabular-nums transition-colors duration-300",
                          expanded ? "text-accent" : "text-mist group-hover:text-silver",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={cn(
                          "flex-1 text-[15px] leading-snug font-medium transition-colors duration-300 sm:text-[16.5px]",
                          expanded ? "text-chalk" : "text-silver group-hover:text-chalk",
                        )}
                      >
                        {item.q}
                      </span>

                      <span
                        className={cn(
                          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border transition-[border-color,background-color,color] duration-500 ease-(--ease-expo)",
                          expanded
                            ? "border-accent/50 bg-accent/12 text-accent"
                            : "border-iron/70 text-mist group-hover:border-accent/35 group-hover:text-silver",
                        )}
                      >
                        {/* Rotate the glyph, not the frame — the frame is a square. */}
                        <PlusIcon
                          className={cn(
                            "size-3.5 transition-transform duration-500 ease-(--ease-expo)",
                            expanded && "rotate-135",
                          )}
                          strokeWidth={2}
                        />
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: ease.expo }}
                        className="overflow-hidden"
                      >
                        <p className="pr-11 pb-6 pl-[38px] text-[14px] leading-relaxed text-mist">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
