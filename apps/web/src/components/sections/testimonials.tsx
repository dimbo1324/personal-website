"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, QuoteIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { SectionHeading } from "@/components/chrome/section-heading";
import { CornerTicks } from "@/components/motion/panel";
import { testimonials } from "@/content/site";
import { ease } from "@/lib/motion";

const AUTOPLAY_MS = 7000;

/** One quote at a time, swipeable, with an autoplay ring that shows the timer. */
export function Testimonials() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setIndex(((next % testimonials.length) + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = setTimeout(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [go, index, paused, reduced]);

  const item = testimonials[index];
  if (!item) return null;

  return (
    <section
      id="reviews"
      aria-label="Отзывы"
      data-domain={item.domain}
      className="relative py-24 sm:py-32 lg:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHeading index="05" eyebrow="Отзывы" title="Что говорят заказчики" align="center" />

        <div className="relative mt-14">
          <div className="group/panel relative overflow-hidden rounded-[24px] border border-iron/80 bg-slate/60 px-6 py-10 backdrop-blur-[2px] sm:px-12 sm:py-14">
            <CornerTicks />

            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 -left-2 font-display text-[9rem] leading-none text-accent/[0.06] select-none"
            >
              “
            </span>

            <QuoteIcon className="relative size-7 text-accent/70" strokeWidth={1.2} />

            <div className="relative mt-6 min-h-[190px] sm:min-h-[170px]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.figure
                  key={item.name}
                  custom={direction}
                  initial={
                    reduced ? undefined : { opacity: 0, x: direction * 40, filter: "blur(6px)" }
                  }
                  animate={reduced ? undefined : { opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={
                    reduced ? undefined : { opacity: 0, x: direction * -40, filter: "blur(6px)" }
                  }
                  transition={{ duration: 0.5, ease: ease.expo }}
                  drag={reduced ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) go(index + 1, 1);
                    if (info.offset.x > 60) go(index - 1, -1);
                  }}
                  data-cursor="drag"
                  className="cursor-grab active:cursor-grabbing"
                >
                  <blockquote className="font-display text-[19px] leading-[1.5] font-medium tracking-[-0.01em] text-chalk/95 sm:text-[24px]">
                    {item.quote}
                  </blockquote>

                  <figcaption className="mt-8 flex items-center gap-3.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-iron/80 bg-carbon font-mono text-[12px] tracking-wide text-accent">
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-chalk">
                        {item.name}
                      </span>
                      <span className="block font-mono text-[10.5px] tracking-[0.12em] text-mist uppercase">
                        {item.role} · {item.company}
                      </span>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          {/* controls */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {testimonials.map((entry, dotIndex) => (
                <button
                  key={entry.name}
                  type="button"
                  aria-label={`Отзыв ${dotIndex + 1}`}
                  aria-current={dotIndex === index}
                  onClick={() => go(dotIndex, dotIndex > index ? 1 : -1)}
                  className="group relative h-6 px-0.5"
                >
                  <span
                    className={cn(
                      "block h-[3px] rounded-full transition-all duration-500 ease-(--ease-expo)",
                      dotIndex === index ? "w-9 bg-accent" : "w-3.5 bg-iron group-hover:bg-mist",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 font-mono text-[10px] text-mist tabular-nums">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(testimonials.length).padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <NavButton label="Предыдущий отзыв" onClick={() => go(index - 1, -1)}>
                <ArrowLeftIcon className="size-4" strokeWidth={1.7} />
              </NavButton>
              <NavButton label="Следующий отзыв" onClick={() => go(index + 1, 1)}>
                <ArrowRightIcon className="size-4" strokeWidth={1.7} />
              </NavButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-xl border border-iron/70 bg-steel/40 text-silver transition-[color,border-color,transform] duration-300 hover:border-accent/45 hover:text-accent active:scale-90"
    >
      {children}
    </button>
  );
}
