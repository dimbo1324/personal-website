"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormValues, type LeadResponse } from "@repo/core/schemas";
import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRightIcon,
  AtSignIcon,
  CheckIcon,
  ClockIcon,
  LoaderCircleIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  SendIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { SectionHeading } from "@/components/chrome/section-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { CornerTicks } from "@/components/motion/panel";
import { draftFromForm, messengers, telegramLink, whatsappLink } from "@/config/contact";
import { contact, site } from "@/content/site";
import { ease, viewportOnce } from "@/lib/motion";

type Status = { kind: "idle" } | { kind: "ok"; text: string } | { kind: "error"; text: string };

export function Contact() {
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      budget: "",
      message: "",
      company: "",
    },
  });

  // Only the fields the messenger draft needs — a full `watch()` would re-render
  // the whole form on every keystroke.
  const values = useWatch({ control, name: ["name", "service", "budget", "message"] });
  const [draftName, draftService, draftBudget, draftMessage] = values;

  async function onSubmit(data: ContactFormValues) {
    setStatus({ kind: "idle" });
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as LeadResponse;

      if (result.ok) {
        setStatus({ kind: "ok", text: result.message });
        reset();
      } else {
        setStatus({ kind: "error", text: result.message });
      }
    } catch {
      setStatus({
        kind: "error",
        text: "Сеть недоступна. Напишите, пожалуйста, в Telegram или WhatsApp — так быстрее.",
      });
    }
  }

  const draft = draftFromForm({
    name: draftName,
    service: draftService,
    budget: draftBudget,
    message: draftMessage,
  });

  return (
    <section id="contact" data-domain="it" className="relative py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="07"
          eyebrow={contact.eyebrow}
          title={contact.heading}
          lede={contact.lede}
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          {/* channels column */}
          <div className="flex flex-col gap-3.5">
            <ChannelCard
              icon={SendIcon}
              title="Telegram"
              value={messengers.telegram.handle}
              note="Самый быстрый канал"
              href={telegramLink(draft)}
              accent="text-[#4aa8e0]"
              highlight
            />
            <ChannelCard
              icon={MessageCircleIcon}
              title="WhatsApp"
              value={site.phone}
              note="Можно прислать фото и чертежи"
              href={whatsappLink(draft)}
              accent="text-[#4fce7a]"
            />
            <ChannelCard
              icon={PhoneIcon}
              title="Телефон"
              value={site.phone}
              note={site.workingHours}
              href={`tel:${site.phoneHref}`}
              accent="text-accent"
            />
            <ChannelCard
              icon={AtSignIcon}
              title="Почта"
              value={site.email}
              note="Для документов и КП"
              href={`mailto:${site.email}`}
              accent="text-silver"
            />

            <div className="mt-1 flex flex-col gap-2.5 rounded-2xl border border-iron/70 bg-steel/30 p-4">
              <InfoRow icon={MapPinIcon} text={`${site.city} · выезд по России`} />
              <InfoRow icon={ClockIcon} text={`Отвечаю ${site.responseTime}`} />
            </div>
          </div>

          {/* form */}
          <motion.form
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            initial={reduced ? undefined : { opacity: 0, y: 26 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.75, ease: ease.expo }}
            className="group/panel relative overflow-hidden rounded-[22px] border border-iron/80 bg-slate/60 p-6 backdrop-blur-[2px] sm:p-8"
          >
            <CornerTicks />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 grid-field-fine opacity-[0.35]"
            />

            <div className="relative">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Имя" error={errors.name?.message} htmlFor="name">
                  <input
                    id="name"
                    autoComplete="name"
                    placeholder="Как к вам обращаться"
                    {...register("name")}
                    className={inputClass}
                  />
                </Field>

                <Field label="Email" error={errors.email?.message} htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.ru"
                    {...register("email")}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="Телефон"
                  hint="необязательно"
                  error={errors.phone?.message}
                  htmlFor="phone"
                >
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                    {...register("phone")}
                    className={inputClass}
                  />
                </Field>
              </div>

              <ChipGroup
                legend="Что нужно"
                options={contact.services}
                value={draftService ?? ""}
                onChange={(next) => setValue("service", next, { shouldDirty: true })}
              />

              <ChipGroup
                legend="Ориентир по бюджету"
                options={contact.budgets}
                value={draftBudget ?? ""}
                onChange={(next) => setValue("budget", next, { shouldDirty: true })}
              />

              <div className="mt-5">
                <Field label="Задача" error={errors.message?.message} htmlFor="message">
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Объект, сроки, что уже есть на руках, какой результат нужен…"
                    {...register("message")}
                    className={cn(inputClass, "resize-none")}
                  />
                </Field>
              </div>

              {/* honeypot — hidden from humans, irresistible to bots */}
              <div aria-hidden className="absolute -left-[9999px] size-0 overflow-hidden">
                <label htmlFor="company">Компания</label>
                <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
              </div>

              <div className="mt-7 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xs text-[11.5px] leading-relaxed text-mist">
                  Отправляя форму, вы соглашаетесь на обработку указанных данных для ответа на
                  обращение.
                </p>

                <Magnetic strength={0.25}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-accent px-7 text-[14px] font-semibold text-void transition-transform duration-300 active:scale-[0.97] disabled:cursor-progress disabled:opacity-70 sm:w-auto"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-[900ms] group-hover:translate-x-full" />
                    {isSubmitting ? (
                      <LoaderCircleIcon
                        className="relative size-4 animate-spin"
                        strokeWidth={2.4}
                      />
                    ) : (
                      <SendIcon className="relative size-4" strokeWidth={2.2} />
                    )}
                    <span className="relative">
                      {isSubmitting ? "Отправляю…" : "Отправить заявку"}
                    </span>
                  </button>
                </Magnetic>
              </div>

              <AnimatePresence>
                {status.kind !== "idle" ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.4, ease: ease.expo }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3.5",
                        status.kind === "ok"
                          ? "border-signal/35 bg-signal/8 text-signal"
                          : "border-ember/40 bg-ember/8 text-ember",
                      )}
                    >
                      {status.kind === "ok" ? (
                        <CheckIcon className="mt-px size-4 shrink-0" strokeWidth={2.4} />
                      ) : (
                        <TriangleAlertIcon className="mt-px size-4 shrink-0" strokeWidth={2} />
                      )}
                      <p className="text-[13px] leading-relaxed">{status.text}</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

const inputClass = cn(
  "h-11 w-full rounded-xl border border-iron/80 bg-carbon/70 px-3.5 text-[14px] text-chalk",
  "transition-[border-color,box-shadow,background-color] duration-300 outline-none",
  "placeholder:text-mist/55",
  "focus:border-accent/55 focus:bg-carbon focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_12%,transparent)]",
);

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="font-mono text-[10px] tracking-[0.16em] text-mist uppercase"
        >
          {label}
        </label>
        {hint ? (
          <span className="font-mono text-[9.5px] text-mist/60 lowercase">{hint}</span>
        ) : null}
      </div>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11.5px] text-ember"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ChipGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="mb-2 font-mono text-[10px] tracking-[0.16em] text-mist uppercase">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              // Tapping the active chip clears it — no reset button needed.
              onClick={() => onChange(selected ? "" : option)}
              className={cn(
                "relative rounded-lg border px-3 py-1.5 text-[12.5px] transition-[color,border-color,background-color] duration-300",
                selected
                  ? "border-accent/55 bg-accent/12 text-chalk"
                  : "border-iron/70 bg-carbon/50 text-mist hover:border-iron hover:text-silver",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={`chip-${legend}`}
                  transition={{ type: "spring", stiffness: 460, damping: 36 }}
                  className="absolute inset-0 rounded-lg border border-accent/50 bg-accent/10"
                />
              ) : null}
              <span className="relative">{option}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ChannelCard({
  icon: Icon,
  title,
  value,
  note,
  href,
  accent,
  highlight = false,
}: {
  icon: typeof SendIcon;
  title: string;
  value: string;
  note: string;
  href: string;
  accent: string;
  highlight?: boolean;
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group/panel relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4",
        "transition-[border-color,transform,background-color] duration-500 ease-(--ease-expo) hover:-translate-y-0.5",
        highlight
          ? "border-accent/35 bg-accent/6 hover:border-accent/55"
          : "border-iron/70 bg-slate/50 hover:border-accent/35",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl border border-iron/70 bg-carbon/70 transition-transform duration-500 ease-(--ease-back) group-hover/panel:scale-110",
          accent,
        )}
      >
        <Icon className="size-[18px]" strokeWidth={1.7} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-chalk">{title}</span>
          {highlight ? (
            <span className="rounded-full bg-accent/15 px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.14em] text-accent uppercase">
              рекомендую
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11.5px] text-silver/80">
          {value}
        </span>
        <span className="mt-0.5 block text-[11px] text-mist">{note}</span>
      </span>

      <ArrowUpRightIcon
        className="size-4 shrink-0 text-mist transition-all duration-500 ease-(--ease-expo) group-hover/panel:translate-x-0.5 group-hover/panel:-translate-y-0.5 group-hover/panel:text-accent"
        strokeWidth={1.8}
      />
    </a>
  );
}

function InfoRow({ icon: Icon, text }: { icon: typeof MapPinIcon; text: string }) {
  return (
    <span className="flex items-center gap-2.5 text-[12.5px] text-mist">
      <Icon className="size-3.5 shrink-0 text-accent/80" strokeWidth={1.7} />
      {text}
    </span>
  );
}
