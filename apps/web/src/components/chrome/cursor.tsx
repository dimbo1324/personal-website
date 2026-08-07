"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

import { useFinePointer } from "@/lib/hooks";
import { ease } from "@/lib/motion";

type CursorMode = "default" | "link" | "view" | "drag";

const LABELS: Partial<Record<CursorMode, string>> = {
  view: "Открыть",
  drag: "Тянуть",
};

const RING_SIZE: Record<CursorMode, number> = {
  default: 28,
  link: 44,
  view: 76,
  drag: 76,
};

/**
 * Instrument-style cursor: a crisp dot that leads, and a lagging ring that
 * catches up. Over anything marked `data-cursor="…"` the ring swells and can
 * carry a label. Mouse-only — touch devices never mount it.
 */
export function Cursor() {
  const fine = useFinePointer();
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 240, damping: 26, mass: 0.55 });
  const ringY = useSpring(y, { stiffness: 240, damping: 26, mass: 0.55 });

  useEffect(() => {
    if (!fine) return;

    function onMove(event: PointerEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      if (target) {
        setMode((target.dataset.cursor as CursorMode | undefined) ?? "link");
        return;
      }

      const interactive = (event.target as HTMLElement | null)?.closest(
        "a, button, input, textarea, select, [role='button']",
      );
      setMode(interactive ? "link" : "default");
    }

    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const ringSize = RING_SIZE[mode];
  const label = LABELS[mode];
  const idle = mode === "default";
  const restOpacity = idle ? 0.45 : 1;
  const ringOpacity = visible ? restOpacity : 0;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center rounded-full border border-accent/70"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: ringOpacity,
          scale: pressed ? 0.82 : 1,
          backgroundColor:
            mode === "view" || mode === "drag"
              ? "color-mix(in srgb, var(--accent) 14%, transparent)"
              : "transparent",
          backdropFilter: mode === "view" ? "blur(2px)" : "blur(0px)",
        }}
        transition={{ duration: 0.32, ease: ease.expo }}
      >
        <AnimatePresence>
          {label ? (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="font-mono text-[9px] tracking-[0.18em] text-accent uppercase"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="absolute top-0 left-0 size-[5px] rounded-full bg-accent"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible && mode === "default" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
