/**
 * Live-site content (goldenagewisdom.org, extracted in CONTENT.md) — the
 * bundled fallback for every public page. CMS sections, when an admin adds
 * them, render *after* this content (see PageSections silent mode), so the
 * admin panel can extend a page without the page ever going blank.
 *
 * Long-form teaching text stays English-only on purpose (see gaw-i18n.js:
 * "a wrong word in a spiritual text is worse than an English one").
 */

export const HOME = {
  heading: "Peace begins within —\ntogether we *radiate it*\nacross the world",
  description:
    "When we transform ourselves through meditation, that peace expands into our families, communities and nations — a shared field of peace, harmony and universal consciousness. Free live meditation twice daily and ancient wisdom with scientific clarity, by Dr Hari Krishna, MD.",
  ctaLabel: "Join the movement",
  ctaHref: "join",
};

/** Subpage hero copy per view — "*text*" marks the gold italic line. */
export const HEROES = {
  about: {
    crumb: "Sahasrara · About",
    title: "Dr Hari Krishna —\n*where science meets spirit.*",
    sub: "A medical professional and spiritual teacher, Dr Hari Krishna founded the Golden Age Spiritual Movement to make meditation logical, practical and free for all — guiding a global community of seekers toward conscious living and the coming golden age.",
  },
  wisdom: {
    crumb: "Ajna · Wisdom",
    title: "Ancient clarity,\n*spoken plainly.*",
    sub: "Living Upanishads — Aham Brahmasmi and Tat Tvam Asi taught as living truths, explained with a physician's precision in Telugu, Hindi and English.",
  },
  wellness: {
    crumb: "Svadhisthana · Wellness",
    title: "The body heals\n*when you stop interfering.*",
    sub: "Five Golden Rules to a healthy and happy life — meditation, sun gazing, earthing, unprocessed food and alkaline water — and the 41-day Golden Age Detox Diet.",
  },
  practice: {
    crumb: "Muladhara · Meditation 101",
    title: "You don't do meditation.\n*You sit, and it happens.*",
    sub: "Explained simply — and scientifically. Nothing to buy, nothing to master. Sit, surrender, and let it happen to you.",
  },
  events: {
    crumb: "Vishuddha · Events",
    title: "Every evening,\n*the world sits together.*",
    sub: "Free live sessions every day of the week on YouTube and Zoom — plus retreats, satsangs and gatherings announced here first.",
  },
  mission: {
    crumb: "Manipura · Our Mission",
    title: "World peace through meditation —\n*scientifically.*",
    sub: "Eight percent of humanity in meditative space is the critical mass that tips the world into Satya Yugam. The golden age is not waited for. It is meditated into being.",
  },
};

export const ABOUT = {
  captions: ["MD, Anaesthesiology", "In reflection", "The posture"],
  strengths: [
    { glyph: "✧", title: "Education", body: "A qualified medical doctor — MD in Anaesthesiology — bringing scientific clarity from biology, psychology and physiology to every teaching." },
    { glyph: "☾", title: "25 years of meditation", body: "Over 25 years of dedicated practice and deep study of consciousness — from Anapanasati breath awareness to the science of prana and the energy body." },
    { glyph: "༄", title: "Kundalini-awakened guru", body: "A guide who has walked the path — demystifying kundalini and guiding real awakening journeys with patience, compassion and direct experience." },
  ],
  voices: [
    { text: "A doctor in a white coat heals the body; a spiritual teacher heals the soul.", name: "Manohar Gnani" },
    { text: "Spiritual knowledge + scientific knowledge + simplicity + compassion + thirst for human evolution = Dr. Hari Krishna sir", name: "Syamala Gowri" },
    { text: "He is a torch bearer to many in spirituality.", name: "Kalyani" },
    { text: "Incredibly knowledgeable — a walking encyclopedia, with answers to even the most profound spiritual questions.", name: "Kavitha Reddy" },
  ],
};

export const WISDOM = {
  verse: {
    quote: "The mind is restless, turbulent, strong and obstinate. To hold it is harder than to hold the wind.",
    source: "Bhagavad Gita · 6.34",
    commentary: "Arjuna's complaint is every beginner's. You don't hold the wind — you sit where it can't reach you. Ten minutes on the breath before the day begins is that shelter.",
  },
  heading: "Ancient truths, scientific clarity",
  cards: [
    { glyph: "𑀰", title: "Living Upanishads", body: "Aham Brahmasmi and Tat Tvam Asi taught as living truths — ancient wisdom made practical for modern minds." },
    { glyph: "⚛", title: "Science meets spirit", body: "Meditation, prana and energy explained through biology, psychology and physiology — logic and self-inquiry, never blind belief." },
    { glyph: "༄", title: "Demystifying kundalini", body: "Genuine awakening cannot be forced — it unfolds naturally through meditation, inner purification and sustained practice." },
    { glyph: "✦", title: "True markers of growth", body: "Less fear, anger and anxiety; more compassion, awareness and wisdom — real change, not mystical display." },
  ],
  voices: [
    { text: "He explains spiritual principles in a simple, logical and scientific way.", name: "Sreenivas Kumar G." },
    { text: "Incredibly knowledgeable — a walking encyclopedia, with answers to even the most profound spiritual questions.", name: "Kavitha Reddy" },
  ],
  architecture: {
    eyebrow: "The Architecture of Reality",
    title: "You are an electromagnetic broadcast",
    lead: "The heart generates a magnetic field ~100× stronger than the brain's — measurable up to 15 feet around the body. What you feel, you transmit.",
    static: { label: "Static noise · stress", chem: "cortisol · adrenaline", body: "Fear and hurry make the heart rhythm jagged and the brain scattered — an incoherent signal that broadcasts, and attracts, more static." },
    coherent: { label: "Coherence · meditation", chem: "oxytocin · DHEA", body: "A quiet heart broadcasts a smooth, organised wave. Like a tuning fork, a coherent field sets the space around it humming in sympathy." },
    principles: [
      { glyph: "◉", title: "The observer", body: "Attention collapses possibility into experience — what you steadily watch, you make real." },
      { glyph: "∞", title: "Entanglement", body: "Your field is never isolated — influence travels between hearts without physical contact." },
      { glyph: "♒", title: "Resonance", body: "A coherent field attracts matching people, opportunities and events — like answers like." },
    ],
    protocolTitle: "The Coherence Protocol · daily",
    protocol: [
      { n: "01", title: "Morning coherence", body: "Before opening your eyes: 10 minutes of slow 5-second rhythmic breathing — set the day's frequency first." },
      { n: "02", title: "Scan & interrupt", body: "Catch static in real time. On tension, breathe 5-5-7 — the longer exhale calms the nervous system out of survival mode." },
      { n: "03", title: "Feel it done", body: "The field responds to feeling, not thought — gratitude in advance broadcasts the signal of a life already fulfilled." },
    ],
  },
  youtube: "https://www.youtube.com/@GoldenAgeGurus",
};

export const WELLNESS = {
  rules: [
    { n: "1", title: "Meditation", body: "Calm the mind, connect with your soul — the foundation of all healing." },
    { n: "2", title: "Sun gazing", body: "Absorb natural sunlight — energize your body and mind." },
    { n: "3", title: "Earthing", body: "Walk barefoot on the earth — stay grounded and recharge naturally." },
    { n: "4", title: "Detox & unprocessed food", body: "Nourish your body with natural, unprocessed foods and detox regularly." },
    { n: "5", title: "Alkaline water", body: "Stay hydrated with alkaline water for better health and balance." },
  ],
  detox: [
    { label: "Satvik Diet", title: "Eat close to nature", desc: "Sattva means purity, harmony, clarity. The diet is less about restriction, more about refinement — natural, simple, minimally processed.", items: ["Fresh fruits & raw or lightly cooked vegetables", "Soaked nuts & seeds, in small amounts", "Fresh coconut — the key satvik fat", "Gentle herbs: ginger, turmeric, cumin, mint", "Avoid: processed food, refined sugar, excess oil, stimulants"] },
    { label: "16:8 Fasting", title: "16 hours of rest, 8 to nourish", desc: "Time-restricted eating gives the body a daily healing window. Choose the rhythm that fits your life and keep it.", items: ["Early window — eat 8:00 AM to 4:00 PM", "Standard window — eat 12:00 PM to 8:00 PM", "Only water during the fasting hours", "Begin with ease, not perfection — the body adapts"] },
    { label: "Smoothies", title: "Seven detox smoothies", desc: "One light smoothie breaks the fast each day — rotate through the week.", items: ["Coconut · Coconut-green · Watermelon mono", "Papaya · Cucumber-mint · Bottle gourd · Ash gourd", "2–4 ingredients max, kept thin", "No sugar, dairy or powders — drink immediately"] },
    { label: "Salad Bowl", title: "The satvik bowl formula", desc: "One vibrant bowl for the evening meal — natural colour, simple combination, clean digestion, no dressing.", items: ["Base: cucumber, carrot, beetroot, tomato, lettuce", "Add: sprouts, soaked nuts, fresh coconut", "Lift: lemon, rock salt, cumin, mint, coriander", "Skip: dressings, cheese, fried toppings"] },
    { label: "Beet Kvass", title: "A living probiotic", desc: "A simple fermented drink for the gut — the root of immunity and mood.", items: ["Beetroot + carrot sticks + mustard seeds in water", "Ferment 2–4 days in a warm place, stir daily", "Drink 100–200 ml with meals, once or twice a day", "Pause if bloated — the gut sets the pace"] },
    { label: "Daily Routine", title: "One golden day", desc: "The whole program in a single daily rhythm — repeat for 41 days, once every 6 months.", items: ["Morning — plain water, light walk (fasting)", "12 PM — break the fast with one detox smoothie", "5–7 PM — one satvik salad bowl", "8 PM — the fast begins again · water only"] },
  ],
  voices: [
    { text: "After knowing him I have not only improved my health but also my thinking towards my life.", name: "Sheela Shivraman" },
    { text: "His teachings have helped me navigate daily stress with a calm and grounded spirit.", name: "Hem" },
  ],
};

export const MEDITATION = {
  steps: [
    { n: "I", title: "Sit cross-legged, hands joined or at rest", body: "Any comfortable seat will do — floor or chair. Cross the legs and rest the palms open on the knees, or join the hands in the lap; either closes the circuit. Keep the spine easy and upright." },
    { n: "II", title: "Close the eyes", body: "Nothing to look at. The world can wait an hour." },
    { n: "III", title: "Watch the breath", body: "Don't control it. Just notice it arriving and leaving." },
    { n: "IV", title: "Let the thoughts flow", body: "They are traffic, not enemies. Watching them is the practice." },
    { n: "V", title: "Surrender and observe", body: "Surrender means: I am nothing. Let the universe — nature, God, whichever word is yours — deal with it. Stop trying to meditate and allow it to happen to you." },
  ],
  quick: [
    { label: "Best time", answer: "Sunrise", detail: "Brahmamuhurtham is finest — but no hour is forbidden. The one you keep is the right one." },
    { label: "How long", answer: "It happens, you don't do it", detail: "Beginners: start with 30 minutes, or an hour if it comes easily. Some sit 1–2 hours; some drop deep in minutes. Comparison is a thief of joy." },
    { label: "The goal", answer: "There isn't one", detail: "Keep sitting. Life reorders itself — physically, emotionally, spiritually. Try it and watch." },
  ],
  science: {
    title: "The field closes into a torus around you",
    body: "Sit still with the legs crossed — palms open on the knees, or the hands joined in the lap — and the body's field closes on itself: lines of energy leave the crown, arc wide around you, and return through the base of the spine — the same shape a magnet draws in iron filings. Inside that loop the work is not yours to do. Healing settles, energy rises, the chakras open in their own order. You only have to stop interfering.",
  },
  recommends: {
    title: "Simply sit and watch the breath",
    body: "No technique to learn, no counting, no force — and by far the most efficient way. Surrender, and let whichever breath wants to happen, happen by itself.",
    techniques: ["Soham", "Kundalini breathing", "Anapanasati", "Kumbhaka", "Bhramari"],
    note: "Some use these as a catalyst into a deeper state. They are optional — the sitting is not.",
    body2: "Most disease sits at the mitochondrial level. Restored prana reaches the cell and heals upward — cellular, bodily, psychic, emotional.",
  },
  deep: [
    { glyph: "༄", title: "What kundalini is", body: "An infinite energy that rises and aligns every chakra, moving like a serpent — cleansing the nadis, healing at each level. Scientifically: cosmic energy raising your frequency once you are connected. Emotionally: fear, shame and guilt giving way to bliss." },
    { glyph: "✦", title: "Karmas, visions, openings", body: "Third-eye visions, past-life glimpses, awakenings — all part of the terrain. They come and they go. The real beauty is transformation: wisdom that stays after the vision fades." },
    { glyph: "◎", title: "Where the energy comes from", body: "Some use a pyramid as a conductor. Some sit in groups, where consciousness pools higher. Some connect straight to the universe and give energy away like transformers. Guided meditation is another door." },
    { glyph: "☀", title: "The ultimate truth", body: "It depends on what you seek — joy for one, wisdom for another, self-discovery for the next. Come to know yourself through your own journey. See you on the other side, friend." },
  ],
  stages: [
    { n: "I", title: "Enter true silence", body: "Meditation settles the restless mind until you rest in deep, natural silence — the ground of all healing." },
    { n: "II", title: "Soften the breath", body: "As stillness deepens, prana refines and the gap between breaths widens — the body needs less, receives more." },
    { n: "III", title: "Receive from the crown", body: "In deep absorption, prana is drawn directly through the sahasrara — the thousand-petaled crown — nourishing body and spirit." },
    { n: "IV", title: "Awaken kundalini", body: "The dormant energy rises, and you meet the universe as yourself — oneness, stillness, boundless peace." },
  ],
  voices: [
    { text: "My thoughts really changed after listening to Hari sir — and I started doing meditation.", name: "Vamshi" },
    { text: "Now I know what inner peace is, and how to attain it.", name: "Jyothi Gunda" },
  ],
};

/** Daily sessions, IST. `h`/`m` are 24-hour start times; `dur` in minutes. */
export const EVENTS = {
  sessions: [
    { h: 4, m: 10, dur: 60, title: "Brahmamuhurtham meditation", desc: "The sacred pre-dawn hour — deepest stillness." },
    { h: 20, m: 0, dur: 30, title: "Online meditation", desc: "Live guided group meditation." },
    { h: 20, m: 30, dur: 30, title: "The world sits together", desc: "One mass meditation for world peace — thousands in one silence. Same room, stay on.", peace: true },
    { h: 21, m: 0, dur: 60, title: "Wisdom session · Dr Hari", desc: "Knowledge, living Upanishads and open Q&A." },
  ],
  youtube: "https://www.youtube.com/@goldenagegurus/streams",
  gatherings: [
    {
      title: "Awakening Hyderabad",
      day: "26", month: "Jul", year: "2026",
      time: "11 AM – 6 PM",
      meta: "Awaken the inner wisdom · live with purpose & peace — a full day with Dr Harikrishna Garu, founder of the movement.",
      place: "9 Convention, Sanath Nagar, Hyderabad · parking limited — carpool",
      contact: "info@goldenagewisdom.org",
      ends: Date.UTC(2026, 6, 26, 12, 30), // 18:00 IST
    },
  ],
  empty: "No gatherings on the calendar right now — the free live sessions run every day. New retreats and satsangs are announced here first.",
  voices: [
    { text: "I have attended a few of his sessions — fantastic, and free of cost.", name: "Swathi G" },
    { text: "The Golden Age movement will definitely attract more youth towards meditation.", name: "Aruna Chatla" },
  ],
};

export const MISSION = {
  intro: "In the ancient yuga cycle, time turns through four great ages. We live at the far edge of Kali — the age of conflict and restlessness — and every tradition that tells this story agrees on what comes next: Satya Yugam, the age of truth. A world where harmony is the norm, not the exception.",
  yugas: [
    { name: "Satya", tag: "the Golden Age — truth, harmony, meditation as the natural state", now: true },
    { name: "Treta", tag: "the Silver Age — virtue begins to wane" },
    { name: "Dvapara", tag: "the Bronze Age — balance tips toward unrest" },
    { name: "Kali", tag: "the dark age of conflict — where we rise from, together" },
  ],
  science: "Science gives us the mechanism: when enough minds settle into stillness, the collective field shifts — calm spreads the way fear does, person to person. The golden age is not waited for. It is meditated into being.",
  goal: { pct: "8%", label: "of humanity in meditative space", note: "Every lit dot is a meditator · be the next one." },
  litDots: [7, 19, 26, 38, 51, 64, 77, 90],
  evidence: [
    { year: "1960", title: "A testable claim", body: "Maharishi predicted that if one percent of a population meditated, the whole population would feel it." },
    { year: "1976", title: "One percent, and the crime rate bent", body: "Cities past that line showed crime around 16% lower. The pattern was named the Maharishi Effect." },
    { year: "1993", title: "Four thousand people, eight weeks", body: "4,000 meditators in Washington DC; protocol pre-approved by 27 independent scientists and police. Violent crime fell 23.3%." },
    { year: "Goal", title: "Not one percent. Eight.", body: "Eight percent of humanity in daily silence — where a golden age becomes ordinary weather." },
  ],
};
