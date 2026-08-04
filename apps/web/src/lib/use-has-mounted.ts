import { useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

/** Returns `false` during SSR/first paint and `true` after hydration, without a setState-in-effect. */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
