import type { AnalyticsEnvironment } from "../../config/env";
import { NullProvider } from "./providers/NullProvider";
import { PlausibleProvider } from "./providers/PlausibleProvider";
import { UmamiProvider } from "./providers/UmamiProvider";
import type { AnalyticsProvider } from "./providers/AnalyticsProvider";
import { reportWarning } from "../../core/log";

export function createAnalyticsProvider(
  config: AnalyticsEnvironment,
  { optedOut }: { readonly optedOut: boolean },
): AnalyticsProvider {
  if (optedOut) return new NullProvider();
  try {
    switch (config.provider) {
      case "plausible":
        return new PlausibleProvider({ domain: config.domain, src: config.src });
      case "umami":
        return new UmamiProvider({ websiteId: config.websiteId, src: config.src });
      default:
        return new NullProvider();
    }
  } catch (error) {
    reportWarning("analytics", error);
    return new NullProvider();
  }
}
