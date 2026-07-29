import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk, DM_Sans, Roboto_Flex } from "next/font/google";
import { FluidGlassCursor } from "@/components/cursor/fluid-glass-cursor";
import "./globals.css";

/* Locked font system:
   JetBrains Mono — titles & labels ("SHU FU", subtitle, "I wonder why")
   Space Grotesk  — floating words
   DM Sans        — body reading text

   Roboto Flex is a deliberate, scoped exception: the Hero's "SHU F."
   TextPressure effect (src/components/hero/text-pressure.tsx) needs a
   variable font with real wght + wdth axes to drive its cursor-pressure
   animation, which none of the three above expose. Not used anywhere
   else — don't reach for it outside that component. */

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
});

export const metadata: Metadata = {
  title: "Shu Fu — Designing Technology for Human Connection",
  description:
    "More than a portfolio—an interactive journey through the ideas, experiments, and products shaping how I think about AI, humanity, and connection.",
  openGraph: {
    title: "Shu Fu — Designing Technology for Human Connection",
    description:
      "More than a portfolio—an interactive journey through the ideas, experiments, and products shaping how I think about AI, humanity, and connection.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${robotoFlex.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper font-sans">
        {children}
        <FluidGlassCursor />
      </body>
    </html>
  );
}
