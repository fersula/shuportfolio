/**
 * JS-side mirrors of the `--ease-*` tokens in globals.css.
 * Keep these two definitions in sync — Tailwind/CSS reads the custom
 * properties, Framer Motion / GSAP need plain cubic-bezier arrays.
 */
export const EASE = {
  prism: [0.16, 1, 0.3, 1] as const,
  refract: [0.22, 1, 0.36, 1] as const,
  drift: [0.65, 0, 0.35, 1] as const,
  settle: [0.33, 1, 0.68, 1] as const,
};
