"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DEPTH_LAYERS,
  LAB_NODES,
  NODE_TYPE_META,
  type LabNode,
  type NodeType,
} from "@/lib/refraction-lab-data";
import { NodeMarker } from "./node-marker";
import { DetailPanel } from "./detail-panel";
import Particles from "./particles";
import { useLocale } from "@/lib/i18n/locale-context";
import { UI_COPY } from "@/lib/i18n/ui-copy";
import { LAB_NODE_COPY } from "@/lib/i18n/refraction-lab-copy";
import "./refraction-lab.css";

const FILTER_TYPES: NodeType[] = ["question", "observation", "hypothesis", "experiment"];
/** every field node's marker sits at this size at rest — the CSS
 *  hover/active scale (see .lab-marker in refraction-lab.css) still
 *  grows it from here, this just fixes the shared baseline */
const FIELD_MARKER_SIZE = 14;

/** `.lab-node` is a flex row: marker, then label text, then (absolutely
 *  positioned, so it doesn't count) insight text. `left`/`top` position
 *  that row's origin at the node's authored X/Y, so the horizontal half
 *  of the anchor transform must offset by half the MARKER's width, not
 *  half the whole row's width (which includes the label) — otherwise a
 *  longer label pulls the marker further from X/Y than a short one,
 *  visibly decoupling the connection lines (drawn straight at X/Y) from
 *  where the marker glyph actually renders. Vertical centering doesn't
 *  have this problem since align-items: center keeps the row's cross-
 *  axis centered regardless of label width. */
const NODE_ANCHOR_X = `calc(var(--lab-size, ${FIELD_MARKER_SIZE}px) * -0.5)`;

/* mirrors the blue/lavender/emerald/mint spectrum tokens in globals.css —
   Particles needs literal hex strings (it feeds a GLSL color attribute),
   not CSS var() references, same reason motion.ts mirrors the --ease-*
   tokens as plain JS numbers */
const NEBULA_COLORS = ["#4d85d7", "#978aee", "#10b981", "#6bd7c3"];

/** true revolution — each of the 7 clickable nodes keeps its own distance
 *  from the field's center (derived from its authored position, not a
 *  fixed radius) and slowly sweeps around that center, like planets
 *  rather than each one wobbling in place. This is separate from (and
 *  doesn't touch) the WebGL nebula's own rotation — that's driven
 *  entirely inside <Particles>. Angular speed (not linear speed) is
 *  fixed per node, so a full lap always takes the same node the same
 *  time regardless of how far out it sits. Varied per index so nodes
 *  don't lap in lockstep. */
function orbitPeriodSeconds(index: number) {
  return 600 + (index % 5) * 120; // one full revolution every ~10–18 minutes
}

/** every id this node connects to, in either direction — authoring only
 *  needs to list a relation on one side (see refraction-lab-data.ts) */
function relationsFor(id: string): string[] {
  const node = LAB_NODES.find((n) => n.id === id);
  const outgoing = node?.relatedIds ?? [];
  const incoming = LAB_NODES.filter((n) => n.relatedIds?.includes(id)).map((n) => n.id);
  return Array.from(new Set([...outgoing, ...incoming]));
}

function NodeItem({
  node,
  isActive,
  isDimmed,
  isHidden,
  registerEl,
  onEnter,
  onLeave,
  onSelect,
}: {
  node: LabNode;
  isActive: boolean;
  isDimmed: boolean;
  isHidden: boolean;
  registerEl: (id: string, el: HTMLDivElement | null) => void;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const { locale } = useLocale();
  const copy = LAB_NODE_COPY[node.id][locale];
  // the first listed type drives the marker's shape/color — a node can
  // belong to more than one filter category, but only wears one look
  const color = NODE_TYPE_META[node.types[0]].color;
  const depth = DEPTH_LAYERS[node.depth];
  return (
    <div
      ref={(el) => registerEl(node.id, el)}
      className={`lab-node${isActive ? " is-active" : ""}${isDimmed ? " is-dimmed" : ""}${
        isHidden ? " is-hidden" : ""
      }`}
      style={
        {
          left: `${node.position.x}%`,
          top: `${node.position.y}%`,
          transform: `translate(${NODE_ANCHOR_X}, -50%)`,
          "--lab-size": `${FIELD_MARKER_SIZE}px`,
        } as React.CSSProperties
      }
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
    >
      <NodeMarker
        type={node.types[0]}
        color={color}
        size={FIELD_MARKER_SIZE}
        opacity={depth.opacity}
        blur={depth.blur}
      />
      <span className="lab-node__label font-grotesk text-sm">{copy.label}</span>
      <span className="lab-node__insight font-sans text-xs leading-snug">{copy.insight}</span>
    </div>
  );
}

/**
 * "Shu's Refraction Lab" — a living map of the questions, observations,
 * hypotheses and experiments behind the work above. Left column filters
 * by node type; right column is a starfield of nodes that light up,
 * connect and expand on hover/click. Deliberately not a dashboard: no
 * card stacks, no dense info — the goal is exploring a mind, not
 * scanning a list. Content lives in src/lib/refraction-lab-data.ts.
 */
export function RefractionLab() {
  const { locale } = useLocale();
  const copy = UI_COPY[locale].refractionLab;
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const nodeElRefs = useRef(new Map<string, HTMLDivElement>());
  const lineElRefs = useRef(new Map<string, SVGLineElement>());
  const gradElRefs = useRef(new Map<string, SVGLinearGradientElement>());
  // each node's current parallax+orbit offset, in the SVG's percentage
  // coordinate space — written every rAF frame, read by the same frame
  // to keep connection lines glued to the markers' actual live position
  const offsetPctRef = useRef(new Map<string, { dx: number; dy: number }>());
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const parRef = useRef({ x: 0, y: 0 });
  const hoveredIdRef = useRef<string | null>(null);

  const relatedToHovered = useMemo(
    () => (hoveredId ? new Set(relationsFor(hoveredId)) : null),
    [hoveredId]
  );

  const hoveredNode = hoveredId ? LAB_NODES.find((n) => n.id === hoveredId) ?? null : null;
  const selectedNode = selectedId ? LAB_NODES.find((n) => n.id === selectedId) ?? null : null;
  const activeTargets =
    hoveredNode && relatedToHovered ? LAB_NODES.filter((n) => relatedToHovered.has(n.id)) : [];

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  function addFilter(type: NodeType) {
    setActiveFilters((prev) => (prev.has(type) ? prev : new Set(prev).add(type)));
  }
  function removeFilter(type: NodeType) {
    setActiveFilters((prev) => {
      if (!prev.has(type)) return prev;
      const next = new Set(prev);
      next.delete(type);
      return next;
    });
  }

  // Depth parallax + slow revolution: nodes drift slightly toward/away
  // from the pointer as it moves inside the starfield, nearer (bigger)
  // nodes drifting more — the same technique (smoothed pointer offset
  // from center, per-layer coefficient) as Hero's FloatingWords, applied
  // here per DEPTH_LAYERS. On top of that, every node also slowly
  // revolves around the field's own center — like planets, each keeping
  // its own authored distance from center but sweeping around it at its
  // own angular speed (orbitPeriodSeconds) — so the constellation keeps
  // moving even with the pointer at rest. This is independent of the
  // nebula's own WebGL rotation (see <Particles disableRotation={false}
  // /> above), which is untouched by this effect.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onMove(e: PointerEvent) {
      const rect = field!.getBoundingClientRect();
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    }
    function onLeave() {
      pointerRef.current.active = false;
    }
    field.addEventListener("pointermove", onMove, { passive: true });
    field.addEventListener("pointerleave", onLeave, { passive: true });

    let raf = 0;
    function frame(now: number) {
      const rect = field!.getBoundingClientRect();
      const pointer = pointerRef.current;
      const targetX = pointer.active ? pointer.x - rect.width / 2 : 0;
      const targetY = pointer.active ? pointer.y - rect.height / 2 : 0;
      parRef.current.x += (targetX - parRef.current.x) * 0.08;
      parRef.current.y += (targetY - parRef.current.y) * 0.08;

      const t = now * 0.001;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      LAB_NODES.forEach((node, i) => {
        const el = nodeElRefs.current.get(node.id);
        if (!el) return;
        // freeze the currently-hovered node in place — otherwise its own
        // orbit drift eventually carries it out from under a pointer that
        // hasn't moved at all, and the browser fires a real mouseleave
        // (hit-testing for hover does get re-evaluated as a transformed
        // element moves under a stationary cursor), silently dropping the
        // hover a user never asked to end. Its connection lines still
        // track live via offsetPctRef — just held at this frozen value —
        // so links to *other*, still-moving nodes keep working.
        if (node.id === hoveredIdRef.current) return;
        const coef = DEPTH_LAYERS[node.depth].parallax;
        const dxP = parRef.current.x * coef;
        const dyP = parRef.current.y * coef;

        // revolve around the field's center at this node's own authored
        // radius — computed in px (not raw %) so the path is a true
        // circle regardless of the field's aspect ratio
        const baseX = (node.position.x / 100) * rect.width;
        const baseY = (node.position.y / 100) * rect.height;
        const ox = baseX - cx;
        const oy = baseY - cy;
        const radius = Math.hypot(ox, oy);
        const baseAngle = Math.atan2(oy, ox);
        const angularSpeed = (2 * Math.PI) / orbitPeriodSeconds(i);
        const angle = baseAngle + t * angularSpeed;
        const dxOrbit = cx + radius * Math.cos(angle) - baseX;
        const dyOrbit = cy + radius * Math.sin(angle) - baseY;

        const dx = dxP + dxOrbit;
        const dy = dyP + dyOrbit;
        el.style.transform = `translate(calc(${NODE_ANCHOR_X} + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;

        // same offset, converted from px into the connections SVG's 0–100
        // viewBox space, so lines can track the marker's live position
        offsetPctRef.current.set(node.id, {
          dx: (dx / rect.width) * 100,
          dy: (dy / rect.height) * 100,
        });
      });

      // re-anchor any currently-hovered connection lines (+ their
      // gradients) to the markers' live positions — straight center-to-
      // center; each node's own opaque marker (painted on top, since the
      // <svg> sits before the node map in the DOM) naturally occludes the
      // segment of line that falls inside its shape, so the line still
      // reads as emerging from the marker without any manual px inset.
      // Walking only *this* hover's own relation ids (not just whatever
      // happens to still be sitting in lineElRefs) matters because
      // AnimatePresence keeps the previous hover's exiting <line>s
      // mounted for their whole 0.35s fade-out — during that overlap,
      // blindly repositioning every ref in the map would drag an old
      // target's still-fading line over to originate from the *new*
      // hovered node instead.
      const hovered = hoveredIdRef.current;
      const hoveredNode2 = hovered ? LAB_NODES.find((n) => n.id === hovered) : null;
      if (hoveredNode2) {
        const ho = offsetPctRef.current.get(hoveredNode2.id) ?? { dx: 0, dy: 0 };
        const x1Pct = hoveredNode2.position.x + ho.dx;
        const y1Pct = hoveredNode2.position.y + ho.dy;

        relationsFor(hovered!).forEach((targetId) => {
          const lineEl = lineElRefs.current.get(targetId);
          if (!lineEl) return;
          const targetNode = LAB_NODES.find((n) => n.id === targetId);
          if (!targetNode) return;
          const to = offsetPctRef.current.get(targetId) ?? { dx: 0, dy: 0 };
          const x2Pct = targetNode.position.x + to.dx;
          const y2Pct = targetNode.position.y + to.dy;

          const X1 = x1Pct.toFixed(2);
          const Y1 = y1Pct.toFixed(2);
          const X2 = x2Pct.toFixed(2);
          const Y2 = y2Pct.toFixed(2);

          lineEl.setAttribute("x1", X1);
          lineEl.setAttribute("y1", Y1);
          lineEl.setAttribute("x2", X2);
          lineEl.setAttribute("y2", Y2);
          const grad = gradElRefs.current.get(targetId);
          if (grad) {
            grad.setAttribute("x1", X1);
            grad.setAttribute("y1", Y1);
            grad.setAttribute("x2", X2);
            grad.setAttribute("y2", Y2);
          }
        });
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="refraction-lab" className="relative bg-ink px-gutter">
      <div className="flex min-h-svh flex-col gap-12 lg:flex-row lg:items-stretch">
        {/* left: the type filter, vertically centered in the section */}
        <div className="flex w-full shrink-0 flex-col justify-center lg:w-72 lg:pr-10">
          <div>
            <span className="font-mono text-base text-paper md:text-2xl">{copy.showMePrefix}</span>
            <div className="mt-6 flex flex-col gap-5">
              {FILTER_TYPES.map((type) => {
                const meta = NODE_TYPE_META[type];
                const metaCopy = copy.nodeTypeMeta[type];
                const active = activeFilters.has(type);
                return (
                  <div key={type} className="flex items-center gap-3">
                    <button
                      type="button"
                      title={metaCopy.description}
                      aria-pressed={active}
                      onClick={() => addFilter(type)}
                      className={`flex flex-1 items-center gap-3 text-left font-mono text-sm transition-colors duration-300 ${
                        active ? "text-paper" : "text-paper-dim hover:text-paper-dim/80"
                      }`}
                    >
                      <NodeMarker type={type} color={meta.color} size={12} />
                      {metaCopy.label}
                    </button>
                    {active && (
                      <button
                        type="button"
                        aria-label={copy.removeFilterAriaLabel(metaCopy.label)}
                        onClick={() => removeFilter(type)}
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-paper-dim/50 font-mono text-[10px] leading-none text-paper-dim transition-colors duration-300 hover:border-paper hover:text-paper"
                      >
                        −
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* right: the starfield — grows to fill whatever the filter column leaves behind */}
        <div className="relative flex w-full flex-1 items-center">
          <div
            ref={fieldRef}
            className="lab-field relative h-[calc(100svh-80px)] w-full lg:min-h-[600px]"
          >
            <div className="lab-field__nebula">
              <Particles
                particleColors={NEBULA_COLORS}
                particleCount={180}
                particleSpread={8}
                speed={0.06}
                particleBaseSize={70}
                cameraDistance={30}
                sizeRandomness={1}
                alphaParticles
                moveParticlesOnHover={false}
                disableRotation={false}
              />
            </div>
            <div className="lab-field__stars" />

            <svg className="lab-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
              {hoveredNode && (
                <>
                  <defs>
                    {activeTargets.map((target) => (
                      <linearGradient
                        key={`grad-${target.id}`}
                        ref={(el) => {
                          if (el) gradElRefs.current.set(target.id, el);
                          else gradElRefs.current.delete(target.id);
                        }}
                        id={`lab-grad-${hoveredNode.id}-${target.id}`}
                        gradientUnits="userSpaceOnUse"
                        x1={hoveredNode.position.x}
                        y1={hoveredNode.position.y}
                        x2={target.position.x}
                        y2={target.position.y}
                      >
                        {/* fades toward the connected end instead of stopping
                            abruptly, so the line reads as emanating from the
                            hovered node and dissolving rather than piercing
                            straight into the target's marker */}
                        <stop
                          offset="0%"
                          stopColor={NODE_TYPE_META[hoveredNode.types[0]].color}
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="70%"
                          stopColor={NODE_TYPE_META[target.types[0]].color}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor={NODE_TYPE_META[target.types[0]].color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <AnimatePresence>
                    {activeTargets.map((target) => (
                      <motion.line
                        key={`line-${target.id}`}
                        ref={(el) => {
                          if (el) lineElRefs.current.set(target.id, el);
                          else lineElRefs.current.delete(target.id);
                        }}
                        className="lab-connection is-active"
                        x1={hoveredNode.position.x}
                        y1={hoveredNode.position.y}
                        x2={target.position.x}
                        y2={target.position.y}
                        strokeWidth={0.09}
                        stroke={`url(#lab-grad-${hoveredNode.id}-${target.id})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                      />
                    ))}
                  </AnimatePresence>
                </>
              )}
            </svg>

            {LAB_NODES.map((node) => (
              <NodeItem
                key={node.id}
                node={node}
                isActive={hoveredId === node.id}
                isDimmed={hoveredId != null && hoveredId !== node.id && !relatedToHovered?.has(node.id)}
                isHidden={activeFilters.size > 0 && !node.types.some((t) => activeFilters.has(t))}
                registerEl={(id, el) => {
                  if (el) nodeElRefs.current.set(id, el);
                  else nodeElRefs.current.delete(id);
                }}
                onEnter={() => setHoveredId(node.id)}
                onLeave={() => setHoveredId((cur) => (cur === node.id ? null : cur))}
                onSelect={() => setSelectedId(node.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grain-overlay" />

      <DetailPanel node={selectedNode} onClose={() => setSelectedId(null)} />
    </section>
  );
}
