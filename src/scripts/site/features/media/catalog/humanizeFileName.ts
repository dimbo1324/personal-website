const ACRONYMS = new Map<string, string>(
  [
    "iiot",
    "iot",
    "plc",
    "dcs",
    "sis",
    "scada",
    "opc",
    "ua",
    "mqtt",
    "sat",
    "fat",
    "hmi",
    "ai",
    "ot",
    "esd",
    "cfd",
  ].map((word) => [word, word === "iiot" ? "IIoT" : word === "iot" ? "IoT" : word.toUpperCase()]),
);

/** "02-iiot-architecture_keynote.mp4" → "IIoT Architecture Keynote" */
export function humanizeFileName(file: string): string {
  const words = decodeURIComponent(file)
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[\s._-]*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(
      (word) => ACRONYMS.get(word.toLowerCase()) ?? word.charAt(0).toUpperCase() + word.slice(1),
    );
  return words.join(" ") || file;
}
