"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useLocale } from "@/lib/i18n/locale-context";
import { UI_COPY } from "@/lib/i18n/ui-copy";

/**
 * The Manifesto: two stacked convictions, set to the right of the fixed
 * index sidebar. Each block fades and lifts in as it scrolls into view,
 * scrubbed to scroll position so it reads as a continuation of the
 * Hero's own scroll-out crossfade rather than a separate reveal.
 */
export function Manifesto() {
  const { locale } = useLocale();
  const copy = UI_COPY[locale].manifesto;
  const sectionRef = useRef<HTMLElement>(null);
  const wonderRef = useRef<HTMLDivElement>(null);
  const callingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      [wonderRef.current, callingRef.current].forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 55%",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="manifesto" ref={sectionRef} className="relative bg-ink md:min-h-svh">
      <div className="flex flex-col justify-center px-gutter py-[80px] md:min-h-svh md:py-section lg:pl-[380px] lg:pr-gutter">
        <div ref={wonderRef} className="max-w-2xl">
          <h2 className="font-mono text-base tracking-[0.04em] text-blue md:text-lg">
            {copy.wonderHeading}
          </h2>
          <p className="mt-5 font-sans text-[24px] leading-relaxed text-paper sm:text-[32px]">
            {copy.wonderBody}
          </p>
        </div>

        <div ref={callingRef} className="mt-16 max-w-2xl md:mt-24">
          <h2 className="font-mono text-base tracking-[0.04em] text-[#D0634D] md:text-lg">
            {copy.callingHeading}
          </h2>
          <p className="mt-5 font-sans text-[24px] leading-relaxed text-paper sm:text-[32px]">
            {copy.callingBody}
          </p>
        </div>
      </div>

      <div className="grain-overlay" />
    </section>
  );
}
