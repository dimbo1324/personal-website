"use client";

import { cn } from "@repo/ui/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";

import { SectionHeading } from "@/components/chrome/section-heading";
import { Panel } from "@/components/motion/panel";
import { type Domain, type Service, services } from "@/content/site";
import { ease, viewportOnce } from "@/lib/motion";

/**
 * Six-column bento. Each group's four cards read 3+3 / 4+2 (or 4+2 / 3+3), so
 * the rhythm shifts between rows without any card growing a dead zone.
 * Tailwind needs the full class names, hence the literal map.
 */
const SPAN: Record<Service["span"], string> = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
};

const GROUPS: Array<{ domain: Domain; label: string; note: string }> = [
  { domain: "engineering", label: "Инженерия", note: "объект, документация, железо" },
  { domain: "it", label: "IT и данные", note: "софт, телеметрия, инфраструктура" },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="02"
          eyebrow="Услуги"
          title="Две половины одной задачи"
          lede="Инженерная часть и цифровая часть закрываются одним подрядом — без потерь на стыке между исполнителями."
        />

        <div className="mt-16 space-y-16">
          {GROUPS.map((group) => (
            <div key={group.domain} data-domain={group.domain}>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "size-2 rotate-45",
                    group.domain === "it" ? "bg-signal" : "bg-ember",
                  )}
                />
                <h3 className="font-display text-[15px] font-semibold tracking-tight text-chalk">
                  {group.label}
                </h3>
                <span className="font-mono text-[10px] tracking-[0.18em] text-mist/70 lowercase">
                  {group.note}
                </span>
                <span className="h-px flex-1 bg-linear-to-r from-iron to-transparent" />
              </div>

              <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
                {services
                  .filter((service) => service.domain === group.domain)
                  .map((service, index) => (
                    <ServiceCard key={service.id} service={service} index={index} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const reduced = useReducedMotion();
  const Icon = service.icon;
  const wide = service.span === 4;

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 26 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, delay: index * 0.07, ease: ease.expo }}
      className={SPAN[service.span]}
    >
      <Panel className={cn("flex h-full flex-col p-6", wide && "sm:p-8")}>
        <div className="flex items-start justify-between gap-4">
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-iron/80 bg-carbon/70 text-accent">
            {/* icon lifts and the ring rotates behind it on hover */}
            <span className="absolute inset-0 rounded-xl border border-accent/0 transition-[transform,border-color] duration-700 ease-(--ease-expo) group-hover/panel:rotate-45 group-hover/panel:border-accent/30" />
            <Icon
              className="relative size-5 transition-transform duration-500 ease-(--ease-back) group-hover/panel:-translate-y-0.5 group-hover/panel:scale-110"
              strokeWidth={1.5}
            />
          </span>

          <ArrowUpRightIcon
            className="size-4 shrink-0 translate-y-1 text-mist opacity-0 transition-all duration-500 ease-(--ease-expo) group-hover/panel:translate-y-0 group-hover/panel:text-accent group-hover/panel:opacity-100"
            strokeWidth={1.8}
          />
        </div>

        <h4
          className={cn(
            "mt-6 font-display font-semibold tracking-tight text-chalk",
            wide ? "text-[19px] sm:text-[22px]" : "text-[16px]",
          )}
        >
          {service.title}
        </h4>

        <p
          className={cn(
            "mt-2.5 flex-1 leading-relaxed text-mist",
            wide ? "text-[14.5px]" : "text-[13.5px]",
          )}
        >
          {service.description}
        </p>

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {service.bullets.map((bullet) => (
            <li
              key={bullet}
              className="rounded-lg border border-iron/70 bg-steel/40 px-2.5 py-1 font-mono text-[10px] tracking-wide text-silver/80 transition-colors duration-500 group-hover/panel:border-accent/25 group-hover/panel:text-silver"
            >
              {bullet}
            </li>
          ))}
        </ul>
      </Panel>
    </motion.div>
  );
}
