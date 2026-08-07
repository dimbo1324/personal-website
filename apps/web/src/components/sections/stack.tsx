"use client";

import { Marquee } from "@/components/motion/marquee";
import { stack } from "@/content/site";

/**
 * Two counter-rotating rows of tools. Purely atmospheric — it gives the page a
 * moment of motion between two dense sections.
 */
export function Stack() {
  const half = Math.ceil(stack.length / 2);
  const rows = [stack.slice(0, half), stack.slice(half)];

  return (
    <section
      aria-label="Инструменты"
      data-domain="it"
      className="relative overflow-hidden py-16 sm:py-20"
    >
      <div className="mx-auto mb-9 flex max-w-6xl items-center gap-4 px-5 sm:px-8">
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-iron" />
        <span className="font-mono text-[10px] tracking-[0.28em] text-mist uppercase">
          Инструменты
        </span>
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-iron" />
      </div>

      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <Marquee
            key={rowIndex}
            speed={rowIndex === 0 ? 30 : 24}
            reverse={rowIndex === 1}
            className="mask-x-fade"
          >
            {row.map((item) => (
              <span
                key={item.label}
                className="group mx-1.5 flex items-center gap-2.5 rounded-xl border border-iron/60 bg-slate/50 px-4 py-2.5 whitespace-nowrap transition-colors duration-500 hover:border-accent/40"
              >
                <item.icon
                  className="size-4 text-mist transition-colors duration-500 group-hover:text-accent"
                  strokeWidth={1.5}
                />
                <span className="text-[13px] font-medium text-silver/85 transition-colors duration-500 group-hover:text-chalk">
                  {item.label}
                </span>
              </span>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
