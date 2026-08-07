"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Matches a media query. Subscribed rather than stored in state so the server
 * snapshot is always `false` and the client never renders a mismatched frame.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True only for real mice — used to gate hover-only flourishes. */
export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}

/** Tracks which `#id` section currently owns the viewport. */
export function useSectionSpy(ids: readonly string[], offset = 0.35): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    function pick() {
      const line = window.innerHeight * offset;
      let current = elements[0]?.id ?? "";
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= line) current = element.id;
      }
      setActive(current);
    }

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [ids, offset]);

  return active;
}

/**
 * Reference count for the body scroll lock. Several overlays can be open at
 * once (palette над диалогом), and each saving/restoring the previous value
 * independently would leave the page permanently locked — so the styles are
 * applied once on 0→1 and released once on 1→0.
 */
let lockCount = 0;

function applyScrollLock() {
  if (lockCount++ > 0) return;

  const { body } = document;
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  body.style.overflow = "hidden";
  if (gutter > 0) body.style.paddingRight = `${gutter}px`;
}

function releaseScrollLock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const { body } = document;
  body.style.removeProperty("overflow");
  body.style.removeProperty("padding-right");
}

/** Locks body scroll while `locked` is true, preserving the scrollbar gutter. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    applyScrollLock();
    return releaseScrollLock;
  }, [locked]);
}
