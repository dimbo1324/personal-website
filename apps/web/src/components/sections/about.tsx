import { UserRoundIcon } from "lucide-react";

const stats = [
  { value: "8+", label: "лет практики" },
  { value: "120+", label: "проектов" },
  { value: "40+", label: "клиентов" },
  { value: "15", label: "регионов" },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-3xl border border-border bg-surface">
          <UserRoundIcon className="size-20 text-ash" strokeWidth={1.25} />
          <span className="absolute inset-x-6 bottom-6 rounded-full border border-border bg-ink/60 px-3 py-1.5 text-center text-xs text-ash backdrop-blur">
            Заглушка фото
          </span>
        </div>

        <div>
          <span className="text-xs font-medium tracking-widest text-brass uppercase">Обо мне</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
            Имя Фамилия
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ash sm:text-base">
            Заглушка биографии: инженер с опытом реализации проектов разной сложности — от частных
            объектов до промышленных площадок. Работаю на стыке расчёта, конструирования и практики
            стройплощадки, отвечаю за результат на каждом этапе.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-semibold text-brass sm:text-3xl">{stat.value}</dt>
                <dd className="mt-1 text-xs text-ash">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
