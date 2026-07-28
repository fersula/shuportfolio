@AGENTS.md

# Shu's Mind — project notes

Personal portfolio for Shu Fu (AI Product Designer/Builder). Black-background,
"prism/refraction" visual metaphor — scattered fragments resolving into a
meaningful spectrum. Restrained, intentional, high-craft feel; serif-leaning
reflective copy vs. sans-serif assertive copy (in spirit — actual typefaces
are locked, see below).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + GSAP
ScrollTrigger. No `tailwind.config.ts` — all design tokens live in
`src/app/globals.css` under `@theme inline`.

## Locked font system (do not add more typefaces)

- **JetBrains Mono** — titles, labels, nav (`font-mono`)
- **Space Grotesk** — floating words, option-wheel labels (`font-grotesk`)
- **DM Sans** — body copy, project-card text (`font-sans`)

Loaded via `next/font/google` in `src/app/layout.tsx`, exposed as CSS vars,
mapped into Tailwind's `font-*` utilities via `@theme inline` in globals.css.

## Design tokens (`src/app/globals.css`)

- Colors: `ink`/`ink-soft`/`ink-raised` (surfaces), `paper`/`paper-dim`/
  `paper-faint` (foreground), `emerald`/`violet-deep`/`gold`/`blue`/
  `terracotta`/`turquoise` (spectrum/accents — blue = Manifesto heading,
  terracotta = sidebar + project-name accent, turquoise = Featured Works'
  "Featured Work" badge)
- Spacing: `gutter`/`hero-y`/`section`, all `clamp()`-based responsive values
- Easing: `prism`/`refract`/`drift`/`settle` — mirrored as JS arrays in
  `src/lib/motion.ts` (`EASE`) for Framer Motion, since CSS custom properties
  aren't directly usable there

## Page composition (`src/app/page.tsx`)

`<IndexSidebar /> <Hero /> <Manifesto /> <Intro /> <FeaturedWorks />
<RefractionLab />` — the sidebar is a fixed overlay, not part of the
document flow.

## Section-by-section

### Hero (`src/components/hero/`)
WebGL `Prism` background (`prism.tsx`, `ogl`-based port of reactbits Prism,
pointer-driven yaw/pitch + inertia), `FloatingWords` depth-layered word field
(parallax + cursor-proximity focus), `LightPoints`. Orchestrated by `hero.tsx`
with a GSAP scroll-scrubbed fade into Manifesto.

**Pitfalls hit here:**
- Prism's own internal "settled → stop rAF" optimization freezes the tilt
  animation if `noise={0}`. Must be non-zero (`0.5` works).
- The Hero→Manifesto crossfade needs the WebGL canvas **fully unmounted**
  (React state, not just CSS `opacity:0`) once faded out — a browser can
  still composite a stale WebGL frame at opacity 0. Toggled via
  `showPrism` state on the GSAP tween's `onComplete`/`onReverseComplete`.
- `ScrollTrigger end` must be reachable given the *next* section's actual
  height — `"bottom top"` failed once Manifesto was shorter than 100vh;
  fixed with `"bottom center"` plus `min-h-svh` on Manifesto as a safety
  margin.

### IndexSidebar (`src/components/nav/index-sidebar.tsx`)
Fixed left nav, terracotta accent, `left-16` (64px — matches the page
gutter everywhere else). Not visible for the whole page — it fades in
and out across **four sequential phases** down the scroll:
1. fades IN as Hero scrolls out ("top top" → "bottom top" on `#hero`).
2. fades OUT once the Featured Works teaser (`#featured-works-teaser`,
   living inside Intro) crosses the viewport's vertical center, staying
   hidden through all of Featured Works — its own "Connection with"
   wheel is the nav there instead.
3. fades back IN as the Refraction Lab teaser
   (`#refraction-lab-teaser`, living inside Featured Works — same
   relationship as #2, one section previews the next) approaches, to
   preview "05 Shu's Lab".
4. fades OUT again once *that* teaser crosses center, staying hidden
   for the rest of the page — Refraction Lab has its own left-side
   filter panel instead of the global sidebar.

This whole sequence is **one rAF-driven scroll listener computing a
single opacity value**, not four independent GSAP ScrollTrigger scrub
tweens on the same element. A scrub tween keeps re-rendering its own
clamped value on *every* scroll event even long after scrolling past
its own start/end range (that's what makes "hide forever" work with
just one tween) — so a second tween targeting the same property would
just fight over whichever one happened to render last on a given
frame. Four tweens would make phase 3 (show again) essentially
unreachable. The piecewise function itself is straightforward: below
each phase's start it's the untouched result of the previous phase,
inside a phase it ramps 0↔1, and once a phase's end is passed the ramp
clamps and holds until the next phase's start.
**Pitfall hit here:** the ramp math needs each element's *document*-relative
top/bottom (`getBoundingClientRect().top/bottom + window.scrollY`), not
`.offsetTop` — `offsetTop` is relative to the nearest *positioned*
ancestor (e.g. Featured Works' own `.relative` section), not the
document, so it silently produced numbers relative to the wrong origin
for anything nested inside a `position: relative` container.

Two other independent effects round it out:
- Scrollspy: nearest-to-viewport-center among tracked elements, driving
  `--effect` (row highlight strength) via a single rAF easing loop.
- Pointer-proximity hover glow on whichever row is nearest the cursor,
  blended with the scrollspy's active row via the same `--effect`.

`NavItem.trackIds?: string[]` lets one nav entry be driven by *multiple*
DOM elements for scrollspy purposes — used so a section's teaser text
living in the *previous* section (Featured Works' teaser in Intro,
Refraction Lab's teaser in Featured Works) can steal the highlight for
its own nav item before the real section is reached.

### Manifesto (`src/components/sections/manifesto.tsx`)
Two convictions ("I wonder why" / "My sincere calling"), blue mono
heading + `32px` DM Sans body, GSAP scroll-scrubbed fade-up
(`opacity 0→1`, `y: 28→0`, `start: "top 88%"`, `end: "top 55%"`). This
exact pattern is the house style for scroll-reveals — reused verbatim by
Intro's card and the Featured Works teaser below.

### Intro (`src/components/sections/intro.tsx`)
Tabbed bio card with `SpotlightText` (cursor-tracked radial-gradient mask
revealing a bright copy over a dim base copy — same rAF-lerp pattern used
everywhere else in this codebase). Card has the Manifesto fade-up applied
to it. Below the card: a "Featured Works" title + description block
(`id="featured-works-teaser"`) — same Manifesto styling and same fade-up
— that's *structurally* still part of Intro but is tracked by the sidebar
as the "Featured Works" nav item (see `trackIds` above).

### Featured Works (`src/components/sections/featured-works.tsx` +
`src/components/sections/project-card.tsx` +
`src/components/sections/option-wheel.tsx`)

Real vertical page scroll through 4 stacked category blocks (Technology,
Culture&Places, Self, Others), each one Featured card + its two Related
cards. A scrollspy determines which block has focus; that one shows all
three cards at full brightness with its Related pair expanded, the other
three show only their (dim, blurred) Featured card as a preview of what's
above/below. The "Connection with [word]" `OptionWheel` on the left is a
**passive readout** of the scrollspy state, not an input surface — this
replaced an earlier version where wheel events were hijacked to drive a
virtual horizontal card reel with the page itself pinned in place; that
model was scrapped in favor of real scroll.

- Scrollspy: one `IntersectionObserver` per section with
  `rootMargin: "-50% 0px -50% 0px"` — a section counts as active exactly
  when its box crosses the viewport's vertical center line. Simpler than
  the rAF nearest-distance loop `IndexSidebar` uses (see below); good
  enough here since sections aren't competing for an analog blend, just a
  single discrete "which one" answer.
- `OptionWheel` gained two props to support this passive mode:
  `selectedIndex` (controlled — an external value the wheel snaps to,
  e.g. from the scrollspy) and `wheelInput={false}` (skips attaching its
  own native `wheel` listener, so hovering the word list doesn't hijack
  real page scroll). Clicking a word still works and calls
  `scrollIntoView` on that section (`onChange` → `scrollToSection`).
  **Feedback-loop trap hit here:** the controlled-`selectedIndex` sync
  effect must call `applyTarget(value, snap, notify=false)` — if it fires
  `onChange` like a real selection would, then a multi-section
  `scrollIntoView` smooth-scroll gets re-triggered mid-flight by the
  scrollspy noticing an intermediate section cross center, stranding the
  scroll on whatever section it happened to be passing over instead of
  the one actually clicked.
- Related-card reveal is a pure-CSS accordion (`.related-accordion` in
  `globals.css`, `grid-template-rows: 0fr → 1fr` toggled by `.is-open`) —
  no JS height measurement needed, and no scroll-jank in practice: verified
  by simulating incremental wheel-scroll steps and diffing consecutive
  `scrollY` samples while a section's accordion opens/closes above the
  viewport — the browser's default scroll anchoring absorbs the reflow
  cleanly on its own.
- Featured card anatomy (unchanged from the previous iteration): fixed-
  ratio responsive image (`clamp(220px, 28vw, 400px)` width +
  `aspect-ratio: 4/3`, capped `max-w-[400px]`) + a hover-reveal info panel
  (project name/year/title/subtitle) laid out via **flexbox**. The
  *active* section's Featured card panel is forced open (not hover-gated)
  via an `active` prop; inactive ones sit dim/blurred with hover-only
  reveal (mostly moot at that opacity). Related cards are small,
  always-visible captions (name/year/title, no subtitle, smaller type) —
  only ever rendered inside an open accordion, so they carry no dim state
  of their own.
- Data model — `PROJECTS` (in `featured-works.tsx`, keyed by id) is the
  single source of truth for project *content*. `worktype` documents each
  project's canonical role but is metadata only; it isn't consulted at
  render time. Section membership is an explicit `SECTIONS` array
  (`{ category, featured: id, related: [id, id] }`) because a project's
  role isn't derivable from one field — e.g. Matsudo MetaCity is Related
  under both Technology and Culture&Places, and COMAI/SEMO are each
  Featured under their own category but double as a Related card under a
  different one. To add a project: add it to `PROJECTS`, drop the
  thumbnail into `public/thumbnails/`, then wire it into `SECTIONS`.
- The wheel column is `lg:sticky lg:top-0 lg:h-svh`, pinned while the
  section-list column (much taller — 4 stacked blocks) scrolls underneath
  it, the standard sticky-nav-beside-scrolling-content split.
- Previously had a `pb-[50svh]` hack on the section-list column so the
  *last* category block could still reach viewport-center for its
  scrollspy, since Featured Works used to be the last thing on the page.
  Removed now that Refraction Lab is a real section below it — the
  padding was only ever a stand-in for real following content.
- After the flex-row (wheel + section-list) there's a trailing
  `min-h-svh` block, `id="refraction-lab-teaser"`, previewing "Shu's
  Refraction Lab" — same Manifesto-pattern fade-up, same relationship
  as Intro's own `featured-works-teaser` (one section previews the
  next). `IndexSidebar` fades back in for this block alone (see above).

### Shu's Refraction Lab (`src/components/sections/refraction-lab/`)
A single-viewport "installation": right ~80%+ is a starfield of glowing
nodes representing questions/observations/hypotheses/experiments; left
is *just* a "Show me..." type filter, vertically centered in the
section — no title or intro copy here, that lives entirely in the
`refraction-lab-teaser` block in Featured Works (same split as Featured
Works itself, whose own title only ever appears as a teaser, never
inside the section). Deliberately not a scrolling list — one
`min-h-svh` section, no card stacks. All copy, node positions and media
live in `src/lib/refraction-lab-data.ts` (`LAB_NODES`) — that file is
the thing to edit, not the components.

- `Particles` (`particles.tsx`) is reactbits' `<Particles />`, ported to
  TypeScript the same way `prism.tsx` ported reactbits' Prism — a WebGL
  (`ogl`) drifting point cloud, rendered as `.lab-field__nebula`, the
  first child inside `.lab-field` so it paints above the ambient
  radial-gradient background but below the static CSS star dots,
  connection lines and nodes. `pointer-events: none` throughout — it's
  pure ambience, never allowed to intercept clicks/hover meant for
  nodes. Colors (`NEBULA_COLORS` in `refraction-lab.tsx`) mirror the
  blue/lavender/emerald/mint spectrum tokens as literal hex strings,
  same reason `motion.ts` mirrors the `--ease-*` tokens in JS — the
  component feeds them into a GLSL color attribute, which can't consume
  a CSS `var()`. Kept deliberately subtle (`particleBaseSize: 70`,
  `speed: 0.06`, moderate count) so it reads as background dust, not a
  second focal point next to the nodes. Skips mounting the WebGL canvas
  entirely under `prefers-reduced-motion` (the static CSS star dots
  alone carry the section then) rather than rendering a frozen point
  cloud.
  **Pitfall hit here:** the component's fixed 15° camera `fov` is a
  *narrow* lens — the visible frustum's half-height at a given depth is
  only `distance * tan(fov/2)`, so reactbits' own documented defaults
  (`particleSpread: 10`, `cameraDistance: 20`) only actually fill a
  small fraction of a wide container like this one (most particles'
  x/y land outside the frustum, or their z — stretched further by the
  vertex shader's `pos.z *= 10.0` — ends up behind the camera or past
  the far plane). First pass looked like particles were clumped in one
  small corner rather than filling the frame. Fix was raising
  `cameraDistance` (30) *and* lowering `particleSpread` (8) together —
  it's the *ratio* between them (relative to `tan(fov/2)`, and further
  scaled by the container's aspect ratio) that determines edge-to-edge
  coverage, not either value in isolation. Confirmed by temporarily
  hiding the star dots/nodes/connections via an injected style and
  screenshotting the canvas alone.
- `NodeMarker` (`node-marker.tsx`) renders one of four shapes from CSS
  alone (`refraction-lab.css`, a scoped file following the
  `border-glow.css` precedent rather than bloating `globals.css`):
  triangle+flicker (question), dot+steady glow (observation),
  hollow-ring+pulse (hypothesis), diamond+bob (experiment — the diamond
  is a rotated+inset square in its own `.lab-marker__diamond-wrap`, so
  the `lab-bob` translateY keyframe doesn't have to fight the diamond's
  own static `rotate(45deg)` on the same element; an earlier version
  also had a rotating conic-gradient ring around it, dropped per direct
  feedback in favor of just the bobbing diamond). The exact same
  component renders both the small legend
  icons and the field nodes, so the legend is a literal key. Experiment's
  key color is `--color-lavender` (`#978aee`) and Observation's is
  `--color-mint` (`#6bd7c3`) — both dedicated tokens (added specifically
  for this, not reused from elsewhere) so tuning them can't accidentally
  recolor Featured Works' turquoise badge or anything else.
- Nodes carry a `depth: "near" | "mid" | "far"` (`DEPTH_LAYERS` in
  `refraction-lab-data.ts`) controlling marker `blur`/`opacity`/
  `parallax` — a lighter version of Hero's `FloatingWords` depth-layer
  trick, meant to give the field some front-to-back read instead of
  every node sitting at the same visual weight. **All 7 current nodes
  are set to `depth: "near"` right now** — direct feedback was to stop
  depth-arranging them at all ("把这些光点不按景深排列...都放在一层",
  put them all on one layer) before re-verifying the connection lines,
  since nodes at different depths also had different `parallax`
  coefficients, so two connected nodes drifted at different relative
  rates as the pointer moved — one more variable making it harder to
  trust whether the line-tracking logic itself was correct. The
  `DEPTH_LAYERS` mechanism itself is untouched (still there for future
  nodes that might want the differentiation); only these 7 nodes'
  individual `depth` values changed. Labels themselves stay full
  opacity/no blur regardless of depth so they're always legible; only
  the marker gets the depth-of-field treatment. Marker *size* is
  **not** part of this
  anymore — every field marker is a fixed `FIELD_MARKER_SIZE` (14px, see
  `refraction-lab.tsx`); depth used to also scale size, dropped per
  direct feedback ("make every light point Npx") to keep sizing simple
  and predictable — the fixed size itself has already moved once since
  (16px → 14px), so if it changes again just edit the one constant. The
  CSS hover/active scale-up (`.lab-marker` scaling 1.45× on hover) is
  unrelated and still applies on top of that fixed base size.
- Nodes drift a few px with the pointer while it's inside `.lab-field`,
  *and* separately every node slowly **revolves around the field's own
  center** — like planets, not each one wobbling in place. First pass
  had each node orbiting its own point (a small fixed-radius wobble);
  direct feedback was specifically "revolve around the center" (公转,
  not 自转), so it was rebuilt: each node's distance from center is
  *derived* from its own authored `position` (`Math.hypot`/`atan2` off
  the field's pixel center — done in px, not raw `%`, so the path is a
  true circle regardless of the field's aspect ratio), and only the
  *angle* advances over time via `orbitPeriodSeconds(index)` (~10–18 min
  per lap, varied by index so nodes don't lap in lockstep — first tuned
  faster at ~4–7 min, then slowed down further since even a "slow"
  angular speed reads as brisk once multiplied out by a large radius).
  Angular speed is what's fixed per node, not linear speed, so a lap
  always takes the same node the same time regardless of how far out it
  sits. No tuning fields live in the data file — everything is derived
  from `position` plus the node's array index, so content stays free of
  animation knobs. This is entirely separate from the WebGL nebula's own
  rotation (`disableRotation={false}` on `<Particles>` — see above);
  they're independent systems and a request to change one isn't a
  request to touch the other. Both the pointer-parallax offset and the
  orbit offset are summed into the same `translate()` written every rAF
  frame; same technique as `FloatingWords` (smoothed pointer offset from
  the field's center, `* depth.parallax` per node) rather than Framer
  Motion, since this needs to run continuously off raw pointer position
  and elapsed time, not react to discrete state changes. Because the
  transform is fully JS-owned, `.lab-node`'s centering
  `translate(-50%,-50%)` moved out of CSS and into the element's initial
  inline `style` (so there's a correct position before the first rAF
  frame runs), and the rAF loop's
  `translate(calc(-50% + dxpx), calc(-50% + dypx))` re-applies it every
  frame instead of just the parallax delta.
- Filters are **multi-select**, not radio-style: clicking a filter row
  adds it to `activeFilters` (a `Set<NodeType>`) and reveals a small
  circular minus button next to that row; the row itself only *adds*,
  removal is exclusively via that minus button (`removeFilter`). Nodes
  are hidden when `activeFilters.size > 0` and the node's type isn't in
  the set — so with nothing selected, everything shows (the default).
- The `.lab-field` frame itself has a `1px solid rgba(255,255,255,0.2)`
  border — deliberately just the frame, no border anywhere else in the
  section (no card stacks, no dashboard chrome).
- The frame is `h-[calc(100svh-80px)]`, centered (`items-center`) in its
  column, so it sits exactly 40px off the true viewport top/bottom
  edges — not just off its flex row's edges. That distinction mattered:
  the section used to also carry `py-section`, and since the row is
  `min-h-svh`, that padding stacked *on top of* the frame's own 40px
  inset, pushing it well past 40px from the actual viewport edge.
  `py-section` was dropped from the section entirely (`px-gutter` only
  now) so the `min-h-svh` row lines up flush with the real viewport and
  the frame's inset is the only thing left controlling the gap.
- Node field positions are authored as plain `{x, y}` percentages, and
  connection lines reuse an SVG with `viewBox="0 0 100 100"
  preserveAspectRatio="none"` so a line's endpoints can just be a node's
  raw `position.x/y` — no ref measurement needed. **This stopped being
  the whole story once nodes started moving** (parallax + orbit
  revolution, both applied as a live `transform` in the rAF loop —
  see above): a line drawn from the *static* `position.x/y` visibly
  detached from the marker as soon as the marker drifted or revolved
  away from its resting spot ("the lines don't line up"). Fix: the same
  rAF loop that animates each node's transform also converts that
  frame's px offset into the SVG's percentage space and writes it into
  `offsetPctRef`, then — only when something is actually hovered —
  walks `lineElRefs`/`gradElRefs` (refs to the live `<line>`/
  `<linearGradient>` DOM nodes) and `setAttribute`s their `x1/y1/x2/y2`
  every frame. `hoveredIdRef` mirrors `hoveredId` state into a ref for
  the same reason `IndexSidebar`'s `activeIdRef` exists — so the rAF
  loop (mounted once, empty dependency array) can read the latest hover
  target without needing to restart on every hover change.
  **Pitfall hit here:** that update loop originally walked *every* ref
  sitting in `lineElRefs` and repositioned it as if it belonged to the
  current hover. `AnimatePresence` keeps a just-unhovered node's `<line>`
  mounted for its whole 0.35s exit fade, so switching hover from A to B
  while A's line was still fading out dragged that stale line over to
  originate from B instead — a stray line connecting to nothing
  sensible ("not connected, and part of the line is missing"). Fix:
  only reposition ids returned by `relationsFor(hovered)` for the
  *current* hover — a stale exiting line for a no-longer-hovered node
  is simply left alone to finish fading at wherever it already was.
  **Second pitfall, same area:** nodes drift continuously, including
  the one currently hovered — and a `<div>` moving out from under a
  pointer that hasn't moved *does* get a real `mouseleave` in Chromium
  (hover hit-testing is re-evaluated as transformed elements move, not
  only on new pointer input), so a user who hovered a node and held
  still would silently lose the hover after well under a second, with
  no input on their part. Fix: the rAF loop skips updating
  `transform`/`offsetPctRef` for whichever node currently matches
  `hoveredIdRef.current`, freezing it in place — under the cursor —
  for the duration of the hover; its connection lines still track
  live, since the *other* endpoint (the related node) keeps moving
  normally.
- Each line is also **inset from both nodes' centers by
  `LINE_GLOW_INSET` (20px)**, shortened along its own direction vector
  in px space (not `%`, since the glow's own size is a fixed px value
  regardless of field size) so it visually starts and ends at the edge
  of each node's `.lab-marker__glow` halo rather than piercing straight
  through the marker — direct feedback was specifically "from one
  point's outer glow to the other's," not center-to-center. 20px is a
  deliberate approximation, not the glow's exact geometric radius
  (`--lab-size * 1.8`, ~25px for the 14px marker) — the glow fades via
  its own radial-gradient well before its geometric edge, so the
  perceived edge sits a bit inside that.
- Connection lines are a **per-pair `<linearGradient>`** (defined in
  `<defs>`, `gradientUnits="userSpaceOnUse"`, `x1/y1/x2/y2` matching the
  line's own — already inset — endpoints, kept in sync live per the
  points above) fading from the hovered node's color to the related
  node's color — not a single flat color, and not dashed/animated (an
  earlier version had a flowing dash pattern; dropped in favor of a
  plain thin solid stroke per direct feedback that it read as too
  thick). **Pitfall hit here:** `stroke-width` set via the
  `.lab-connection` CSS *class* silently resolves as a literal
  sub-pixel CSS length and does **not** get scaled up by the SVG's own
  viewBox-to-viewport transform the way a plain `stroke-width`
  *attribute* does — so a thin class-set value (`0.09`) was rendering
  at ~0 visible coverage (confirmed by forcing the same value on via
  `setAttribute` instead, which rendered fine). Fix: `strokeWidth={0.09}`
  is set directly as a prop on the `<motion.line>` (→ a real SVG
  attribute) instead of living in the CSS class, which only carries
  `fill`/`opacity`/`transition` now.
- Hover state is one `hoveredId` in React (not CSS `:hover`) because
  dimming siblings and drawing connection lines both need to know
  *which* node is hovered, not just that some node is. `relationsFor()`
  makes relations effectively bidirectional even though `relatedIds` in
  the data only needs to be authored on one side of a pair.
- The floating insight tooltip is a fixed `240px` wide (not `max-width`)
  and always `left`-anchors via `calc(var(--lab-size) + 10px)` — the
  same offset `.lab-node__label`'s own `margin-left` uses, so the
  tooltip's left edge lines up with the keyword's left edge exactly,
  for every node. There used to be a `right`-anchored "flip" variant for
  nodes near the field's right edge (to dodge overflow), but it broke
  that left-alignment for exactly the nodes it applied to (`Dating AI`,
  `Emotion AI Future` — the only two past `position.x: 65`) — direct
  feedback was that *all* nodes should align the same way, so the flip
  was removed outright rather than patched.
- The marker's own soft-glow halo (`.lab-marker__glow`, blurred and
  much bigger than the marker itself) can visually collide with the
  insight tooltip directly beneath it if the halo radius or the
  tooltip's `margin-top` aren't kept in balance — got flagged while
  reviewing screenshots as text sitting half-behind the glow.
- The sitewide `.fluid-glass-cursor` blob (see `globals.css`) will sit
  on whatever the pointer is hovering, including these nodes/tooltips —
  in a real Chromium screenshot this shows up as the hovered text
  looking warped/frosted underneath a ~140px circle. That's the
  existing cursor effect working as designed, not a Refraction Lab bug;
  don't "fix" it by fighting the cursor component from here.
- `DetailPanel` (`detail-panel.tsx`) is a right-side drawer (`35%`
  width, `min-w-[420px]`), not a centered modal — `framer-motion`
  `AnimatePresence` slides it in on `x`, plus a click-to-close backdrop
  and Escape key. Its media slideshow auto-advances every 2s through
  `node.media` (crossfaded via `AnimatePresence mode="sync"`); nodes
  with no media get a quiet accent-colored gradient placeholder instead
  of a broken `<Image>`. `MediaSlideshow` is `key={node.id}`'d from the
  parent so switching nodes resets its slide index by remounting,
  rather than calling `setState` synchronously inside an effect (React
  Compiler flagged the latter as a lint error). `.gif` sources get
  `unoptimized` on the `next/image` `<Image>` — Next's image optimizer
  re-encodes images (including dropping GIF animation) unless told not
  to, and a couple of nodes (`london-monster`) rely on animated GIFs to
  show the actual installation in motion.
- All 7 nodes now have real content/media (`public/dots-media/<id>/`,
  images supplied directly by Shu rather than generated) — the file's
  earlier placeholder-copy phase is gone, this is really Shu's own
  writing. `LAB_NODES` entries **aren't fixed-shape** beyond the top-level
  metadata: `types: NodeType[]` (not a single `type`) lets a node belong
  to more than one filter category at once — e.g. `bmi-paradox` is both
  `question` and `observation`, and shows up whenever *either* filter is
  active (`node.types.some((t) => activeFilters.has(t))` in
  `refraction-lab.tsx`). The first entry in `types` is what decides the
  node's marker shape/color and detail-panel accent everywhere
  `NODE_TYPE_META[node.types[0]]` is read — order it deliberately.
  `sections: LabSection[]` (`{icon, title, body}`) replaced the old
  fixed Origin/Observation/Hypothesis/Value/Why-It-Might-Fail/What-I-
  Learned fields — different nodes genuinely have differently-shaped
  stories (a resolved question needs 3 beats, a shipped experiment
  needs 5, and the actual section titles differ node to node: "Trigger",
  "Reflection", "What I Believe", "Questions I'm Still Living With" …),
  so `DetailPanel` just `.map()`s over whatever's there instead of
  rendering 6 hardcoded `<Field>` calls.
- `relatedTags` (free text shown in the panel's "Related" line) and
  `relatedIds` (which drives the hover connection lines) are
  deliberately separate — a node's "Related" line often names other
  Featured Works *projects* (COMAI, SEMO, Chimon…) that aren't
  Refraction Lab nodes at all and so can't be a `relatedIds` target.
  Where a related mention *is* another lab node under a different name
  (e.g. `cultural-stereotypes`'s "Related: … Chimon" refers to the
  `traditional-x-ai` node, which is *about* Chimon), the id gets wired
  into `relatedIds` even though the visible tag text says something
  else. One correction made while wiring this up: the source brief for
  `london-monster` listed itself as its own second "Related" entry —
  read as a copy/paste slip for `presence-in-pandemic`, since that node
  independently names London Monster back as one of *its* relations
  (now documented inline in the data file).

## Environment quirks worth knowing before you "verify and it looks broken"

**The Claude Code Browser preview tool consistently runs its tab with
`document.hidden === true`.** This throttles/blocks: `requestAnimationFrame`
(and any `setTimeout`-based rAF polyfill), `IntersectionObserver` callbacks,
React's non-urgent scheduler (props can appear "stale" for a beat after a
programmatic/injected event, even though a *real* click flushes fine),
video/audio autoplay, and `window.scrollTo()`'s visual effect. Screenshots
taken in this state frequently return solid black frames.

Workarounds that reliably worked this session:
- Prefer real user input over synthetic: use the `computer` tool's actual
  click/hover/scroll over `element.click()` — note the screenshot pixel
  space is scaled (≈0.625×) relative to the CSS viewport at common sizes,
  so convert coordinates before clicking.
- To force an animation to its settled state for verification, walk the
  React fiber tree from a DOM node (`el[Object.keys(el).find(k =>
  k.startsWith('__reactFiber$'))]`) to find the component, pull its
  exposed rAF callback ref out of the hooks list, and call it directly N
  times with synthetic incrementing timestamps.
- Don't trust a single immediate `getComputedStyle`/prop read after a
  simulated interaction — re-check after a short wait, or force-settle as
  above, before concluding something is broken.

## Known non-blocking issues

- `framer-export/ShusMindHeroManifesto.tsx` (self-contained Hero+
  Manifesto+Sidebar for pasting into Framer's code editor) has 4 unfixed
  `react-hooks/refs` lint errors (refs read during render for array
  initialization). `framer-export/ShusMindIndexSidebar.tsx` has one unused
  import warning. Both pass a standalone `tsc` check. Never asked to fix
  these — they're outside the live app and were flagged, not requested.
- `metabond` and `iverse` in `PROJECTS` point at `/thumbnails/metabond.png`
  and `/thumbnails/iverse.png`, which don't exist yet — Shu said he'd
  supply the real thumbnails; until then those two cards 400 in the
  browser (title/subtitle copy is already real, not placeholder).

## Verification habits for this project

After any change: `npx tsc --noEmit` and `npx eslint <changed files>` before
calling something done. For visual/behavioral changes, actually check the
browser (per the environment caveats above) rather than trusting types alone
— several real bugs in this project (missing `position: relative` under a
Next.js `fill` image, a hover panel overflowing the viewport, arc items
silently drifting from centered to top-aligned) were only caught by
measuring actual rendered geometry, not by reading the code.
