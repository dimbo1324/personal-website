export type AnalyticsProps = Readonly<Record<string, string | number | boolean>>;

export abstract class AnalyticsProvider {
  async load(): Promise<void> {
    return Promise.resolve();
  }

  abstract track(event: string, props?: AnalyticsProps): void;
}
