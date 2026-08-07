"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRightIcon, PhoneIcon, SearchIcon, SendIcon } from "lucide-react";

import { messengers, telegramLink, whatsappLink } from "@/config/contact";
import { nav, site } from "@/content/site";
import { ease } from "@/lib/motion";

export function MobileNav({
  open,
  active,
  onSelect,
  onSearch,
}: {
  open: boolean;
  active: string;
  onSelect: (id: string) => void;
  onSearch: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: ease.expo }}
          className="mx-auto max-w-5xl overflow-hidden md:hidden"
        >
          <div className="mt-2 rounded-2xl border border-iron/80 bg-carbon/95 p-2 backdrop-blur-2xl">
            <nav className="flex flex-col">
              {nav.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + index * 0.045, duration: 0.42, ease: ease.expo }}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-300",
                    active === item.id
                      ? "bg-accent/10 text-chalk"
                      : "text-silver hover:bg-steel/60",
                  )}
                >
                  <span className="font-mono text-[10px] text-accent tabular-nums">
                    {item.short}
                  </span>
                  <span className="flex-1 text-[15px] font-medium">{item.label}</span>
                  <ArrowUpRightIcon
                    className="size-4 text-mist transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.6}
                  />
                </motion.button>
              ))}
            </nav>

            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-hairline pt-2">
              <QuickTile icon={SearchIcon} label="Поиск" onClick={onSearch} />
              <QuickTile
                icon={SendIcon}
                label="Telegram"
                href={telegramLink()}
                title={messengers.telegram.handle}
              />
              <QuickTile icon={PhoneIcon} label="Позвонить" href={`tel:${site.phoneHref}`} />
            </div>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[13px] font-semibold text-void"
            >
              Написать в WhatsApp
              <ArrowUpRightIcon className="size-4" strokeWidth={2.2} />
            </a>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function QuickTile({
  icon: Icon,
  label,
  href,
  title,
  onClick,
}: {
  icon: typeof SearchIcon;
  label: string;
  href?: string;
  title?: string;
  onClick?: () => void;
}) {
  const className =
    "flex flex-col items-center gap-1.5 rounded-xl border border-iron/60 bg-steel/40 px-2 py-3 text-[11px] text-silver transition-colors duration-300 hover:border-accent/40 hover:text-chalk";

  const inner = (
    <>
      <Icon className="size-4 text-accent" strokeWidth={1.6} />
      {label}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        title={title}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
