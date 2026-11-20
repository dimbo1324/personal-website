export const RADAR_AXES = Object.freeze(["PLC/SIS", "SAT/FAT", "IIoT", "C++/PY", "CI/TEST", "CFD"]);

export const RADAR_BASELINE = Object.freeze([96, 94, 92, 88, 82, 85]);

/** Name shown before the first scenario is picked. */
export const RADAR_INITIAL_NAME = Object.freeze({ en: "Balanced", es: "Equilibrado", ru: "Баланс" });

export const RADAR_SCENARIOS = Object.freeze([
  { name: { en: "Refinery SAT", es: "SAT en refinería", ru: "SAT на НПЗ" }, weights: [98, 97, 84, 76, 72, 74] },
  { name: { en: "Digital Twin", es: "Gemelo digital", ru: "Цифровой двойник" }, weights: [86, 78, 98, 95, 86, 91] },
  { name: { en: "C++ Backend", es: "Backend C++", ru: "Бэкенд на C++" }, weights: [70, 68, 84, 97, 96, 74] },
  { name: RADAR_INITIAL_NAME, weights: [95, 92, 93, 89, 84, 86] },
]);
