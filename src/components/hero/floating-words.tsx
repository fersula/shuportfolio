"use client";

import { useEffect, useRef, type RefObject } from "react";
import { motion } from "framer-motion";
import { FRAGMENTS, LAYERS } from "./field-data";
import { EASE } from "@/lib/motion";
import type { PointerState } from "./use-pointer";

/* extra reach beyond the word's own box for the proximity focus */
const FOCUS_PADDING = 56;

export function FloatingWords({
  pointerRef,
}: {
  pointerRef: RefObject<PointerState>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef(new Map<string, HTMLDivElement>());
  const nodeRefs = useRef(new Map<string, HTMLSpanElement>());
  /* smoothed pointer offset from the hero center, in px */
  const par = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;

    function frame() {
      const root = rootRef.current;
      const section = root?.closest("section");
      if (!root || !section) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const sectionRect = section.getBoundingClientRect();
      const pointer = pointerRef.current;

      // depth parallax: each layer drifts by its own coefficient
      const targetX = pointer.active
        ? pointer.x - sectionRect.width / 2
        : 0;
      const targetY = pointer.active
        ? pointer.y - sectionRect.height / 2
        : 0;
      par.current.x += (targetX - par.current.x) * 0.08;
      par.current.y += (targetY - par.current.y) * 0.08;

      FRAGMENTS.forEach((f) => {
        const wrap = wrapRefs.current.get(f.id);
        if (!wrap) return;
        const coef = LAYERS[f.layer].parallax;
        const dx = par.current.x * coef;
        const dy = par.current.y * coef;
        wrap.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;
      });

      // proximity focus: near words lift out of their depth layer
      nodeRefs.current.forEach((el) => {
        if (!pointer.active) {
          el.classList.remove("is-focus");
          return;
        }
        const rect = el.getBoundingClientRect();
        const cx = rect.left - sectionRect.left + rect.width / 2;
        const cy = rect.top - sectionRect.top + rect.height / 2;
        const dist = Math.hypot(cx - pointer.x, cy - pointer.y);
        const radius = rect.width / 2 + FOCUS_PADDING;
        el.classList.toggle("is-focus", dist < radius);
      });

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pointerRef]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-20 hidden sm:block"
    >
      {FRAGMENTS.map((f, i) => {
        const L = LAYERS[f.layer];
        return (
          <div
            key={f.id}
            ref={(el) => {
              if (el) wrapRefs.current.set(f.id, el);
              else wrapRefs.current.delete(f.id);
            }}
            className="frag absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: f.top, left: f.left }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.4 + i * 0.05,
                ease: EASE.prism,
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: f.floatDuration,
                  delay: f.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* .word-shell is the scroll timeline's fade target;
                    .word-node carries the depth-layer look + focus state */}
                <span className="word-shell block">
                  <span
                    ref={(el) => {
                      if (el) nodeRefs.current.set(f.id, el);
                      else nodeRefs.current.delete(f.id);
                    }}
                    className="word-node block whitespace-nowrap text-center font-grotesk font-medium text-paper"
                    style={{
                      fontSize: L.fontSize,
                      opacity: L.opacity,
                      filter: L.blur ? `blur(${L.blur}px)` : "none",
                    }}
                  >
                    {f.text}
                  </span>
                </span>
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
