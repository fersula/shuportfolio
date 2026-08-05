import type { Locale } from "./locale-context";

/** Translated text for each LAB_NODES entry, keyed by node id. Only the
 *  language-dependent fields live here — id, types, position, depth,
 *  relatedIds, year, media stay on the base LabNode and are locale-
 *  agnostic. `sections`/`statusChecklist` here are positional arrays that
 *  must stay the same length and order as the base node's, since icon
 *  (sections) and state (statusChecklist) are read from the base node by
 *  the same index. */
type NodeCopy = {
  label: string;
  insight: string;
  status: string;
  relatedTags: string[];
  sections: { title: string; body: string }[];
  statusChecklist: { label: string }[];
};

export const LAB_NODE_COPY: Record<string, Record<Locale, NodeCopy>> = {
  "dating-ai": {
    en: {
      label: "Dating AI",
      insight:
        "Every conversation with AI leaves an emotional footprint. What if those footprints could lead you home?",
      status: "Paused after early market validation",
      relatedTags: ["Emotion AI", "SEMO", "Psychology"],
      sections: [
        {
          title: "Origin",
          body: "I wondered why Taylor Swift could transform heartbreak into creative assets while most people simply carried emotional scars. That question made me think: could AI help ordinary people do the same?",
        },
        {
          title: "Observation",
          body: "After my breakup, I realized I wasn't only talking to friends. I was talking to AI. The more I reflected through those conversations, the more obvious my emotional patterns became. Unlike people, AI never gets tired of listening.",
        },
        {
          title: "Hypothesis",
          body: "What if every conversation with AI became part of an emotional footprint today, to help you build healthier relationships tomorrow? Instead of matching people through self-written profiles, what if AIs that truly understand your emotional patterns could find compatibility beyond the masks.",
        },
        {
          title: "Value",
          body: "Today's dating apps mostly optimize for attraction. But attraction isn't always what leads to long-term happiness. An AI that understands your emotional patterns could recommend someone you genuinely need — not simply someone you're immediately drawn to.",
        },
        {
          title: "Why It Might Fail",
          body: "After discussing the concept with a VC friend, I realized the biggest challenge wasn't the technology. It was the market. The people most willing to trust AI with their emotional history are also among the most selective partners. Without enough users, the matching network becomes extremely difficult to bootstrap.",
        },
        {
          title: "What I Learned",
          body: "The bottleneck wasn't AI. It was market segmentation, network effects, and expectation management. Sometimes the hardest part of building isn't solving the problem — it's finding enough people who share it.",
        },
      ],
      statusChecklist: [
        { label: "Pitch deck completed" },
        { label: "Discussed with investors" },
        { label: "Currently paused" },
      ],
    },
    zh: {
      label: "约会 AI",
      insight: "每一次与 AI 的对话，都会留下情感的足迹。如果这些足迹，能带你找到归属呢？",
      status: "早期市场验证后暂停",
      relatedTags: ["情感 AI", "SEMO", "心理学"],
      sections: [
        {
          title: "起点",
          body: "我曾好奇，为什么泰勒·斯威夫特能把心碎转化为创作的养分，而大多数人只是把伤痛一直背在身上。这个疑问让我开始想：AI 能不能帮助普通人也做到这一点？",
        },
        {
          title: "观察",
          body: "分手之后我发现，我倾诉的对象不只是朋友，还有 AI。在那些对话里反复梳理自己，我的情感模式也越来越清晰。和人不一样，AI 从不会厌倦倾听。",
        },
        {
          title: "假设",
          body: "如果今天与 AI 的每一次对话，都能沉淀成情感足迹的一部分，帮你在未来建立更健康的关系呢？与其靠自己撰写的资料去匹配对象，不如让真正理解你情感模式的 AI，去发现面具之下的契合。",
        },
        {
          title: "价值",
          body: "如今的交友软件大多在优化“吸引力”。但吸引力并不总能带来长久的幸福。一个理解你情感模式的 AI，或许能推荐你真正需要的人——而不只是让你一见倾心的人。",
        },
        {
          title: "可能失败的原因",
          body: "和一位做风投的朋友聊过这个想法后，我意识到最大的挑战不是技术，而是市场。那些最愿意把情感经历托付给 AI 的人，往往也是择偶最挑剔的一群人。用户基数不够，匹配网络就很难真正启动起来。",
        },
        {
          title: "我学到的",
          body: "瓶颈不在 AI，而在市场细分、网络效应和预期管理。有时候，做产品最难的部分不是解决问题，而是找到足够多、和你有同样问题的人。",
        },
      ],
      statusChecklist: [
        { label: "完成路演材料" },
        { label: "已与投资人沟通" },
        { label: "目前处于暂停状态" },
      ],
    },
  },

  "bmi-paradox": {
    en: {
      label: "BMI Paradox",
      insight: "When a simpler technology can solve the same problem, do we really need the more advanced one?",
      status: "Resolved as a personal lens — not pursued as a product",
      relatedTags: ["COMAI", "Emotion AI"],
      sections: [
        {
          title: "Trigger",
          body: "On Honda's project, I kept circling back to one question: if all we want is to read someone's mood, why brainwaves? EEG means a bulky, uncomfortable headset, and it's solving something a camera and a microphone already handle quietly, with far less friction. I figured our client just wanted a flashier technology to point to — though I wasn't totally sure of myself either. Maybe I was the one missing the bigger picture.",
        },
        {
          title: "Reflection",
          body: "Months later I brought it up with Kai, a brain scientist, and he'd landed on the same question completely on his own. His reasoning: if someone can speak and move, we already have enough signal — brainwaves only really earn their place for people who can't do either, and even then, the accurate way to capture them is invasive while the comfortable way isn't accurate. Brainwave data doesn't generalize the way voice or movement does; it's only really legible against your own personal baseline. The most meaningful BMI product Kai had come across wasn't flashy at all — just a headband that helps you fall asleep. Everything past that seems to be meditation apps and brain-controlled games. Fun, not necessary.",
        },
        {
          title: "What Changed Me",
          body: "That conversation gave me confidence in something I hadn't fully trusted before: I can question emerging technologies from first principles, even outside my own discipline. Sometimes the most valuable question isn't \"How can we use this technology?\" It's \"Do we actually need it?\"",
        },
      ],
      statusChecklist: [{ label: "Resolved through conversation with a brain scientist" }],
    },
    zh: {
      label: "BMI 悖论",
      insight: "当更简单的技术就能解决同一个问题时，我们真的需要更先进的那一个吗？",
      status: "作为个人视角已有答案——但未作为产品推进",
      relatedTags: ["COMAI", "情感 AI"],
      sections: [
        {
          title: "起因",
          body: "在本田的项目里，我一直绕不开一个问题：如果我们只是想读懂一个人的情绪，为什么非要用脑电波？脑电图（EEG）意味着一个笨重又不舒服的头戴设备，而摄像头和麦克风早就能悄悄地、更省事地解决同样的问题。我猜客户只是想要一个听起来更炫的技术——但我自己也不算完全确定，也许是我没看到更大的图景。",
        },
        {
          title: "反思",
          body: "几个月后，我和脑科学家 Kai 聊起这个想法，发现他完全独立地想到了同一个问题。他的推理是：如果一个人还能说话、还能动，我们其实已经有足够的信号了——脑电波真正有价值的场景，是那些既不能说也不能动的人；即便如此，精确采集脑电波需要侵入式设备，而舒适的采集方式又不够精确。脑电数据也不像语音或动作那样具有普适性，它只有对照个人自己的基线才有意义。Kai 遇到过最有价值的 BMI 产品其实一点也不炫——只是一条帮助入睡的头带。除此之外，大多是冥想类应用和脑控游戏，有趣，但算不上必要。",
        },
        {
          title: "改变我的地方",
          body: "那次谈话让我对一件事有了信心，一件我之前没有完全相信自己能做到的事：即使在自己专业之外，我也可以从第一性原理出发去质疑新兴技术。有时候，最有价值的问题不是“我们能怎么用这项技术”，而是“我们真的需要它吗”。",
        },
      ],
      statusChecklist: [{ label: "通过与脑科学家的对话得到解答" }],
    },
  },

  "traditional-x-ai": {
    en: {
      label: "Traditional × AI",
      insight: "Tradition survives not by being preserved, but by being reimagined.",
      status: "Website & branding built — paused by founder",
      relatedTags: ["London Monster", "SerenChina"],
      sections: [
        {
          title: "Trigger",
          body: "A friend approached me with an idea: could we help Chinese traditional craftsmanship reach an international audience?",
        },
        {
          title: "Observation",
          body: "Around the same time, I kept seeing collaborations between Chinese artisans and luxury brands. It proved these crafts still held tremendous cultural value. But I wondered: why should traditional craftsmanship exist only as luxury collectibles?",
        },
        {
          title: "Hypothesis",
          body: "What if AI could generate contemporary aesthetics inspired by traditional motifs — letting centuries-old techniques become part of everyday interiors, products and architecture again? Instead of preserving tradition, we could let it evolve.",
        },
        {
          title: "Experiment",
          body: "This became CHIMON — combining business strategy, branding and web design while exploring how AI-generated visual languages could inspire new possibilities for traditional crafts.",
        },
        {
          title: "Status",
          body: "Website and branding built — currently paused by the founder.",
        },
      ],
      statusChecklist: [{ label: "Website & branding built" }, { label: "Paused by founder" }],
    },
    zh: {
      label: "传统 × AI",
      insight: "传统的存续，不是靠被保存，而是靠被重新想象。",
      status: "网站与品牌已完成搭建——创始人决定暂停",
      relatedTags: ["London Monster", "SerenChina"],
      sections: [
        {
          title: "起因",
          body: "一位朋友带着一个想法找到我：我们能不能帮助中国传统手工艺触达国际受众？",
        },
        {
          title: "观察",
          body: "差不多同一时期，我不断看到中国匠人与奢侈品牌的联名合作，这证明这些手艺依然拥有巨大的文化价值。但我在想：传统手工艺，为什么只能以奢侈收藏品的形式存在？",
        },
        {
          title: "假设",
          body: "如果 AI 能从传统纹样中生成当代美学呢？让延续百年的技艺，重新走进日常的室内空间、产品与建筑之中。与其保存传统，不如让它演化。",
        },
        {
          title: "实验",
          body: "这个想法成为了 CHIMON——融合商业策略、品牌与网页设计，探索 AI 生成的视觉语言，如何为传统工艺带来新的可能性。",
        },
        {
          title: "现状",
          body: "网站与品牌已完成搭建——目前由创始人决定暂停。",
        },
      ],
      statusChecklist: [{ label: "网站与品牌已完成搭建" }, { label: "创始人决定暂停" }],
    },
  },

  "presence-in-pandemic": {
    en: {
      label: "Presence in Pandemic",
      insight: "We're constantly connected, yet we still feel so far apart.",
      status: "Carried forward into Metabond, my master's thesis",
      relatedTags: ["London Monster", "SEMO"],
      sections: [
        {
          title: "Trigger",
          body: "By 2020 I'd gone from constantly moving between the UK, the US and a blur of other countries, to being locked alone in a 30 square meter apartment in Japan, unable to fly home. Just me, a thesis, and grocery runs.",
        },
        {
          title: "Question",
          body: "We could still video call our families, binge every show that existed, even work out at home. So why did it still feel like something was missing? What is it that physical presence gives us that technology still cannot?",
        },
        {
          title: "Observation",
          body: "What I actually missed was strangely specific: studying next to people in a library, not even talking to them. Turns out there's a term for that — social facilitation. Around the same time, Google's Starline project made me realize something: presence isn't created by video alone. It comes from countless subtle sensory cues that today's digital communication simply doesn't reproduce.",
        },
        {
          title: "Experiment",
          body: "This became MetaBond. I designed a wearable system that captures subtle body movements and transforms them into spatial sound, so people in different places can hear each other grow closer or farther — almost like sensing someone shift in a chair near you. Less a video call, more a shared room made of sound.",
        },
        {
          title: "What Changed Me",
          body: "Technology has made communication effortless. But recreating human presence is still one of its greatest unsolved challenges.",
        },
      ],
      statusChecklist: [{ label: "Wearable prototype built" }, { label: "Completed as master's thesis" }],
    },
    zh: {
      label: "疫情中的在场感",
      insight: "我们始终保持连接，却依然感到如此遥远。",
      status: "延续进了我的硕士毕业论文项目 Metabond",
      relatedTags: ["London Monster", "SEMO"],
      sections: [
        {
          title: "起因",
          body: "到 2020 年，我从常年辗转于英国、美国和一堆记不清的国家之间，变成了独自被困在日本一间 30 平米的公寓里，回不了家。只剩下我、一篇论文，和偶尔的买菜出门。",
        },
        {
          title: "疑问",
          body: "我们依然可以视频通话，追遍所有的剧，甚至在家健身。可为什么还是觉得少了点什么？物理意义上的“在场”，究竟给了我们什么，是技术至今仍给不了的？",
        },
        {
          title: "观察",
          body: "我真正想念的东西出乎意料地具体：在图书馆里和别人挨着自习，哪怕根本不说话。后来才知道这有个专有名词——社会助长效应。差不多同一时期，谷歌的 Starline 项目让我意识到：在场感并不只靠视频画面产生，它来自无数细微的感官线索，而这些正是今天的数字沟通完全无法还原的。",
        },
        {
          title: "实验",
          body: "这成为了 MetaBond。我设计了一套可穿戴系统，捕捉细微的身体动作并将其转化为空间音效，让身处异地的人也能“听见”彼此的远近变化——就像能感觉到身边有人在椅子上微微挪动一样。它不太像一通视频通话，更像一间由声音搭建出的共享房间。",
        },
        {
          title: "改变我的地方",
          body: "技术让沟通变得毫不费力。但重现人与人之间的在场感，仍是它至今未能解决的最大难题之一。",
        },
      ],
      statusChecklist: [{ label: "已完成可穿戴原型" }, { label: "作为硕士论文完成" }],
    },
  },

  "emotion-ai-future": {
    en: {
      label: "Emotion AI Future",
      insight: "The more emotionally capable AI becomes, the less emotionally capable humans might become.",
      status: "Ongoing open question — no fixed answer yet",
      relatedTags: ["SEMO", "COMAI"],
      sections: [
        {
          title: "Observation",
          body: "Working across Honda and SEMO pulled me deep into emotion AI, and honestly, most of what I saw felt like it was treating loneliness the way a painkiller treats an infection: emotional analysis, emotional support, companion robots that make someone feel less alone right now while quietly making them lonelier over time.",
        },
        {
          title: "What I Believe",
          body: "AI should lower the friction in how people reach each other, not stand in for the people themselves.",
        },
        {
          title: "Questions I'm Still Living With",
          body: "If the goal is helping you understand and empathize with the humans already in your life, when does that AI actually step in? When does it speak up? When does it stay quiet? How much of your day should it really be watching? I honestly don't have a clean answer yet — still an open question for me.",
        },
      ],
      statusChecklist: [{ label: "Still living with the question" }],
    },
    zh: {
      label: "情感 AI 的未来",
      insight: "AI 的情感能力越强，人类的情感能力或许就会越弱。",
      status: "持续开放的问题——尚无定论",
      relatedTags: ["SEMO", "COMAI"],
      sections: [
        {
          title: "观察",
          body: "在本田和 SEMO 的工作，让我深入接触了情感 AI 领域。老实说，我看到的大多数产品，处理孤独的方式，就像止痛药处理感染一样：情绪分析、情感陪伴、陪伴机器人——它们让人当下感觉不那么孤独，却在悄悄地、日积月累地让人更加孤独。",
        },
        {
          title: "我相信的事",
          body: "AI 应该降低人与人相互靠近的门槛，而不是取代人本身。",
        },
        {
          title: "我仍在追问的问题",
          body: "如果目标是帮你更好地理解、共情你生活里已经存在的那些人，这样的 AI 究竟该在什么时候介入？什么时候该开口？什么时候该保持沉默？它究竟应该“看着”你生活中的多少部分？老实说，我还没有一个干净利落的答案——对我来说，这仍然是一个开放的问题。",
        },
      ],
      statusChecklist: [{ label: "仍在与这个问题共处" }],
    },
  },

  "cultural-stereotypes": {
    en: {
      label: "Cultural Stereotypes",
      insight: "People rarely reject a culture — they reject the version they've been shown.",
      status: "Built & launched SerenChina 1.0 — pursuing funding next",
      relatedTags: ["SerenChina", "Chimon"],
      sections: [
        {
          title: "Observation",
          body: "Watching China travel content take off on TikTok, I kept comparing it to how effortlessly Japan sells its own image abroad, and realized how much of what people \"know\" about a place is just whatever filter happened to get there first. China is one of the most varied countries on earth, and almost none of that reaches someone who's only mildly curious.",
        },
        {
          title: "Hypothesis",
          body: "I think travel decisions are emotional before they're logistical. An itinerary could start there too — not with budget and number of days, but with whatever actually resonates with a person, letting that lead them into a culture they didn't even know they'd love.",
        },
        {
          title: "Experiment",
          body: "This idea became SerenChina — an AI-powered travel discovery experience that helps people discover places based on emotional attraction rather than geographical planning.",
        },
        {
          title: "Status",
          body: "Built & launched SerenChina 1.0. Next: user interviews → commercialization → funding.",
        },
      ],
      statusChecklist: [
        { label: "Built & launched SerenChina 1.0" },
        { label: "User interviews" },
        { label: "Commercialization & funding" },
      ],
    },
    zh: {
      label: "文化刻板印象",
      insight: "人们很少真正拒绝一种文化——他们拒绝的，只是被展示出来的那个版本。",
      status: "已完成并上线 SerenChina 1.0——下一步争取融资",
      relatedTags: ["SerenChina", "Chimon"],
      sections: [
        {
          title: "观察",
          body: "看着中国旅行内容在 TikTok 上爆火，我不自觉地拿它和日本对外输出形象时的那种毫不费力去比较，也意识到人们对一个地方所谓的“了解”，往往只是最先抵达他们的那个滤镜。中国是地球上最具多样性的国家之一，但这种多样性，几乎传不到一个只是“有点好奇”的人那里。",
        },
        {
          title: "假设",
          body: "我认为旅行决策首先是情感的，其次才是行程安排。一份行程也可以从情感出发去规划——不是从预算和天数开始，而是从真正打动一个人的东西开始，让它带着这个人走进一种连自己都没想到会喜欢的文化。",
        },
        {
          title: "实验",
          body: "这个想法成为了 SerenChina——一款 AI 驱动的旅行发现产品，帮助人们基于情感吸引力、而非地理规划来发现目的地。",
        },
        {
          title: "现状",
          body: "已完成并上线 SerenChina 1.0。下一步：用户访谈 → 商业化 → 融资。",
        },
      ],
      statusChecklist: [
        { label: "已完成并上线 SerenChina 1.0" },
        { label: "用户访谈" },
        { label: "商业化与融资" },
      ],
    },
  },

  "london-monster": {
    en: {
      label: "London Monster",
      insight: "Every tiny action leaves invisible ripples across the city we live in.",
      status: "Completed — top marks, dean's standout pick of the cohort",
      relatedTags: ["SerenChina", "Presence in Pandemic"],
      sections: [
        {
          title: "Trigger",
          body: "Between Australia, Tokyo, London and New York, I was moving faster than I could ever feel settled anywhere, and it got me asking what \"belonging\" even means when you're never in one place long enough to earn it.",
        },
        {
          title: "Reflection",
          body: "I began to see cities less as physical spaces, and more as living organisms. Every decision we make — where we walk, who we meet, how we interact — creates tiny ripples that continuously reshape the whole.",
        },
        {
          title: "Experiment",
          body: "Together with my RCA teammates, we created London Monster, an interactive installation. Visitors interacted with two robotic creatures, and every movement transformed the surrounding projection, lighting and soundscape — making each person's presence visible across the entire space.",
        },
        {
          title: "Status",
          body: "It ended up winning top marks that year, and our dean even posted it as the standout project of the cohort.",
        },
        {
          title: "What Changed Me",
          body: "This was the first time I consciously explored a question that still shapes my work today: how do people create meaningful connections with places?",
        },
      ],
      statusChecklist: [
        { label: "Installation built & exhibited (RCA)" },
        { label: "Top marks — cohort standout" },
      ],
    },
    zh: {
      label: "London Monster",
      insight: "每一个微小的举动，都会在我们生活的城市里，留下看不见的涟漪。",
      status: "已完成——获得最高分，并被院长评为当届最佳作品",
      relatedTags: ["SerenChina", "疫情中的在场感"],
      sections: [
        {
          title: "起因",
          body: "辗转于澳大利亚、东京、伦敦和纽约之间，我搬家的速度，比在任何一个地方“安定下来”的速度都快，这让我开始追问：当你从来没有在一个地方停留到足够久，“归属感”到底意味着什么？",
        },
        {
          title: "反思",
          body: "我开始不再把城市看作单纯的物理空间，而更像是一个活的有机体。我们做的每一个决定——走哪条路、遇见谁、如何互动——都会产生细小的涟漪，不断重塑整体。",
        },
        {
          title: "实验",
          body: "和皇家艺术学院（RCA）的队友们一起，我们创作了互动装置《London Monster》。参观者与两只机械生物互动，每一个动作都会改变周围的投影、灯光与声景——让每个人的“存在”，在整个空间里都清晰可见。",
        },
        {
          title: "现状",
          body: "这件作品最终获得了当年的最高分，院长还专门把它作为当届最佳作品分享了出来。",
        },
        {
          title: "改变我的地方",
          body: "这是我第一次有意识地去探索一个至今仍在影响我工作的问题：人与地方之间，是如何建立起有意义的连接的？",
        },
      ],
      statusChecklist: [{ label: "装置已完成并展出（RCA）" }, { label: "最高分——当届最佳" }],
    },
  },
};
