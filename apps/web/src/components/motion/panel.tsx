"use client";

import { cn } from "@repo/ui/lib/utils";
import { type ReactNode, useRef } from "react";

/**
 * The site's base surface: a drafting-style panel with corner ticks and an
 * accent spotlight that tracks the cursor.
 */
export function Panel({
  children,
  className,
  ticks = true,
  spotlight = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  ticks?: boolean;
  spotlight?: boolean;
  as?: "div" | "article" | "li" | "figure";
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!spotlight) return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--spot-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    element.style.setProperty("--spot-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <Tag
      ref={ref as never}
      onPointerMove={onPointerMove}
      className={cn(
        "group/panel relative isolate overflow-hidden rounded-[20px] border border-border/80",
        "bg-slate/70 backdrop-blur-[2px]",
        "transition-[border-color,transform,box-shadow] duration-500 ease-(--ease-expo)",
        "hover:-translate-y-[3px] hover:border-accent/35 hover:shadow-[0_28px_60px_-32px_rgb(0_0_0/0.9)]",
        className,
      )}
    >
      {spotlight ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 spotlight opacity-0 transition-opacity duration-500 group-hover/panel:opacity-100"
        />
      ) : null}

      {ticks ? <CornerTicks /> : null}

      {children}
    </Tag>
  );
}

/** Four drafting marks that brighten on hover — the house detail. */
export function CornerTicks({ className }: { className?: string }) {
  const base =
    "pointer-events-none absolute size-2.5 border-iron transition-colors duration-500 group-hover/panel:border-accent/70";

  return (
    <span aria-hidden className={cn("absolute inset-0", className)}>
      <span className={cn(base, "top-2 left-2 border-t border-l")} />
      <span className={cn(base, "top-2 right-2 border-t border-r")} />
      <span className={cn(base, "bottom-2 left-2 border-b border-l")} />
      <span className={cn(base, "right-2 bottom-2 border-r border-b")} />
    </span>
  );
}
