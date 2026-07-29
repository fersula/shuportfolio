"use client";

import Image from "next/image";

export type ProjectItem = {
  id: string;
  src: string;
  projectName: string;
  year: string;
  title: string;
  subtitle: string;
  link: string;
};

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z" />
    </svg>
  );
}

/**
 * The large hero card for a category's Featured project. `active` mirrors
 * whether this project's category currently has scroll focus — when true
 * the info panel is forced open (bypassing the hover-only reveal) and the
 * card sits at full brightness; otherwise it's a dim/blurred preview of a
 * section not currently in focus.
 */
export function FeaturedCard({ item, active }: { item: ProjectItem; active: boolean }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex w-full items-center gap-6 transition-all duration-700 ease-out ${
        active ? "opacity-100 blur-none" : "opacity-25 blur-[3px]"
      }`}
    >
      <div className="relative w-[55%] shrink-0 overflow-hidden rounded-[32px] [aspect-ratio:4/3]">
        <Image
          src={item.src}
          alt={item.projectName}
          fill
          sizes="(min-width: 1024px) 32vw, 55vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      <div
        className={`flex flex-1 flex-col justify-center gap-2 transition-opacity duration-300 ease-out ${
          active ? "opacity-100" : "pointer-events-none opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="flex items-center gap-1.5 text-turquoise">
          <span className="font-mono text-sm">Featured Work</span>
          <SparkleIcon className="h-5 w-5" />
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-sans text-[32px] font-bold text-paper">{item.projectName}</span>
          <span className="font-mono text-xs text-paper-dim">{item.year}</span>
        </div>
        <p className="font-sans text-base font-medium leading-snug text-paper">{item.title}</p>
        {/* subtitle + divider: hidden until real hover, independent of
            `active` — the active section's panel is forced open above, but
            this pair stays hover-only even then (see reference screenshot:
            the active/open SerenChina card shows no subtitle until hovered) */}
        <div className="flex flex-col gap-2 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
          <div className="h-px w-full bg-paper-faint/40" />
          <p className="font-sans text-xs leading-snug text-paper-dim">{item.subtitle}</p>
        </div>
      </div>
    </a>
  );
}

/** Mobile Featured Works: image on top, text below — a plain always-visible
 *  block instead of the hover/active-gated flex-row panel above, since
 *  there's no hover state and every mobile section is shown expanded, not
 *  just the one with scroll focus. Kept as its own component rather than
 *  a variant prop on FeaturedCard so desktop's markup stays untouched. */
export function FeaturedCardMobile({ item }: { item: ProjectItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-4">
      <div className="relative w-full overflow-hidden rounded-[24px] [aspect-ratio:4/3]">
        <Image src={item.src} alt={item.projectName} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-turquoise">
          <span className="font-mono text-sm">Featured Work</span>
          <SparkleIcon className="h-5 w-5" />
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-sans text-2xl font-bold text-paper">{item.projectName}</span>
          <span className="font-mono text-xs text-paper-dim">{item.year}</span>
        </div>
        <p className="font-sans text-base font-medium leading-snug text-paper">{item.title}</p>
        <div className="h-px w-full bg-paper-faint/40" />
        <p className="font-sans text-xs leading-snug text-paper-dim">{item.subtitle}</p>
      </div>
    </a>
  );
}

/** Mobile Featured Works: the Related pair's image/text also stack (image
 *  on top, text below) instead of desktop's side-by-side grid — the two
 *  cards themselves stay side by side (see the grid-cols-2 wrapper in
 *  featured-works.tsx), only each card's own internal layout changes. */
export function RelatedCardMobile({ item }: { item: ProjectItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex flex-1 flex-col gap-3">
      <div className="relative w-full overflow-hidden rounded-[16px] [aspect-ratio:1/1]">
        <Image src={item.src} alt={item.projectName} fill sizes="50vw" className="object-cover" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-sans text-lg font-bold text-paper">{item.projectName}</span>
          <span className="font-mono text-xs text-paper-dim">{item.year}</span>
        </div>
        <p className="font-sans text-xs leading-snug text-paper-dim">{item.title}</p>
      </div>
    </a>
  );
}

/** Small always-visible caption card — name/year/title only, no subtitle,
 *  smaller type than the Featured card. Only ever rendered inside an
 *  active section's accordion, so it has no dim/blur state of its own.
 *  Sized via flex-1 in a `w-full` row (see featured-works.tsx) so the pair
 *  together always fills the same total width as the Featured card above. */
export function RelatedCard({ item }: { item: ProjectItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid flex-1 grid-cols-2 items-center gap-6"
    >
      <div className="relative overflow-hidden rounded-[20px] [aspect-ratio:1/1]">
        <Image
          src={item.src}
          alt={item.projectName}
          fill
          sizes="(min-width: 1024px) 14vw, 22vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1">
        {/* name + year: default-visible, swapped out for subtitle+divider
            on hover (see reference screenshot — Chimon under hover shows
            only its title/subtitle, no name/year) */}
        <div className="flex items-baseline justify-between gap-2 group-hover:hidden">
          <span className="font-sans text-2xl font-bold text-paper">{item.projectName}</span>
          <span className="font-mono text-xs text-paper-dim">{item.year}</span>
        </div>
        <p className="font-sans text-xs leading-snug text-paper group-hover:text-sm">{item.title}</p>
        <div className="hidden flex-col gap-2 group-hover:flex">
          <div className="h-px w-full bg-paper-faint/40" />
          <p className="font-sans text-xs leading-snug text-paper-dim">{item.subtitle}</p>
        </div>
      </div>
    </a>
  );
}
