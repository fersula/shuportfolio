import type { Locale } from "./locale-context";

/** Translated title/subtitle for each PROJECTS entry in featured-works.tsx,
 *  keyed by project id. projectName, year, src, link stay locale-agnostic
 *  and are read straight off the base PROJECTS record. */
export const PROJECTS_COPY: Record<
  string,
  Record<Locale, { title: string; subtitle: string }>
> = {
  auto: {
    en: {
      title: "How can AI feel thoughtful—not merely capable?",
      subtitle: "Future automotive AI experiences, Strategy · Embodied AI · Two-stage PoC",
    },
    zh: {
      title: "未来 AI 如何能更有创造用心的体验，而不只是有能力？",
      subtitle: "未来汽车 AI 体验，策略 · 具身智能 · 两阶段概念验证Demo",
    },
  },
  sere: {
    en: {
      title: "Can AI help us discover unfamiliar cultures through emotional resonance?",
      subtitle: "AI-powered travel discovery product, designed and built independently",
    },
    zh: {
      title: "AI 能否通过情感共鸣，帮我们探索未知的陌生文化？",
      subtitle: "AI 驱动的旅行发现产品，独立设计与开发",
    },
  },
  semo: {
    en: {
      title: "Can AI hear what words leave unsaid?",
      subtitle: "Emotion AI venture, SER-powered AI prototype, venture strategy",
    },
    zh: {
      title: "AI 能听见言语之外的东西吗？",
      subtitle: "情感 AI 创业项目，基于语音情感识别（SER）的 AI 原型，创业策略",
    },
  },
  elgana: {
    en: {
      title: "How can a workplace tool become a digital hub for community and collaboration?",
      subtitle: "Product repositioning and renewal, research, strategy, UX/UI and brand",
    },
    zh: {
      title: "一个办公协作工具，如何成为社群与协作的数字枢纽？",
      subtitle: "产品重新定位与焕新，研究、策略、用户体验设计与品牌",
    },
  },
  chimon: {
    en: {
      title: "How can traditional Chinese craftsmanship find new relevance in a global market?",
      subtitle: "Venture brand and live website, service concept, identity",
    },
    zh: {
      title: "中国传统手工艺，如何在全球市场中找到新的意义？",
      subtitle: "创业品牌与上线网站，服务概念与视觉识别",
    },
  },
  metamatsu: {
    en: {
      title:
        "How can a city turn disaster preparedness and cultural heritage into an explorable virtual world?",
      subtitle: "Public-sector metaverse, unreal engine and geospatial mapping",
    },
    zh: {
      title: "一座城市，如何把防灾意识与文化遗产，变成一个可探索的虚拟世界？",
      subtitle: "日本公共部门元宇宙项目，基于虚幻引擎与地理空间测绘",
    },
  },
  metabond: {
    en: {
      title: "Can the subtle presence of others help us focus without demanding attention?",
      subtitle: "Master's thesis · wearable sensing, app prototype",
    },
    zh: {
      title: "他人若隐若现的存在，能否在不打扰的前提下，帮我们更专注？",
      subtitle: "硕士毕业论文 · 可穿戴感应设备、应用原型",
    },
  },
  iverse: {
    en: {
      title: "Can generative AI help people explore identity and connect beyond social labels?",
      subtitle: "0→1 AI social platform, UX/UI, Motion and Brand",
    },
    zh: {
      title: "生成式 AI 能否帮助人们探索身份认同，超越社交标签建立连接？",
      subtitle: "从 0 到 1 的 AI 社交平台，用户体验设计、动效与品牌",
    },
  },
};
