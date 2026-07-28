"use client";

import { useEffect, useRef, type RefObject } from "react";

export type PointerState = {
  x: number;
  y: number;
  active: boolean;
};

/**
 * Tracks pointer position relative to `containerRef` in a plain ref
 * (no React state) so consumers can read it inside their own rAF
 * loops without forcing re-renders on every pixel of movement.
 */
export function usePointer(containerRef: RefObject<HTMLElement | null>) {
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.active = true;
    }
    function onLeave() {
      pointerRef.current.active = false;
    }

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef]);

  return pointerRef;
}
