const projects = [
  { title: "Проект №1", tag: "Промышленный объект" },
  { title: "Проект №2", tag: "Жилой комплекс" },
  { title: "Проект №3", tag: "Реконструкция" },
  { title: "Проект №4", tag: "Частный дом" },
];

export function Projects() {
  return (
    <section id="portfolio" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-medium tracking-widest text-brass uppercase">Портфолио</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
          Избранные проекты
        </h2>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {projects.map((project, index) => (
          <div
            key={project.title}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div
              className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-graphite via-ink to-ink text-xs tracking-widest text-ash uppercase transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundPosition: `${index * 20}% 50%` }}
            >
              Заглушка изображения
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <h3 className="text-base font-semibold text-paper">{project.title}</h3>
                <p className="mt-1 text-sm text-ash">{project.tag}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-brass opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Подробнее
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
