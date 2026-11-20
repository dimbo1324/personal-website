import { NullProvider } from "./providers/NullProvider.js";
import { PlausibleProvider } from "./providers/PlausibleProvider.js";
import { UmamiProvider } from "./providers/UmamiProvider.js";

/**
 * @param {{ provider: string, domain: string | null, src: string | null, websiteId: string | null }} config
 * @param {{ optedOut: boolean }} privacy
 */
export function createAnalyticsProvider(config, { optedOut }) {
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
    console.warn("[analytics] disabled:", error.message);
    return new NullProvider();
  }
}
