/**
 * Content for the "Shu's Refraction Lab" section
 * (src/components/sections/refraction-lab/refraction-lab.tsx).
 *
 * This file is the single place to edit copy, images and layout for each
 * node — the component just renders whatever is here. To add a new node:
 *   1. add an entry to LAB_NODES below (position is a 0–100 percentage of
 *      the starfield area, so it's independent of screen size)
 *   2. drop its slideshow images into public/dots-media/<id>/ and list
 *      them in `media`, in the order they should play (Title/1/2/3… —
 *      any filenames are fine, this array is the order of truth)
 *   3. if it should draw a connection line to another node on hover, add
 *      that node's id to `relatedIds` (and, for a two-way link, add this
 *      node's id to the other one's `relatedIds` too)
 *
 * `types` is an array, not a single value — a node can belong to more
 * than one filter category at once (e.g. both "question" and
 * "observation"), and shows up whenever ANY of its types is active in
 * the "Show me..." filter. The first entry in `types` is the one that
 * decides the node's marker shape/color and its detail-panel accent —
 * order it deliberately, don't just list types alphabetically.
 *
 * `sections` is a free-form ordered list of {icon, title, body} blocks
 * for the detail panel — not a fixed Origin/Observation/Hypothesis/…
 * shape. Different nodes genuinely have different-shaped stories (a
 * resolved question needs fewer beats than a shipped experiment), so
 * the schema doesn't force one template on all of them. Keep each body
 * to a few sentences; this is a reflective narrative, not a case study.
 */

export type NodeType = "question" | "observation" | "hypothesis" | "experiment";

/** how far into the starfield a node sits — near nodes render sharper
 *  and drift more with the pointer; far nodes sit softer and barely
 *  move, the same depth-of-field trick Hero's FloatingWords uses. All
 *  markers share one fixed size (see FIELD_MARKER_SIZE) — depth no
 *  longer scales it, only blur/opacity/parallax. */
export type Depth = "near" | "mid" | "far";

export const DEPTH_LAYERS: Record<
  Depth,
  { blur: number; opacity: number; parallax: number }
> = {
  near: { blur: 0, opacity: 1, parallax: 0.05 },
  mid: { blur: 0.3, opacity: 0.92, parallax: 0.035 },
  far: { blur: 0.6, opacity: 0.8, parallax: 0.02 },
};

export type LabStatusItem = {
  label: string;
  /** "done" renders a check, "active" renders the in-progress dot */
  state: "done" | "active";
};

export type LabSection = {
  icon: string;
  title: string;
  body: string;
};

export type LabNode = {
  id: string;
  label: string;
  /** every type this node belongs to — see the file-level comment above */
  types: NodeType[];
  /** one line shown under the label on hover, before the panel is opened */
  insight: string;
  /** position within the starfield, 0–100 (%) on each axis */
  position: { x: number; y: number };
  /** front-back placement — see DEPTH_LAYERS */
  depth: Depth;
  /** other node ids this one draws a glowing connection line to on hover */
  relatedIds?: string[];

  year: string;
  status: string;
  relatedTags: string[];
  media: { src: string; alt: string }[];

  sections: LabSection[];
  statusChecklist: LabStatusItem[];
};

export const LAB_NODES: LabNode[] = [
  {
    id: "dating-ai",
    label: "Dating AI",
    types: ["hypothesis"],
    insight:
      "Every conversation with AI leaves an emotional footprint. What if those footprints could lead you home?",
    position: { x: 78, y: 22 },
    depth: "near",
    relatedIds: ["emotion-ai-future"],

    year: "2026",
    status: "Paused after early market validation",
    relatedTags: ["Emotion AI", "SEMO", "Psychology"],
    media: [
      { src: "/dots-media/Dating_AI/Title.png", alt: "Dating AI — cover" },
      { src: "/dots-media/Dating_AI/2.png", alt: "Dating AI — the crisis of connection" },
      { src: "/dots-media/Dating_AI/3.png", alt: "Dating AI — the mission" },
      { src: "/dots-media/Dating_AI/4.png", alt: "Dating AI — the insight" },
    ],

    sections: [
      {
        icon: "✨",
        title: "Origin",
        body: "I wondered why Taylor Swift could transform heartbreak into creative assets while most people simply carried emotional scars. That question made me think: could AI help ordinary people do the same?",
      },
      {
        icon: "❝",
        title: "Observation",
        body: "After my breakup, I realized I wasn't only talking to friends. I was talking to AI. The more I reflected through those conversations, the more obvious my emotional patterns became. Unlike people, AI never gets tired of listening.",
      },
      {
        icon: "💡",
        title: "Hypothesis",
        body: "What if every conversation with AI became part of an emotional footprint today, to help you build healthier relationships tomorrow? Instead of matching people through self-written profiles, what if AIs that truly understand your emotional patterns could find compatibility beyond the masks.",
      },
      {
        icon: "◆",
        title: "Value",
        body: "Today's dating apps mostly optimize for attraction. But attraction isn't always what leads to long-term happiness. An AI that understands your emotional patterns could recommend someone you genuinely need — not simply someone you're immediately drawn to.",
      },
      {
        icon: "⚠",
        title: "Why It Might Fail",
        body: "After discussing the concept with a VC friend, I realized the biggest challenge wasn't the technology. It was the market. The people most willing to trust AI with their emotional history are also among the most selective partners. Without enough users, the matching network becomes extremely difficult to bootstrap.",
      },
      {
        icon: "🌱",
        title: "What I Learned",
        body: "The bottleneck wasn't AI. It was market segmentation, network effects, and expectation management. Sometimes the hardest part of building isn't solving the problem — it's finding enough people who share it.",
      },
    ],
    statusChecklist: [
      { label: "Pitch deck completed", state: "done" },
      { label: "Discussed with investors", state: "done" },
      { label: "Currently paused", state: "active" },
    ],
  },
  {
    id: "bmi-paradox",
    label: "BMI Paradox",
    types: ["observation"],
    insight:
      "When a simpler technology can solve the same problem, do we really need the more advanced one?",
    position: { x: 47, y: 76 },
    depth: "near",
    relatedIds: ["emotion-ai-future"],

    year: "2024",
    status: "Resolved as a personal lens — not pursued as a product",
    relatedTags: ["COMAI", "Emotion AI"],
    media: [
      { src: "/dots-media/BMI/1.jpg", alt: "BMI Paradox — EEG headset reference" },
      { src: "/dots-media/BMI/2.png", alt: "BMI Paradox — research notes" },
      { src: "/dots-media/BMI/3.png", alt: "BMI Paradox — comparison sketch" },
    ],

    sections: [
      {
        icon: "👀",
        title: "Trigger",
        body: "On Honda's project, I kept circling back to one question: if all we want is to read someone's mood, why brainwaves? EEG means a bulky, uncomfortable headset, and it's solving something a camera and a microphone already handle quietly, with far less friction. I figured our client just wanted a flashier technology to point to — though I wasn't totally sure of myself either. Maybe I was the one missing the bigger picture.",
      },
      {
        icon: "💭",
        title: "Reflection",
        body: "Months later I brought it up with Kai, a brain scientist, and he'd landed on the same question completely on his own. His reasoning: if someone can speak and move, we already have enough signal — brainwaves only really earn their place for people who can't do either, and even then, the accurate way to capture them is invasive while the comfortable way isn't accurate. Brainwave data doesn't generalize the way voice or movement does; it's only really legible against your own personal baseline. The most meaningful BMI product Kai had come across wasn't flashy at all — just a headband that helps you fall asleep. Everything past that seems to be meditation apps and brain-controlled games. Fun, not necessary.",
      },
      {
        icon: "✨",
        title: "What Changed Me",
        body: "That conversation gave me confidence in something I hadn't fully trusted before: I can question emerging technologies from first principles, even outside my own discipline. Sometimes the most valuable question isn't \"How can we use this technology?\" It's \"Do we actually need it?\"",
      },
    ],
    statusChecklist: [
      { label: "Resolved through conversation with a brain scientist", state: "done" },
    ],
  },
  {
    id: "traditional-x-ai",
    label: "Traditional × AI",
    types: ["experiment"],
    insight: "Tradition survives not by being preserved, but by being reimagined.",
    position: { x: 20, y: 40 },
    depth: "near",
    relatedIds: ["london-monster"],

    year: "2025",
    status: "Website & branding built — paused by founder",
    relatedTags: ["London Monster", "SerenChina"],
    media: [
      { src: "/dots-media/chimon/1.png", alt: "Traditional × AI — Chimon cover" },
      { src: "/dots-media/chimon/2.png", alt: "Traditional × AI — brand identity" },
      { src: "/dots-media/chimon/3.png", alt: "Traditional × AI — AI-generated motifs" },
      { src: "/dots-media/chimon/4.png", alt: "Traditional × AI — product application" },
      { src: "/dots-media/chimon/5.png", alt: "Traditional × AI — website design" },
    ],

    sections: [
      {
        icon: "👀",
        title: "Trigger",
        body: "A friend approached me with an idea: could we help Chinese traditional craftsmanship reach an international audience?",
      },
      {
        icon: "💭",
        title: "Observation",
        body: "Around the same time, I kept seeing collaborations between Chinese artisans and luxury brands. It proved these crafts still held tremendous cultural value. But I wondered: why should traditional craftsmanship exist only as luxury collectibles?",
      },
      {
        icon: "💡",
        title: "Hypothesis",
        body: "What if AI could generate contemporary aesthetics inspired by traditional motifs — letting centuries-old techniques become part of everyday interiors, products and architecture again? Instead of preserving tradition, we could let it evolve.",
      },
      {
        icon: "🧪",
        title: "Experiment",
        body: "This became CHIMON — combining business strategy, branding and web design while exploring how AI-generated visual languages could inspire new possibilities for traditional crafts.",
      },
      {
        icon: "🚀",
        title: "Status",
        body: "Website and branding built — currently paused by the founder.",
      },
    ],
    statusChecklist: [
      { label: "Website & branding built", state: "done" },
      { label: "Paused by founder", state: "active" },
    ],
  },
  {
    id: "presence-in-pandemic",
    label: "Presence in Pandemic",
    types: ["experiment"],
    insight: "We're constantly connected, yet we still feel so far apart.",
    position: { x: 62, y: 58 },
    depth: "near",
    relatedIds: ["london-monster"],

    year: "2021",
    status: "Carried forward into Metabond, my master's thesis",
    relatedTags: ["London Monster", "SEMO"],
    media: [
      { src: "/dots-media/metabond/1.png", alt: "Metabond — wearable device" },
      { src: "/dots-media/metabond/2.png", alt: "Metabond — spatial audio concept" },
      { src: "/dots-media/metabond/3.png", alt: "Metabond — system diagram" },
    ],

    sections: [
      {
        icon: "👀",
        title: "Trigger",
        body: "By 2020 I'd gone from constantly moving between the UK, the US and a blur of other countries, to being locked alone in a 30 square meter apartment in Japan, unable to fly home. Just me, a thesis, and grocery runs.",
      },
      {
        icon: "❓",
        title: "Question",
        body: "We could still video call our families, binge every show that existed, even work out at home. So why did it still feel like something was missing? What is it that physical presence gives us that technology still cannot?",
      },
      {
        icon: "💡",
        title: "Observation",
        body: "What I actually missed was strangely specific: studying next to people in a library, not even talking to them. Turns out there's a term for that — social facilitation. Around the same time, Google's Starline project made me realize something: presence isn't created by video alone. It comes from countless subtle sensory cues that today's digital communication simply doesn't reproduce.",
      },
      {
        icon: "🧪",
        title: "Experiment",
        body: "This became MetaBond. I designed a wearable system that captures subtle body movements and transforms them into spatial sound, so people in different places can hear each other grow closer or farther — almost like sensing someone shift in a chair near you. Less a video call, more a shared room made of sound.",
      },
      {
        icon: "🌱",
        title: "What Changed Me",
        body: "Technology has made communication effortless. But recreating human presence is still one of its greatest unsolved challenges.",
      },
    ],
    statusChecklist: [
      { label: "Wearable prototype built", state: "done" },
      { label: "Completed as master's thesis", state: "done" },
    ],
  },
  {
    id: "emotion-ai-future",
    label: "Emotion AI Future",
    types: ["question", "observation"],
    insight: "The more emotionally capable AI becomes, the less emotionally capable humans might become.",
    position: { x: 85, y: 68 },
    depth: "near",

    year: "2025",
    status: "Ongoing open question — no fixed answer yet",
    relatedTags: ["SEMO", "COMAI"],
    media: [
      { src: "/dots-media/emotionAI/1.png", alt: "Emotion AI Future — SEMO app" },
      { src: "/dots-media/emotionAI/2.png", alt: "Emotion AI Future — SEMO platform" },
      { src: "/dots-media/emotionAI/3.jpg", alt: "Emotion AI Future — research reference" },
    ],

    sections: [
      {
        icon: "👀",
        title: "Observation",
        body: "Working across Honda and SEMO pulled me deep into emotion AI, and honestly, most of what I saw felt like it was treating loneliness the way a painkiller treats an infection: emotional analysis, emotional support, companion robots that make someone feel less alone right now while quietly making them lonelier over time.",
      },
      {
        icon: "🌱",
        title: "What I Believe",
        body: "AI should lower the friction in how people reach each other, not stand in for the people themselves.",
      },
      {
        icon: "❓",
        title: "Questions I'm Still Living With",
        body: "If the goal is helping you understand and empathize with the humans already in your life, when does that AI actually step in? When does it speak up? When does it stay quiet? How much of your day should it really be watching? I honestly don't have a clean answer yet — still an open question for me.",
      },
    ],
    statusChecklist: [{ label: "Still living with the question", state: "active" }],
  },
  {
    id: "cultural-stereotypes",
    label: "Cultural Stereotypes",
    types: ["experiment"],
    insight: "People rarely reject a culture — they reject the version they've been shown.",
    position: { x: 52, y: 32 },
    depth: "near",
    relatedIds: ["traditional-x-ai"],

    year: "2026",
    status: "Built & launched SerenChina 1.0 — pursuing funding next",
    relatedTags: ["SerenChina", "Chimon"],
    media: [
      { src: "/dots-media/serenchina/1.png", alt: "Cultural Stereotypes — SerenChina cover" },
      { src: "/dots-media/serenchina/2.png", alt: "Cultural Stereotypes — discovery flow" },
      { src: "/dots-media/serenchina/3.png", alt: "Cultural Stereotypes — emotional matching" },
      { src: "/dots-media/serenchina/4.png", alt: "Cultural Stereotypes — destination detail" },
      { src: "/dots-media/serenchina/5.png", alt: "Cultural Stereotypes — app interface" },
      { src: "/dots-media/serenchina/6.png", alt: "Cultural Stereotypes — brand system" },
    ],

    sections: [
      {
        icon: "👀",
        title: "Observation",
        body: "Watching China travel content take off on TikTok, I kept comparing it to how effortlessly Japan sells its own image abroad, and realized how much of what people \"know\" about a place is just whatever filter happened to get there first. China is one of the most varied countries on earth, and almost none of that reaches someone who's only mildly curious.",
      },
      {
        icon: "💡",
        title: "Hypothesis",
        body: "I think travel decisions are emotional before they're logistical. An itinerary could start there too — not with budget and number of days, but with whatever actually resonates with a person, letting that lead them into a culture they didn't even know they'd love.",
      },
      {
        icon: "🧪",
        title: "Experiment",
        body: "This idea became SerenChina — an AI-powered travel discovery experience that helps people discover places based on emotional attraction rather than geographical planning.",
      },
      {
        icon: "🚀",
        title: "Status",
        body: "Built & launched SerenChina 1.0. Next: user interviews → commercialization → funding.",
      },
    ],
    statusChecklist: [
      { label: "Built & launched SerenChina 1.0", state: "done" },
      { label: "User interviews", state: "active" },
      { label: "Commercialization & funding", state: "active" },
    ],
  },
  {
    id: "london-monster",
    label: "London Monster",
    types: ["experiment"],
    insight: "Every tiny action leaves invisible ripples across the city we live in.",
    position: { x: 32, y: 15 },
    depth: "near",

    year: "2022",
    status: "Completed — top marks, dean's standout pick of the cohort",
    // "London Monster" in the source brief listed itself as a related item —
    // read as a copy/paste slip for "Presence in Pandemic", the node that
    // explicitly names London Monster back as one of its own relations.
    relatedTags: ["SerenChina", "Presence in Pandemic"],
    media: [
      { src: "/dots-media/london_monster/1.jpeg", alt: "London Monster — installation shadow play" },
      { src: "/dots-media/london_monster/2.jpg", alt: "London Monster — installation detail" },
      { src: "/dots-media/london_monster/3.gif", alt: "London Monster — robotic creature in motion" },
      { src: "/dots-media/london_monster/4.png", alt: "London Monster — projection mapping" },
      { src: "/dots-media/london_monster/5.png", alt: "London Monster — exhibition view" },
      { src: "/dots-media/london_monster/6.gif", alt: "London Monster — visitor interaction" },
      { src: "/dots-media/london_monster/7.gif", alt: "London Monster — soundscape response" },
      { src: "/dots-media/london_monster/8.gif", alt: "London Monster — lighting response" },
    ],

    sections: [
      {
        icon: "👀",
        title: "Trigger",
        body: "Between Australia, Tokyo, London and New York, I was moving faster than I could ever feel settled anywhere, and it got me asking what \"belonging\" even means when you're never in one place long enough to earn it.",
      },
      {
        icon: "💡",
        title: "Reflection",
        body: "I began to see cities less as physical spaces, and more as living organisms. Every decision we make — where we walk, who we meet, how we interact — creates tiny ripples that continuously reshape the whole.",
      },
      {
        icon: "🧪",
        title: "Experiment",
        body: "Together with my RCA teammates, we created London Monster, an interactive installation. Visitors interacted with two robotic creatures, and every movement transformed the surrounding projection, lighting and soundscape — making each person's presence visible across the entire space.",
      },
      {
        icon: "🏆",
        title: "Status",
        body: "It ended up winning top marks that year, and our dean even posted it as the standout project of the cohort.",
      },
      {
        icon: "🌱",
        title: "What Changed Me",
        body: "This was the first time I consciously explored a question that still shapes my work today: how do people create meaningful connections with places?",
      },
    ],
    statusChecklist: [
      { label: "Installation built & exhibited (RCA)", state: "done" },
      { label: "Top marks — cohort standout", state: "done" },
    ],
  },
];

export const NODE_TYPE_META: Record<
  NodeType,
  { label: string; description: string; color: string }
> = {
  question: {
    label: "Questions",
    description: "Unknown — a spark that hasn't resolved into anything yet.",
    color: "var(--color-blue)",
  },
  observation: {
    label: "Observations",
    description: "Something noticed, steady enough to hold onto.",
    color: "var(--color-mint)",
  },
  hypothesis: {
    label: "Hypotheses",
    description: "A claim waiting to be tested.",
    color: "var(--color-emerald)",
  },
  experiment: {
    label: "Experiments",
    description: "Built, tested, and lived with for a while.",
    color: "var(--color-lavender)",
  },
};
