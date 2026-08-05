import type { Locale } from "./locale-context";

/** All flat, one-off UI copy that isn't keyed by a data-model id (that
 *  lives in projects-copy.ts and refraction-lab-copy.ts instead). Every
 *  key here must exist for both locales — TypeScript enforces the shape
 *  match via `satisfies Record<Locale, ...>` below. */
const en = {
  hero: {
    scroll: "Scroll",
  },
  nav: {
    hero: "Shu's Mindspace",
    manifesto: "Manifesto",
    intro: "Intro",
    featuredWorks: "Featured Works",
    refractionLab: "Refraction Lab",
    contact: "Contact Me",
  },
  manifesto: {
    wonderHeading: "I wonder why",
    wonderBody:
      "The more advanced our technology becomes, the more I wonder why people still feel disconnected.",
    callingHeading: "My sincere calling",
    callingBody:
      "I use emerging technology to help people feel more understood, and more connected to themselves, others, and the world.",
  },
  intro: {
    tabs: [
      {
        key: "anyone",
        label: "For anyone",
        text: "I design and build AI-powered experiences that turn emerging technologies into something people can actually feel, use, and understand.",
      },
      {
        key: "founders",
        label: "founders",
        text: "I help turn ambiguous ideas into sharp product hypotheses, then make them tangible through fast, testable prototypes.",
      },
      {
        key: "recruiters",
        label: "recruiters",
        text: "5+ years across AI, UX, prototyping and emerging technology projects. Strong in product thinking, interaction design, and AI-assisted building.",
      },
      {
        key: "designers",
        label: "designers",
        text: "I care deeply about the human side of technology — and about translating abstract ideas into clear product behavior and interactions.",
      },
      {
        key: "product-managers",
        label: "product managers",
        text: "My strength is identifying the real problem behind the brief, framing solution hypotheses, and shaping product behavior from insight to prototype.",
      },
      {
        key: "engineers",
        label: "engineers",
        text: "I work at the boundary of product, design, and implementation — defining system logic, interaction flows, and using AI-assisted tools to quickly build and test ideas.",
      },
    ],
    featuredTeaserHeading: "Featured Works",
    featuredTeaserBody:
      "My projects may span automotive, emotion AI, culture and travel. But they all explore different forms of human connection.",
  },
  featuredWorks: {
    categories: {
      Technology: "Technology",
      "Culture&Places": "Culture&Places",
      Self: "Self",
      Others: "Others",
    } as Record<string, string>,
    connectionWithPrefix: "Connection with",
    /** wraps the category name for the mobile heading, which concatenates
     *  prefix + category into one flowing phrase (desktop keeps them as
     *  two separate elements — prefix label beside a rotating word wheel
     *  — so it doesn't need this) */
    connectionCategoryWrap: ["", ""] as [string, string],
    featuredWorkBadge: "Featured Work",
    refractionTeaserHeading: "Shu's Refraction Lab",
    refractionTeaserBody:
      "A living archive of the questions, observations, and experiments shaping how I think, and they are still expanding...",
  },
  contact: {
    body: "If any of this resonates, I’d love to hear from you — reach out to talk design, ideas, or connection.",
  },
  refractionLab: {
    showMePrefix: "Show me...",
    removeFilterAriaLabel: (label: string) => `Remove ${label} filter`,
    nodeTypeMeta: {
      question: {
        label: "Questions",
        description: "Unknown — a spark that hasn't resolved into anything yet.",
      },
      observation: {
        label: "Observations",
        description: "Something noticed, steady enough to hold onto.",
      },
      hypothesis: {
        label: "Hypotheses",
        description: "A claim waiting to be tested.",
      },
      experiment: {
        label: "Experiments",
        description: "Built, tested, and lived with for a while.",
      },
    },
    detailPanel: {
      status: "Status",
      related: "Related",
      close: "Close",
    },
  },
  heroWords: {
    ai: "AI",
    culture: "Culture",
    human: "Human",
    intelligence: "Intelligence",
    history: "History",
    emotion: "Emotion",
    places: "Places",
    memory: "Memory",
    connection: "Connection",
    meaning: "Meaning",
    care: "Care",
    signals: "Signals",
    behavior: "Behavior",
    philosophy: "Philosophy",
  } as Record<string, string>,
};

const zh: typeof en = {
  hero: {
    scroll: "向下滚动",
  },
  nav: {
    hero: "意识空间",
    manifesto: "宣言",
    intro: "简介",
    featuredWorks: "精选作品",
    refractionLab: "脑洞实验室",
    contact: "联系我",
  },
  manifesto: {
    wonderHeading: "我一直在思考",
    wonderBody: "为什么技术越来越先进，人与人之间的连接，却似乎越来越遥远。",
    callingHeading: "我真正想做的事",
    callingBody:
      "我希望科技不仅改变效率，也能帮助人与自己、他人，以及这个世界建立更加真实温暖的连接。",
  },
  intro: {
    tabs: [
      {
        key: "anyone",
        label: "写给所有人",
        text: "我设计并打造由 AI 驱动的体验，让新兴技术变成人们真正能感受到、能使用、能理解的东西。",
      },
      {
        key: "founders",
        label: "创始人",
        text: "我擅长把模糊的想法打磨成清晰的产品假设，再通过快速、可验证的原型让它们变得真实可触。",
      },
      {
        key: "recruiters",
        label: "招聘方",
        text: "我拥有 5 年以上 AI、用户体验、原型设计与新兴技术项目经验。擅长产品思维、交互设计，以及借助 AI 辅助的快速构建。",
      },
      {
        key: "designers",
        label: "设计师",
        text: "我非常在意技术中“人”的那一面——也在意如何把抽象的想法，转化成清晰的产品行为与交互。",
      },
      {
        key: "product-managers",
        label: "产品经理",
        text: "我擅长从需求背后找到真正的本源问题，构建解决方案假设，并把洞察一路打磨成具体的产品行为和原型。",
      },
      {
        key: "engineers",
        label: "工程师",
        text: "我擅长在产品、设计与开发实现的交界处 定义系统逻辑、交互流程，并借助 AI 辅助工具快速构建和验证想法。",
      },
    ],
    featuredTeaserHeading: "精选作品",
    featuredTeaserBody:
      "我的项目跨越汽车、情感 AI、文化与旅行等领域，但它们探索的，始终是不同形式的人际连接。",
  },
  featuredWorks: {
    categories: {
      Technology: "科技",
      "Culture&Places": "文化与地方",
      Self: "自我",
      Others: "他者",
    },
    connectionWithPrefix: "连接在",
    connectionCategoryWrap: ["「", "」"],
    featuredWorkBadge: "精选",
    refractionTeaserHeading: "Shu 的脑洞实验室",
    refractionTeaserBody:
      "这是一间持续生长的脑洞实验室，收录着塑造我各种思考、疑问、观察与实验。",
  },
  contact: {
    body: "如果这些内容触动了你，很想听你聊聊——无论是设计、想法，还是关于连接的一切。",
  },
  refractionLab: {
    showMePrefix: "给我看看…",
    removeFilterAriaLabel: (label: string) => `移除${label}筛选`,
    nodeTypeMeta: {
      question: {
        label: "疑问",
        description: "未知——一颗还未落定成形的火花。",
      },
      observation: {
        label: "观察",
        description: "被注意到的事物，稳定得足以被留住。",
      },
      hypothesis: {
        label: "假设",
        description: "一个等待被验证的主张。",
      },
      experiment: {
        label: "实验",
        description: "被搭建、被验证，并与之共处过一段时间。",
      },
    },
    detailPanel: {
      status: "状态",
      related: "相关",
      close: "关闭",
    },
  },
  heroWords: {
    ai: "AI",
    culture: "文化",
    human: "人类",
    intelligence: "智能",
    history: "历史",
    emotion: "情感",
    places: "地方",
    memory: "记忆",
    connection: "连接",
    meaning: "意义",
    care: "关怀",
    signals: "信号",
    behavior: "行为",
    philosophy: "哲学",
  },
};

export const UI_COPY = { en, zh } satisfies Record<Locale, typeof en>;

export type UiCopy = typeof en;
