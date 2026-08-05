import {
  ClipboardCheckIcon,
  CompassIcon,
  CpuIcon,
  HardHatIcon,
  RulerIcon,
  SearchCheckIcon,
} from "lucide-react";

const services = [
  {
    icon: CompassIcon,
    title: "Проектирование",
    description: "Заглушка описания услуги проектирования и разработки технической документации.",
  },
  {
    icon: RulerIcon,
    title: "Расчёты и моделирование",
    description: "Заглушка описания: инженерные расчёты, 3D-моделирование, проверка нагрузок.",
  },
  {
    icon: SearchCheckIcon,
    title: "Технический аудит",
    description: "Заглушка описания: оценка состояния объекта и выявление рисков.",
  },
  {
    icon: HardHatIcon,
    title: "Шефмонтаж",
    description: "Заглушка описания: авторский надзор и сопровождение на площадке.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Экспертиза",
    description: "Заглушка описания: независимая экспертиза проектных решений.",
  },
  {
    icon: CpuIcon,
    title: "Консультации",
    description: "Заглушка описания: консультирование по инженерным вопросам проекта.",
  },
];

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-medium tracking-widest text-brass uppercase">Услуги</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
          Чем я могу помочь
        </h2>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group rounded-2xl border border-border bg-surface p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]"
          >
            <div className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-ink/60 text-brass transition-colors duration-300 group-hover:text-paper">
              <Icon className="size-5" strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-base font-semibold text-paper">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ash">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
