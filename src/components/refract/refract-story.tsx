"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./refract.css";

type Chapter = {
  num: string;
  id: string;
  label: string;
};

const CHAPTERS: Chapter[] = [
  { num: "00", id: "prologue", label: "Why I started" },
  { num: "01", id: "self-knowledge", label: "The real problem" },
  { num: "02", id: "state-aware", label: "A state-aware model" },
  { num: "03", id: "relational-intelligence", label: "How Refract works" },
  { num: "04", id: "matching", label: "What makes a match" },
  { num: "05", id: "overtone", label: "Overtone × Refract" },
  { num: "06", id: "principles", label: "Product principles" },
  { num: "07", id: "why-share", label: "Why I’m sharing this" },
  { num: "08", id: "appendix", label: "Appendix" },
];

/* pointer-proximity falloff + smoothing constants, identical to the home
   page's IndexSidebar so both navs feel like the same component. */
const smoothFalloff = (p: number) => p * p * (3 - 2 * p);
const PROXIMITY_RADIUS = 48; // px — reach of the hover effect around a row's center
const SMOOTHING_MS = 120; // exponential-smoothing time constant for --effect


/** ch.02's three moments — one person, three relational states. */
const MOMENTS: { when: string; emoji: string; said: string }[] = [
  { when: "Right after a breakup", emoji: "\u{1F62D}", said: "I always give too much." },
  {
    when: "Months later, reflecting",
    emoji: "\u{1F914}",
    said: "I tend to over-function when I feel someone pulling away.",
  },
  {
    when: "After a first date",
    emoji: "\u{1F928}",
    said: "He replied slowly, so I immediately started trying harder.",
  },
];

/** ch.02's state table — what each relational state shows, and how it lies. */
const STATES: { state: string; reveals: string; distorts: string }[] = [
  {
    state: "Breakup / conflict",
    reveals: "Triggers, defenses",
    distorts: "Blame, emotional amplification",
  },
  {
    state: "Healing",
    reveals: "Reflection, accountability",
    distorts: "Retrospective rationalisation",
  },
  { state: "Dating", reveals: "Values, aspirations", distorts: "Self-presentation" },
  {
    state: "Relationship",
    reveals: "Repeated behavior, outcomes",
    distorts: "Habituation, context",
  },
];


/* both live in public/ with spaces in their names, so the URLs are encoded */
const DECK_URL = "/Refract%20Deck%20April%202026.pdf";
const TIMELINE_URL = "/refract%20deck%20figma%20timline.png";
const ARCHITECTURE_URL = "/refract%20architecture.png";

const scrollToChapter = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function Eyebrow({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div className="rf-eyebrow">
      <span>{num}</span>
      <i aria-hidden />
      <span>{children}</span>
    </div>
  );
}

/** The page's one recurring "big moment": a short spectrum rule and the
 *  chapter's closing conviction. Replaces the old bordered pull-quote. */
function Conviction({ children }: { children: React.ReactNode }) {
  return <p className="rf-conviction">{children}</p>;
}

/** The repeating structural unit: mono label in the left rail, content in
 *  the right column, hairline above. Every section is built from these. */
function Row({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rf-row">
      <div className="rf-row__label">
        {label}
        {sub ? <b>{sub}</b> : null}
      </div>
      <div className="rf-row__body">{children}</div>
    </div>
  );
}

/**
 * Chapter index for this page. Deliberately the *same* nav as the home
 * page's `IndexSidebar` — same `.sidebar-row/.sidebar-marker/
 * .sidebar-index/.sidebar-label` classes out of globals.css, same
 * `left-16` gutter, same gap, and the same rAF loop easing each row's
 * `--effect` (0–1) toward whichever is higher: pointer proximity or the
 * scroll-driven active row. Only the source of "active" differs (chapter
 * scrollspy here, not the home page's four-phase show/hide sequence).
 */
function RefractIndex({ activeId }: { activeId: string }) {
  const rowsRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetsRef = useRef<number[]>(CHAPTERS.map(() => 0));
  const currentRef = useRef<number[]>(CHAPTERS.map(() => 0));
  const activeIdRef = useRef<string>(activeId);
  const rafRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    function frame(now: number) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const k = 1 - Math.exp(-dt / (SMOOTHING_MS / 1000));

      let moving = false;
      CHAPTERS.forEach((chapter, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const target = Math.max(
          targetsRef.current[i] ?? 0,
          chapter.id === activeIdRef.current ? 1 : 0
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
      CHAPTERS.forEach((_, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const distance = Math.abs(e.clientY - (rect.top + rect.height / 2));
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

  return (
    <div className="fixed left-16 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
      <div
        style={{
          filter:
            "drop-shadow(0 1px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 18px rgba(0,0,0,0.6))",
        }}
      >
        <nav ref={rowsRef} className="flex flex-col gap-8" aria-label="Chapter index">
          {CHAPTERS.map((chapter, i) => (
            <div
              key={chapter.num}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="sidebar-row cursor-pointer"
              aria-current={activeId === chapter.id ? "true" : undefined}
              onClick={() => scrollToChapter(chapter.id)}
            >
              <span className="sidebar-content flex items-center gap-3">
                <span className="sidebar-marker h-px shrink-0" />
                <span className="sidebar-index font-mono text-xs">{chapter.num}</span>
                <span className="sidebar-label font-mono text-sm whitespace-nowrap">
                  {chapter.label}
                </span>
              </span>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

function MobileIndex({ activeId }: { activeId: string }) {
  return (
    <nav className="refract-mobile-index" aria-label="Chapter index">
      {CHAPTERS.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          aria-label={`Go to chapter ${chapter.num}: ${chapter.label}`}
          aria-current={activeId === chapter.id ? "true" : undefined}
          onClick={() => scrollToChapter(chapter.id)}
        >
          {chapter.num}
        </button>
      ))}
    </nav>
  );
}

/**
 * The prism figure: `public/prism.png` (a real beam-through-glass render)
 * with the "ONE PERSON" label set in HTML to its left, on the beam's axis,
 * and the three kinds of evidence listed against the fan it throws.
 *
 * Replaces an earlier hand-drawn SVG version. Because the figure is wider
 * than the 640px prose measure it breaks out of the column at lg — see
 * `.rf-prism` in refract.css.
 */
function PrismDiagram() {
  return (
    <figure className="rf-prism">
      <div className="rf-prism__figure">
        <span className="rf-prism__source">One person</span>
        <Image
          className="rf-prism__img"
          src="/prism.png"
          alt="A single white beam entering a prism and separating into three coloured bands"
          width={360}
          height={256}
          priority={false}
        />
      </div>

      <div className="rf-prism__labels">
        <div className="rf-prism__label is-conscious">
          <span>Conscious Self</span>
          <small>What I say and believe I want — my values, and the needs I can name.</small>
        </div>
        <div className="rf-prism__label is-revealed">
          <span>Revealed Pattern</span>
          <small>
            What I repeatedly choose and do when it is actually happening — knowing a value isn’t
            the same as embodying it.
          </small>
        </div>
        <div className="rf-prism__label is-latent">
          <span>Latent Fit</span>
          <small>
            What may actually work for me, but I haven’t yet learned to recognise or ask for.
          </small>
        </div>
      </div>
    </figure>
  );
}

export function RefractStory() {
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = CHAPTERS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => Boolean(section)
    );
    let raf = 0;

    // Active chapter = the *last* one whose top has crossed the anchor line,
    // not the one whose top is nearest it. Nearest-top flips to the next
    // chapter halfway through a long one (05 Overtone is ~2 viewports tall,
    // so its top drifts further from the anchor than 06's does long before
    // 06 is on screen); "last one crossed" can only advance when the next
    // chapter actually arrives.
    const update = () => {
      raf = 0;
      const anchor = window.innerHeight * 0.35;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= anchor) current = section;
      });
      if (current) setActiveId(current.id);

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      progressRef.current?.style.setProperty("--rf-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-refract-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="refract-page">
      <div className="refract-wash" aria-hidden />
      <div className="grain-overlay fixed inset-0 z-20" aria-hidden />
      <div className="refract-progress" ref={progressRef} aria-hidden>
        <div className="refract-progress__fill" />
      </div>

      <Link className="refract-home-link" href="/">
        {/* a drawn back icon rather than an "←" glyph, so its weight matches
            the page's hairlines instead of the mono font's arrow */}
        <svg
          className="refract-home-link__icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M13 8H3M3 8l4.5-4.5M3 8l4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Shu’s Portfolio
      </Link>

      <RefractIndex activeId={activeId} />
      <MobileIndex activeId={activeId} />

      <header className="refract-hero">
        <div data-refract-reveal>
          <p className="refract-hero__kicker">AI ✕ Relational Intelligence・8 min read</p>
          <h1>Refract</h1>
          <div className="refract-hero__rule" aria-hidden />
          <p className="refract-hero__subtitle">
            How a breakup made me rethink how AI could help us understand ourselves, grow, and find
            more compatible partners.
          </p>
          <p className="refract-hero__byline">
            By Shu Fu (Suu) · Product Designer &amp; AI Builder · Tokyo · Original product thesis
            developed April 2026
          </p>
        </div>
      </header>

      <article>
        {/* ---------------- 00 ---------------- */}
        <section id="prologue" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="00">Why I started thinking about this</Eyebrow>
            <h2 className="rf-statement">From self-description to relational intelligence.</h2>
            <p className="rf-lede">
              What I learned building Refract — and why Overtone made me reopen the thesis.
            </p>
          </div>

          <div data-refract-reveal>
            <p className="rf-body">
              In April 2026, during a painful breakup, I realised that the place with the most
              context about my relationships wasn’t a dating app or a questionnaire. It was AI.
            </p>
            <p className="rf-body">
              I had used it to replay conflicts, process emotions, question my own role, and make
              sense of what had happened. That led to a simple question:{" "}
              <strong>
                why does all of that context disappear the moment I start dating again?
              </strong>
            </p>
            <p className="rf-body">
              Could the relationship data we generate while healing help us make better relationship 
              decisions next time? That question became Refract — an AI relationship concept built 
              around turning past relationship experience into something useful for what comes next.

            </p>
          </div>

          <div data-refract-reveal>
            <Conviction>
              <span className="rf-conviction__mark" aria-hidden>
                🤔
              </span>{" "}
             Taylor Swift can turn heartbreak into songs. 
             What if the rest of us could turn ours into something useful too?
            </Conviction>
          </div>

         

          <p className="rf-note" data-refract-reveal>
            The original April deck and Figma version history are included in the appendix.
          </p>
        </section>
        

        {/* ---------------- 01 ---------------- */}
        <section id="self-knowledge" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="01">The real problem</Eyebrow>
            <h2 className="rf-statement">Self-description is not self-knowledge.</h2>
            <p className="rf-lede">Dating profiles have two data problems.</p>
          </div>

          <div className="rf-rows" data-refract-reveal>
            <Row label="Gap 01">
              <h3>The presentation gap</h3>
              <p className="rf-body">
                We don’t describe ourselves; we present ourselves. Everyone knows “communication matters” is the right answer. Saying it tells you nothing about what someone does when communication gets uncomfortable.
              </p>
            </Row>
            <Row label="Gap 02">
              <h3>The self-knowledge gap</h3>
              <p className="rf-body">
                Even perfect honesty is limited by what we know about ourselves. People can sincerely want one kind of partner and keep responding to a very different one. We often know who we want to want — not what actually makes us feel safe, anxious, respected, or trapped.
              </p>
            </Row>
          </div>

          <div data-refract-reveal>
            <p className="rf-lede rf-lede--standalone">
              So there are three layers of a person a matching system could learn from:
            </p>
            <PrismDiagram />
            <p className="rf-lede rf-lede--afterfigure">
              These three can overlap. They often don’t. The gaps between them are where matching becomes interesting.
            </p>
          </div>

          <div data-refract-reveal>
             <Conviction>
              <span className="rf-conviction__mark" aria-hidden>
                🤔
              </span>{" "}
              The problem isn’t that profiles are shallow. It’s that matchmaking depends too
              heavily on conscious self-description — profiles are optimised for legibility, not
              compatibility.
            </Conviction>
          </div>
        </section>

        {/* ---------------- 02 ---------------- */}
        <section id="state-aware" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="02">A state-aware model</Eyebrow>
            <h2 className="rf-statement">The same person, at three different moments</h2>
          </div>
          <div data-refract-reveal>
            <p className="rf-body">Imagine the same person speaking at three points in time:</p>
          </div>

          <div className="rf-dialogue" data-refract-reveal>
            {MOMENTS.map(({ when, emoji, said }) => (
              <div key={when}>
                <p className="rf-dialogue__when">{when}</p>
                <div className="rf-dialogue__row">
                  <span className="rf-dialogue__avatar" aria-hidden>
                    {emoji}
                  </span>
                  <p className="rf-dialogue__bubble">“{said}”</p>
                </div>
              </div>
            ))}
          </div>

          <div data-refract-reveal>
            <p className="rf-body">
              <strong>None of these statements alone is enough.</strong> 
            </p>
          </div>
           <div data-refract-reveal>
            <p className="rf-body">
             The first is emotionally charged. The second is more reflective, but still retrospective. The third captures a real behavior — but only once.
             Together, they begin to reveal something none of them says directly:
            </p>
          </div>
                     <div data-refract-reveal>
            <p className="rf-body">
            <strong>Under relational uncertainty, this person tends to increase pursuit and self-sacrifice..</strong> 
            </p>
          </div>


        <div data-refract-reveal>
             <Conviction>
              <span className="rf-conviction__mark" aria-hidden>
                🤔
              </span>{" "}
             No single version of us is the ground truth.
            </Conviction>
          </div>

          <div data-refract-reveal>
            <p className="rf-body">
              A breakup reveals things a dating interview never will. But it is not inherently more
              truthful. Every relational state exposes something different — and introduces its own
              distortion.
            </p>
          </div>

          <div data-refract-reveal>
            <table className="rf-table">
              <thead>
                <tr>
                  <th scope="col">State</th>
                  <th scope="col">What it reveals</th>
                  <th scope="col">What can distort it</th>
                </tr>
              </thead>
              <tbody>
                {STATES.map(({ state, reveals, distorts }) => (
                  <tr key={state}>
                    <th scope="row">{state}</th>
                    <td data-label="Reveals">{reveals}</td>
                    <td data-label="Can distort">{distorts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div data-refract-reveal>
            <p className="rf-lede rf-lede--afterfigure">
              Every state contains signal. Every state contains bias. The value is in comparing
              them.
            </p>
          </div>


        </section>

        {/* ---------------- 03 ---------------- */}
        <section id="relational-intelligence" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="03">How Refract works</Eyebrow>
            <h2 className="rf-statement">A relationship lifecycle, not a signup flow.</h2>
            <p className="rf-lede">
              The Cycle: Breakup / Conflict → Healing → Reflection → Readiness → Dating → Relationship → Conflict / Growth
            </p>
          </div>

          <div data-refract-reveal>
            <p className="rf-body">
              Instead of asking people to construct a new dating identity from scratch, Refract
              gradually builds a relational model from what they already reveal over time — through
              past AI conversations, voice reflections, guided interviews, post-date check-ins, and
              relationship outcomes.
            </p>
          </div>

          <div className="rf-rows rf-rows--steps" data-refract-reveal>
            <Row label="Ingest">
              <h3>Bring in relationship history</h3>
              <p className="rf-body">
                Collect relational evidence across different moments and emotional states.
              </p>
              <p className="rf-inline-list">
                <span>AI conversations</span>
                <span>Voice reflections</span>
                <span>Guided interviews</span>
                <span>Post-date check-ins</span>
              </p>
            </Row>
            <Row label="Distill">
              <h3>Turn stories into relational patterns</h3>
              <p className="rf-body">
                Look beyond what someone says about themselves to identify recurring patterns in how
                they interpret, respond, connect, withdraw, repair, and set boundaries.
              </p>
            </Row>
            <Row label="Evolve">
              <h3>Build relational readiness</h3>
              <p className="rf-body">
                Before matching, help users surface blind spots, unresolved carryover, needs, and
                boundaries.
              </p>
              <p className="rf-body rf-body--point">
                Wanting to date is not always the same as being ready to build a relationship.
              </p>
            </Row>
            <Row label="Align">
              <h3>Make better introductions</h3>
              <p className="rf-body">
                Use deeper relational patterns — alongside values, life direction, and readiness — to
                make more informed introductions without pretending to predict chemistry.
              </p>
            </Row>
          </div>

          

          <div data-refract-reveal>
            <p className="rf-lede rf-lede--afterfigure">
              AI narrows avoidable incompatibility. Real life decides the spark.
            </p>
          </div>

          <div data-refract-reveal>
            <h3 className="rf-statement rf-statement--sub">
              Inside DISTILL: how stories become a relational model
            </h3>
          </div>

          <div data-refract-reveal>
            <p className="rf-body">
              The hardest part is not collecting emotional data. It is turning subjective stories
              into useful signals without mistaking narrative for truth.
            </p>
          </div>


          <div data-refract-reveal>
            <p className="rf-label rf-label--standalone">
              Algorithm logic — how narratives become relational patterns
            </p>
          </div>

          <div className="rf-rows rf-rows--tight rf-rows--steps" data-refract-reveal>
            <Row label="01" sub="Capture">
              <h3>State-tagged narratives</h3>
              <p className="rf-body">
                Every narrative keeps its relational state and timing. A breakup reflection and a post-date reflection are useful for different reasons.
              </p>
            </Row>
            <Row label="02" sub="Decompose">
              <h3>Extract behavior, not labels</h3>
              <p className="rf-body">
                Instead of jumping to labels like “anxiously attached”, Refract breaks a narrative
                into observable relational signals.
              </p>
              <p className="rf-formula">
                <span>trigger</span>
                <i>→</i>
                <span>interpretation</span>
                <i>→</i>
                <span>response</span>
                <i>→</i>
                <span>need</span>
                <i>→</i>
                <span>boundary</span>
                <i>→</i>
                <span>repair</span>
              </p>
            </Row>
            <Row label="03" sub="Triangulate">
              <h3>Look across time</h3>
              <p className="rf-body">The model looks for repetition, contradiction, and change across different states. One emotional statement is not enough to become a pattern.</p>
              <div className="rf-quotes">
                <p>
                  <span>Breakup</span>“I always give too much.”
                </p>
                <p>
                  <span>Months later</span>“I tend to over-function when I feel someone pulling
                  away.”
                </p>
                <p>
                  <span>Post-date</span>“He replied slowly, so I immediately started trying harder.”
                </p>
              </div>
              <p className="rf-quotes__out">
                Across states, a more credible pattern begins to emerge: this person may increase pursuit and self-sacrifice under relational
                uncertainty.
              </p>
            </Row>
            <Row label="04" sub="Infer&Update">
              <h3>Hold hypotheses, not verdicts</h3>
              <p className="rf-body">
                Patterns are stored as evidence-backed hypotheses with different levels of confidence. New dates and relationships can strengthen, weaken, or overturn them.
              </p>
              <dl className="rf-spec">
                <div>
                  <dt>Hypothesis</dt>
                  <dd>Pursuit behaviour increases under relational uncertainty.</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>
                    Medium <em>→</em> High
                  </dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>Repeated across multiple relational states.</dd>
                </div>
              </dl>
            </Row>
          </div>

          <div data-refract-reveal>
            <Conviction>
              The goal was never an AI that knows your personality. It was a model that gradually learns how you relate.
            </Conviction>
          </div>
        </section>


        {/* ---------------- 04 ---------------- */}
        <section id="matching" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="04">What makes a match</Eyebrow>
            <h2 className="rf-statement">A good match is not one score. It has layers.</h2>
          </div>

          <div className="rf-rows rf-rows--steps" data-refract-reveal>
            <Row label="Foundation">
              <h3>Are we building toward compatible lives?</h3>
              <p className="rf-inline-list">
                <span>Values</span>
                <span>Relationship intent</span>
                <span>Life direction</span>
                <span>Ambition and lifestyle</span>
                <span>Family expectations</span>
              </p>
            </Row>
            <Row label="Dynamics">
              <h3>What happens when the relationship becomes real?</h3>
              <p className="rf-inline-list">
                <span>Conflict and repair</span>
                <span>Closeness vs. space</span>
                <span>Emotional expression</span>
                <span>Boundaries</span>
                <span>Communication under stress</span>
                <span>Reassurance vs. autonomy</span>
              </p>
            </Row>
            <Row label="Readiness">
              <h3>Are they ready to build something new?</h3>
              <p className="rf-inline-list">
                <span>Emotional availability</span>
                <span>Unresolved attachment</span>
                <span>Dating motivation</span>
                <span>Capacity for commitment</span>
                <span>Space for a new relationship</span>
              </p>
              <p className="rf-note">
                A highly compatible person at the wrong relational moment can still become the wrong
                outcome.
              </p>
            </Row>
            <Row label="Chemistry">
              <h3>Not computed. Given room.</h3>
              <p className="rf-body">
                We don’t try to compute love. We reduce avoidable incompatibility and create a
                better chance for chemistry to happen in real life.
              </p>
            </Row>
          </div>

          <div data-refract-reveal>
           
            <p className="rf-lede rf-lede--afterfigure">
              AI narrows avoidable incompatibility. Real life decides the spark.
            </p>
          

            
            <div className="rf-strategy">
              <div className="is-mirror">
                <Image
                  className="rf-strategy__art"
                  src="/illustmirror.png"
                  alt="Two overlapping circles of the same size, mirrored around a shared axis"
                  width={698}
                  height={584}
                />
                <span className="rf-strategy__n">01</span>
                <h4>
                  The Mirror
                  <em>Resonance</em>
                </h4>
                <p>
                  Someone with similar relational rhythms — ways of approaching
                  closeness, conflict, emotional needs, or the world.
                </p>
              </div>
              <div className="is-complement">
                <Image
                  className="rf-strategy__art"
                  src="/illustcomple.png"
                  alt="Two different forms meeting and balancing each other"
                  width={698}
                  height={584}
                />
                <span className="rf-strategy__n">02</span>
                <h4>
                  The Complement
                  <em>Counterbalance</em>
                </h4>
                <p>Someone whose differences may create balance rather than friction.</p>
              </div>
              <div className="is-prism">
                <Image
                  className="rf-strategy__art"
                  src="/illustprism.png"
                  alt="A beam entering a prism and fanning out into several unpredicted directions"
                  width={698}
                  height={584}
                />
                <span className="rf-strategy__n">03</span>
                <h4>
                  The Prism
                  <em>Wildcard</em>
                </h4>
                <p>
                  Someone outside the model’s strongest assumptions — preserving room for attraction
                  the system could not have predicted.
                </p>
              </div>
            </div>
          </div>

          <div data-refract-reveal>
            <Conviction>
              Precision for the foundation. Exploration for the spark. We don’t compute chemistry —
              we preserve the conditions in which it can surprise us.
            </Conviction>
          </div>
        </section>

        {/* ---------------- 05 ---------------- */}
        <section id="overtone" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="05">Overtone × Refract</Eyebrow>
            <h2 className="rf-statement">Same direction, different centre of gravity.</h2>
            <p className="rf-body">
              Discovering Overtone felt surprisingly familiar. Both products move beyond profiles,
              use conversation to understand people more deeply, curate rather than maximise
              matches, and leave chemistry to real life.
            </p>
          </div>

          <div data-refract-reveal>
            <p className="rf-lede rf-label--standalone">Where the thinking overlaps</p>
            <div className="rf-overlap">
              <div>
                <strong>Conversation over profiles</strong>
                <span>Guided conversation instead of static bios and stated preferences.</span>
              </div>
              <div>
                <strong>Inference over tags</strong>
                <span>Deriving how someone thinks and relates, not what they ticked.</span>
              </div>
              <div>
                <strong>Curation over abundance</strong>
                <span>Neither thesis depends on infinite browsing or match volume.</span>
              </div>
              <div>
                <strong>Chemistry stays human</strong>
                <span>AI improves the conditions for an introduction. It can’t guarantee one.</span>
              </div>
            </div>
          </div>

          <div data-refract-reveal>
            <p className="rf-lede rf-label--standalone">Where Refract puts more weight</p>
          </div>

          <div className="rf-rows rf-rows--tight rf-rows--steps rf-rows--rail-auto" data-refract-reveal>
            <Row label="01" sub="Evidence horizon">
              <h3>Longitudinal + state-aware</h3>
              <p className="rf-body">
                Overtone starts learning when someone enters the matchmaking experience. Refract
                starts earlier and observes longer — across breakup, healing, crushes, dating,
                post-date reflection, and eventually relationships.
              </p>
              <p className="rf-body">
                Both use conversation. The difference is that Refract treats <em>when</em> a
                conversation happens as part of what that conversation means.
              </p>
            </Row>
            <Row label="02" sub="Intelligence target">
              <h3>Recurring relational patterns</h3>
              <p className="rf-body">
                Refract puts more weight on patterns that repeat across time, rather than treating
                any single interview or self-description as the model of the person.
              </p>
              <p className="rf-body">
                These can include how someone responds to uncertainty, conflict, distance,
                closeness, boundaries, reassurance, or repair.
              </p>
              <p className="rf-body">
                The goal is not only to understand who someone is, but to identify what repeatedly
                happens in the way they relate.
              </p>
              <p className="rf-body">
                Those patterns serve two purposes: helping the user see themselves more clearly, and
                helping the system make better introductions.
              </p>
            </Row>
            <Row label="03" sub="Dual purpose">
              <h3>Reflect inward, connect outward</h3>
              <p className="rf-body">
                Refract was never designed only to find someone a better match.
              </p>
              <p className="rf-body">
                The same relational model first acts as a mirror — surfacing recurring patterns,
                blind spots, unresolved carryover, and helping someone become more ready for what
                comes next.
              </p>
              <p className="rf-body">
                Then it acts as a matching layer — using that deeper understanding to identify
                people who may fit not only what the user says they want, but how they actually
                relate.
              </p>
              <p className="rf-body rf-body--point">
                Understand the pattern. Grow from it. Then use it to connect differently.
              </p>
            </Row>
          </div>

          <figure className="rf-architecture" data-refract-reveal>
            <Image
              src={ARCHITECTURE_URL}
              alt="Refract architecture: relational history feeds a pattern model, which branches into reflecting inward and connecting outward"
              width={1672}
              height={941}
            />
          </figure>

          <div data-refract-reveal>
            <Conviction>That is also where the name Refract came from: the same light can reveal something about itself, and also be redirected to connect somewhere new.</Conviction>
          </div>
        </section>

        {/* ---------------- 06 ---------------- */}
        <section id="principles" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="06">Product principles</Eyebrow>
            <h2 className="rf-statement">What I would keep pushing.</h2>
          </div>

          <div className="rf-rows" data-refract-reveal>
            <Row label="01">
              <h3>Self-report is evidence, not ground truth.</h3>
              <p className="rf-body">
                What people say matters. What they repeatedly do matters too. A relational model
                should be able to hold both.
              </p>
            </Row>
            <Row label="02">
              <h3>Model people across states, not as snapshots.</h3>
              <p className="rf-body">
                Breakup, healing, dating and stable relationships reveal different parts of the same
                person and introduce different biases. Reliable patterns emerge through comparison
                over time.
              </p>
            </Row>
            <Row label="03">
              <h3>Separate user belief from model hypothesis.</h3>
              <p className="rf-body">
                A user should be able to disagree with the model without forcing either side to
                become “the truth”.
              </p>
            </Row>
            <Row label="04">
              <h3>Readiness is independent from compatibility.</h3>
              <p className="rf-body">
                Wanting a relationship does not necessarily mean being ready to sustain one. A
                serious matchmaking product should know when to introduce and when to slow down.
              </p>
            </Row>
            <Row label="05">
              <h3>Never optimise romance like content recommendation.</h3>
              <p className="rf-body">
                If someone repeatedly chooses the same unhealthy dynamic, “more of what you clicked before” may be exactly
                the wrong objective.
              </p>
            </Row>
            <Row label="06">
              <h3>Preserve uncertainty.</h3>
              <p className="rf-body">
                A good model knows what it knows, and deliberately explores what it doesn’t.
              </p>
            </Row>
          </div>

          <div data-refract-reveal>
            <Conviction>
              AI should narrow avoidable incompatibility without narrowing human possibility.
            </Conviction>
          </div>
        </section>

        {/* ---------------- 07 ---------------- */}
        <section id="why-share" className="refract-section refract-closing">
          <div data-refract-reveal>
            <Eyebrow num="07">Why I’m sharing this</Eyebrow>
            <h2 className="rf-statement">The questions felt worth taking seriously.</h2>
            <p className="rf-body">
              Seeing Overtone was honestly very encouraging😆. I had paused Refract partly because
              building a dating network alone felt unrealistic. Then I saw a team with deep
              experience in this space building from many of the same beliefs and already turning
              them into something real. It made me feel that the questions I had been thinking about
              were worth taking seriously.
            </p>
            <p className="rf-body">
              That is also why I wanted to share this. If any part of my thinking is useful, I would
              rather put it in the room than leave it sitting in an old deck.
            </p>
            <p className="rf-body">
              A lot of my work keeps coming back to similar themes:{" "}
              <strong>
                human connection, identity, emotion, and how technology can understand people
                without flattening them.
              </strong>{" "}
              Projects like Honda Future AI, SerenChina, Kado and Refract all touch different parts
              of that. I’m a product designer and AI builder, so I also like turning these ideas
              into things people can actually experience and test.
            </p>
            <p className="rf-final">
              {/* the same looping avatar the home page's Intro card uses, standing in
                  for an emoji ahead of the closing line */}
              <video
                className="rf-final__avatar"
                src="/emo.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden
              />{" "}
              If there is ever a way I can contribute to Overtone — through product thinking,
              prototyping, research, or simply sharing what I’ve learned — I’d be very happy to.
            </p>
          </div>
        </section>

        {/* ---------------- 08 ---------------- */}
        <section id="appendix" className="refract-section">
          <div data-refract-reveal>
            <Eyebrow num="08">Appendix</Eyebrow>
            <h2 className="rf-statement">The original material.</h2>
          </div>

          <div className="rf-appendix" data-refract-reveal>
            <figure className="rf-appendix__item">
              <div className="rf-appendix__file">
                <svg className="rf-appendix__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M14 2.5H6.5A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20V7.5L14 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2.5V7.5H19" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="rf-appendix__name">Refract Deck — April 2026</p>
                  <p className="rf-appendix__meta">PDF · 21 pages · 7.4 MB</p>
                </div>
              </div>

              <div className="rf-appendix__actions">
                <a href={DECK_URL} target="_blank" rel="noreferrer">
                  Open preview
                </a>
                <a href={DECK_URL} download="Refract Deck April 2026.pdf">
                  Download
                </a>
              </div>

              {/* lazy: the deck is 7.4 MB and this sits at the foot of the page,
                  so it only fetches if someone actually scrolls here. Mobile
                  browsers refuse to render PDFs inline, hence the actions above. */}
              <iframe
                className="rf-appendix__preview"
                src={`${DECK_URL}#toolbar=0&navpanes=0&view=FitH`}
                title="Refract Deck, April 2026"
                loading="lazy"
              />
            </figure>

            <figure className="rf-appendix__item">
              <a className="rf-appendix__shot" href={TIMELINE_URL} target="_blank" rel="noreferrer">
                <Image
                  src={TIMELINE_URL}
                  alt="Figma version history for the Refract deck, showing edits through April"
                  width={2816}
                  height={1528}
                />
              </a>
              <figcaption className="rf-appendix__caption">
                Refract Product Services was built in April 2026.
              </figcaption>
            </figure>
          </div>
        </section>
      </article>
    </main>
  );
}
