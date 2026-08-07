"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

import { SectionHeading } from "@/components/chrome/section-heading";
import { process } from "@/content/site";
import { ease, viewportOnce } from "@/lib/motion";

/**
 * The four stages, connected by a rail that fills as the section scrolls past.
 * Vertical on mobile, horizontal from `lg` up — same rail, different axis.
 */
export function Process() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
  const glow = useTransform(fill, (value) => `${value * 100}%`);

  return (
    <section id="process" data-domain="engineering" className="relative py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="03"
          eyebrow="Процесс"
          title="Четыре шага без сюрпризов"
          lede="Каждый этап заканчивается артефактом, который можно посмотреть и оценить: формулировкой, сметой, демо, актом."
        />

        <div ref={ref} className="relative mt-16">
          {/* rail */}
          <div className="absolute top-0 bottom-0 left-[19px] w-px bg-hairline lg:top-[19px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto">
            <motion.div
              className="absolute inset-0 origin-top bg-linear-to-b from-accent to-accent-deep lg:origin-left lg:bg-linear-to-r"
              style={reduced ? { scaleY: 1, scaleX: 1 } : { scaleY: fill, scaleX: fill }}
            />
            {/* travelling node that rides the fill — one per axis */}
            {reduced ? null : (
              <>
                <motion.span
                  style={{ top: glow }}
                  className="absolute -left-[3px] size-[7px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_2px_color-mix(in_srgb,var(--accent)_65%,transparent)] lg:hidden"
                />
                <motion.span
                  style={{ left: glow }}
                  className="absolute top-1/2 hidden size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_2px_color-mix(in_srgb,var(--accent)_65%,transparent)] lg:block"
                />
              </>
            )}
          </div>

          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {process.map((stage, index) => (
              <motion.li
                key={stage.step}
                initial={reduced ? undefined : { opacity: 0, y: 26 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.7, delay: index * 0.1, ease: ease.expo }}
                className="group relative pl-14 lg:pt-14 lg:pl-0"
              >
                {/* node */}
                <span className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-xl border border-iron/80 bg-carbon text-accent transition-[border-color,transform] duration-500 ease-(--ease-expo) group-hover:-translate-y-0.5 group-hover:border-accent/50 lg:top-0 lg:left-0">
                  <stage.icon className="size-4.5" strokeWidth={1.5} />
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-accent tabular-nums">
                    {stage.step}
                  </span>
                  <span className="rounded-md border border-iron/70 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-mist uppercase">
                    {stage.duration}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-[17px] font-semibold tracking-tight text-chalk">
                  {stage.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">{stage.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
