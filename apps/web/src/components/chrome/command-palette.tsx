"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightIcon,
  BlocksIcon,
  CornerDownLeftIcon,
  LayersIcon,
  SearchIcon,
  SendIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { messengers, telegramLink, whatsappLink } from "@/config/contact";
import { nav, services, site, works } from "@/content/site";
import { useScrollLock } from "@/lib/hooks";
import { ease } from "@/lib/motion";

interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  keywords: string;
  run: () => void;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * ⌘K palette over the whole site: sections, services, works and the direct
 * contact channels in one keyboard-driven list.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  const commands = useMemo<Command[]>(() => {
    const close = () => onOpenChange(false);

    return [
      ...nav.map((item) => ({
        id: `nav-${item.id}`,
        label: item.label,
        group: "Разделы",
        hint: item.short,
        keywords: `${item.label} ${item.id}`,
        run: () => {
          close();
          scrollToSection(item.id);
        },
      })),
      ...services.map((service) => ({
        id: `service-${service.id}`,
        label: service.title,
        group: "Услуги",
        hint: service.domain === "it" ? "IT" : "Инженерия",
        keywords: `${service.title} ${service.description} ${service.bullets.join(" ")}`,
        run: () => {
          close();
          scrollToSection("services");
        },
      })),
      ...works.map((work) => ({
        id: `work-${work.id}`,
        label: work.title,
        group: "Работы",
        hint: work.year,
        keywords: `${work.title} ${work.category} ${work.tags.join(" ")} ${work.place}`,
        run: () => {
          close();
          scrollToSection("works");
        },
      })),
      {
        id: "ch-telegram",
        label: `Написать в Telegram · ${messengers.telegram.handle}`,
        group: "Связаться",
        keywords: "telegram телеграм написать чат",
        run: () => {
          close();
          window.open(telegramLink(), "_blank", "noopener,noreferrer");
        },
      },
      {
        id: "ch-whatsapp",
        label: "Написать в WhatsApp",
        group: "Связаться",
        keywords: "whatsapp вотсап ватсап написать",
        run: () => {
          close();
          window.open(whatsappLink(), "_blank", "noopener,noreferrer");
        },
      },
      {
        id: "ch-phone",
        label: `Позвонить · ${site.phone}`,
        group: "Связаться",
        keywords: "телефон позвонить звонок phone",
        run: () => {
          close();
          window.location.href = `tel:${site.phoneHref}`;
        },
      },
    ];
  }, [onOpenChange]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.keywords}`.toLowerCase().includes(needle),
    );
  }, [commands, query]);

  // Reset during render rather than in an effect: opening the palette or typing
  // a new query invalidates the highlighted row immediately, with no extra pass.
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setCursor(0);
  }

  const [lastOpen, setLastOpen] = useState(open);
  if (lastOpen !== open) {
    setLastOpen(open);
    if (open) {
      setQuery("");
      setLastQuery("");
      setCursor(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setCursor((value) => (results.length === 0 ? 0 : (value + 1) % results.length));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setCursor((value) =>
          results.length === 0 ? 0 : (value - 1 + results.length) % results.length,
        );
      }
      if (event.key === "Enter") {
        event.preventDefault();
        results[cursor]?.run();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cursor, onOpenChange, open, results]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Закрыть поиск"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Быстрый поиск по сайту"
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.34, ease: ease.expo }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-iron bg-carbon/95 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.95)]"
          >
            <div className="flex items-center gap-3 border-b border-hairline px-4">
              <SearchIcon className="size-4 shrink-0 text-accent" strokeWidth={1.6} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Раздел, услуга, проект…"
                className="h-14 w-full bg-transparent text-[15px] text-chalk outline-none placeholder:text-mist/60"
              />
              <kbd className="hidden shrink-0 rounded border border-iron px-1.5 py-0.5 font-mono text-[10px] text-mist sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="hide-scrollbar max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-mist">Ничего не нашлось</p>
              ) : (
                results.map((command, index) => {
                  const showGroup = command.group !== lastGroup;
                  lastGroup = command.group;

                  return (
                    <div key={command.id}>
                      {showGroup ? (
                        <p className="px-3 pt-3 pb-1.5 font-mono text-[9px] tracking-[0.24em] text-mist/70 uppercase">
                          {command.group}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        data-index={index}
                        onMouseMove={() => setCursor(index)}
                        onClick={command.run}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
                          index === cursor
                            ? "bg-accent/12 text-chalk"
                            : "text-silver/85 hover:bg-steel/60",
                        )}
                      >
                        <ChannelIcon group={command.group} />
                        <span className="flex-1 truncate text-sm">{command.label}</span>
                        {command.hint ? (
                          <span className="font-mono text-[10px] text-mist">{command.hint}</span>
                        ) : null}
                        {index === cursor ? (
                          <CornerDownLeftIcon
                            className="size-3.5 shrink-0 text-accent"
                            strokeWidth={1.6}
                          />
                        ) : null}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-hairline px-4 py-2.5 font-mono text-[10px] text-mist">
              <span>↑↓ навигация · ⏎ выбрать</span>
              <span>{results.length} совпадений</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const GROUP_ICONS = {
  Разделы: ArrowRightIcon,
  Услуги: LayersIcon,
  Работы: BlocksIcon,
  Связаться: SendIcon,
} as const;

function ChannelIcon({ group }: { group: string }) {
  const Icon = GROUP_ICONS[group as keyof typeof GROUP_ICONS] ?? ArrowRightIcon;
  return <Icon className="size-3.5 shrink-0 text-mist" strokeWidth={1.6} />;
}
