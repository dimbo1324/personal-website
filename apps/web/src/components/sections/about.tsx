"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { SectionHeading } from "@/components/chrome/section-heading";
import { CornerTicks } from "@/components/motion/panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { about, site } from "@/content/site";
import { ease, viewportOnce } from "@/lib/motion";

export function About() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" data-domain="engineering" className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading index="01" eyebrow="Обо мне" title={about.heading} className="max-w-3xl" />

        <div
          ref={ref}
          className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16"
        >
          {/* portrait: duotone by default, full colour on hover */}
          <Reveal preset="wipeUp" className="lg:sticky lg:top-28 lg:self-start">
            <div className="group/panel relative aspect-4/5 overflow-hidden rounded-[22px] border border-iron/80">
              <motion.div
                style={reduced ? undefined : { y: portraitY }}
                className="absolute inset-x-0 -inset-y-[8%]"
              >
                <Image
                  src="/images/portrait-b.jpg"
                  alt="Портрет: инженер на объекте"
                  fill
                  sizes="(max-width: 1024px) 90vw, 420px"
                  className="object-cover contrast-[1.05] grayscale-[0.85] transition-[filter,transform] duration-[1200ms] ease-(--ease-expo) group-hover/panel:scale-[1.04] group-hover/panel:grayscale-0"
                />
              </motion.div>

              {/* accent duotone wash lifts on hover */}
              <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-void via-void/25 to-transparent" />
              <span className="pointer-events-none absolute inset-0 bg-accent/16 mix-blend-color transition-opacity duration-[1200ms] group-hover/panel:opacity-0" />
              <span className="pointer-events-none absolute inset-0 grid-field-fine opacity-[0.18] mix-blend-overlay" />

              <CornerTicks />

              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold tracking-tight text-chalk">
                    {site.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                    {site.role}
                  </p>
                </div>
                <span className="rounded-lg border border-iron/80 bg-carbon/70 px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-mist uppercase backdrop-blur">
                  {site.city}
                </span>
              </div>
            </div>
          </Reveal>

          <div>
            <RevealGroup step={0.1} className="space-y-5">
              {about.paragraphs.map((paragraph) => (
                <RevealItem key={paragraph.slice(0, 24)}>
                  <p className="text-[15px] leading-[1.75] text-silver/85 sm:text-[16px]">
                    {paragraph}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* spec sheet with dotted leaders — reads like a title block */}
            <dl className="mt-11 border-t border-hairline">
              {about.specs.map((spec, index) => (
                <motion.div
                  key={spec.key}
                  initial={reduced ? undefined : { opacity: 0, x: -12 }}
                  whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.6, delay: index * 0.07, ease: ease.expo }}
                  className="group flex flex-col gap-1 border-b border-hairline py-3.5 transition-colors duration-300 hover:border-accent/30 sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <dt className="shrink-0 font-mono text-[10px] tracking-[0.16em] text-mist uppercase transition-colors duration-300 group-hover:text-accent">
                    {spec.key}
                  </dt>
                  {/* The dotted leader only earns its place once key and value share a line. */}
                  <span
                    aria-hidden
                    className="hidden h-px min-w-6 flex-1 self-center bg-[repeating-linear-gradient(to_right,var(--color-iron)_0_2px,transparent_2px_6px)] sm:block"
                  />
                  <dd className="text-[13.5px] text-silver sm:shrink-0 sm:text-right">
                    {spec.value}
                  </dd>
                </motion.div>
              ))}
            </dl>

            {/* capability meters */}
            <div className="mt-11 space-y-5">
              {about.marks.map((mark, index) => (
                <Meter key={mark.label} {...mark} delay={index * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meter({
  label,
  value,
  domain,
  delay,
}: {
  label: string;
  value: number;
  domain: "engineering" | "it";
  delay: number;
}) {
  const reduced = useReducedMotion();
  const tone = domain === "it" ? "bg-signal" : "bg-ember";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium text-silver">{label}</span>
        <span className="font-mono text-[11px] text-mist tabular-nums">{value}%</span>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-steel">
        {/* The value lives in `width`, not in the transform, so it still reads
            correctly when the animation is skipped. */}
        <motion.div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${value}%`, originX: 0 }}
          initial={reduced ? undefined : { scaleX: 0 }}
          whileInView={reduced ? undefined : { scaleX: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.25, delay, ease: ease.expo }}
        />
      </div>
    </div>
  );
}
