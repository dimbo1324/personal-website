/** Writes the current year into the copyright line. */
export function renderCurrentYear(element: Element | null): void {
  if (element) element.textContent = String(new Date().getFullYear());
}
