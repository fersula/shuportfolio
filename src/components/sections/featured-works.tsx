"use client";

import { useEffect, useRef, useState } from "react";
import { OptionWheel } from "./option-wheel";
import { FeaturedCard, RelatedCard, type ProjectItem } from "./project-card";
import { gsap } from "@/lib/gsap";

// Single source of truth for project content. `worktype` documents each
// project's canonical role, but doesn't drive rendering directly — the same
// project can appear as a big Featured card under its own category and as a
// small Related card under a different one (e.g. COMAI is Featured under
// Technology, Related under Self), so which category shows which card is
// controlled separately below by SECTIONS.
type WorkType = "Featured" | "Related";

const PROJECTS: Record<string, ProjectItem & { worktype: WorkType }> = {
  auto: {
    id: "auto",
    src: "/thumbnails/auto.png",
    projectName: "COMAI",
    year: "2023-2025",
    title: "How can AI feel thoughtful—not merely capable?",
    subtitle: "Future automotive AI experience · Strategy, embodied AI and two-stage PoC",
    link: "https://fushu.framer.website/auto",
    worktype: "Featured",
  },
  sere: {
    id: "sere",
    src: "/thumbnails/sere.png",
    projectName: "SerenChina",
    year: "2026",
    title: "Can AI help us discover unfamiliar cultures through emotional resonance?",
    subtitle: "AI-powered travel discovery product · Designed and built independently",
    link: "https://fushu.framer.website/sere",
    worktype: "Featured",
  },
  semo: {
    id: "semo",
    src: "/thumbnails/semo.png",
    projectName: "SEMO",
    year: "2025",
    title: "Can AI hear what words leave unsaid?",
    subtitle:
      "Emotion AI venture · SER-powered companion prototype, user testing and venture strategy",
    link: "https://fushu.framer.website/semo",
    worktype: "Featured",
  },
  elgana: {
    id: "elgana",
    src: "/thumbnails/elgana.png",
    projectName: "Elgana",
    year: "2023",
    title: "How can a workplace tool become a digital hub for community and collaboration?",
    subtitle: "Product repositioning and renewal · Research, strategy, UX/UI and brand experience",
    link: "https://fushu.framer.website/elgana",
    worktype: "Featured",
  },
  chimon: {
    id: "chimon",
    src: "/thumbnails/chimon.png",
    projectName: "Chimon",
    year: "2025",
    title: "How can traditional Chinese craftsmanship find new relevance in a global market?",
    subtitle: "Venture brand and live website · Service concept, identity and Framer buildn",
    link: "https://chimonart.framer.website/",
    worktype: "Related",
  },
  metamatsu: {
    id: "metamatsu",
    src: "/thumbnails/metamatsu.png",
    projectName: "Matsudo MetaCity",
    year: "2025",
    title:
      "How can a city turn disaster preparedness and cultural heritage into an explorable virtual world?",
    subtitle: "Public-sector metaverse · Spatial UX, Unreal Engine and geospatial mapping",
    link: "https://chimonart.framer.website/",
    worktype: "Related",
  },
  metabond: {
    // src points at the intended final path — PNG not in public/thumbnails/
    // yet, will 404 until Shu drops the real thumbnail in
    id: "metabond",
    src: "/thumbnails/metabond.png",
    projectName: "Metabond",
    year: "2021-2022",
    title: "Can the subtle presence of others help us focus without demanding attention?",
    subtitle: "Master's thesis · Wearable sensing, spatial audio and app prototype",
    link: "https://fushu.framer.website/metabond",
    worktype: "Related",
  },
  iverse: {
    // src points at the intended final path — PNG not in public/thumbnails/
    // yet, will 404 until Shu drops the real thumbnail in
    id: "iverse",
    src: "/thumbnails/iverse.png",
    projectName: "IVERSE",
    year: "2022-2023",
    title: "Can generative AI help people explore identity and connect beyond social labels?",
    subtitle: "0→1 AI social platform · Product concept, UX/UI, motion and brand",
    link: "https://fushu.framer.website/iverse",
    worktype: "Related",
  },
};

// Stacked vertically in this order — each section is one category's
// Featured card + its two Related cards. A project's Related pairing isn't
// derivable from a single field (e.g. Matsudo MetaCity is Related under
// both Technology and Culture&Places, and COMAI/SEMO double as a Related
// card under a category other than their own Featured one), so it's an
// explicit table.
const SECTIONS: { category: string; featured: string; related: [string, string] }[] = [
  { category: "Technology", featured: "auto", related: ["semo", "metamatsu"] },
  { category: "Culture&Places", featured: "sere", related: ["chimon", "metamatsu"] },
  { category: "Self", featured: "semo", related: ["auto", "metabond"] },
  { category: "Others", featured: "elgana", related: ["iverse", "metabond"] },
];

const CATEGORIES = SECTIONS.map((section) => section.category);

export function FeaturedWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const teaserRef = useRef<HTMLDivElement>(null);

  // same fade-up-on-scroll house style as the Intro/Manifesto/Featured Works
  // teasers — this one previews "Shu's Refraction Lab", the section after
  // this one, exactly the way Intro's own teaser previews Featured Works.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = teaserRef.current;
    if (!el) return;

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          end: "top 55%",
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  // scrollspy: whichever section's box currently crosses the viewport's
  // vertical center is "active" — real page scroll drives this, the
  // OptionWheel is just a passive readout of it (see wheelInput={false})
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx !== -1) setActiveIndex(idx);
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="featured-works" className="relative bg-ink">
      <div className="flex flex-col px-gutter lg:flex-row">
        <div
          id="featured-works-wheel"
          className="flex h-[45svh] w-full shrink-0 items-center gap-4 lg:sticky lg:top-0 lg:h-svh lg:w-[42%]"
        >
          <span className="shrink-0 whitespace-nowrap font-mono text-base text-paper md:text-2xl">
            Connection with
          </span>
          <div className="relative h-[70svh] flex-1">
            <OptionWheel
              items={CATEGORIES}
              defaultSelected={0}
              selectedIndex={activeIndex}
              wheelInput={false}
              draggable={false}
              side="left"
              inset={32}
              fontSize={2}
              onChange={(index) => scrollToSection(index)}
            />
          </div>
        </div>

        <div className="flex w-full flex-col lg:w-[58%]">
          {SECTIONS.map((section, i) => {
            const active = activeIndex === i;
            const featured = PROJECTS[section.featured];
            const related = section.related.map((id) => PROJECTS[id]);
            return (
              <div
                key={section.category}
                ref={(el) => {
                  sectionRefs.current[i] = el;
                }}
                className="flex flex-col py-10"
              >
                <FeaturedCard item={featured} active={active} />
                <div className={`related-accordion mt-12 ${active ? "is-open" : ""}`}>
                  <div className="flex w-full gap-8">
                    {related.map((item) => (
                      <RelatedCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-svh flex-col justify-center px-gutter py-section lg:pl-[380px] lg:pr-gutter">
        <div id="refraction-lab-teaser" ref={teaserRef} className="max-w-2xl">
          <h2 className="font-mono text-base tracking-[0.04em] text-turquoise md:text-lg">
            Shu&apos;s Refraction Lab
          </h2>
          <p className="mt-5 font-sans text-[24px] leading-relaxed text-paper">
            A living archive of the questions, observations, and experiments shaping how I
            think.
          </p>
        </div>
      </div>
    </section>
  );
}
