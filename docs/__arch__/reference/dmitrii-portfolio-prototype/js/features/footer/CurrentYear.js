/** Writes the current year into the copyright line. */
export function renderCurrentYear(element) {
  if (element) element.textContent = String(new Date().getFullYear());
}
