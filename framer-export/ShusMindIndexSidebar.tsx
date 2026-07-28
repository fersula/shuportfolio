/**
 * Shu's Mind — Index Sidebar, standalone Framer-ready version.
 * ------------------------------------------------------------------
 * Self-contained: no Tailwind, no next/font, no "@/..." path aliases,
 * no external stylesheet. Every visual is either an inline `style`
 * object or a value computed in JS each animation frame and written
 * directly to `element.style`.
 *
 * HOW IT FINDS THE SECTIONS IT TRACKS
 * This sidebar doesn't render Hero/Manifesto itself — it finds them
 * elsewhere on the same page by matching `id` attribute, the same way
 * an anchor-nav normally works. By default it looks for:
 *   - id="hero"       → drives the sidebar's own fade-in-on-scroll
 *   - id="manifesto"  → just another scrollspy target
 * If your section ids differ, pass a custom `items` array (see the
 * NavItem type below) — anything without a `sectionId` renders as an
 * inert placeholder label (exactly what "03 Intro" / "04" / "05" / "06"
 * are by default: reserved slots for sections that don't exist yet).
 *
 * HOW TO USE IN FRAMER
 * 1. Paste this whole file into a Code File / Code Component in
 *    Framer (paste as code, not into an AI chat — see note from the
 *    previous file).
 * 2. Make sure whatever Hero/Manifesto content you have on the page
 *    carries the matching `id` attributes (default "hero"/"manifesto"),
 *    or pass your own `items` list, e.g.:
 *      <IndexSidebar items={[
 *        { num: "01", label: "Home", sectionId: "home" },
 *        { num: "02", label: "About", sectionId: "about" },
 *      ]} />
 * 3. This component renders as `position: fixed`, so where you place
 *    it in the layout tree doesn't matter — drop it anywhere on the
 *    page and it'll pin itself to the left edge, vertically centered.
 * 4. It only renders at viewport width >= 1024px (matches the
 *    original's `lg:block` breakpoint) — on anything narrower it
 *    renders nothing.
 */

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ============================================================== *
 * Design tokens
 * ============================================================== */

const COLORS = {
  paperDim: "#a8a6a0",
  paperFaint: "#59584f",
  terracotta: "#d0634d",
};

const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

/* ============================================================== *
 * Small shared helpers
 * ============================================================== */

function useGoogleFonts() {
  useEffect(() => {
    const id = "shus-mind-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [255, 255, 255];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/* pointer-proximity falloff — the "smooth" curve from reactbits' LineSidebar */
const smoothFalloff = (p: number) => p * p * (3 - 2 * p);
const PROXIMITY_RADIUS = 48; // px — reach of the hover effect around a row's center
const SMOOTHING_MS = 120; // exponential-smoothing time constant for the effect value

/* ============================================================== *
 * Nav data
 * ============================================================== */

export type NavItem = {
  num: string;
  label: string;
  /** matches an element's `id` elsewhere on the page. Omit for an
   *  inert placeholder (not clickable, never highlights). */
  sectionId?: string;
};

const DEFAULT_ITEMS: NavItem[] = [
  { num: "01", label: "Shu's Mindspace", sectionId: "hero" },
  { num: "02", label: "Manifesto", sectionId: "manifesto" },
  { num: "03", label: "Intro" },
  { num: "04", label: "Shu's Principle Engine" },
  { num: "05", label: "Featured Works" },
  { num: "06", label: "Shu's Lab" },
];

/* ============================================================== *
 * Index sidebar — fixed nav, scrollspy + pointer-proximity hover
 * ============================================================== */

export function IndexSidebar({ items = DEFAULT_ITEMS }: { items?: NavItem[] }) {
  useGoogleFonts();
  const viewportWidth = useViewportWidth();

  const wrapRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const indexRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const contentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const targetsRef = useRef<number[]>(items.map(() => 0));
  const currentRef = useRef<number[]>(items.map(() => 0));
  const activeIndexRef = useRef(0);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // the first item with a sectionId drives the sidebar's own fade-in —
  // originally "hero" specifically, generalized here to "whichever
  // section is first in the list"
  const fadeInTriggerId = useMemo(
    () => items.find((i) => i.sectionId)?.sectionId,
    [items]
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // fade the whole sidebar in as its first tracked section scrolls out
  useEffect(() => {
    const wrap = wrapRef.current;
    const trigger = fadeInTriggerId ? document.getElementById(fadeInTriggerId) : null;
    if (!wrap || !trigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wrap, { opacity: 1 });
      return;
    }
    const tween = gsap.fromTo(
      wrap,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [fadeInTriggerId]);

  // scrollspy: whichever tracked section is nearest the viewport's center
  useEffect(() => {
    const sections = items
      .map((i) => (i.sectionId ? document.getElementById(i.sectionId) : null))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    let raf = 0;
    function update() {
      raf = 0;
      const mid = window.innerHeight / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      items.forEach((item, idx) => {
        const el = item.sectionId ? document.getElementById(item.sectionId) : null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs((r.top + r.bottom) / 2 - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  // single rAF loop easing every row's effect toward max(proximity, active)
  useEffect(() => {
    function frame(now: number) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const tau = SMOOTHING_MS / 1000;
      const k = 1 - Math.exp(-dt / tau);

      let moving = false;
      items.forEach((_, i) => {
        const target = Math.max(
          targetsRef.current[i] ?? 0,
          i === activeIndexRef.current ? 1 : 0
        );
        const cur = currentRef.current[i] ?? 0;
        const next = cur + (target - cur) * k;
        const settled = Math.abs(target - next) < 0.0015;
        const value = settled ? target : next;
        currentRef.current[i] = value;

        const marker = markerRefs.current[i];
        const indexEl = indexRefs.current[i];
        const labelEl = labelRefs.current[i];
        const contentEl = contentRefs.current[i];
        if (marker) {
          marker.style.width = `${14 + value * 18}px`;
          marker.style.opacity = String(0.3 + value * 0.7);
          marker.style.background = lerpColor(
            COLORS.paperFaint,
            COLORS.terracotta,
            value
          );
        }
        if (indexEl)
          indexEl.style.color = lerpColor(COLORS.paperFaint, COLORS.terracotta, value);
        if (labelEl)
          labelEl.style.color = lerpColor(COLORS.paperDim, COLORS.terracotta, value);
        if (contentEl) contentEl.style.transform = `translateX(${value * 10}px)`;

        if (!settled) moving = true;
      });

      rafRef.current = moving ? requestAnimationFrame(frame) : 0;
    }

    function startLoop() {
      if (rafRef.current) return;
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(frame);
    }
    startLoop();

    const rows = rowsRef.current;
    if (!rows) return;

    function handleMove(e: PointerEvent) {
      items.forEach((_, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(e.clientY - center);
        targetsRef.current[i] = smoothFalloff(
          Math.max(0, 1 - distance / PROXIMITY_RADIUS)
        );
      });
      startLoop();
    }
    function handleLeave() {
      targetsRef.current = targetsRef.current.map(() => 0);
      startLoop();
    }

    rows.addEventListener("pointermove", handleMove, { passive: true });
    rows.addEventListener("pointerleave", handleLeave, { passive: true });
    return () => {
      rows.removeEventListener("pointermove", handleMove);
      rows.removeEventListener("pointerleave", handleLeave);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [activeIndex, items]);

  if (viewportWidth < 1024) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        pointerEvents: "none",
        position: "fixed",
        left: viewportWidth >= 1280 ? 40 : 24,
        top: "50%",
        zIndex: 50,
        transform: "translateY(-50%)",
        opacity: 0,
        filter:
          "drop-shadow(0 1px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 18px rgba(0,0,0,0.6))",
      }}
    >
      <div
        ref={rowsRef}
        style={{
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.num}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            onClick={() =>
              item.sectionId &&
              document.getElementById(item.sectionId)?.scrollIntoView({
                behavior: "smooth",
              })
            }
            style={{ cursor: item.sectionId ? "pointer" : "default" }}
          >
            <span
              ref={(el) => {
                contentRefs.current[i] = el;
              }}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span
                ref={(el) => {
                  markerRefs.current[i] = el;
                }}
                style={{
                  height: 1,
                  width: 14,
                  flexShrink: 0,
                  background: COLORS.paperFaint,
                  display: "block",
                }}
              />
              <span
                ref={(el) => {
                  indexRefs.current[i] = el;
                }}
                style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.paperFaint }}
              >
                {item.num}
              </span>
              <span
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  color: COLORS.paperDim,
                }}
              >
                {item.label}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndexSidebar;
