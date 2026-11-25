import { Store } from "../core/store";
import { ThemeService } from "../features/theme/ThemeService";
import type { AppState } from "./state";

/** Global UI state shared between features. */
export function createAppStore(): Store<AppState> {
  return new Store<AppState>({
    theme: ThemeService.readInitial(),
    activeSection: "overview",
    heroScene: 0,
    simRunning: true,
    cycle: 1,
    widgetState: "closed",
    widgetMaximized: false,
  });
}
