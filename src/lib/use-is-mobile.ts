"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}
function getServerSnapshot() {
  return false;
}

/**
 * matchMedia via useSyncExternalStore rather than useState+useEffect — this
 * hits the server/client snapshot split React designed for exactly this
 * ("does a media query match" differs between server and client): hydration
 * renders the desktop branch (the server snapshot) first, then a
 * post-hydration check swaps to the real client value with no mismatch
 * warning, and no synchronous setState-in-effect for React Compiler to flag
 * (see the MediaSlideshow precedent in refraction-lab/detail-panel.tsx).
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
