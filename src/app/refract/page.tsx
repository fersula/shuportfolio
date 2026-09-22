import type { Metadata } from "next";
import { RefractStory } from "@/components/refract/refract-story";

export const metadata: Metadata = {
  title: "Refract Story — Shu Fu",
  description:
    "The story about Refract — what I learned building an AI relationship concept that turns longitudinal relationship history into relational intelligence.",
};

export default function RefractPage() {
  return <RefractStory />;
}
