"use client";

import { motion, useReducedMotion } from "framer-motion";

import { CountUp } from "@/components/motion/count-up";
import { stats } from "@/content/site";
import { ease, viewportOnce } from "@/lib/motion";

/** Four figures in a hairline-divided row, counting up as they enter view. */
export function Stats() {
  const reduced = useReducedMotion();

  return (
    <section aria-label="Показатели" className="relative border-b border-hairline">
      <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, delay: index * 0.09, ease: ease.expo }}
            className="group relative border-b border-hairline px-2 py-9 first:pl-0 sm:py-11 lg:border-b-0 lg:not-first:border-l lg:not-first:pl-8"
          >
            {/* hairline that lights up on hover */}
            <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent/70 transition-transform duration-700 ease-(--ease-expo) group-hover:scale-x-100 lg:top-0 lg:bottom-auto" />

            <div className="flex items-baseline gap-1 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-none font-semibold tracking-[-0.04em] text-chalk tabular-nums">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="mt-3 text-[13px] font-medium text-silver">{stat.label}</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-mist/70 uppercase">
              {stat.hint}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
