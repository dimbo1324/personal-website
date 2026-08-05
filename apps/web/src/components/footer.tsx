import { GlobeIcon, MailIcon, SendIcon } from "lucide-react";

const links = ["Главная", "Обо мне", "Услуги", "Портфолио", "Контакты"];
const socials = [
  { icon: MailIcon, label: "Почта" },
  { icon: SendIcon, label: "Telegram" },
  { icon: GlobeIcon, label: "Сайт" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-sm font-semibold tracking-wide text-paper">Имя Фамилия</span>
          <p className="mt-1 text-xs text-ash">Заглушка: инженерные услуги под ключ.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ash">
          {links.map((label) => (
            <button
              key={label}
              type="button"
              className="transition-colors duration-300 hover:text-paper"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {socials.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-ash transition-colors duration-300 hover:border-brass/40 hover:text-brass"
            >
              <Icon className="size-4" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>

      <p className="border-t border-border px-6 py-5 text-center text-xs text-ash">
        © {new Date().getFullYear()} Имя Фамилия. Заглушка футера.
      </p>
    </footer>
  );
}
