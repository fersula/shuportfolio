"use client";

import { useLocale } from "@/lib/i18n/locale-context";

/** Standalone (not part of IndexSidebar) so it stays reachable on mobile,
 *  where IndexSidebar is `hidden` below `lg`, and so it doesn't get pulled
 *  into IndexSidebar's four-phase scroll-driven opacity choreography —
 *  it's always visible, always clickable, regardless of scroll position. */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const next = locale === "en" ? "zh" : "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={locale === "en" ? "Switch to Chinese" : "切换到英文"}
      className="fixed right-6 top-6 z-50 rounded-full border border-paper-dim/40 bg-ink/60 px-3.5 py-1.5 font-mono text-xs text-paper-dim backdrop-blur transition-colors duration-300 hover:border-paper hover:text-paper"
    >
      {next === "zh" ? "中文" : "EN"}
    </button>
  );
}
