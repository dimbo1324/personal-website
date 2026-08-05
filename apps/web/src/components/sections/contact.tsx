"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormValues } from "@repo/core/schemas";
import { Button } from "@repo/ui";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const contactInfo = [
  { icon: MailIcon, label: "почта@заглушка.ru" },
  { icon: PhoneIcon, label: "+7 (000) 000-00-00" },
  { icon: MapPinIcon, label: "Город, Россия" },
];

export function Contact() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactFormSchema) });

  function onSubmit() {
    setSent(true);
    reset();
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-medium tracking-widest text-brass uppercase">Контакты</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
          Свяжитесь со мной
        </h2>
        <p className="mt-4 text-sm text-ash sm:text-base">
          Заглушка текста: расскажите о задаче — отвечу в течение рабочего дня.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="flex flex-col gap-4">
          {contactInfo.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-ink/60 text-brass">
                <Icon className="size-4" strokeWidth={1.5} />
              </span>
              <span className="text-sm text-ash">{label}</span>
            </div>
          ))}
        </div>

        <form
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-ash">
                Имя
              </label>
              <input
                id="name"
                {...register("name")}
                placeholder="Ваше имя"
                className="rounded-lg border border-border bg-ink/40 px-3 py-2.5 text-sm text-paper placeholder:text-ash/60 focus:border-brass/50 focus:outline-none"
              />
              {errors.name ? <p className="text-xs text-brass">{errors.name.message}</p> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-ash">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className="rounded-lg border border-border bg-ink/40 px-3 py-2.5 text-sm text-paper placeholder:text-ash/60 focus:border-brass/50 focus:outline-none"
              />
              {errors.email ? <p className="text-xs text-brass">{errors.email.message}</p> : null}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-1.5">
            <label htmlFor="message" className="text-xs font-medium text-ash">
              Сообщение
            </label>
            <textarea
              id="message"
              rows={4}
              {...register("message")}
              placeholder="Опишите задачу вкратце…"
              className="resize-none rounded-lg border border-border bg-ink/40 px-3 py-2.5 text-sm text-paper placeholder:text-ash/60 focus:border-brass/50 focus:outline-none"
            />
            {errors.message ? <p className="text-xs text-brass">{errors.message.message}</p> : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs text-ash">Форма демонстрационная, заявки не отправляются.</p>
            <Button type="submit" disabled={isSubmitting} className="shrink-0 rounded-full px-6">
              Отправить
            </Button>
          </div>

          {sent ? (
            <p className="mt-4 rounded-lg border border-border bg-ink/40 px-3 py-2 text-xs text-brass">
              Заглушка: сообщение «отправлено».
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
