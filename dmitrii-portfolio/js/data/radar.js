export const RADAR_AXES = Object.freeze(["PLC/SIS", "SAT/FAT", "IIoT", "C++/PY", "CI/TEST", "CFD"]);

export const RADAR_BASELINE = Object.freeze([96, 94, 92, 88, 82, 85]);

export const RADAR_SCENARIOS = Object.freeze([
  { name: "Refinery SAT", weights: [98, 97, 84, 76, 72, 74] },
  { name: "Digital Twin", weights: [86, 78, 98, 95, 86, 91] },
  { name: "C++ Backend", weights: [70, 68, 84, 97, 96, 74] },
  { name: "Balanced", weights: [95, 92, 93, 89, 84, 86] },
]);
