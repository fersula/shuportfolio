export type DepthLayer = "d1" | "d2" | "d3" | "d4";

/* Each depth layer uniformly controls font size, blur, opacity — and its
   parallax coefficient (how far it shifts with the mouse). d1 is nearest.
   mobileFontSize is a separate, smaller clamp() used only below the `sm`
   breakpoint (see .word-node in globals.css) — the desktop clamp()s above
   are tuned for a wide viewport and pin to their flat rem floor well before
   phone widths, so phones need their own scale rather than just riding the
   same vw curve down. */
export const LAYERS: Record<
  DepthLayer,
  { fontSize: string; mobileFontSize: string; blur: number; opacity: number; parallax: number }
> = {
  d1: { fontSize: "clamp(2.75rem, 4.5vw, 4.25rem)", mobileFontSize: "clamp(1.6rem, 8vw, 2.4rem)", blur: 1, opacity: 0.95, parallax: 0.08 },
  d2: { fontSize: "clamp(2rem, 3vw, 2.9rem)", mobileFontSize: "clamp(1.15rem, 5.8vw, 1.75rem)", blur: 1.5, opacity: 0.85, parallax: 0.06 },
  d3: { fontSize: "clamp(1.2rem, 1.9vw, 1.8rem)", mobileFontSize: "clamp(0.85rem, 4.2vw, 1.3rem)", blur: 2, opacity: 0.65, parallax: 0.04 },
  d4: { fontSize: "clamp(0.85rem, 1.3vw, 1.15rem)", mobileFontSize: "clamp(0.65rem, 3vw, 1rem)", blur: 2.5, opacity: 0.5, parallax: 0.02 },
};

export type Fragment = {
  id: string;
  text: string;
  /** position as a percentage of the hero viewport */
  top: string;
  left: string;
  /** mobile-only position override (see .frag in globals.css) — only set
      where the desktop position collides with something mobile-specific,
      e.g. the centered SHU.F title or a mobile-sized neighbor word */
  mobileTop?: string;
  mobileLeft?: string;
  layer: DepthLayer;
  /** stagger + float timing offsets so the field doesn't move in lockstep */
  delay: number;
  floatDuration: number;
};

/* Composition follows the Figma reference: the seven anchor words placed
   per the mock, the rest scattered on far layers as depth dust. */
export const FRAGMENTS: Fragment[] = [
  // nearest
  { id: "ai", text: "AI", top: "78%", left: "67%", layer: "d1", delay: 0.45, floatDuration: 7 },
  // mobile: "SHU.F" sits centered around ~44-56% of the hero height, and
  // 57% was landing right on its bottom edge — pushed down to clear it
  { id: "culture", text: "Culture", top: "57%", left: "60%", mobileTop: "68%", layer: "d1", delay: 0.1, floatDuration: 8 },
  // second plane
  // mobile: same top (30%) put these two edge-to-edge at mobile's bigger
  // font sizes — staggered vertically so they don't crowd each other
  { id: "human", text: "Human", top: "30%", left: "45%", mobileTop: "22%", layer: "d2", delay: 0.25, floatDuration: 9 },
  { id: "intelligence", text: "Intelligence", top: "30%", left: "73%", mobileTop: "38%", layer: "d2", delay: 0.6, floatDuration: 8.5 },
  { id: "history", text: "History", top: "63%", left: "83%", layer: "d2", delay: 0.35, floatDuration: 7.5 },
  // third plane
  { id: "emotion", text: "Emotion", top: "44%", left: "83%", layer: "d3", delay: 0.15, floatDuration: 8 },
  { id: "places", text: "Places", top: "80%", left: "50%", layer: "d3", delay: 0.5, floatDuration: 9 },
  { id: "memory", text: "Memory", top: "16%", left: "88%", layer: "d3", delay: 0.3, floatDuration: 7 },
  { id: "connection", text: "Connection", top: "72%", left: "24%", layer: "d3", delay: 0.7, floatDuration: 8.5 },
  // farthest
  { id: "meaning", text: "Meaning", top: "12%", left: "58%", layer: "d4", delay: 0.2, floatDuration: 6.5 },
  { id: "care", text: "Care", top: "22%", left: "14%", layer: "d4", delay: 0.55, floatDuration: 7 },
  { id: "signals", text: "Signals", top: "35%", left: "25%", layer: "d4", delay: 0.4, floatDuration: 6 },
  { id: "behavior", text: "Behavior", top: "93%", left: "84%", layer: "d4", delay: 0.65, floatDuration: 7.5 },
  { id: "philosophy", text: "Philosophy", top: "90%", left: "26%", layer: "d4", delay: 0.05, floatDuration: 6.5 },
];

export type LightPoint = {
  id: string;
  top: string;
  left: string;
  size: number;
  hue: "emerald" | "gold";
  delay: number;
  duration: number;
};

export const LIGHT_POINTS: LightPoint[] = Array.from({ length: 18 }).map((_, i) => {
  const hue = i % 2 === 0 ? "emerald" : "gold";
  // deterministic pseudo-scatter so SSR/CSR markup matches
  const top = (i * 53.7) % 96;
  const left = (i * 31.3 + i * i * 2.1) % 96;
  return {
    id: `pt-${i}`,
    top: `${top}%`,
    left: `${left}%`,
    size: 2 + ((i * 7) % 4),
    hue,
    delay: (i % 6) * 0.35,
    duration: 4 + (i % 5),
  };
});
