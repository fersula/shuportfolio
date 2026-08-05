"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { gsap } from "@/lib/gsap";
import { BorderGlow } from "@/components/ui/border-glow";
import { useIsMobile } from "@/lib/use-is-mobile";
import { useLocale } from "@/lib/i18n/locale-context";
import { UI_COPY } from "@/lib/i18n/ui-copy";

/**
 * The bio paragraph is rendered twice, stacked: a dim base copy (70% white)
 * and a bright copy (100% white) clipped to a soft circle that follows the
 * cursor — a torchlight over the text, lerped + eased every frame the same
 * way the rest of the site's cursor-driven reveals work.
 */
function SpotlightText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const overlay = overlayRef.current;
    if (!el || !overlay) return;

    const current = { x: 0.5, y: 0.4, r: 0 };
    const target = { x: 0.5, y: 0.4, active: false };
    let raf = 0;

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = (e.clientY - rect.top) / rect.height;
      target.active = true;
    }
    function onLeave() {
      target.active = false;
    }
    function frame() {
      const rect = el!.getBoundingClientRect();
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      current.r += ((target.active ? 130 : 0) - current.r) * 0.12;
      overlay!.style.setProperty("--spot-x", `${current.x * rect.width}px`);
      overlay!.style.setProperty("--spot-y", `${current.y * rect.height}px`);
      overlay!.style.setProperty("--spot-r", `${current.r}px`);
      raf = requestAnimationFrame(frame);
    }

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <p
        className="font-sans text-[24px] leading-relaxed"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        {text}
      </p>
      <p
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 font-sans text-[24px] leading-relaxed"
        style={{
          color: "#ffffff",
          maskImage:
            "radial-gradient(circle var(--spot-r, 0px) at var(--spot-x, 50%) var(--spot-y, 40%), black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--spot-r, 0px) at var(--spot-x, 50%) var(--spot-y, 40%), black 0%, transparent 100%)",
        }}
      >
        {text}
      </p>
    </div>
  );
}

export function Intro() {
  const { locale } = useLocale();
  const TABS = UI_COPY[locale].intro.tabs;
  const [active, setActive] = useState(TABS[0].key);
  const activeTab = TABS.find((t) => t.key === active) ?? TABS[0];
  const cardRef = useRef<HTMLDivElement>(null);
  const teaserRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      [cardRef.current, teaserRef.current].forEach((el) => {
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="intro" className="relative bg-ink">
      <div className="flex flex-col justify-center px-gutter pb-[120px] pt-0 md:min-h-svh md:py-section lg:pl-[380px] lg:pr-gutter">
        <div ref={cardRef} className="max-w-2xl">
          <BorderGlow
            borderRadius={24}
            backgroundColor="#131417"
            glowColor="14 55 58"
            glowRadius={36}
            glowIntensity={1}
            coneSpread={25}
            edgeSensitivity={30}
            colors={["#10b981", "#4d85d7", "#d0634d"]}
          >
            {/* mobile: avatar in the card's left region (vertically centered
                against the taller tab list), tabs pushed to the card's
                right edge (justify-between), bio below — a genuinely
                different arrangement from desktop's
                nav-column + stacked avatar/text, not just a reflow of the
                same DOM, so it's kept as its own branch rather than fought
                into shared markup via CSS alone. Gated on a mounted-only
                isMobile (rather than Tailwind breakpoints) so exactly one
                <video> mounts at a time instead of decoding two
                simultaneously. */}
            {isMobile && (
              <div className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <video
                    src="/emo.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-[100px] w-[100px] shrink-0 rounded-full object-cover"
                  />
                  <nav className="flex flex-col items-start gap-2">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActive(tab.key)}
                        className={`text-left font-mono text-xs transition-colors duration-300 ${
                          active === tab.key
                            ? "text-paper"
                            : "text-paper-dim/60 hover:text-paper-dim"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="relative mt-6">
                  <p aria-hidden className="invisible font-sans text-[24px] leading-relaxed">
                    {TABS[0].text}
                  </p>
                  <div className="absolute inset-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: EASE.settle }}
                      >
                        <SpotlightText text={activeTab.text} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {!isMobile && (
              <div className="p-8 md:p-10">
                <div className="flex flex-col gap-10 md:flex-row md:items-center">
                  <nav className="flex shrink-0 flex-col gap-4">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActive(tab.key)}
                        className={`text-left font-mono text-sm transition-colors duration-300 ${
                          active === tab.key
                            ? "text-paper"
                            : "text-paper-dim/60 hover:text-paper-dim"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>

                  <div className="flex-1">
                    <video
                      src="/emo.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="mb-4 h-[100px] w-[100px] rounded-full object-cover"
                    />
                    <div className="relative">
                      {/* invisible sizer, pinned to the first tab's text — keeps the
                          card's height fixed instead of hugging whichever tab is active */}
                      <p aria-hidden className="invisible font-sans text-[24px] leading-relaxed">
                        {TABS[0].text}
                      </p>
                      <div className="absolute inset-0">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35, ease: EASE.settle }}
                          >
                            <SpotlightText text={activeTab.text} />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </BorderGlow>
        </div>
      </div>

      <div className="flex flex-col justify-center px-gutter pb-[80px] pt-0 md:min-h-svh md:py-section lg:pl-[380px] lg:pr-gutter">
        <div id="featured-works-teaser" ref={teaserRef} className="max-w-2xl">
          <h2 className="font-mono text-base tracking-[0.04em] text-blue md:text-lg">
            {UI_COPY[locale].intro.featuredTeaserHeading}
          </h2>
          <p className="mt-5 font-sans text-[24px] leading-relaxed text-paper">
            {UI_COPY[locale].intro.featuredTeaserBody}
          </p>
        </div>
      </div>
    </section>
  );
}
