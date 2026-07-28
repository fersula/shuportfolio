"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { NODE_TYPE_META, type LabNode } from "@/lib/refraction-lab-data";
import { NodeMarker } from "./node-marker";

const SLIDE_MS = 2000;

/** Cover image, autoplaying every 2s and looping — or a quiet gradient
 *  placeholder (in the node's own accent color) when no media exists yet. */
function MediaSlideshow({ node }: { node: LabNode }) {
  const [index, setIndex] = useState(0);
  const color = NODE_TYPE_META[node.types[0]].color;

  useEffect(() => {
    if (node.media.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % node.media.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [node]);

  if (node.media.length === 0) {
    return (
      <div
        className="relative aspect-[16/10] w-full"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, color-mix(in srgb, ${color} 22%, transparent) 0%, transparent 70%), var(--color-ink-raised)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <NodeMarker type={node.types[0]} color={color} size={20} />
        </div>
      </div>
    );
  }

  const current = node.media[index];
  // next/image's optimizer strips GIF animation by re-encoding frames —
  // opt those out so installation/interaction clips actually play.
  const isGif = current.src.toLowerCase().endsWith(".gif");

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-raised">
      <AnimatePresence mode="sync">
        <motion.div
          key={current.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE.settle }}
          className="absolute inset-0"
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="35vw"
            unoptimized={isGif}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Field({ icon, title, children }: { icon: string; title: string; children: string }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-paper-dim">
        <span aria-hidden>{icon}</span>
        {title}
      </h3>
      <p className="mt-2 font-sans text-sm leading-relaxed text-paper">{children}</p>
    </div>
  );
}

export function DetailPanel({ node, onClose }: { node: LabNode | null; onClose: () => void }) {
  useEffect(() => {
    if (!node) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [node, onClose]);

  const color = node ? NODE_TYPE_META[node.types[0]].color : undefined;

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE.settle }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={node.label}
            className="fixed right-0 top-0 z-50 h-svh w-full overflow-y-auto bg-ink-soft shadow-[-24px_0_60px_rgba(0,0,0,0.5)] md:w-[35%] md:min-w-[420px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: EASE.prism }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 font-mono text-paper-dim backdrop-blur transition-colors hover:text-paper"
            >
              ×
            </button>

            <MediaSlideshow key={node.id} node={node} />

            <div className="flex flex-col gap-8 px-8 py-8">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-sans text-2xl font-bold text-paper">{node.label}</h2>
                  <span className="font-mono text-xs text-paper-dim">{node.year}</span>
                </div>

                <div className="mt-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper-faint">
                    Status
                  </span>
                  <p className="mt-1 font-sans text-sm text-paper-dim">{node.status}</p>
                </div>

                <div className="mt-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper-faint">
                    Related
                  </span>
                  <p className="mt-1 font-sans text-sm text-paper-dim">
                    {node.relatedTags.join(" · ")}
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-paper-faint/25" />

              <div className="flex flex-col gap-6">
                {node.sections.map((section) => (
                  <Field key={section.title} icon={section.icon} title={section.title}>
                    {section.body}
                  </Field>
                ))}
              </div>

              <div className="h-px w-full bg-paper-faint/25" />

              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper-faint">
                  Status
                </span>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {node.statusChecklist.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 font-sans text-sm text-paper-dim"
                    >
                      <span aria-hidden style={{ color: item.state === "done" ? "var(--color-emerald)" : color }}>
                        {item.state === "done" ? "✅" : "🔵"}
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
