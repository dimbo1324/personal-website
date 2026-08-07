"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpIcon, AtSignIcon, MessageCircleIcon, PhoneIcon, SendIcon } from "lucide-react";

import { ScrambleText } from "@/components/motion/split-text";
import { messengers, telegramLink, whatsappLink } from "@/config/contact";
import { legal, nav, site } from "@/content/site";
import { ease, viewportOnce } from "@/lib/motion";

const SOCIALS = [
  { icon: SendIcon, label: "Telegram", href: telegramLink(), title: messengers.telegram.handle },
  { icon: MessageCircleIcon, label: "WhatsApp", href: whatsappLink(), title: site.phone },
  { icon: PhoneIcon, label: "Позвонить", href: `tel:${site.phoneHref}`, title: site.phone },
  { icon: AtSignIcon, label: "Почта", href: `mailto:${site.email}`, title: site.email },
];

export function Footer() {
  const reduced = useReducedMotion();

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <footer className="relative overflow-hidden border-t border-hairline">
      {/* oversized wordmark, cropped by the fold — the page's closing note */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-2.5vw] flex justify-center"
      >
        <span className="font-display text-[14vw] leading-[0.8] font-bold tracking-[-0.06em] whitespace-nowrap text-chalk/[0.03] select-none">
          {site.shortName}
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:gap-14">
          <div>
            <p className="font-display text-[19px] font-semibold tracking-tight text-chalk">
              <ScrambleText text={site.name} />
            </p>
            <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-mist">
              {site.tagline}. {site.city}, работа по всей России.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  title={`${social.label} · ${social.title}`}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex size-10 items-center justify-center rounded-xl border border-iron/70 bg-steel/30 text-mist transition-[color,border-color,transform] duration-400 ease-(--ease-expo) hover:-translate-y-0.5 hover:border-accent/45 hover:text-accent"
                >
                  <social.icon
                    className="size-4 transition-transform duration-400 ease-(--ease-back) group-hover:scale-110"
                    strokeWidth={1.7}
                  />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Разделы сайта">
            <p className="font-mono text-[10px] tracking-[0.24em] text-mist/70 uppercase">
              Навигация
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
              {nav.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={reduced ? undefined : { opacity: 0, x: -8 }}
                  whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.5, delay: index * 0.04, ease: ease.expo }}
                >
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    className="group flex items-center gap-2 py-1.5 text-[13.5px] text-silver/80 transition-colors duration-300 hover:text-chalk"
                  >
                    <span className="font-mono text-[9.5px] text-mist/60 transition-colors duration-300 group-hover:text-accent">
                      {item.short}
                    </span>
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-400 ease-(--ease-expo) group-hover:origin-left group-hover:scale-x-100" />
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex items-center gap-2.5 rounded-xl border border-iron/70 bg-steel/30 py-2.5 pr-3 pl-4 text-[12.5px] font-medium text-silver transition-[color,border-color] duration-300 hover:border-accent/45 hover:text-chalk"
            >
              Наверх
              <span className="flex size-6 items-center justify-center rounded-lg bg-accent/12 text-accent transition-transform duration-400 ease-(--ease-back) group-hover:-translate-y-0.5">
                <ArrowUpIcon className="size-3.5" strokeWidth={2.2} />
              </span>
            </button>

            <p className="font-mono text-[10px] tracking-[0.16em] text-mist/60 uppercase lg:text-right">
              {site.workingHours}
              <br />
              {site.timezone}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10.5px] text-mist/70">
            © {new Date().getFullYear()} {legal.entity}
          </p>
          <p className="max-w-lg font-mono text-[10.5px] text-mist/50">
            {legal.copyrightNote} {legal.imageCredit}.
          </p>
        </div>
      </div>
    </footer>
  );
}
