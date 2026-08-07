"use client";

import { cn } from "@repo/ui/lib/utils";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownIcon, ArrowUpRightIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { RotatingWord, SplitWords } from "@/components/motion/split-text";
import { telegramLink, whatsappLink } from "@/config/contact";
import { hero, site } from "@/content/site";
import { ease } from "@/lib/motion";

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(7px)"]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /** Entrance animation props, dropped entirely when motion is reduced. */
  function enter(delay: number, y = 16) {
    if (reduced) return {};
    return {
      initial: { opacity: 0, y },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, delay, ease: ease.expo },
    };
  }

  return (
    <section
      ref={ref}
      id="hero"
      data-domain="engineering"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-28 pb-0"
    >
      {/* photographic backdrop, pushed far back and desaturated into the palette */}
      <motion.div
        aria-hidden
        style={{ y: reduced ? 0 : imageY }}
        className="pointer-events-none absolute inset-0 -z-20"
      >
        <Image
          src="/images/facade-night.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 mask-b-fade object-cover opacity-[0.30] saturate-[0.55]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-void/70 via-void/45 to-void" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,transparent,var(--color-void)_88%)]" />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: fade, filter: blur }}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 sm:px-8"
      >
        {/* availability chip */}
        <motion.div {...enter(0.15, 14)} className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-iron/80 bg-carbon/60 py-1.5 pr-4 pl-2.5 backdrop-blur-md">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-silver uppercase">
              {hero.status}
            </span>
          </span>

          <span className="hidden font-mono text-[10px] tracking-[0.18em] text-mist/70 uppercase sm:block">
            {site.city} · {site.timezone}
          </span>
        </motion.div>

        {/* headline */}
        <h1 className="mt-6 font-display text-[clamp(2.15rem,5.4vw,4.6rem)] leading-[0.98] font-semibold tracking-[-0.04em] text-chalk">
          <span className="block">
            <SplitWords text={hero.headingLead} delay={0.25} step={0.05} />{" "}
            <RotatingWord words={hero.headingRotators} wordClassName="text-accent-gradient" />
          </span>
          <span className="mt-1 block text-mist/80">
            <SplitWords text={hero.headingTail} delay={0.45} step={0.05} />
          </span>
        </h1>

        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          <motion.p
            {...enter(0.7, 18)}
            className="max-w-xl text-[15px] leading-relaxed text-silver/85 sm:text-base"
          >
            {hero.lede}
          </motion.p>

          <motion.div
            {...enter(0.85, 18)}
            className="flex flex-col gap-3.5 sm:flex-row sm:items-center lg:justify-end"
          >
            <Magnetic strength={0.28}>
              <button
                type="button"
                onClick={() => scrollTo("contact")}
                data-cursor="link"
                className="group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-accent px-7 text-[14px] font-semibold text-void transition-transform duration-300 active:scale-[0.97] sm:w-auto"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-[900ms] group-hover:translate-x-full" />
                <span className="relative">{hero.primaryCta}</span>
                <ArrowUpRightIcon
                  className="relative size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.3}
                />
              </button>
            </Magnetic>

            <button
              type="button"
              onClick={() => scrollTo("works")}
              className="group flex h-13 items-center justify-center gap-2 rounded-2xl border border-iron/80 bg-carbon/50 px-6 text-[14px] font-medium text-silver backdrop-blur-md transition-colors duration-300 hover:border-accent/40 hover:text-chalk"
            >
              {hero.secondaryCta}
              <ArrowDownIcon
                className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                strokeWidth={1.8}
              />
            </button>
          </motion.div>
        </div>

        {/* direct channels */}
        <motion.div
          {...enter(1.05, 10)}
          className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] text-mist/70 uppercase">
            или сразу в мессенджер
          </span>
          <ChannelLink href={telegramLink()} icon={SendIcon} label="Telegram" />
          <ChannelLink href={whatsappLink()} icon={MessageCircleIcon} label="WhatsApp" />
        </motion.div>
      </motion.div>

      {/* capability ticker anchored to the fold */}
      <div className="relative border-y border-hairline/80 bg-carbon/40 backdrop-blur-sm">
        <Marquee speed={34} className="mask-x-fade py-3.5">
          {hero.ticker.map((word) => (
            <span key={word} className="flex items-center">
              <span className="px-6 font-mono text-[11px] tracking-[0.22em] text-mist uppercase">
                {word}
              </span>
              <span className="size-1 rotate-45 bg-accent/50" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* scroll cue */}
      <motion.button
        type="button"
        onClick={() => scrollTo("about")}
        {...enter(1.4, 0)}
        style={reduced ? undefined : { opacity: fade }}
        aria-label={hero.scrollHint}
        className="absolute right-5 bottom-20 hidden flex-col items-center gap-3 text-mist transition-colors duration-300 hover:text-accent sm:right-8 lg:flex"
      >
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase [writing-mode:vertical-rl]">
          {hero.scrollHint}
        </span>
        <span className="relative h-14 w-px overflow-hidden bg-iron">
          <motion.span
            className="absolute inset-x-0 h-5 bg-accent"
            animate={{ y: ["-100%", "300%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: ease.swift }}
          />
        </span>
      </motion.button>
    </section>
  );
}

function ChannelLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof SendIcon;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-center gap-2 text-[13px] font-medium text-silver transition-colors duration-300 hover:text-accent",
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.8} />
      <span className="relative">
        {label}
        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-400 ease-(--ease-expo) group-hover:origin-left group-hover:scale-x-100" />
      </span>
    </a>
  );
}
