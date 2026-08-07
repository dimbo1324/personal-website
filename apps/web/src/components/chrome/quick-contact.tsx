"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { AtSignIcon, MessageCircleIcon, PhoneIcon, SendIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { messengers, telegramLink, whatsappLink } from "@/config/contact";
import { site } from "@/content/site";
import { ease, springSnappy } from "@/lib/motion";

interface Channel {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: typeof SendIcon;
  external: boolean;
  tone: string;
}

const CHANNELS: Channel[] = [
  {
    id: "telegram",
    label: "Telegram",
    hint: messengers.telegram.handle,
    href: telegramLink(),
    icon: SendIcon,
    external: true,
    tone: "text-[#4aa8e0]",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    hint: site.phone,
    href: whatsappLink(),
    icon: MessageCircleIcon,
    external: true,
    tone: "text-[#4fce7a]",
  },
  {
    id: "phone",
    label: "Позвонить",
    hint: site.workingHours,
    href: `tel:${site.phoneHref}`,
    icon: PhoneIcon,
    external: false,
    tone: "text-accent",
  },
  {
    id: "email",
    label: "Почта",
    hint: site.email,
    href: `mailto:${site.email}`,
    icon: AtSignIcon,
    external: false,
    tone: "text-silver",
  },
];

/**
 * Persistent contact dock. Collapsed it is a single pulsing button; expanded it
 * fans out every channel with a pre-filled first message.
 */
export function QuickContact() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    // Appear once the hero is behind you, retreat over the contact section.
    setVisible(value > 0.06 && value < 0.94);
  });

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="fixed right-4 bottom-4 z-[85] flex flex-col items-end gap-2.5 sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {open && visible
          ? CHANNELS.map((channel, index) => (
              <motion.a
                key={channel.id}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.85, transition: { duration: 0.14 } }}
                transition={{ ...springSnappy, delay: (CHANNELS.length - index - 1) * 0.035 }}
                className="group flex items-center gap-3 rounded-2xl border border-iron/80 bg-carbon/92 py-2.5 pr-3 pl-3.5 shadow-[0_20px_45px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl transition-colors duration-300 hover:border-accent/45"
              >
                <span className="text-right">
                  <span className="block text-[13px] font-medium text-chalk">{channel.label}</span>
                  <span className="block font-mono text-[10px] text-mist">{channel.hint}</span>
                </span>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl border border-iron/70 bg-steel/60 transition-transform duration-300 group-hover:scale-110",
                    channel.tone,
                  )}
                >
                  <channel.icon className="size-4" strokeWidth={1.7} />
                </span>
              </motion.a>
            ))
          : null}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={open ? "Скрыть контакты" : "Быстрая связь"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.6,
          pointerEvents: visible ? "auto" : "none",
        }}
        transition={{ duration: 0.35, ease: ease.expo }}
        className="relative flex size-13 items-center justify-center rounded-2xl bg-accent text-void shadow-[0_18px_40px_-14px_color-mix(in_srgb,var(--accent)_60%,transparent)] transition-transform duration-300 active:scale-90"
      >
        {!open ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-pulse-ring rounded-2xl border border-accent"
          />
        ) : null}

        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ opacity: 0, rotate: -80, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 80, scale: 0.5 }}
            transition={{ duration: 0.22, ease: ease.expo }}
            className="flex"
          >
            {open ? (
              <XIcon className="size-5" strokeWidth={2.2} />
            ) : (
              <MessageCircleIcon className="size-5" strokeWidth={2} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
