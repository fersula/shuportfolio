"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Prism from "./prism";
import { LightPoints } from "./light-points";
import { FloatingWords } from "./floating-words";
import { TextPressure } from "./text-pressure";
import { usePointer } from "./use-pointer";
import { EASE } from "@/lib/motion";
import { gsap } from "@/lib/gsap";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const pointerRef = usePointer(sectionRef);
  const [showPrism, setShowPrism] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia(sectionRef);

    mm.add("(min-width: 640px)", () => {
      /*
       * No pin — the hero scrolls away naturally. Over that same natural
       * distance, the word field converges onto the central axis and
       * loses its body, the Prism light fades out, and the title block
       * fades with it — so by the time Manifesto scrolls into view there
       * is no surviving hero artifact and no hard seam, just a crossfade.
       */
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // ends after half a viewport of scroll rather than a full one
          // ("bottom top") — Manifesto's content-driven height can be
          // shorter than a full viewport, and if the trigger's end is
          // unreachable within the page's actual scroll distance, this
          // fade (and the Prism unmount it drives) can never complete
          end: "bottom center",
          scrub: 0.6,
        },
      })
        .to(".frag", { left: "50%", stagger: { each: 0.015, from: "random" } }, 0)
        .to(".frag-point", { left: "50%", stagger: { each: 0.012, from: "random" } }, 0)
        .to(
          ".word-shell",
          { opacity: 0, filter: "blur(5px)", stagger: { each: 0.012, from: "random" } },
          0.05
        )
        .to(pointsRef.current, { opacity: 0 }, 0.15)
        .to(
          prismRef.current,
          {
            opacity: 0,
            // fully unmount the WebGL canvas once faded rather than just
            // hiding it via CSS — a live canvas can otherwise get
            // composited at a stale screen position by the browser once
            // the page has scrolled well past it
            onComplete: () => setShowPrism(false),
            onReverseComplete: () => setShowPrism(true),
          },
          0.25
        )
        .to(contentRef.current, { opacity: 0, yPercent: -10 }, 0.1);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-svh w-full overflow-hidden bg-ink"
    >
      {/* Prism — full-screen, always visible, tilts toward the pointer */}
      <div ref={prismRef} aria-hidden className="absolute inset-0">
        {showPrism && (
          <Prism
            animationType="hover"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0.5}
            glow={1}
          />
        )}
      </div>

      <div ref={pointsRef} className="absolute inset-0">
        <LightPoints />
      </div>
      <FloatingWords pointerRef={pointerRef} />

      <div
        ref={contentRef}
        className="relative z-30 flex h-full w-full flex-col items-center justify-center px-gutter sm:items-stretch"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE.prism, delay: 0.2 }}
          className="relative w-[clamp(18rem,35.5vw,32.3rem)] leading-none tracking-tight lg:w-[clamp(16.15rem,39vw,35.5rem)]"
        >
          <TextPressure
            text="SHU F."
            textColor="#ffffff"
            minFontSize={100}
            width={false}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="absolute bottom-8 left-gutter flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-paper-faint"
        >
          <span className="relative h-10 w-px overflow-hidden bg-paper-faint/40">
            <motion.span
              className="absolute inset-x-0 top-0 h-3 bg-emerald"
              animate={{ y: ["-20%", "140%"] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
          Scroll
        </motion.div>
      </div>

      <div className="grain-overlay z-40" />
    </section>
  );
}
