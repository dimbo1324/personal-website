import type { Theme } from "../features/theme/ThemeService";

export type WidgetState = "closed" | "open" | "minimized";

export interface AppState {
  theme: Theme;
  activeSection: string;
  heroScene: number;
  simRunning: boolean;
  cycle: number;
  widgetState: WidgetState;
  widgetMaximized: boolean;
}
