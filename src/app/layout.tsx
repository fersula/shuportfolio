import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk, DM_Sans, Roboto_Flex, Noto_Sans_SC } from "next/font/google";
import { FluidGlassCursor } from "@/components/cursor/fluid-glass-cursor";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import "./globals.css";

/* Locked font system:
   JetBrains Mono — titles & labels ("SHU FU", subtitle, "I wonder why")
   Space Grotesk  — floating words
   DM Sans        — body reading text

   Roboto Flex is a deliberate, scoped exception: the Hero's "SHU F."
   TextPressure effect (src/components/hero/text-pressure.tsx) needs a
   variable font with real wght + wdth axes to drive its cursor-pressure
   animation, which none of the three above expose. Not used anywhere
   else — don't reach for it outside that component.

   Noto Sans SC is the single Chinese typeface, standing in for all
   three of the above (mono/grotesk/sans) for CJK glyphs specifically —
   it's appended as a fallback inside each --font-* stack in globals.css
   (not a locale-gated swap of the whole stack), so the browser's own
   per-character font fallback reaches it only for characters DM Sans/
   Space Grotesk/JetBrains Mono don't cover. Latin text keeps rendering
   in the original locked typeface even while the zh locale is active —
   e.g. an English project name like "COMAI" sitting inside otherwise-
   Chinese copy stays in DM Sans rather than being pulled into Noto Sans
   SC's own (also-present) Latin glyphs. */

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

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shufu.work"),
  title: "Shu Fu — Designing Technology for Human Connection",
  description:
    "More than a portfolio—an interactive journey through the ideas, experiments, and products shaping how I think about AI, humanity, and connection.",
  openGraph: {
    title: "Shu Fu — Designing Technology for Human Connection",
    description:
      "More than a portfolio—an interactive journey through the ideas, experiments, and products shaping how I think about AI, humanity, and connection.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
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
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${robotoFlex.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper font-sans">
        <LocaleProvider>
          {children}
          <FluidGlassCursor />
        </LocaleProvider>
      </body>
    </html>
  );
}
