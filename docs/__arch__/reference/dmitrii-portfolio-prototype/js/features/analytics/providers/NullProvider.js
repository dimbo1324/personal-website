import { AnalyticsProvider } from "./AnalyticsProvider.js";

/** Used when analytics is not configured or the visitor opted out: does nothing. */
export class NullProvider extends AnalyticsProvider {}
