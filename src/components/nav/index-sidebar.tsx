"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useLocale } from "@/lib/i18n/locale-context";
import { UI_COPY } from "@/lib/i18n/ui-copy";

type NavItem = {
  num: string;
  label: string;
  /** only sections that actually exist get an id + are clickable/highlightable */
  id?: string;
  /** extra element ids that should also count as "this item is active" for
   * the scrollspy, without becoming the click-to-scroll target — e.g. the
   * Featured Works teaser text living inside Intro, ahead of the real section */
  trackIds?: string[];
};

// `label` here is the English fallback and the key structure other logic
// (targetsRef/currentRef sizing, scrollspy tracking) is built around — the
// actual displayed text comes from UI_COPY.nav via navKey at render time,
// so ITEMS itself stays locale-agnostic and every id/ref/effect above is
// unaffected by which language is active.
const ITEMS: (NavItem & { navKey: keyof typeof UI_COPY.en.nav })[] = [
  { num: "01", label: "Shu's Mindspace", id: "hero", navKey: "hero" },
  { num: "02", label: "Manifesto", id: "manifesto", navKey: "manifesto" },
  { num: "03", label: "Intro", id: "intro", navKey: "intro" },
  {
    num: "04",
    label: "Featured Works",
    id: "featured-works",
    trackIds: ["featured-works-teaser"],
    navKey: "featuredWorks",
  },
  {
    num: "05",
    label: "Refraction Lab",
    id: "refraction-lab",
    trackIds: ["refraction-lab-teaser"],
    navKey: "refractionLab",
  },
  { num: "06", label: "Contact Me", id: "contact", navKey: "contact" },
];

/* pointer-proximity falloff, matching reactbits LineSidebar's "smooth" curve */
const smoothFalloff = (p: number) => p * p * (3 - 2 * p);

const PROXIMITY_RADIUS = 48; // px — reach of the hover effect around a row's center
const SMOOTHING_MS = 120; // exponential-smoothing time constant for --effect

/**
 * Fixed, vertically-centered index nav. Fades in over the same scroll
 * range the Hero fades out on, so its arrival reads as part of one
 * continuous crossfade rather than a hard cut. Stays fixed for the rest
 * of the page. Items without a real section yet are inert placeholders.
 *
 * Each row's --effect (0–1) is the max of pointer-proximity and
 * scroll-driven active state, eased toward its target every frame
 * (reactbits LineSidebar's model) — driving color, marker length and a
 * small horizontal shift together via CSS, no separate indicator line.
 */
export function IndexSidebar() {
  const { locale } = useLocale();
  const outerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetsRef = useRef<number[]>(ITEMS.map(() => 0));
  const currentRef = useRef<number[]>(ITEMS.map(() => 0));
  const activeIdRef = useRef<string>("hero");
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const [activeId, setActiveId] = useState<string>("hero");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // scrollspy: whichever tracked element is nearest the viewport's center —
  // an item can track more than one element (see trackIds above), and
  // whichever of its elements wins still just activates that one nav item
  useEffect(() => {
    const tracked: { navId: string; el: HTMLElement }[] = [];
    ITEMS.forEach((item) => {
      if (!item.id) return;
      const primary = document.getElementById(item.id);
      if (primary) tracked.push({ navId: item.id, el: primary });
      item.trackIds?.forEach((extraId) => {
        const el = document.getElementById(extraId);
        if (el) tracked.push({ navId: item.id!, el });
      });
    });
    if (!tracked.length) return;

    let raf = 0;
    function update() {
      raf = 0;
      const mid = window.innerHeight / 2;
      let closest = tracked[0];
      let closestDist = Infinity;
      for (const entry of tracked) {
        const r = entry.el.getBoundingClientRect();
        const dist = Math.abs((r.top + r.bottom) / 2 - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closest = entry;
        }
      }
      setActiveId(closest.navId);
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
  }, []);

  // Unified scroll-driven opacity for the whole sidebar, across four
  // sequential phases down the page:
  //   1. fades IN as Hero scrolls out ("top top" -> "bottom top" on #hero)
  //   2. fades OUT once the Featured Works teaser (in Intro) crosses
  //      center, staying hidden through Featured Works itself — its own
  //      "Connection with" wheel is the nav there instead
  //   3. fades back IN as the Refraction Lab teaser (in Featured Works)
  //      approaches, to preview "05 Refraction Lab"
  //   4. fades OUT again once that teaser crosses center, staying hidden
  //      through Refraction Lab — the Lab has its own left-side filter
  //      instead
  //   5. fades back IN as Contact approaches (it has no left panel of its
  //      own), and stays visible for the rest of the page — it's the last
  //      section, so there's no further fade-out
  // Deliberately one rAF-driven calculation rather than several GSAP
  // ScrollTrigger scrub tweens on the same element's opacity: a scrub
  // tween keeps re-rendering its own clamped value on *every* scroll
  // event even once scrolled well past its own range, so a second tween
  // on the same property would just fight over whichever one rendered
  // last on a given frame — fine for one tween, not composable for four.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wrap, { opacity: 1 });
      return;
    }

    const hero = document.getElementById("hero");
    const fwTeaser = document.getElementById("featured-works-teaser");
    const rlTeaser = document.getElementById("refraction-lab-teaser");
    const contact = document.getElementById("contact");
    if (!hero || !fwTeaser || !rlTeaser || !contact) return;

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const ramp = (start: number, end: number, value: number) =>
      clamp01((value - start) / (end - start));

    let raf = 0;
    function update() {
      raf = 0;
      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      // document-relative top/bottom via getBoundingClientRect() + scrollY,
      // not offsetTop — offsetTop is relative to the nearest *positioned*
      // ancestor (e.g. Featured Works' own `relative` section), not the
      // document, so it silently gave the wrong numbers for anything
      // nested inside a `position: relative` container.
      const heroRect = hero!.getBoundingClientRect();
      const heroTop = heroRect.top + scrollY;
      const heroBottom = heroRect.bottom + scrollY;

      const fwRect = fwTeaser!.getBoundingClientRect();
      const fwDocBottom = fwRect.bottom + scrollY;
      const fwHideStart = fwRect.top + scrollY + fwRect.height / 2 - vh / 2; // "center center"
      const fwHideEnd = fwDocBottom; // "bottom top"

      const rlRect = rlTeaser!.getBoundingClientRect();
      const rlDocTop = rlRect.top + scrollY;
      const rlDocBottom = rlRect.bottom + scrollY;
      const rlShowStart = rlDocTop - vh * 0.88; // "top 88%"
      const rlShowEnd = rlDocTop - vh * 0.55; // "top 55%"
      const rlHideStart = rlDocTop + rlRect.height / 2 - vh / 2; // "center center"
      const rlHideEnd = rlDocBottom; // "bottom top"

      const contactRect = contact!.getBoundingClientRect();
      const contactDocTop = contactRect.top + scrollY;
      const contactShowStart = contactDocTop - vh * 0.88; // "top 88%"
      const contactShowEnd = contactDocTop - vh * 0.55; // "top 55%"

      let opacity: number;
      if (scrollY <= fwHideStart) {
        opacity = ramp(heroTop, heroBottom, scrollY);
      } else if (scrollY <= fwHideEnd) {
        opacity = 1 - ramp(fwHideStart, fwHideEnd, scrollY);
      } else if (scrollY <= rlShowStart) {
        opacity = 0;
      } else if (scrollY <= rlShowEnd) {
        opacity = ramp(rlShowStart, rlShowEnd, scrollY);
      } else if (scrollY <= rlHideStart) {
        opacity = 1;
      } else if (scrollY <= rlHideEnd) {
        opacity = 1 - ramp(rlHideStart, rlHideEnd, scrollY);
      } else if (scrollY <= contactShowStart) {
        opacity = 0;
      } else if (scrollY <= contactShowEnd) {
        opacity = ramp(contactShowStart, contactShowEnd, scrollY);
      } else {
        opacity = 1;
      }

      wrap!.style.opacity = opacity.toFixed(4);
      setHidden(opacity <= 0.001);
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
  }, []);

  // single rAF loop easing every row's --effect toward max(proximity, active)
  useEffect(() => {
    function frame(now: number) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const tau = SMOOTHING_MS / 1000;
      const k = 1 - Math.exp(-dt / tau);

      let moving = false;
      ITEMS.forEach((item, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const target = Math.max(
          targetsRef.current[i] ?? 0,
          item.id === activeIdRef.current ? 1 : 0
        );
        const cur = currentRef.current[i] ?? 0;
        const next = cur + (target - cur) * k;
        const settled = Math.abs(target - next) < 0.0015;
        const value = settled ? target : next;
        currentRef.current[i] = value;
        row.style.setProperty("--effect", value.toFixed(4));
        if (!settled) moving = true;
      });

      rafRef.current = moving ? requestAnimationFrame(frame) : 0;
    }

    function startLoop() {
      if (rafRef.current) return;
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(frame);
    }
    // re-kick the loop whenever the scroll-driven active row changes
    startLoop();

    const rows = rowsRef.current;
    if (!rows) return;

    function handleMove(e: PointerEvent) {
      ITEMS.forEach((_, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const rowRect = row.getBoundingClientRect();
        const center = rowRect.top + rowRect.height / 2;
        const distance = Math.abs(e.clientY - center);
        targetsRef.current[i] = smoothFalloff(Math.max(0, 1 - distance / PROXIMITY_RADIUS));
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
  }, [activeId]);

  const scrollTo = (id?: string) => {
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={outerRef}
      className="fixed left-16 top-1/2 z-50 hidden -translate-y-1/2 lg:block"
      style={{ pointerEvents: hidden ? "none" : "auto" }}
    >
      <div
        ref={wrapRef}
        className="pointer-events-none"
        style={{
          opacity: 0,
          filter:
            "drop-shadow(0 1px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 18px rgba(0,0,0,0.6))",
        }}
      >
        <div
          ref={rowsRef}
          className="flex flex-col gap-8"
          style={{ pointerEvents: hidden ? "none" : "auto" }}
        >
          {ITEMS.map((item, i) => (
            <div
              key={item.num}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="sidebar-row"
              onClick={() => scrollTo(item.id)}
              style={{ cursor: item.id ? "pointer" : "default" }}
            >
              <span className="sidebar-content flex items-center gap-3">
                <span className="sidebar-marker h-px shrink-0" />
                <span className="sidebar-index font-mono text-xs">{item.num}</span>
                <span className="sidebar-label font-mono text-sm whitespace-nowrap">
                  {UI_COPY[locale].nav[item.navKey]}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
