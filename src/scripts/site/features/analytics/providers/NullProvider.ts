import { AnalyticsProvider } from "./AnalyticsProvider";
import type { AnalyticsProps } from "./AnalyticsProvider";

export class NullProvider extends AnalyticsProvider {
  override track(_event: string, _props?: AnalyticsProps): void {
    // Analytics is disabled.
  }
}
