interface NetworkInformation {
  readonly saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformation;
}

/** Whether lighter media should be used: small screens or a data-saver. */
export function prefersCompactMedia(compactQuery: string): boolean {
  const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
  const small = typeof window.matchMedia === "function" && window.matchMedia(compactQuery).matches;
  return saveData || small;
}
