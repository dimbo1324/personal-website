import { QuoteIcon } from "lucide-react";

const testimonials = [
  {
    quote:
      "Заглушка отзыва: качественная и своевременная работа, все сроки были соблюдены, а результат превзошёл ожидания.",
    name: "Иван Иванов",
    role: "Заказчик, промышленный объект",
  },
  {
    quote:
      "Заглушка отзыва: грамотный подход к расчётам и внимание к деталям на каждом этапе проекта.",
    name: "Анна Смирнова",
    role: "Заказчик, частный дом",
  },
  {
    quote: "Заглушка отзыва: рекомендую как надёжного специалиста для сложных технических задач.",
    name: "Пётр Кузнецов",
    role: "Заказчик, реконструкция",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-medium tracking-widest text-brass uppercase">Отзывы</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
          Что говорят клиенты
        </h2>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <figure
            key={item.name}
            className="flex flex-col rounded-2xl border border-border bg-surface p-6"
          >
            <QuoteIcon className="size-6 text-brass/70" strokeWidth={1.5} />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ash">
              {item.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-ink/60 text-xs font-medium text-ash">
                {item.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span>
                <span className="block text-sm font-medium text-paper">{item.name}</span>
                <span className="block text-xs text-ash">{item.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
