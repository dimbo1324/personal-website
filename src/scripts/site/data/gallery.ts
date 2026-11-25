import type { ImageDescriptor } from "../features/media/images/imageSources";
import { localImage, remoteImage } from "../features/media/images/imageSources";
import type { LocalizedText } from "../i18n/types";

export type GallerySize = "feature" | "tall";

export interface GalleryItem {
  readonly image: ImageDescriptor;
  readonly tag: LocalizedText;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly size?: GallerySize;
  readonly position?: string;
}

/**
 * Gallery content. `size` drives the bento layout:
 *   "feature" → 2×2, "tall" → 1×2, default → 1×1.
 * Text fields are { en, es, ru }. Remote images show hardware only;
 * every photo of a person is local.
 */
export const GALLERY_ITEMS: readonly GalleryItem[] = Object.freeze([
  {
    image: localImage("keynote", { full: 1280, widths: [640] }),
    tag: { en: "Keynote", es: "Ponencia", ru: "Доклад" },
    title: {
      en: "IIoT Architecture Keynote",
      es: "Ponencia sobre arquitectura IIoT",
      ru: "Доклад об архитектуре IIoT",
    },
    description: {
      en: "Presenting industrial connectivity and multi-vendor automation workflows (Siemens & Schneider Electric).",
      es: "Presentando conectividad industrial y flujos de automatización multimarca (Siemens y Schneider Electric).",
      ru: "Рассказываю о промышленной связности и мультивендорной автоматизации (Siemens и Schneider Electric).",
    },
    size: "feature",
  },
  {
    image: localImage("field-sat", { full: 720, widths: [400] }),
    tag: { en: "On site", es: "En planta", ru: "На объекте" },
    title: { en: "Refinery SAT / FAT", es: "SAT / FAT en refinería", ru: "SAT / FAT на НПЗ" },
    description: {
      en: "2,500+ field I/O signals verified across LUKOIL Kstovo units L-24/7 and AVT-5 with live SIS/ESD checks.",
      es: "Más de 2.500 señales de E/S de campo verificadas en las unidades L-24/7 y AVT-5 de LUKOIL Kstovo, con pruebas SIS/ESD en vivo.",
      ru: "Более 2 500 полевых сигналов ввода-вывода проверено на установках Л-24/7 и АВТ-5 ЛУКОЙЛ (Кстово) с проверкой ПАЗ/ESD вживую.",
    },
    size: "tall",
    position: "center 30%",
  },
  {
    image: localImage("stage-mid", { full: 1280, widths: [640] }),
    tag: { en: "Stage", es: "Escenario", ru: "Сцена" },
    title: {
      en: "Digital Twin Talk",
      es: "Charla sobre gemelos digitales",
      ru: "Доклад о цифровом двойнике",
    },
    description: {
      en: "ODE-based thermal plant twin with four cascaded virtual PID loops, streamed over MQTT / gRPC.",
      es: "Gemelo de una planta térmica basado en EDO, con cuatro lazos PID virtuales en cascada, transmitido por MQTT / gRPC.",
      ru: "Цифровой двойник ТЭС на ОДУ с четырьмя каскадными виртуальными ПИД-контурами, данные по MQTT / gRPC.",
    },
  },
  {
    image: remoteImage("server-room"),
    tag: { en: "Backend", es: "Backend", ru: "Бэкенд" },
    title: {
      en: "Telemetry & Backend Core",
      es: "Telemetría y núcleo backend",
      ru: "Телеметрия и ядро бэкенда",
    },
    description: {
      en: "Python, C++, gRPC, WebSocket and Dockerised time-series pipelines backed by Jenkins CI.",
      es: "Python, C++, gRPC, WebSocket y flujos de series temporales en Docker, con Jenkins CI.",
      ru: "Python, C++, gRPC, WebSocket и конвейеры временных рядов в Docker с Jenkins CI.",
    },
  },
  {
    image: localImage("portrait", { full: 800, widths: [400] }),
    tag: { en: "Profile", es: "Perfil", ru: "Профиль" },
    title: { en: "Dmitrii Prikhodko", es: "Dmitrii Prikhodko", ru: "Дмитрий Приходько" },
    description: {
      en: "Industrial Automation, IIoT & Software Engineer — MSc with honours, based in Montevideo.",
      es: "Ingeniero en automatización industrial, IIoT y software — máster con honores, en Montevideo.",
      ru: "Инженер АСУ ТП, IIoT и ПО — магистр с отличием, живу в Монтевидео.",
    },
    position: "center 25%",
  },
  {
    image: remoteImage("control-cabinet"),
    tag: { en: "Hardware", es: "Hardware", ru: "Железо" },
    title: { en: "Control Cabinet Build", es: "Armario de control", ru: "Шкаф управления" },
    description: {
      en: "PLC rack, I/O modules, relays and terminal blocks — the kind of cabinet checked point-by-point during SAT/FAT.",
      es: "Rack de PLC, módulos de E/S, relés y borneras: el tipo de armario que se revisa punto por punto en SAT/FAT.",
      ru: "Корзина ПЛК, модули ввода-вывода, реле и клеммники — такие шкафы проверяются поточечно на SAT/FAT.",
    },
  },
  {
    image: remoteImage("embedded-board"),
    tag: { en: "Embedded", es: "Embebidos", ru: "Встраиваемые" },
    title: {
      en: "Embedded & Control Hardware",
      es: "Hardware embebido y de control",
      ru: "Встраиваемая электроника",
    },
    description: {
      en: "ATmega48 cooling controller for a 5 kW microwave load and electroplating line automation (+12% yield).",
      es: "Controlador de refrigeración ATmega48 para una carga de microondas de 5 kW y automatización de una línea de galvanizado (+12 % de rendimiento).",
      ru: "Контроллер охлаждения на ATmega48 для СВЧ-нагрузки 5 кВт и автоматизация гальванической линии (+12% выхода).",
    },
  },
  {
    image: remoteImage("panel-wiring"),
    tag: { en: "Commissioning", es: "Puesta en marcha", ru: "Пусконаладка" },
    title: {
      en: "Panel Wiring & Field I/O",
      es: "Cableado de tableros y E/S de campo",
      ru: "Монтаж шкафов и полевые сигналы",
    },
    description: {
      en: "Marshalling, field wiring and DIN-rail components — where signal lists meet copper during loop checks.",
      es: "Cableado de campo, borneras de distribución y componentes en riel DIN: donde la lista de señales se encuentra con el cobre.",
      ru: "Кроссировка, полевой монтаж и компоненты на DIN-рейке — где перечень сигналов встречается с медью при прозвонке контуров.",
    },
  },
]);
