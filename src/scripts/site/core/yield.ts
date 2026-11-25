interface SchedulerLike {
  yield?: () => Promise<void>;
}

export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: SchedulerLike }).scheduler;
  if (typeof scheduler?.yield === "function") return scheduler.yield();
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}
