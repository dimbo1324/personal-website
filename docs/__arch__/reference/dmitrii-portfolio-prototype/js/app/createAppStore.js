import { Store } from "../core/Store.js";
import { ThemeService } from "../features/theme/ThemeService.js";

/** Global UI state shared between features. */
export function createAppStore() {
  return new Store({
    theme: ThemeService.readInitial(),
    activeSection: "overview",
    heroScene: 0,
    simRunning: true,
    cycle: 1,
    widgetState: "closed", // closed | open | minimized
    widgetMaximized: false,
  });
}
