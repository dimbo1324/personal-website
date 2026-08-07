import {
  ActivityIcon,
  BlocksIcon,
  BrainCircuitIcon,
  CableIcon,
  CloudIcon,
  CodeXmlIcon,
  CompassIcon,
  CpuIcon,
  DatabaseIcon,
  DraftingCompassIcon,
  FactoryIcon,
  GaugeIcon,
  GitBranchIcon,
  HardHatIcon,
  LayersIcon,
  type LucideIcon,
  NetworkIcon,
  RadarIcon,
  RulerIcon,
  ScanLineIcon,
  SearchCheckIcon,
  ServerIcon,
  ShieldCheckIcon,
  TerminalIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react";

/**
 * Every visible string on the site lives here. The page is single-locale (ru)
 * by design, so a typed content module beats scattering `t("…")` calls through
 * fourteen sections — and it keeps copy edits to one file.
 */

/** Warm = engineering / metal. Cool = IT / digital. Drives the scroll accent. */
export type Domain = "engineering" | "it";

export const site = {
  name: "Дмитрий Приходько",
  shortName: "Д. Приходько",
  initials: "ДП",
  role: "Инженер · Разработчик",
  tagline: "Инженерные и IT-услуги",
  city: "Москва",
  timezone: "МСК / UTC+3",
  email: "hello@prihodko.dev",
  phone: "+7 (900) 000-00-00",
  phoneHref: "+79000000000",
  workingHours: "Пн–Пт, 10:00 — 20:00",
  responseTime: "до 2 часов в рабочее время",
} as const;

/** Visible nav. The hero is reached through the wordmark, not a link. */
export const nav = [
  { id: "about", label: "Обо мне", short: "01" },
  { id: "services", label: "Услуги", short: "02" },
  { id: "process", label: "Процесс", short: "03" },
  { id: "works", label: "Работы", short: "04" },
  { id: "reviews", label: "Отзывы", short: "05" },
  { id: "faq", label: "Вопросы", short: "06" },
  { id: "contact", label: "Контакты", short: "07" },
] as const;

export type NavItem = (typeof nav)[number];

export const hero = {
  status: "Принимаю заявки на IV квартал",
  headingLead: "Инженерия",
  headingRotators: ["и цифра", "и данные", "и автоматика", "и надёжность"],
  headingTail: "в одном подряде",
  lede: "Проектирую, считаю и запускаю: от инженерных решений на объекте до систем сбора данных, диспетчеризации и веб-платформ, которые ими управляют.",
  primaryCta: "Обсудить задачу",
  secondaryCta: "Смотреть работы",
  scrollHint: "Листайте",
  ticker: [
    "проектирование",
    "расчёты и модели",
    "автоматизация",
    "диспетчеризация",
    "телеметрия",
    "веб-платформы",
    "интеграции",
    "технический аудит",
    "сопровождение",
  ],
} as const;

export const stats = [
  { value: 9, suffix: "+", label: "лет практики", hint: "с 2017 года" },
  { value: 140, suffix: "+", label: "сданных проектов", hint: "инженерия и ПО" },
  { value: 46, suffix: "", label: "постоянных клиентов", hint: "повторные обращения" },
  { value: 12, suffix: "", label: "регионов", hint: "выездная работа" },
] as const;

export const about = {
  eyebrow: "Обо мне",
  heading: "Двумя руками: одной — чертёж, другой — код",
  paragraphs: [
    "Начинал на стройплощадке с расчётов и авторского надзора, а закончил тем, что стал писать софт, который эти расчёты выполняет. Сегодня это один подряд: инженерная часть и цифровая часть не передаются между подрядчиками и не теряются на стыке.",
    "Работаю сам и небольшой проверенной командой под задачу. Беру ответственность за результат целиком — от исходных данных до сданного объекта и работающей панели мониторинга.",
  ],
  specs: [
    { key: "Специализация", value: "Инженерные системы, автоматизация, веб" },
    { key: "Формат", value: "Проект под ключ · Аутсорс · Консультации" },
    { key: "География", value: "Россия, выезд на объект" },
    { key: "Документы", value: "ИП, работа по договору, закрывающие" },
    { key: "Стек", value: "AutoCAD · Revit · SCADA · TypeScript · Next.js" },
  ],
  marks: [
    { label: "Инженерная часть", value: 92, domain: "engineering" as Domain },
    { label: "Автоматизация и АСУ", value: 78, domain: "engineering" as Domain },
    { label: "Разработка ПО", value: 85, domain: "it" as Domain },
    { label: "Инфраструктура и DevOps", value: 64, domain: "it" as Domain },
  ],
} as const;

export interface Service {
  id: string;
  domain: Domain;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  /** Column span out of six on large screens — drives the bento rhythm. */
  span: 2 | 3 | 4;
}

export const services: Service[] = [
  {
    id: "design",
    domain: "engineering",
    icon: DraftingCompassIcon,
    title: "Проектирование",
    description:
      "Полный комплект рабочей документации: от обследования и исходных данных до согласования и авторского надзора.",
    bullets: ["Стадии П и Р", "Согласование", "Авторский надзор"],
    span: 3,
  },
  {
    id: "calc",
    domain: "engineering",
    icon: RulerIcon,
    title: "Расчёты и моделирование",
    description:
      "Нагрузки, тепло, гидравлика, прочность. Модель, по которой можно принимать решения.",
    bullets: ["BIM-модель", "Проверочные расчёты", "Отчёт с обоснованием"],
    span: 3,
  },
  {
    id: "automation",
    domain: "engineering",
    icon: WorkflowIcon,
    title: "Автоматизация и АСУ ТП",
    description: "Щиты, контроллеры, логика управления и диспетчерский верхний уровень.",
    bullets: ["ПЛК и щиты", "SCADA", "Пусконаладка"],
    span: 4,
  },
  {
    id: "audit",
    domain: "engineering",
    icon: SearchCheckIcon,
    title: "Технический аудит",
    description:
      "Независимая оценка состояния объекта, поиск рисков и слабых мест до того, как они станут дорогими.",
    bullets: ["Обследование", "Дефектная ведомость", "План мероприятий"],
    span: 2,
  },
  {
    id: "telemetry",
    domain: "it",
    icon: RadarIcon,
    title: "Телеметрия и мониторинг",
    description:
      "Сбор данных с оборудования, хранение, алерты и понятные дашборды вместо таблиц, которые никто не открывает.",
    bullets: ["IoT-шлюзы", "Временные ряды", "Алерты в Telegram"],
    span: 4,
  },
  {
    id: "web",
    domain: "it",
    icon: CodeXmlIcon,
    title: "Веб-платформы",
    description:
      "Сайты, порталы и внутренние системы на современном стеке — быстрые, доступные, поддерживаемые.",
    bullets: ["Next.js / TypeScript", "Панели управления", "Интеграции с 1С"],
    span: 2,
  },
  {
    id: "infra",
    domain: "it",
    icon: ServerIcon,
    title: "Инфраструктура",
    description:
      "Серверы, контуры, резервирование и CI/CD. Чтобы обновление не превращалось в событие.",
    bullets: ["Docker / CI", "Мониторинг", "Резервные копии"],
    span: 3,
  },
  {
    id: "consult",
    domain: "it",
    icon: BrainCircuitIcon,
    title: "Консультации",
    description: "Разбор задачи, оценка трудоёмкости и честный ответ о том, что делать не нужно.",
    bullets: ["Аудит решения", "Оценка бюджета", "Дорожная карта"],
    span: 3,
  },
];

export const process = [
  {
    step: "01",
    icon: CompassIcon,
    title: "Разбор задачи",
    duration: "1–3 дня",
    text: "Созваниваемся, собираю исходные данные и ограничения. На выходе — понятная формулировка того, что делаем и чего не делаем.",
  },
  {
    step: "02",
    icon: LayersIcon,
    title: "Концепция и смета",
    duration: "3–7 дней",
    text: "Варианты решения с плюсами, минусами и деньгами. Фиксируем состав работ, сроки и точки контроля в договоре.",
  },
  {
    step: "03",
    icon: GitBranchIcon,
    title: "Работа итерациями",
    duration: "2–10 недель",
    text: "Показываю прогресс каждую неделю. Правки вносятся по ходу, а не в последний день перед сдачей.",
  },
  {
    step: "04",
    icon: ShieldCheckIcon,
    title: "Сдача и сопровождение",
    duration: "далее",
    text: "Передача документации и доступов, обучение, гарантийный период и поддержка по договору.",
  },
] as const;

export interface Work {
  id: string;
  title: string;
  domain: Domain;
  category: string;
  year: string;
  place: string;
  image: string;
  summary: string;
  metrics: Array<{ label: string; value: string }>;
  tags: string[];
}

export const works: Work[] = [
  {
    id: "plant-scada",
    title: "Диспетчеризация производственной площадки",
    domain: "engineering",
    category: "АСУ ТП",
    year: "2025",
    place: "Тульская обл.",
    image: "/images/hero-plant.jpg",
    summary:
      "Объединил четыре независимых участка в один диспетчерский контур: единый сбор сигналов, аварийные сценарии и отчётность по сменам.",
    metrics: [
      { label: "Точек контроля", value: "1 240" },
      { label: "Простой ↓", value: "31%" },
      { label: "Срок", value: "5 мес." },
    ],
    tags: ["ПЛК", "SCADA", "Modbus", "Отчётность"],
  },
  {
    id: "dc-power",
    title: "Электроснабжение и холод для ЦОД",
    domain: "it",
    category: "Инфраструктура",
    year: "2025",
    place: "Москва",
    image: "/images/server-room.jpg",
    summary:
      "Проект второго энерговвода и перерасчёт схемы охлаждения машинного зала под удвоение стоек без остановки сервиса.",
    metrics: [
      { label: "Стоек", value: "96" },
      { label: "PUE", value: "1.28" },
      { label: "Простой", value: "0 ч" },
    ],
    tags: ["Расчёты", "Резервирование", "Термомодель"],
  },
  {
    id: "facade-light",
    title: "Архитектурное освещение фасада",
    domain: "engineering",
    category: "Электрика",
    year: "2024",
    place: "Казань",
    image: "/images/facade-night.jpg",
    summary:
      "Светотехнический расчёт, проект и управление сценариями подсветки с астрономическим таймером и сезонными пресетами.",
    metrics: [
      { label: "Линий", value: "34" },
      { label: "Потребление ↓", value: "42%" },
      { label: "Сценариев", value: "12" },
    ],
    tags: ["DALI", "Светорасчёт", "Сценарии"],
  },
  {
    id: "telemetry-platform",
    title: "Платформа телеметрии оборудования",
    domain: "it",
    category: "Разработка",
    year: "2024",
    place: "Распределённо",
    image: "/images/circuit.jpg",
    summary:
      "Веб-платформа для сбора показаний с 400+ устройств: временные ряды, пороги, эскалация аварий в Telegram и мобильный отчёт.",
    metrics: [
      { label: "Устройств", value: "412" },
      { label: "Событий/сут", value: "1.9 млн" },
      { label: "Отклик", value: "<120 мс" },
    ],
    tags: ["Next.js", "TimescaleDB", "MQTT", "Telegram"],
  },
  {
    id: "workshop",
    title: "Модернизация механического участка",
    domain: "engineering",
    category: "Производство",
    year: "2023",
    place: "Нижний Новгород",
    image: "/images/welding.jpg",
    summary:
      "Перекомпоновка участка, новая схема вентиляции и учёт энергоресурсов по станкам с выводом на общий экран цеха.",
    metrics: [
      { label: "Станков", value: "18" },
      { label: "Выработка ↑", value: "24%" },
      { label: "Срок", value: "3 мес." },
    ],
    tags: ["Компоновка", "Вентиляция", "Энергоучёт"],
  },
  {
    id: "network",
    title: "Структурированная сеть бизнес-центра",
    domain: "it",
    category: "Сети",
    year: "2023",
    place: "Санкт-Петербург",
    image: "/images/cables.jpg",
    summary:
      "СКС на 900 портов, сегментация, отказоустойчивое ядро и мониторинг, который замечает проблему раньше арендатора.",
    metrics: [
      { label: "Портов", value: "912" },
      { label: "Аптайм", value: "99.98%" },
      { label: "Этажей", value: "14" },
    ],
    tags: ["СКС", "VLAN", "Zabbix"],
  },
];

export const stack = [
  { label: "AutoCAD", icon: DraftingCompassIcon },
  { label: "Revit / BIM", icon: BlocksIcon },
  { label: "SCADA", icon: GaugeIcon },
  { label: "ПЛК", icon: CpuIcon },
  { label: "Modbus / MQTT", icon: CableIcon },
  { label: "TypeScript", icon: CodeXmlIcon },
  { label: "Next.js", icon: LayersIcon },
  { label: "PostgreSQL", icon: DatabaseIcon },
  { label: "Docker", icon: ServerIcon },
  { label: "Linux", icon: TerminalIcon },
  { label: "Сети", icon: NetworkIcon },
  { label: "Мониторинг", icon: ActivityIcon },
  { label: "Энергоаудит", icon: ZapIcon },
  { label: "Обследование", icon: ScanLineIcon },
  { label: "Промышленность", icon: FactoryIcon },
  { label: "Стройплощадка", icon: HardHatIcon },
  { label: "Облако", icon: CloudIcon },
] as const;

export const testimonials = [
  {
    quote:
      "Редкий случай, когда подрядчик приносит не «варианты», а решение с обоснованием. Спорные места подсветил сам, до того как они всплыли на монтаже.",
    name: "Игорь Ветров",
    role: "Технический директор",
    company: "Производственный холдинг",
    domain: "engineering" as Domain,
  },
  {
    quote:
      "Сделал панель мониторинга, которой реально пользуются сменные мастера. Это, если честно, важнее любой архитектуры внутри.",
    name: "Анна Соловьёва",
    role: "Руководитель эксплуатации",
    company: "Сеть логистических центров",
    domain: "it" as Domain,
  },
  {
    quote:
      "Взял проект, который до него вели двое подрядчиков, и за месяц привёл документацию в порядок. Сроки не сдвигал ни разу.",
    name: "Пётр Кузнецов",
    role: "Заказчик, реконструкция",
    company: "Девелопмент",
    domain: "engineering" as Domain,
  },
  {
    quote:
      "Отдельно отмечу переписку: короткие понятные ответы без воды и без «мы уточним у коллег». Всё по существу.",
    name: "Марина Дьяченко",
    role: "Директор по ИТ",
    company: "Ритейл",
    domain: "it" as Domain,
  },
];

export const faq = [
  {
    q: "Вы работаете один или командой?",
    a: "Инженерную и архитектурную часть веду сам. Под монтаж, узкие разделы и объёмную разработку подключаю проверенных специалистов — но договор, сроки и ответственность остаются на мне.",
  },
  {
    q: "Как формируется стоимость?",
    a: "После разбора задачи и фиксации состава работ. Небольшие задачи — фиксированная цена, длинные проекты — этапами с приёмкой. Оценку присылаю письменно, скрытых позиций в смете не появляется.",
  },
  {
    q: "Возьмётесь ли за проект, который уже начали другие?",
    a: "Да, это частый случай. Начинаем с аудита того, что есть: что можно использовать, что придётся переделать и сколько это стоит. Заключение по аудиту вы получаете до того, как решите продолжать.",
  },
  {
    q: "Работаете ли вы удалённо?",
    a: "Разработка, расчёты и документация — полностью удалённо. Обследование, пусконаладка и авторский надзор — с выездом на объект, командировки по России.",
  },
  {
    q: "Что происходит после сдачи?",
    a: "Гарантийный период по договору, передача исходников и доступов, короткое обучение вашей команды. Дальше — поддержка по запросу или по отдельному соглашению.",
  },
  {
    q: "Как быстро вы отвечаете?",
    a: `Обычно ${site.responseTime}. Самый быстрый канал — Telegram или WhatsApp: там же можно сразу приложить фото объекта, чертежи или ТЗ.`,
  },
] as const;

export const contact = {
  eyebrow: "Контакты",
  heading: "Расскажите о задаче",
  lede: "Опишите объект и результат, который нужен. Отвечу в течение рабочего дня и скажу честно, берусь я за это или нет.",
  budgets: ["до 300 тыс.", "300 тыс. — 1 млн", "1–5 млн", "свыше 5 млн", "не определён"],
  services: [
    "Проектирование",
    "Расчёты",
    "Автоматизация",
    "Аудит",
    "Телеметрия",
    "Веб-платформа",
    "Другое",
  ],
} as const;

export const legal = {
  entity: "ИП Приходько Д. А.",
  copyrightNote: "Сайт-визитка. Материалы носят информационный характер и не являются офертой.",
  imageCredit: "Фотографии: Unsplash",
} as const;
