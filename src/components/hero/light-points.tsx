"use client";

import { motion } from "framer-motion";
import { LIGHT_POINTS } from "./field-data";

export function LightPoints() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15] hidden sm:block">
      {LIGHT_POINTS.map((p) => (
        <span
          key={p.id}
          className="frag-point absolute"
          style={{ top: p.top, left: p.left }}
        >
          <motion.span
            className="block rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: `var(--color-${p.hue})`,
              boxShadow: `0 0 ${p.size * 3}px var(--color-${p.hue})`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.2, 0.8] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </span>
      ))}
    </div>
  );
}
