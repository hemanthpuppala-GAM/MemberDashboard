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
    title: "Everything on the home page",
    intro: "Changes publish to the home page the moment you save.",
    sections: [
      {
        title: "Header & menu",
        description: "Top bar links, the join button and the volunteer hover card.",
        columns: 2,
        fields: [
          { key: "supportLabel", label: "Member support link", type: "text" },
          { key: "volunteerNavLabel", label: "Volunteer link", type: "text" },
          { key: "privacyLabel", label: "Privacy link", type: "text" },
          { key: "joinLabel", label: "Join button", type: "text" },
          { key: "joinShortLabel", label: "Join button (phone)", type: "text" },
          { key: "volunteerHintTitle", label: "Volunteer hover · title", type: "text" },
          { key: "volunteerHint", label: "Volunteer hover · text", type: "textarea", rows: 3, wide: true },
          { key: "qrEyebrow", label: "QR badge · eyebrow", type: "text" },
          { key: "qrSub", label: "QR badge · sub-line", type: "text" },
        ],
      },
      {
        title: "Hero",
        description: "The headline, intro and the watch-the-intro link.",
        columns: 2,
        fields: [
          { key: "headline", label: "Headline", type: "text" },
          { key: "headlineAccent", label: "Headline accent (italic)", type: "text" },
          { key: "subline", label: "Intro line", type: "textarea", rows: 3, wide: true },
          { key: "watchLabel", label: "Watch the intro · link", type: "text" },
          { key: "filmSrc", label: "Intro film · video URL (mp4)", type: "text", placeholder: "assets/peace-film.mp4" },
        ],
      },
      {
        title: "Guruji's photo",
        fields: [
          { key: "heroImage", label: "Photo (Dr Hari Krishna)", type: "image", fallback: "assets/hari-stream-forest.png" },
          { key: "heroCaption", label: "Name on the photo", type: "text" },
        ],
      },
      {
        title: "Bodhi tree chapters",
        description: "The six leaves on the tree and the caption under it. Reflect's title is the rotating question below.",
        fields: [
          {
            type: "list",
            key: "chapters",
            itemLabel: (c) => c.label || "Chapter",
            layout: "cards",
            fields: [
              { key: "label", label: "Leaf label", type: "text" },
              { key: "kicker", label: "Caption · kicker", type: "text" },
              { key: "title", label: "Caption · title (Reflect: leave empty)", type: "text" },
              { key: "cta", label: "Caption · link", type: "text" },
            ],
          },
        ],
      },
      {
        title: "Rituals chapter",
        description: "The three ritual cards (Mind, Body, Self).",
        fields: [
          {
            type: "list",
            key: "rituals",
            itemLabel: (r) => r.title || "Ritual",
            layout: "cards",
            fields: [
              { key: "kicker", label: "Kicker", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Text", type: "textarea", rows: 3 },
              { key: "cta", label: "Link", type: "text" },
            ],
          },
        ],
      },
      {
        title: "Daily pause chapter",
        description: "The three steps of the 30-minute sit.",
        fields: [
          {
            type: "list",
            key: "pauseSteps",
            itemLabel: (s) => s.title || "Step",
            layout: "cards",
            fields: [
              { key: "min", label: "Minutes", type: "text", narrow: true },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Text", type: "textarea", rows: 2 },
            ],
          },
        ],
      },
      {
        title: "Nourish chapter",
        description: "The three mindful-eating tips.",
        fields: [
          {
            type: "list",
            key: "eatingTips",
            itemLabel: (t) => t.lead || "Tip",
            layout: "cards",
            fields: [
              { key: "lead", label: "Lead (bold)", type: "text" },
              { key: "text", label: "Text", type: "textarea", rows: 2 },
            ],
          },
        ],
      },
      {
        title: "Reflect questions",
        description: "Shown one at a time under the tree and in the Reflect chapter.",
        fields: [{ key: "questions", label: "One question per line", type: "lines", rows: 6 }],
      },
      {
        title: "New here? — FAQs",
        fields: [
          {
            type: "list",
            key: "faqs",
            itemLabel: (f) => f.q || "Question",
            addable: true,
            newItem: { q: "", a: "" },
            layout: "cards",
            fields: [
              { key: "q", label: "Question", type: "text" },
              { key: "a", label: "Answer", type: "textarea", rows: 3 },
            ],
          },
        ],
      },
      {
        title: "Cards beside the tree",
        description: "Upcoming card (shows the next Live Session when there is one), the members-say card, and the Quote of the day card (posters are uploaded in CMS → Quote of the day; with none, it shows Watch the intro).",
        columns: 2,
        fields: [
          { key: "eventKicker", label: "Upcoming · kicker", type: "text" },
          { key: "eventTitle", label: "Upcoming · title (no session scheduled)", type: "text" },
          { key: "eventSub", label: "Upcoming · details (no session scheduled)", type: "text", wide: true },
          { key: "eventCta", label: "Upcoming · link label", type: "text" },
          { key: "eventHref", label: "Upcoming · link", type: "text" },
          { key: "testiKicker", label: "Members say · kicker", type: "text" },
          { key: "testiCta", label: "Members say · link label", type: "text" },
          { key: "storiesCta", label: "Video stories · button (shown when Testimonials have videos)", type: "text" },
          { key: "storiesRailTitle", label: "Video stories · title over the faces on phones", type: "text" },
          { key: "quoteKicker", label: "Quote of the day · kicker", type: "text" },
          { key: "quoteCta", label: "Quote of the day · link label", type: "text" },
        ],
      },
      {
        title: "Sits around the world",
        fields: [{ key: "sitsTitle", label: "Title", type: "text" }],
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
        title: "Chapter names (the tabs)",
        description: "The page is shown in chapters. Leave empty for the standard names, or list your own in order, separated by commas: His story, What he brings, What members say. A chapter with no content is hidden.",
        fields: [{ key: "chapterNames", label: "Chapter names", type: "text" }],
      },
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
          { key: "intro", label: "Intro", type: "textarea", rows: 8, wide: true, hint: "Leave a blank line between paragraphs." },
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
    title: "Mission story & closing line",
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
        fields: [
          { key: "intro1", label: "Paragraph 1 (lead, shown larger)", type: "textarea", rows: 5 },
          { key: "intro2", label: "Paragraph 2", type: "textarea", rows: 4 },
          { key: "intro3", label: "Paragraph 3", type: "textarea", rows: 4 },
        ],
      },
      {
        title: "Closing card",
        columns: 2,
        fields: [
          { key: "closing", label: "Closing line", type: "textarea", rows: 2, wide: true },
          { key: "dotsCaption", label: "Dots caption", type: "text", wide: true },
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
        title: "Chapter names (the tabs)",
        description: "The page is shown in chapters. Leave empty for the standard names, or list your own in order, separated by commas: How to sit, Quick answers, Short clips, The science, Practices, Your path. A chapter with no content is hidden.",
        fields: [{ key: "chapterNames", label: "Chapter names", type: "text" }],
      },
      {
        title: "Short clips (YouTube Shorts)",
        description:
          "Every Short on the channel, newest first, then one row per topic below. Each topic is a playlist you keep on YouTube (YouTube Studio → Playlists): paste its link here and the row follows the playlist. Rows refresh once a day; hidden if YouTube can't be read. Every clip offers Like & comment, Subscribe and the full video on YouTube.",
        columns: 2,
        fields: [
          { key: "clipsTitle", label: "Title", type: "text" },
          { key: "clipsIntro", label: "Intro", type: "textarea", rows: 2, wide: true },
          {
            type: "list",
            key: "clipsTopics",
            label: "Topic rows (YouTube playlists)",
            wide: true,
            addable: true,
            addLabel: "Add topic",
            newItem: { title: "", playlist: "" },
            itemLabel: (t) => t.title || "Topic",
            layout: "row",
            fields: [
              { key: "title", label: "Row title", type: "text", grow: 2 },
              { key: "playlist", label: "Playlist link", type: "text", grow: 4, placeholder: "https://www.youtube.com/playlist?list=PL…" },
            ],
          },
        ],
      },
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
              { key: "label", label: "Small label (optional)", type: "text" },
              { key: "answer", label: "Heading", type: "text" },
              { key: "detail", label: "Text", type: "textarea", rows: 6 },
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
          { key: "scienceBody", label: "Science · body", type: "textarea", rows: 10, wide: true, hint: "Leave a blank line between paragraphs." },
          { key: "scienceClose", label: "Science · closing line", type: "text", wide: true },
          { key: "recKicker", label: "Recommends · kicker", type: "text" },
          { key: "recTitle", label: "Recommends · title", type: "text" },
          { key: "recBody", label: "Recommends · body", type: "textarea", rows: 4, wide: true },
          { key: "techKicker", label: "Practices · heading", type: "text" },
          { key: "techIntro", label: "Practices · intro", type: "text" },
          {
            type: "list",
            key: "techniques",
            label: "Practices",
            itemLabel: (t) => (typeof t === "string" ? t : t?.name) || "Practice",
            addable: true,
            newItem: { name: "", desc: "" },
            layout: "row",
            wide: true,
            fields: [
              { key: "name", label: "Name", type: "text" },
              { key: "desc", label: "Description", type: "text", grow: 3 },
            ],
          },
          { key: "techNote", label: "Practices · note", type: "textarea", rows: 3, wide: true },
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
              { key: "body", label: "Body", type: "textarea", rows: 6 },
            ],
          },
          { key: "deepClose", label: "Seasoned · closing line", type: "text", wide: true },
          { key: "cta", label: "Button label", type: "text" },
          { key: "ctaHref", label: "Button link", type: "text" },
          { key: "watchHref", label: "Footer · Watch live link", type: "url" },
          ...FOOTER_FIELDS,
        ],
      },
    ],
  },

  wisdom: {
    label: "Wisdom",
    publicPath: "/wisdom",
    eyebrow: "Admin · Wisdom page",
    title: "Intro, cards, the living river, the Wisdom Library & quotes",
    intro: "Changes publish the moment you save.",
    sections: [
      {
        title: "Heading",
        columns: 3,
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
          { key: "intro", label: "Intro", type: "textarea", rows: 5, wide: true },
        ],
      },
      {
        title: "Chapters (the tabs under the heading)",
        description: "The page is shown in four chapters. A chapter with no content is hidden.",
        columns: 4,
        fields: [
          { key: "chapterOverview", label: "I · cards & Library", type: "text" },
          { key: "chapterRiver", label: "II · the living river", type: "text" },
          { key: "chapterGhats", label: "III · ghats", type: "text" },
          { key: "chapterTruth", label: "IV · closing & quotes", type: "text" },
        ],
      },
      {
        title: "Wisdom cards",
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
        title: "One living river — heading & story",
        columns: 3,
        fields: [
          { key: "riverKicker", label: "Kicker", type: "text" },
          { key: "riverTitle", label: "Title", type: "text" },
          { key: "riverTitleAccent", label: "Title accent (italic)", type: "text" },
          { key: "riverStory", label: "Opening story", type: "textarea", rows: 3, wide: true },
          { key: "riverIntro", label: "Intro", type: "textarea", rows: 4, wide: true },
        ],
      },
      {
        title: "The two questions",
        fields: [
          {
            type: "list",
            key: "questions",
            itemLabel: (q) => q.title || "Question",
            layout: "cards",
            fields: [
              { key: "label", label: "Sanskrit name", type: "text" },
              { key: "title", label: "Question", type: "text" },
              { key: "body", label: "Body", type: "textarea", rows: 3 },
            ],
          },
          { key: "questionsNote", label: "Line under the questions", type: "text" },
        ],
      },
      {
        title: "River stages (Vedas → Puranas)",
        fields: [
          {
            type: "list",
            key: "stages",
            itemLabel: (st) => st.name || "Stage",
            layout: "cards",
            fields: [
              { key: "place", label: "Place on the river", type: "text" },
              { key: "name", label: "Name", type: "text" },
              { key: "alias", label: "Meaning (italic)", type: "text" },
              { key: "body", label: "Body", type: "textarea", rows: 4 },
              { key: "tryThis", label: "Try this (a small practice)", type: "textarea", rows: 2 },
              { key: "verse", label: "Verse (transliterated)", type: "text" },
              { key: "meaning", label: "Verse meaning", type: "text" },
              { key: "ref", label: "Verse source", type: "text" },
            ],
          },
          { key: "riverEnd", label: "Where the river ends (closing line)", type: "textarea", rows: 2 },
        ],
      },
      {
        title: "Many ghats, one water",
        fields: [
          { key: "ghatsKicker", label: "Kicker", type: "text" },
          { key: "ghatsTitle", label: "Title", type: "text" },
          { key: "ghatsIntro", label: "Intro", type: "textarea", rows: 2 },
          {
            type: "list",
            key: "ghats",
            itemLabel: (g) => g.who || "Ghat",
            layout: "cards",
            fields: [
              { key: "who", label: "Who", type: "text" },
              { key: "text", label: "Text", type: "textarea", rows: 2 },
              { key: "verse", label: "Verse (optional)", type: "text" },
              { key: "meaning", label: "Verse meaning", type: "text" },
            ],
          },
        ],
      },
      {
        title: "Closing verse & source",
        columns: 2,
        fields: [
          { key: "closingVerse", label: "Verse", type: "text" },
          { key: "closingMeaning", label: "Meaning", type: "text" },
          { key: "closingRef", label: "Source", type: "text" },
          { key: "closingBody", label: "Closing paragraph", type: "textarea", rows: 4, wide: true },
          { key: "sourceNote", label: "Source note", type: "textarea", rows: 2, wide: true },
          { key: "bookLabel", label: "Book link label", type: "text" },
          { key: "bookHref", label: "Book link (leave empty to hide)", type: "text" },
        ],
      },
      {
        title: "The Golden Age Wisdom Library",
        columns: 2,
        fields: [
          { key: "libraryKicker", label: "Kicker", type: "text" },
          { key: "libraryTitle", label: "Title", type: "text" },
          { key: "libraryBody", label: "Body", type: "textarea", rows: 5, wide: true },
          { key: "libraryClose", label: "Closing line", type: "text" },
          { key: "libraryCloseSub", label: "Closing sub-line", type: "text" },
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
        title: "Chapter names (the tabs)",
        description: "The page is shown in chapters. Leave empty for the standard names, or list your own in order, separated by commas: Feel better, 8 simple rules, Detox plan. A chapter with no content is hidden.",
        fields: [{ key: "chapterNames", label: "Chapter names", type: "text" }],
      },
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
        title: "Chapter names (the tabs)",
        description: "The page is shown in chapters. Leave empty for the standard names, or list your own in order, separated by commas: Daily sits, Upcoming gatherings, Past gatherings. A chapter with no content is hidden.",
        fields: [{ key: "chapterNames", label: "Chapter names", type: "text" }],
      },
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
  volunteer: {
    label: "Volunteer",
    publicPath: "/volunteer",
    eyebrow: "Admin · Volunteer page",
    title: "The seva sign-up page",
    intro: "Changes publish the moment you save. Which teams appear (and their order) is set in Volunteers → Categories; the wording for each team is here.",
    sections: [
      {
        title: "Heading",
        columns: 3,
        fields: [
          { key: "kicker", label: "Eyebrow", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
          { key: "intro", label: "Intro", type: "textarea", rows: 3, wide: true },
        ],
      },
      {
        title: "Teams",
        description: "One card per team. The id must match the team's slug in Volunteers → Categories.",
        fields: [
          { key: "serveLabel", label: "Section label", type: "text" },
          { key: "serveHint", label: "Hint under the label", type: "text" },
          {
            type: "list",
            key: "teams",
            itemLabel: (t) => t.title || t.id || "Team",
            addable: true,
            newItem: { id: "", glyph: "✦", title: "", desc: "" },
            layout: "cards",
            fields: [
              { key: "id", label: "Slug (id)", type: "text" },
              { key: "glyph", label: "Symbol", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "desc", label: "Description", type: "textarea", rows: 2 },
            ],
          },
        ],
      },
      {
        title: "Form",
        columns: 2,
        fields: [
          { key: "aboutLabel", label: "\"About you\" label", type: "text" },
          { key: "nameLabel", label: "Name · label", type: "text" },
          { key: "namePlaceholder", label: "Name · placeholder", type: "text" },
          { key: "emailLabel", label: "Email · label", type: "text" },
          { key: "phoneLabel", label: "Phone · label", type: "text" },
          { key: "phonePlaceholder", label: "Phone · placeholder", type: "text" },
          { key: "cityLabel", label: "City · label", type: "text" },
          { key: "cityPlaceholder", label: "City · placeholder", type: "text" },
          { key: "availLabel", label: "Time question", type: "text" },
          { key: "noteLabel", label: "Note · label", type: "text" },
          { key: "notePlaceholder", label: "Note · placeholder", type: "textarea", rows: 2, wide: true },
          { key: "submitLabel", label: "Submit button", type: "text" },
        ],
      },
      {
        title: "Side cards & thank-you",
        columns: 2,
        fields: [
          { key: "nextLabel", label: "\"What happens next\" title", type: "text" },
          { key: "steps", label: "Steps (one per line)", type: "lines", wide: true },
          { key: "smallTitle", label: "Dark card · title", type: "text" },
          { key: "smallBody", label: "Dark card · text", type: "textarea", rows: 3 },
          { key: "writeLabel", label: "Email line · lead-in", type: "text" },
          { key: "sentTitle", label: "Thank-you · title", type: "text" },
          { key: "sentBody", label: "Thank-you · text", type: "text" },
        ],
      },
      { title: "Footer", columns: 2, fields: FOOTER_FIELDS },
    ],
  },
  donate: {
    label: "Donate",
    publicPath: "/donate",
    eyebrow: "Admin · Donate page",
    title: "The ways-to-give page",
    intro: "The payment methods themselves (UPI, bank, QR) are managed in CMS → Donations. The words around them are here.",
    sections: [
      {
        title: "Heading",
        columns: 3,
        fields: [
          { key: "kicker", label: "Eyebrow", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "titleAccent", label: "Title accent (italic)", type: "text" },
          { key: "intro", label: "Intro", type: "textarea", rows: 3, wide: true },
        ],
      },
      {
        title: "Notes under the methods",
        description: "The WhatsApp number or email is added automatically between the lead-in and the rest.",
        columns: 2,
        fields: [
          { key: "emptyLead", label: "No methods yet · lead-in", type: "textarea", rows: 2 },
          { key: "emptyTail", label: "No methods yet · ending", type: "text" },
          { key: "questionsLead", label: "Questions · lead-in", type: "text" },
          { key: "noGiveLead", label: "Not giving · lead-in", type: "textarea", rows: 2 },
          { key: "sevaLabel", label: "Seva link text", type: "text" },
        ],
      },
      { title: "Footer", columns: 2, fields: FOOTER_FIELDS },
    ],
  },
};

/** Index order (matches the public nav). */
export const SITE_CONTENT_PAGES = ["home", "about", "mission", "meditation", "wisdom", "wellness", "events", "volunteer", "donate"];

/** Top-level document keys a schema edits — everything else goes to the raw-JSON fallback. */
export function schemaKeys(schema) {
  const keys = new Set();
  for (const section of schema.sections) {
    for (const field of section.fields) if (field.key) keys.add(field.key);
  }
  return keys;
}

/** CMS page slug ↔ copy-editor page (the built-in "meditate" CMS page is the /meditation site page). */
export const COPY_PAGE_BY_SLUG = { home: "home", about: "about", mission: "mission", meditate: "meditation", wisdom: "wisdom", wellness: "wellness", events: "events", volunteer: "volunteer", donate: "donate" };
export const SLUG_BY_COPY_PAGE = Object.fromEntries(Object.entries(COPY_PAGE_BY_SLUG).map(([slug, page]) => [page, slug]));
