"use client";

import { cn } from "@repo/ui/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRightIcon, LayoutGridIcon, ListIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { SectionHeading } from "@/components/chrome/section-heading";
import { CornerTicks, Panel } from "@/components/motion/panel";
import { type Work, works } from "@/content/site";
import { useFinePointer, useScrollLock } from "@/lib/hooks";
import { ease, springSoft, viewportOnce } from "@/lib/motion";

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "engineering", label: "Инженерия" },
  { id: "it", label: "IT" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];
type ViewMode = "list" | "grid";

export function Works() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [hovered, setHovered] = useState<Work | null>(null);
  const [opened, setOpened] = useState<Work | null>(null);

  const fine = useFinePointer();
  const reduced = useReducedMotion();

  // Cursor-tracked preview: the pointer position drives a lagging spring.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const previewX = useSpring(pointerX, springSoft);
  const previewY = useSpring(pointerY, springSoft);
  const tilt = useTransform(previewX, [-400, 400], [7, -7]);

  const visible = works.filter((work) => filter === "all" || work.domain === filter);
  const showPreview = fine && !reduced && view === "list" && hovered !== null;

  return (
    <section id="works" className="relative py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="04"
            eyebrow="Работы"
            title="Что уже сдано"
            lede="Шесть проектов, где инженерная и цифровая части встретились в одном контуре."
            className="lg:max-w-2xl"
          />

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center rounded-xl border border-iron/70 bg-steel/40 p-1">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "relative rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors duration-300",
                    filter === item.id ? "text-void" : "text-mist hover:text-silver",
                  )}
                >
                  {filter === item.id ? (
                    <motion.span
                      layoutId="works-filter"
                      transition={springSoft}
                      className="absolute inset-0 rounded-lg bg-accent"
                    />
                  ) : null}
                  <span className="relative">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden items-center rounded-xl border border-iron/70 bg-steel/40 p-1 lg:flex">
              {(
                [
                  { id: "list" as const, icon: ListIcon, label: "Списком" },
                  { id: "grid" as const, icon: LayoutGridIcon, label: "Плиткой" },
                ] satisfies Array<{ id: ViewMode; icon: typeof ListIcon; label: string }>
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={view === item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    "rounded-lg p-2 transition-colors duration-300",
                    view === item.id ? "bg-accent/15 text-accent" : "text-mist hover:text-silver",
                  )}
                >
                  <item.icon className="size-4" strokeWidth={1.7} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-14"
          onPointerMove={(event) => {
            pointerX.set(event.clientX);
            pointerY.set(event.clientY);
          }}
          onPointerLeave={() => setHovered(null)}
        >
          {view === "list" ? (
            <ul className="border-t border-hairline">
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((work, index) => (
                  <motion.li
                    key={work.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, delay: index * 0.05, ease: ease.expo }}
                    onMouseEnter={() => setHovered(work)}
                    className="border-b border-hairline"
                  >
                    <button
                      type="button"
                      data-cursor="view"
                      onClick={() => setOpened(work)}
                      className="group relative flex w-full items-center gap-5 overflow-hidden px-1 py-7 text-left sm:gap-8 sm:py-8"
                    >
                      {/* accent wash sweeping in from the left */}
                      <span className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-linear-to-r from-accent/8 to-transparent transition-transform duration-700 ease-(--ease-expo) group-hover:scale-x-100" />

                      <span className="w-10 shrink-0 font-mono text-[10px] text-mist tabular-nums transition-colors duration-300 group-hover:text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* thumbnail only on small screens; desktop uses the floating preview.
                          Fixed dimensions, not `fill`: a display:none `fill` image makes the
                          browser pick the largest srcset candidate. */}
                      <Image
                        src={work.image}
                        alt=""
                        width={64}
                        height={64}
                        className="hidden size-16 shrink-0 rounded-xl border border-iron/70 object-cover opacity-80 sm:block lg:hidden"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-display text-[17px] leading-tight font-semibold tracking-tight text-chalk transition-transform duration-500 ease-(--ease-expo) group-hover:translate-x-1 sm:text-[21px]">
                            {work.title}
                          </span>
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase",
                              work.domain === "it"
                                ? "bg-signal/12 text-signal"
                                : "bg-ember/12 text-ember",
                            )}
                          >
                            {work.category}
                          </span>
                        </span>
                        <span className="mt-1.5 block font-mono text-[10.5px] tracking-[0.14em] text-mist uppercase">
                          {work.place} · {work.year}
                        </span>
                      </span>

                      <ArrowUpRightIcon
                        className="size-5 shrink-0 text-mist transition-all duration-500 ease-(--ease-expo) group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                        strokeWidth={1.5}
                      />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((work, index) => (
                  <motion.div
                    key={work.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.5, delay: index * 0.05, ease: ease.expo }}
                    viewport={viewportOnce}
                  >
                    <Panel className="h-full" spotlight={false}>
                      <button
                        type="button"
                        data-cursor="view"
                        onClick={() => setOpened(work)}
                        className="flex h-full w-full flex-col text-left"
                      >
                        <span className="relative block aspect-16/10 overflow-hidden">
                          <Image
                            src={work.image}
                            alt={work.title}
                            fill
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                            className="object-cover opacity-75 saturate-[0.7] transition-[transform,opacity,filter] duration-[1100ms] ease-(--ease-expo) group-hover/panel:scale-[1.06] group-hover/panel:opacity-100 group-hover/panel:saturate-100"
                          />
                          <span className="absolute inset-0 bg-linear-to-t from-slate via-slate/25 to-transparent" />
                        </span>

                        <span className="flex flex-1 flex-col p-5">
                          <span className="font-mono text-[9.5px] tracking-[0.16em] text-accent uppercase">
                            {work.category} · {work.year}
                          </span>
                          <span className="mt-2 font-display text-[16px] leading-snug font-semibold tracking-tight text-chalk">
                            {work.title}
                          </span>
                          <span className="mt-auto pt-4 font-mono text-[10px] text-mist">
                            {work.place}
                          </span>
                        </span>
                      </button>
                    </Panel>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* floating preview that follows the cursor across the list */}
      <AnimatePresence>
        {showPreview && hovered ? (
          <motion.div
            key={hovered.id}
            className="pointer-events-none fixed top-0 left-0 z-40 hidden lg:block"
            style={{ x: previewX, y: previewY, rotate: tilt }}
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.32, ease: ease.expo }}
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <div className="relative h-[240px] w-[380px] overflow-hidden rounded-2xl border border-iron/80 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)]">
                <Image src={hovered.image} alt="" fill sizes="380px" className="object-cover" />
                <span className="absolute inset-0 bg-linear-to-t from-void/85 via-transparent to-transparent" />
                <span className="absolute inset-0 grid-field-fine opacity-25 mix-blend-overlay" />
                <CornerTicks />
                <span className="absolute inset-x-4 bottom-3 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-chalk uppercase">
                  <span>{hovered.category}</span>
                  <span className="text-accent">{hovered.year}</span>
                </span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <WorkDialog work={opened} onClose={() => setOpened(null)} />
    </section>
  );
}

function WorkDialog({ work, onClose }: { work: Work | null; onClose: () => void }) {
  useScrollLock(work !== null);

  return (
    <AnimatePresence>
      {work ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
        >
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-void/85 backdrop-blur-lg"
          />

          <motion.article
            role="dialog"
            aria-modal="true"
            aria-label={work.title}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.42, ease: ease.expo }}
            className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-iron bg-carbon shadow-[0_60px_140px_-40px_rgb(0_0_0/0.95)]"
          >
            <div className="relative h-52 shrink-0 sm:h-64">
              <Image
                src={work.image}
                alt={work.title}
                fill
                sizes="768px"
                className="object-cover"
                priority
              />
              <span className="absolute inset-0 bg-linear-to-t from-carbon via-carbon/40 to-transparent" />
              <span className="absolute inset-0 grid-field-fine opacity-20 mix-blend-overlay" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl border border-iron/80 bg-void/60 text-silver backdrop-blur-md transition-colors duration-300 hover:border-accent/50 hover:text-chalk"
              >
                <XIcon className="size-4" strokeWidth={2} />
              </button>

              <div className="absolute inset-x-6 bottom-5">
                <span className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                  {work.category} · {work.place} · {work.year}
                </span>
                <h3 className="mt-2 font-display text-[22px] leading-tight font-semibold tracking-tight text-chalk sm:text-[28px]">
                  {work.title}
                </h3>
              </div>
            </div>

            <div className="hide-scrollbar overflow-y-auto p-6 sm:p-8">
              <p className="text-[14.5px] leading-relaxed text-silver/85">{work.summary}</p>

              <dl className="mt-7 grid grid-cols-3 gap-3">
                {work.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-iron/70 bg-steel/40 p-3.5"
                  >
                    <dt className="font-mono text-[9.5px] tracking-[0.14em] text-mist uppercase">
                      {metric.label}
                    </dt>
                    <dd className="mt-1.5 font-display text-[18px] font-semibold tracking-tight text-accent tabular-nums sm:text-[22px]">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-6 flex flex-wrap gap-1.5">
                {work.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-lg border border-iron/70 px-2.5 py-1 font-mono text-[10px] text-silver/80"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
