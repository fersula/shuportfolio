# Changelog

Notable changes to Shu's Mind, newest first.

## 2026-07-28

**Mobile responsiveness pass** — the site previously hid or awkwardly
reflowed several sections below the `sm`/`md` breakpoints; this pass gives
Hero, Manifesto, Intro, and Featured Works real mobile-specific layouts.

- New `useIsMobile()` hook (`src/lib/use-is-mobile.ts`, `useSyncExternalStore`
  on `(max-width: 767px)`) used to branch rendering between desktop and
  mobile layouts where a CSS-only reflow wasn't enough.
- **Hero**: `FloatingWords` field is no longer hidden on mobile (was
  `hidden sm:block`) — each word's position and font size can now carry an
  optional mobile override (`mobileTop`/`mobileLeft`/`mobileFontSize` in
  `field-data.ts`, applied via CSS custom properties) so crowded/colliding
  words on narrow screens can be repositioned individually. Hero's content
  block is centered on mobile (`items-center`, `sm:items-stretch` restores
  desktop's left alignment).
- **Fluid glass cursor**: now works on touch devices too, not just
  `pointer: fine`. On touch, the blob starts parked at Hero's center as
  soon as Hero is on screen, follows a finger drag (clamped to Hero's own
  bounds), and fades based on scroll position instead of `pointerleave`.
- **Manifesto**: smaller body copy on mobile (`24px`, up to `32px` from
  `sm:`), reduced section padding below `md`, `min-h-svh` now only applies
  from `md` up so the section doesn't force excess height on short mobile
  viewports.
- **Intro**: dedicated mobile layout (avatar + tabs side by side, bio text
  below) instead of reflowing the desktop nav-column layout; gated on
  `isMobile` so only one `<video>` avatar mounts at a time.
- **Featured Works**: mobile gets an entirely separate render path — no
  `OptionWheel`, no scrollspy/active-section concept. Each category renders
  a static "Connection with [Category]" heading followed by its Featured
  and Related cards fully expanded (new `FeaturedCardMobile` /
  `RelatedCardMobile` components in `project-card.tsx`: image-on-top,
  text-below, no hover-gating). Desktop's wheel + scrollspy + accordion
  behavior is unchanged. Mobile sections get their own GSAP scroll-triggered
  fade-up, matching the site's usual reveal style.
- Desktop Featured/Related card images now scale up slightly on hover
  (`group-hover:scale-105`).

**Fixes**

- Matsudo MetaCity's project link was pointing at Chimon's site
  (`chimonart.framer.website`) by mistake — corrected to
  `fushu.framer.website/metamatsu`.
- Re-compressed `metamatsu.png` thumbnail (1.37MB → 639KB, same image).

**Dev environment**

- `next.config.ts`: added `allowedDevOrigins` so `next dev` accepts
  requests from a phone on the same Wi-Fi (LAN IP) during mobile testing —
  dev-only, has no effect on the deployed build.
