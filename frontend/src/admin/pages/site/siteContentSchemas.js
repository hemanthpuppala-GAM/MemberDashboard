/**
 * Field schemas for the public-site content editors (/admin/content/{page}).
 * Derived from the design handoff's `Admin {Page}.dc.html` files
 * (Replicated-Design/design_handoff_home_bodhi_tree/design/) — same sections,
 * same field order, same labels and help text. Each schema edits the matching
 * frontend/src/site/content/{page}.json document; keys present in the document
 * but not listed here are kept and editable in the raw-JSON fallback.
 *
 * Field types
 *   text | textarea | url | time      plain string        ({ key, label, rows?, hint?, placeholder?, wide? })
 *   select                            string from options ({ options: [...] })
 *   image                             URL / "assets/x.png" ({ fallback: "assets/…" | (item) => "assets/…", hint? })
 *   csv                               string[] ⇄ "a, b, c"
 *   lines                             string[] ⇄ one per line
 *   pairs                             [{a,b}] ⇄ "a | b" per line ({ pairKeys: ["label","href"] })
 *   object                            nested object       ({ fields: [...] })
 *   list                              array of objects    ({ fields, itemLabel?, addable?, newItem?, layout? })
 *   heading                           sub-heading inside a section ({ label, hint? })
 */

const TIME_ZONES = [
  "Asia/Kolkata", "America/Chicago", "America/New_York", "America/Los_Angeles", "America/Denver",
  "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney", "UTC",
];
const WELLNESS_ICONS = ["meditation", "sun", "earth", "food", "water"];

const QUOTES_LIST = {
  type: "list",
  key: "quotes",
  label: "Testimonials",
  itemLabel: "Testimonial",
  addable: true,
  newItem: { text: "“”", name: "" },
  layout: "row",
  fields: [
    { key: "text", label: "Quote", type: "text", grow: 3 },
    { key: "name", label: "Name", type: "text" },
  ],
};

const FOOTER_FIELDS = [
  { key: "footerTitle", label: "Footer · title", type: "text" },
  { key: "footerSub", label: "Footer · sub-line", type: "text" },
];

export const SITE_CONTENT_SCHEMAS = {
  home: {
    label: "Home",
    publicPath: "/",
    eyebrow: "Admin · Home page",
    title: "Header texts & sit timings",
    intro: "Changes publish to the home page the moment you save.",
    sections: [
      {
        title: "Header & hero",
        columns: 2,
        fields: [
          { type: "heading", label: "Header & navigation" },
          { key: "tagline", label: "Tagline (header)", type: "text" },
          { key: "supportLabel", label: "Nav · support", type: "text" },
          { key: "volunteerNavLabel", label: "Nav · volunteer", type: "text" },
          { key: "joinLabel", label: "Nav · join button", type: "text" },
          { key: "joinShortLabel", label: "Nav · join button (phone)", type: "text" },
          { key: "privacyLabel", label: "Nav · privacy", type: "text" },
          { key: "volunteerHintTitle", label: "Volunteer hover · title", type: "text" },
          { key: "volunteerHint", label: "Volunteer hover · text", type: "textarea", rows: 3 },
          { type: "heading", label: "Hero" },
          { key: "headline", label: "Headline", type: "text" },
          { key: "headlineAccent", label: "Headline accent (italic)", type: "text" },
          { key: "subline", label: "Sub-line", type: "textarea", rows: 3, wide: true },
          { key: "phoneJoinLabel", label: "Sessions heading (phone/tablet)", type: "text" },
          { key: "watchLabel", label: "Secondary link", type: "text" },
          { key: "sitsTitle", label: "World sits title", type: "text" },
          { key: "qrEyebrow", label: "QR eyebrow", type: "text" },
          { key: "qrSub", label: "QR sub-line", type: "text" },
          { key: "volunteerLabel", label: "Volunteer button", type: "text" },
          { key: "heroCaption", label: "Hero photo caption", type: "text" },
          { key: "filmSrc", label: "Intro film · video URL (mp4)", type: "text", placeholder: "assets/peace-film.mp4" },
          { type: "heading", label: "Promo tile" },
          { key: "promoKicker", label: "Promo tile · kicker", type: "text" },
          { key: "promoTitle", label: "Promo tile · title", type: "text" },
          { key: "promoBody", label: "Promo tile · body", type: "textarea", rows: 3 },
          { key: "promoCta", label: "Promo tile · button", type: "text" },
          { type: "heading", label: "Golden rules & free band" },
          { key: "rulesKicker", label: "Golden rules · heading", type: "text", wide: true },
          { key: "rule1", label: "Golden rule 1", type: "text" },
          { key: "rule2", label: "Golden rule 2", type: "text" },
          { key: "rule3", label: "Golden rule 3", type: "text" },
          { key: "rule4", label: "Golden rule 4", type: "text" },
          { key: "rule5", label: "Golden rule 5", type: "text" },
          { key: "freeKicker", label: "Free band · label", type: "text" },
          { key: "freeLine", label: "Free band · line", type: "text" },
          { type: "heading", label: "Event banner" },
          { key: "eventKicker", label: "Event banner · kicker", type: "text" },
          { key: "eventTitle", label: "Event banner · title", type: "text" },
          { key: "eventSub", label: "Event banner · details", type: "text" },
          { key: "eventCta", label: "Event banner · button", type: "text" },
          { key: "eventHref", label: "Event banner · link", type: "text" },
          { type: "heading", label: "Yantra tips" },
          { key: "tipSunGazing", label: "Yantra tip · Sun gazing", type: "textarea", rows: 3 },
          { key: "tipAlkaline", label: "Yantra tip · Alkaline water", type: "textarea", rows: 3 },
          { key: "tipEarthing", label: "Yantra tip · Earthing", type: "textarea", rows: 3 },
        ],
      },
      {
        title: "Page index (under the headline)",
        fields: [
          { key: "subPages", label: 'One page per line as "Label | link"', type: "pairs", pairKeys: ["label", "href"], rows: 4 },
        ],
      },
      {
        title: "Hero photo",
        fields: [
          { key: "heroImage", label: "Hero photo (Dr Hari Krishna)", type: "image", fallback: "assets/hari-stream-forest.png" },
        ],
      },
      {
        title: "Three pillars",
        description:
          "Each panel's title, teaching line, quote and link label. Upload a portrait photo (about 3:4, 600×720 or larger) to replace the default artwork; leave empty to keep the default.",
        fields: [
          {
            type: "list",
            key: "pillars",
            itemLabel: (p) => p.kicker || "Pillar",
            layout: "cards",
            fields: [
              { key: "image", label: "Photo", type: "image", fallback: (p) => `assets/pillars/${p.key}-600x720.webp` },
              { key: "kicker", label: "Title", type: "text" },
              { key: "line", label: "Teaching line", type: "text" },
              { key: "quote", label: "Quote (laptop/desktop)", type: "textarea", rows: 3 },
              { key: "cta", label: "Link label", type: "text" },
              { key: "href", label: "Link URL", type: "text" },
            ],
          },
          { key: "chipKicker", label: "Meditation panel · top badge", type: "text" },
          { key: "chipLine", label: "Meditation panel · top line", type: "text" },
        ],
        columns: 2,
      },
      {
        title: "Sit timings",
        fields: [
          {
            type: "list",
            key: "sessions",
            label: "Slots",
            itemLabel: "Slot",
            hint: "The first slot is the one shown under the headline. Times are entered in the slot's own time zone; the home page converts them for each visitor.",
            addable: true,
            newItem: { name: "New sit", start: "06:00", end: "06:30", tz: "UTC", zone: "UTC" },
            layout: "row",
            fields: [
              { key: "name", label: "Name", type: "text", grow: 2 },
              { key: "start", label: "Start", type: "time" },
              { key: "end", label: "End", type: "time" },
              { key: "tz", label: "Time zone", type: "select", options: TIME_ZONES, grow: 2 },
              { key: "zone", label: "Label", type: "text", placeholder: "IST" },
            ],
          },
        ],
      },
      {
        title: "Zoom",
        fields: [
          {
            type: "object",
            key: "zoom",
            columns: 3,
            fields: [
              { key: "id", label: "Meeting ID", type: "text" },
              { key: "passcode", label: "Passcode", type: "text" },
              { key: "url", label: "Join link", type: "url" },
            ],
          },
        ],
      },
    ],
  },

  about: {
    label: "About",
    publicPath: "/about",
    eyebrow: "Admin · About page",
    title: "Portrait, story & testimonials",
    intro: "Changes publish to the About page the moment you save.",
    sections: [
      {
        title: "Portrait",
        fields: [
          {
            key: "photo",
            label: "Portrait",
            type: "image",
            fallback: "assets/hari-portrait-white.jpg",
            portrait: true,
            hint: "Portrait orientation, about 3:4. Face in the upper third works best.",
          },
          { key: "photoCaption", label: "Photo caption", type: "text" },
        ],
      },
      {
        title: "Story",
        columns: 2,
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text", wide: true },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
          { key: "intro", label: "Intro", type: "textarea", rows: 5, wide: true },
          { key: "badge1", label: "Badge 1", type: "text" },
          { key: "badge2", label: "Badge 2", type: "text" },
        ],
      },
      {
        title: "Three strengths",
        fields: [
          {
            type: "list",
            key: "strengths",
            itemLabel: (g) => g.title || "Strength",
            layout: "cards",
            fields: [
              { key: "glyph", label: "Glyph", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea", rows: 4 },
            ],
          },
        ],
      },
      {
        title: "Testimonials",
        fields: [
          { key: "quotesKicker", label: "Section heading", type: "text" },
          QUOTES_LIST,
        ],
      },
      {
        title: "Footer band",
        columns: 2,
        fields: [
          { key: "footerTitle", label: "Title", type: "text" },
          { key: "footerSub", label: "Sub-line", type: "text" },
        ],
      },
    ],
  },

  mission: {
    label: "Mission",
    publicPath: "/mission",
    eyebrow: "Admin · Mission page",
    title: "Story, yugas & the 8% goal",
    intro: "Changes publish to the Mission page the moment you save.",
    sections: [
      {
        title: "Heading",
        columns: 3,
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
        ],
      },
      {
        title: "Story",
        columns: 2,
        fields: [
          { key: "intro1", label: "Paragraph 1", type: "textarea", rows: 3, wide: true },
          { key: "intro1Accent", label: "Paragraph 1 · highlighted phrase", type: "text" },
          { key: "intro1Tail", label: "Paragraph 1 · closing line", type: "text" },
          { type: "heading", label: "The four yugas" },
          {
            type: "list",
            key: "yugas",
            itemLabel: (y) => y.name || "Yuga",
            layout: "row",
            fields: [
              { key: "name", label: "Name", type: "text" },
              { key: "tag", label: "Description", type: "text", grow: 3 },
            ],
          },
          { key: "intro2", label: "Paragraph 2", type: "textarea", rows: 3, wide: true },
          { key: "intro2Accent", label: "Paragraph 2 · highlighted phrase", type: "text", wide: true },
        ],
      },
      {
        title: "The 8% goal card",
        columns: 2,
        fields: [
          { key: "goalNumber", label: "Big number (without %)", type: "text" },
          { key: "goalLead", label: "Lead-in", type: "text" },
          { key: "goalAccent", label: "Highlighted phrase", type: "text" },
          { key: "goalTail", label: "Closing", type: "text" },
          { key: "dotsCaption", label: "Dots caption", type: "text" },
          { key: "cta", label: "Button label", type: "text" },
          { key: "ctaHref", label: "Button link", type: "text" },
        ],
      },
      {
        title: "Footer band",
        columns: 2,
        fields: [
          { key: "footerTitle", label: "Title", type: "text" },
          { key: "footerSub", label: "Sub-line", type: "text" },
        ],
      },
    ],
  },

  meditation: {
    label: "Meditation",
    publicPath: "/meditation",
    eyebrow: "Admin · Meditation page",
    title: "Steps, posture photo & teachings",
    intro: "Changes publish the moment you save.",
    sections: [
      {
        title: "Posture photo",
        fields: [
          { key: "photo", label: "Posture photo", type: "image", fallback: "assets/hari-posture-stream.png", portrait: true },
          { key: "photoCaption", label: "Caption", type: "text" },
        ],
      },
      {
        title: "Heading",
        columns: 2,
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text", wide: true },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
          { key: "sub", label: "Sub-line", type: "text", wide: true },
        ],
      },
      {
        title: "How to meditate",
        fields: [
          { key: "howKicker", label: "Section heading", type: "text" },
          {
            type: "list",
            key: "steps",
            itemLabel: (s) => `Step ${s.n || ""}`.trim(),
            layout: "row",
            fields: [
              { key: "n", label: "No.", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text", grow: 2 },
              { key: "body", label: "Body", type: "textarea", rows: 2, grow: 4 },
            ],
          },
          { key: "howClose", label: "Closing line", type: "text" },
        ],
      },
      {
        title: "Quick answers",
        fields: [
          {
            type: "list",
            key: "answers",
            itemLabel: (q) => q.label || "Answer",
            layout: "cards",
            fields: [
              { key: "label", label: "Label", type: "text" },
              { key: "answer", label: "Answer", type: "text" },
              { key: "detail", label: "Detail", type: "textarea", rows: 3 },
            ],
          },
        ],
      },
      {
        title: "The science & recommendation",
        columns: 2,
        fields: [
          { key: "scienceKicker", label: "Science · kicker", type: "text" },
          { key: "scienceTitle", label: "Science · title", type: "text" },
          { key: "scienceBody", label: "Science · body", type: "textarea", rows: 4, wide: true },
          { key: "recKicker", label: "Recommends · kicker", type: "text" },
          { key: "recTitle", label: "Recommends · title", type: "text" },
          { key: "recBody", label: "Recommends · body", type: "textarea", rows: 3, wide: true },
          { key: "techKicker", label: "Techniques · heading", type: "text" },
          { key: "techniques", label: "Techniques (comma-separated)", type: "csv" },
          { key: "techNote", label: "Techniques · note", type: "text", wide: true },
          { key: "bodyLead", label: "Body · lead", type: "text" },
          { key: "bodyText", label: "Body · text", type: "text" },
          { key: "bodyCta", label: "Body · button", type: "text" },
          { key: "bodyHref", label: "Body · link", type: "text" },
        ],
      },
      {
        title: "Where are you on the path?",
        columns: 3,
        fields: [
          { key: "pathLabel", label: "Prompt", type: "text" },
          { key: "simpleLabel", label: "Tab 1", type: "text" },
          { key: "deepLabel", label: "Tab 2", type: "text" },
          { key: "simpleLead", label: "Beginner · lead", type: "text" },
          { key: "simpleQuote", label: "Beginner · quote", type: "text" },
          { key: "simpleTail", label: "Beginner · tail", type: "text" },
          { type: "heading", label: "Seasoned meditator cards" },
          {
            type: "list",
            key: "deepCards",
            itemLabel: (d) => d.title || "Card",
            layout: "cards",
            fields: [
              { key: "glyph", label: "Glyph", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea", rows: 4 },
            ],
          },
          { key: "deepClose", label: "Seasoned · closing line", type: "text", wide: true },
          { key: "cta", label: "Button label", type: "text" },
          { key: "ctaHref", label: "Button link", type: "text" },
          { type: "spacer" },
          ...FOOTER_FIELDS,
        ],
      },
    ],
  },

  wisdom: {
    label: "Wisdom",
    publicPath: "/wisdom",
    eyebrow: "Admin · Wisdom page",
    title: "Cards, the Architecture of Reality & quotes",
    intro: "Changes publish the moment you save.",
    sections: [
      {
        title: "Heading",
        columns: 3,
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
        ],
      },
      {
        title: "Four wisdom cards",
        fields: [
          {
            type: "list",
            key: "cards",
            itemLabel: (g) => g.title || "Card",
            layout: "cards",
            fields: [
              { key: "glyph", label: "Glyph", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea", rows: 3 },
            ],
          },
        ],
      },
      {
        title: "The Architecture of Reality",
        columns: 2,
        fields: [
          { key: "archKicker", label: "Kicker", type: "text" },
          { key: "archTitle", label: "Title", type: "text" },
          { key: "archSub", label: "Intro", type: "textarea", rows: 2, wide: true },
          { key: "staticLabel", label: "Static · label", type: "text" },
          { key: "coherentLabel", label: "Coherence · label", type: "text" },
          { key: "staticTag", label: "Static · tag", type: "text" },
          { key: "coherentTag", label: "Coherence · tag", type: "text" },
          { key: "staticBody", label: "Static · body", type: "textarea", rows: 3 },
          { key: "coherentBody", label: "Coherence · body", type: "textarea", rows: 3 },
          { type: "heading", label: "Three principles" },
          {
            type: "list",
            key: "principles",
            itemLabel: (p) => p.title || "Principle",
            layout: "cards",
            fields: [
              { key: "glyph", label: "Glyph", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea", rows: 2 },
            ],
          },
          { key: "protocolKicker", label: "Protocol heading", type: "text", wide: true },
          {
            type: "list",
            key: "protocol",
            itemLabel: (s) => s.title || "Step",
            layout: "cards",
            fields: [
              { key: "n", label: "No.", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea", rows: 2 },
            ],
          },
        ],
      },
      {
        title: "Testimonials",
        fields: [QUOTES_LIST],
      },
      {
        title: "Buttons & footer",
        columns: 2,
        fields: [
          { key: "filmLabel", label: "Film button", type: "text" },
          { key: "filmHref", label: "Film link", type: "text" },
          { key: "cta", label: "Join button", type: "text" },
          { key: "ctaHref", label: "Join link", type: "text" },
          ...FOOTER_FIELDS,
        ],
      },
    ],
  },

  wellness: {
    label: "Wellness",
    publicPath: "/wellness",
    eyebrow: "Admin · Wellness page",
    title: "Benefits, golden rules & the detox program",
    intro: "Changes publish the moment you save.",
    sections: [
      {
        title: "Heading & buttons",
        columns: 3,
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
          { key: "exploreLabel", label: "Explore button", type: "text" },
          { key: "cta", label: "Challenge button", type: "text" },
          { key: "ctaHref", label: "Challenge link", type: "text" },
        ],
      },
      {
        title: "Five benefits",
        fields: [
          {
            type: "list",
            key: "benefits",
            itemLabel: (b) => b.title || "Benefit",
            layout: "row",
            fields: [
              { key: "icon", label: "Icon", type: "select", options: WELLNESS_ICONS },
              { key: "title", label: "Title", type: "text", grow: 2 },
              { key: "body", label: "Body", type: "text", grow: 4 },
            ],
          },
          QUOTES_LIST,
        ],
      },
      {
        title: "Five golden rules",
        columns: 2,
        fields: [
          { key: "rulesNumber", label: "Big number", type: "text" },
          { key: "rulesTitle", label: "Title", type: "text" },
          { key: "rulesSub", label: "Sub-line", type: "text" },
          { key: "rulesMotto", label: "Motto", type: "text" },
          {
            type: "list",
            key: "rules",
            itemLabel: (r) => r.title || "Rule",
            layout: "row",
            fields: [
              { key: "icon", label: "Icon", type: "select", options: WELLNESS_ICONS },
              { key: "title", label: "Title", type: "text", grow: 2 },
              { key: "body", label: "Body", type: "text", grow: 4 },
            ],
          },
        ],
      },
      {
        title: "Detox diet program",
        columns: 3,
        fields: [
          { key: "detoxEyebrow", label: "Eyebrow", type: "text" },
          { key: "detoxTitle", label: "Title", type: "text" },
          { key: "detoxBadge", label: "Badge", type: "text" },
          { key: "pdfLabel", label: "PDF button", type: "text" },
          { key: "pdfHref", label: "PDF link", type: "text", placeholder: "assets/detox-diet.pdf" },
          { type: "heading", label: "Six tabs", hint: "Six tabs. Bullet points: one per line." },
          {
            type: "list",
            key: "detox",
            itemLabel: (d) => d.label || "Tab",
            layout: "cards",
            fields: [
              { key: "glyph", label: "Glyph", type: "text", narrow: true },
              { key: "label", label: "Tab label", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "desc", label: "Description", type: "textarea", rows: 3 },
              { key: "items", label: "Bullets (one per line)", type: "lines", rows: 5 },
            ],
          },
          ...FOOTER_FIELDS,
        ],
      },
    ],
  },

  events: {
    label: "Events",
    publicPath: "/events",
    eyebrow: "Admin · Events page",
    title: "Sessions, gatherings & Zoom",
    intro: "Changes publish the moment you save.",
    sections: [
      {
        title: "Heading",
        columns: 2,
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
          { key: "sub", label: "Sub-line", type: "text" },
        ],
      },
      {
        title: "India sessions (IST)",
        columns: 2,
        fields: [
          { key: "indiaKicker", label: "Block heading", type: "text" },
          { key: "indiaNote", label: "Block note", type: "text" },
          {
            type: "list",
            key: "sessionsIndia",
            label: "Sessions",
            itemLabel: "Session",
            hint: "Times in IST; the page converts them to each visitor's local time automatically.",
            addable: true,
            addLabel: "Add session",
            newItem: { start: "06:00", end: "07:00", title: "New session", desc: "" },
            layout: "row",
            fields: [
              { key: "start", label: "Start", type: "time" },
              { key: "end", label: "End", type: "time" },
              { key: "title", label: "Title", type: "text", grow: 2 },
              { key: "desc", label: "Description", type: "text", grow: 3 },
            ],
          },
        ],
      },
      {
        title: "USA & UK sessions",
        columns: 2,
        fields: [
          { key: "abroadKicker", label: "Block heading", type: "text" },
          { key: "abroadNote", label: "Block note", type: "text" },
          {
            type: "list",
            key: "sessionsAbroad",
            label: "Sessions",
            itemLabel: "Session",
            hint: "Times are entered in the slot's own time zone.",
            addable: true,
            addLabel: "Add session",
            newItem: { start: "06:00", end: "07:00", tz: "UTC", zone: "UTC", title: "New session", desc: "" },
            layout: "row",
            fields: [
              { key: "start", label: "Start", type: "time" },
              { key: "end", label: "End", type: "time" },
              { key: "tz", label: "Time zone", type: "select", options: TIME_ZONES, grow: 2 },
              { key: "zone", label: "Label", type: "text", placeholder: "CT" },
              { key: "title", label: "Title", type: "text", grow: 2 },
              { key: "desc", label: "Description", type: "text", grow: 2 },
            ],
          },
        ],
      },
      {
        title: "YouTube & Zoom",
        columns: 2,
        fields: [
          { key: "watchLabel", label: "Watch button", type: "text" },
          { key: "watchHref", label: "Watch link", type: "url" },
          { key: "zoomTitle", label: "Zoom · title", type: "text" },
          { key: "zoomBody", label: "Zoom · body", type: "text" },
          { key: "zoomCta", label: "Zoom · button", type: "text" },
          { key: "zoomHref", label: "Zoom · link", type: "text" },
        ],
      },
      {
        title: "Upcoming gatherings",
        columns: 2,
        fields: [
          { key: "upcomingTitle", label: "Block title", type: "text" },
          { key: "upcomingEmpty", label: "Empty-state text", type: "text" },
          {
            type: "list",
            key: "upcoming",
            label: "Upcoming gatherings",
            itemLabel: "Gathering",
            addable: true,
            addLabel: "Add gathering",
            newItem: { day: "01", month: "JAN", title: "New gathering", meta: "" },
            layout: "row",
            fields: [
              { key: "day", label: "Day", type: "text", narrow: true },
              { key: "month", label: "Month", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text", grow: 2 },
              { key: "meta", label: "Details", type: "text", grow: 3 },
            ],
          },
          { type: "heading", label: "Past gatherings" },
          { key: "pastTitle", label: "Block title", type: "text" },
          { type: "spacer" },
          {
            type: "list",
            key: "past",
            label: "Past gatherings",
            itemLabel: "Gathering",
            addable: true,
            newItem: { day: "01", month: "JAN", title: "Gathering", meta: "" },
            layout: "row",
            fields: [
              { key: "day", label: "Day", type: "text", narrow: true },
              { key: "month", label: "Month", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text", grow: 2 },
              { key: "meta", label: "Details", type: "text", grow: 3 },
            ],
          },
          { key: "registerLabel", label: "Register link label", type: "text" },
          { key: "registerHref", label: "Register link", type: "text" },
        ],
      },
      {
        title: "Testimonials",
        columns: 2,
        fields: [QUOTES_LIST, ...FOOTER_FIELDS],
      },
    ],
  },
};

/** Index order (matches the public nav). */
export const SITE_CONTENT_PAGES = ["home", "about", "mission", "meditation", "wisdom", "wellness", "events"];

/** Top-level document keys a schema edits — everything else goes to the raw-JSON fallback. */
export function schemaKeys(schema) {
  const keys = new Set();
  for (const section of schema.sections) {
    for (const field of section.fields) if (field.key) keys.add(field.key);
  }
  return keys;
}
