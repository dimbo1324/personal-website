/**
 * Gallery content. `size` drives the bento layout:
 *   "feature" → 2×2, "tall" → 1×2, default → 1×1.
 * Remote images (Unsplash) show hardware only; every photo of a person is local.
 */
export const GALLERY_ITEMS = Object.freeze([
  {
    src: "assets/images/keynote.webp",
    tag: "Keynote",
    title: "IIoT Architecture Keynote",
    description: "Presenting industrial connectivity and multi-vendor automation workflows (Siemens & Schneider Electric).",
    size: "feature",
  },
  {
    src: "assets/images/field-sat.webp",
    tag: "On site",
    title: "Refinery SAT / FAT",
    description: "2,500+ field I/O signals verified across LUKOIL Kstovo units L-24/7 and AVT-5 with live SIS/ESD checks.",
    size: "tall",
    position: "center 30%",
  },
  {
    src: "assets/images/stage-mid.webp",
    tag: "Stage",
    title: "Digital Twin Talk",
    description: "ODE-based thermal plant twin with four cascaded virtual PID loops, streamed over MQTT / gRPC.",
  },
  {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    tag: "Backend",
    title: "Telemetry & Backend Core",
    description: "Python, C++, gRPC, WebSocket and Dockerised time-series pipelines backed by Jenkins CI.",
  },
  {
    src: "assets/images/portrait.webp",
    tag: "Profile",
    title: "Dmitrii Prikhodko",
    description: "Industrial Automation, IIoT & Software Engineer — MSc with honours, based in Montevideo.",
    position: "center 25%",
  },
  {
    src: "https://images.unsplash.com/photo-1780034766312-73825064806c?auto=format&fit=crop&w=900&q=80",
    tag: "Hardware",
    title: "Control Cabinet Build",
    description: "PLC rack, I/O modules, relays and terminal blocks — the kind of cabinet checked point-by-point during SAT/FAT.",
  },
  {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    tag: "Embedded",
    title: "Embedded & Control Hardware",
    description: "ATmega48 cooling controller for a 5 kW microwave load and electroplating line automation (+12% yield).",
  },
  {
    src: "https://images.unsplash.com/photo-1753272691001-4d68806ac590?auto=format&fit=crop&w=900&q=80",
    tag: "Commissioning",
    title: "Panel Wiring & Field I/O",
    description: "Marshalling, field wiring and DIN-rail components — where signal lists meet copper during loop checks.",
  },
]);
