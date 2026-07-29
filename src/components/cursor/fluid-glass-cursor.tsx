"use client";

import { useEffect, useRef } from "react";

const BLOB_SIZE = 140;

/**
 * feDisplacementMap reads its X/Y push from the R/G channels of a map
 * image. A plain linear gradient across the blob's width, sampled at any
 * point, is proportional to that point's x-offset from center (0 at the
 * middle column, growing toward the left/right edges) — stack a vertical
 * one the same way for Y (via `mix-blend-mode: screen`, which keeps each
 * layer's own channel and passes the other through untouched, since each
 * layer is zero in the channel it doesn't own) and the combined map is
 * exactly the (x, y) radial vector field: displacement is ~0 at the
 * blob's center and grows toward its rim, i.e. a real lens bulge rather
 * than the uniform all-over ripple a noise-based map gives. The
 * feDisplacementMap `scale` below is negative on purpose — positive
 * samples *outward* (pulls in edge content, shrinking what's under the
 * blob, like looking through the wrong end of a telescope); negative
 * samples *inward* toward center, which is what actually magnifies.
 */
const RADIAL_MAP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${BLOB_SIZE}" height="${BLOB_SIZE}"><defs><linearGradient id="gx" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="gy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient></defs><rect width="${BLOB_SIZE}" height="${BLOB_SIZE}" fill="url(#gx)"/><rect width="${BLOB_SIZE}" height="${BLOB_SIZE}" fill="url(#gy)" style="mix-blend-mode:screen"/></svg>`;
const RADIAL_MAP_DATA_URI = `data:image/svg+xml,${encodeURIComponent(RADIAL_MAP_SVG)}`;

/**
 * A small glass blob that follows the pointer while it's over the Hero
 * section, refracting whatever sits beneath it via an SVG displacement
 * filter layered onto backdrop-filter (Chromium; other engines fall back
 * to a plain frosted blur — see the `@supports` gate in globals.css).
 * Outside Hero the blob just fades out — nothing hides the real system
 * cursor at any point, so there's nothing to "restore" there.
 *
 * This samples the page's actual rendered pixels — the one thing a
 * three.js overlay structurally can't do, since WebGL has no access to
 * already-rendered DOM content. A three.js version was tried first and
 * reverted: without real scene content to refract, its transmission
 * material could only fake translucency via flat alpha blending, which
 * read as a tinted, slightly muddy disc rather than genuinely warped
 * text. backdrop-filter doesn't have that problem — text stays legible
 * through the blob, with the radial map above bending it only near the
 * rim, the way a real lens would.
 *
 * Position is written every frame by a rAF loop, the same target/current
 * lerp pattern as SpotlightText in intro.tsx and the index sidebar's
 * scrollspy easing.
 */
export function FluidGlassCursor() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = blobRef.current;
    if (!el) return;
    const heroEl = document.getElementById("hero");

    let raf = 0;

    if (window.matchMedia("(pointer: fine)").matches) {
      const current = { x: innerWidth / 2, y: innerHeight / 2, o: 0 };
      const target = { x: current.x, y: current.y, o: 0 };

      function onMove(e: PointerEvent) {
        target.x = e.clientX;
        target.y = e.clientY;
        const rect = heroEl?.getBoundingClientRect();
        const insideHero =
          !!rect &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        target.o = insideHero ? 1 : 0;
      }
      function onLeave() {
        target.o = 0;
      }
      function frame() {
        current.x += (target.x - current.x) * 0.16;
        current.y += (target.y - current.y) * 0.16;
        current.o += (target.o - current.o) * 0.12;
        el!.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        el!.style.opacity = String(current.o);
        raf = requestAnimationFrame(frame);
      }

      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave, { passive: true });
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      };
    }

    // Touch devices have no hover state to reveal the blob with, so instead
    // it starts parked at Hero's own center — visible as soon as Hero is
    // on screen, no touch needed — and a finger drag anywhere in Hero moves
    // it from there, clamped to Hero's own rect (never wanders past its
    // edges). Fades with scroll position the same way the desktop version
    // fades on pointerleave, since this is a fixed-position overlay that
    // would otherwise keep floating over whatever scrolls under it.
    if (!heroEl) return;

    const heroRect = () => heroEl.getBoundingClientRect();
    const start = (() => {
      const r = heroRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })();
    const current = { x: start.x, y: start.y, o: 0 };
    const target = { x: start.x, y: start.y, o: 0 };

    function heroVisibleAmount() {
      const r = heroRect();
      return r.bottom > 0 && r.top < window.innerHeight ? 1 : 0;
    }

    target.o = heroVisibleAmount();

    function onTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const r = heroRect();
      target.x = Math.min(Math.max(t.clientX, r.left), r.right);
      target.y = Math.min(Math.max(t.clientY, r.top), r.bottom);
      target.o = heroVisibleAmount();
    }
    function onScroll() {
      target.o = heroVisibleAmount();
    }
    function frame() {
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      current.o += (target.o - current.o) * 0.12;
      el!.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      el!.style.opacity = String(current.o);
      raf = requestAnimationFrame(frame);
    }

    heroEl.addEventListener("touchstart", onTouch, { passive: true });
    heroEl.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      heroEl.removeEventListener("touchstart", onTouch);
      heroEl.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="fluid-glass-cursor">
      <svg className="fluid-glass-cursor__defs">
        <filter id="fluid-glass-distortion" colorInterpolationFilters="sRGB">
          <feImage href={RADIAL_MAP_DATA_URI} x="0" y="0" width={BLOB_SIZE} height={BLOB_SIZE} result="map" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={-44}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div ref={blobRef} className="fluid-glass-cursor__blob" />
    </div>
  );
}
