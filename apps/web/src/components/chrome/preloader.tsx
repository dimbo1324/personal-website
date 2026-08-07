"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

import { site } from "@/content/site";
import { useScrollLock } from "@/lib/hooks";
import { ease } from "@/lib/motion";

const SESSION_KEY = "intro-played";
const LINES = ["инициализация", "загрузка модулей", "калибровка сетки", "готово"];

/** Never changes within a session, so the subscription is a no-op. */
const subscribeNever = () => () => {
  /* nothing to unsubscribe from */
};

/**
 * A short instrument boot: counter, log lines, then two panels part like a
 * shutter. Plays once per browser session and never for reduced-motion users.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState(0);

  // The server always assumes the intro already played, so the markup it sends
  // has no shutter in it and the client only adds one when it really should.
  const alreadyPlayed = useSyncExternalStore(
    subscribeNever,
    () => sessionStorage.getItem(SESSION_KEY) === "1",
    () => true,
  );

  const playing = !reduced && !alreadyPlayed && !finished;

  useScrollLock(playing);

  useEffect(() => {
    if (!playing) return;

    const start = performance.now();
    const total = 1500;
    let frame = 0;

    let settle = 0;

    function tick(now: number) {
      const ratio = Math.min(1, (now - start) / total);
      // Ease-out so the number decelerates into 100 instead of snapping.
      setProgress(Math.round((1 - Math.pow(1 - ratio, 3)) * 100));
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "1");
      settle = window.setTimeout(() => setFinished(true), 260);
    }

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [playing]);

  const lineIndex = Math.min(LINES.length - 1, Math.floor((progress / 100) * LINES.length));

  return (
    <AnimatePresence>
      {playing ? (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[120] flex items-center justify-center"
          exit={{ transition: { duration: 0.8 } }}
        >
          {/* shutter halves */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-void"
            exit={{ y: "-100%", transition: { duration: 0.85, ease: ease.expo } }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-void"
            exit={{ y: "100%", transition: { duration: 0.85, ease: ease.expo } }}
          />

          {/* hairline that splits them */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px origin-center bg-accent/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 1.4, ease: ease.expo }}
          />

          <motion.div
            className="relative z-10 flex w-[min(88vw,420px)] flex-col items-center gap-5"
            exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.32 } }}
          >
            <span className="font-mono text-[10px] tracking-[0.42em] text-mist uppercase">
              {site.shortName}
            </span>

            <span className="font-display text-6xl font-semibold tracking-tight text-chalk tabular-nums">
              {String(progress).padStart(3, "0")}
            </span>

            <div className="h-px w-full overflow-hidden bg-iron">
              <motion.div
                className="h-full origin-left bg-accent"
                style={{ scaleX: progress / 100 }}
                transition={{ duration: 0 }}
              />
            </div>

            <span className="font-mono text-[10px] tracking-[0.24em] text-mist/70 lowercase">
              {LINES[lineIndex]}
              <span className="animate-blink">_</span>
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
