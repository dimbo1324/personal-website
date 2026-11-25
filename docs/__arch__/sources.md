# Стек проекта

Реестр всего, что проект берёт извне: языки, инструменты, библиотеки и сервисы — название,
используемая версия, сайт (откуда скачать) и исходники.

**Обязанность каждого ассистента и разработчика** (правило в `.ai/project/13-progress-tracking.md`):
подключили новый язык, инструмент, библиотеку, фреймворк или внешний API — добавьте строку сюда;
обновили версию или убрали — исправьте строку. Только эти четыре колонки, без описаний. Источник
версий — `package.json`, `package-lock.json`, `.nvmrc`, `.github/workflows/ci.yml`.

Сверено с файлами проекта 2026-11-24.

## Платформа и сервисы

| Название                   | Версия                    | Сайт                                              | Исходники                                 |
| -------------------------- | ------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Node.js                    | 24 (`.nvmrc`), от 22.23.4 | https://nodejs.org                                | https://github.com/nodejs/node            |
| npm                        | 11 (с Node)               | https://www.npmjs.com                             | https://github.com/npm/cli                |
| Git                        | текущая                   | https://git-scm.com/downloads                     | https://github.com/git/git                |
| GitHub, GitHub Actions     | —                         | https://docs.github.com/actions                   | —                                         |
| GitHub CLI (`gh`)          | текущая                   | https://cli.github.com                            | https://github.com/cli/cli                |
| Cloudflare Pages           | —                         | https://pages.cloudflare.com                      | —                                         |
| Cloudflare Pages Functions | —                         | https://developers.cloudflare.com/pages/functions | https://github.com/cloudflare/workerd     |
| Cloudflare Turnstile       | API `v0`                  | https://developers.cloudflare.com/turnstile       | —                                         |
| Telegram Bot API           | текущая                   | https://core.telegram.org/bots/api                | https://github.com/tdlib/telegram-bot-api |
| WhatsApp Click-to-Chat     | `wa.me`                   | https://faq.whatsapp.com/5913398998672934         | —                                         |

## Фреймворк и интерфейс

| Название                  | Версия       | Сайт                                                    | Исходники                                   |
| ------------------------- | ------------ | ------------------------------------------------------- | ------------------------------------------- |
| Astro                     | 7.4.13       | https://astro.build                                     | https://github.com/withastro/astro          |
| Tailwind CSS              | 4.3.5        | https://tailwindcss.com                                 | https://github.com/tailwindlabs/tailwindcss |
| @tailwindcss/vite         | 4.3.5        | https://tailwindcss.com/docs/installation/using-vite    | https://github.com/tailwindlabs/tailwindcss |
| Lucide (`lucide`)         | 1.79.0       | https://lucide.dev                                      | https://github.com/lucide-icons/lucide      |
| @lucide/astro             | 1.79.0       | https://lucide.dev/guide/packages/lucide-astro          | https://github.com/lucide-icons/lucide      |
| TypeScript                | 6.0.3        | https://www.typescriptlang.org                          | https://github.com/microsoft/TypeScript     |
| @cloudflare/workers-types | 5.20261124.2 | https://www.npmjs.com/package/@cloudflare/workers-types | https://github.com/cloudflare/workerd       |
| Wrangler                  | 4.168.0      | https://developers.cloudflare.com/workers/wrangler      | https://github.com/cloudflare/workers-sdk   |

## Инструменты сборки и проверки

| Название                    | Версия  | Сайт                                                             | Исходники                                                   |
| --------------------------- | ------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Vitest                      | 5.1.1   | https://vitest.dev                                               | https://github.com/vitest-dev/vitest                        |
| jsdom                       | 31.0.1  | https://github.com/jsdom/jsdom                                   | https://github.com/jsdom/jsdom                              |
| ESLint                      | 10.15.0 | https://eslint.org                                               | https://github.com/eslint/eslint                            |
| @eslint/js                  | 10.0.1  | https://eslint.org                                               | https://github.com/eslint/eslint                            |
| typescript-eslint           | 8.74.0  | https://typescript-eslint.io                                     | https://github.com/typescript-eslint/typescript-eslint      |
| eslint-plugin-astro         | 3.2.1   | https://ota-meshi.github.io/eslint-plugin-astro                  | https://github.com/ota-meshi/eslint-plugin-astro            |
| globals                     | 17.14.0 | https://www.npmjs.com/package/globals                            | https://github.com/sindresorhus/globals                     |
| Prettier                    | 3.10.1  | https://prettier.io                                              | https://github.com/prettier/prettier                        |
| prettier-plugin-astro       | 1.1.2   | https://github.com/withastro/prettier-plugin-astro               | https://github.com/withastro/prettier-plugin-astro          |
| prettier-plugin-tailwindcss | 0.8.1   | https://github.com/tailwindlabs/prettier-plugin-tailwindcss      | https://github.com/tailwindlabs/prettier-plugin-tailwindcss |
| @astrojs/check              | 0.9.12  | https://docs.astro.build/en/reference/cli-reference/#astro-check | https://github.com/withastro/astro                          |
| @types/node                 | 24.19.2 | https://www.npmjs.com/package/@types/node                        | https://github.com/DefinitelyTyped/DefinitelyTyped          |

## GitHub Actions

| Название                | Версия | Сайт                                       | Исходники                                  |
| ----------------------- | ------ | ------------------------------------------ | ------------------------------------------ |
| actions/checkout        | v7.0.1 | https://github.com/actions/checkout        | https://github.com/actions/checkout        |
| actions/setup-node      | v7.1.0 | https://github.com/actions/setup-node      | https://github.com/actions/setup-node      |
| actions/upload-artifact | v7.0.2 | https://github.com/actions/upload-artifact | https://github.com/actions/upload-artifact |
