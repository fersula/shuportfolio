"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useLocale } from "@/lib/i18n/locale-context";
import { UI_COPY } from "@/lib/i18n/ui-copy";

const EMAIL = "fersulafu@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/shu-fu-suu/";
const INSTAGRAM_URL = "https://www.instagram.com/suu_fushu/";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/**
 * Final section: mirrors the Manifesto/Intro fade-up house style. The
 * profile clip is the same /emo.mp4 loop used in Intro's tab card, reused
 * here as the "signing off" beat of the page.
 */
export function Contact() {
  const { locale } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const el = contentRef.current;
      if (!el) return;
      gsap.fromTo(
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="relative min-h-svh bg-ink">
      <div className="flex min-h-svh flex-col justify-center px-gutter py-section lg:pl-[380px] lg:pr-gutter">
        <div ref={contentRef} className="max-w-xl">
          <video
            src="/emo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="mb-6 h-[100px] w-[100px] rounded-full object-cover"
          />
          <p className="font-sans text-[24px] leading-relaxed text-paper">
            {UI_COPY[locale].contact.body}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="rounded-lg border border-paper-dim/40 px-6 py-4 font-sans text-base text-paper transition-colors duration-300 hover:border-paper hover:bg-paper/5"
            >
              {EMAIL}
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-paper-dim/40 text-paper transition-colors duration-300 hover:border-paper hover:bg-paper/5"
            >
              <LinkedInIcon />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-paper-dim/40 text-paper transition-colors duration-300 hover:border-paper hover:bg-paper/5"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="grain-overlay" />
    </section>
  );
}
