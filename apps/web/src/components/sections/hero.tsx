import { Button } from "@repo/ui";
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_srgb,var(--color-brass)_10%,transparent),transparent)]"
      />

      <span className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wide text-ash uppercase">
        <span className="size-1.5 rounded-full bg-brass" />
        Инженерные услуги
      </span>

      <h1 className="max-w-3xl animate-fade-up text-4xl leading-tight font-semibold tracking-tight text-paper [animation-delay:80ms] sm:text-6xl">
        Инженерные решения,
        <br />
        продуманные до деталей
      </h1>

      <p className="mt-6 max-w-xl animate-fade-up text-base text-ash [animation-delay:160ms] sm:text-lg">
        Заглушка описания: проектирование, расчёты и техническое сопровождение проектов — от идеи до
        сдачи объекта.
      </p>

      <div className="mt-10 flex animate-fade-up flex-col items-center gap-3 [animation-delay:240ms] sm:flex-row">
        <Button size="lg" className="group rounded-full px-7">
          Обсудить проект
          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-full border-border px-7 text-paper hover:bg-paper/10"
        >
          Смотреть портфолио
        </Button>
      </div>

      <a
        href="#about"
        aria-label="Прокрутить вниз"
        className="absolute bottom-10 inline-flex size-10 animate-bounce items-center justify-center rounded-full text-ash transition-colors duration-300 hover:text-paper"
      >
        <ArrowDownIcon className="size-5" />
      </a>
    </section>
  );
}
