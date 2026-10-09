/** Fixed copy for the Home chapters (design statics: HASHES, QUESTIONS, FAQS, chapterData). */

export const CHAPTER_HASHES = ["rituals", "daily-pause", "nourish", "one-minute", "reflect", "new-here"];

export const QUESTIONS = [
  "What makes you feel most like yourself?",
  "What are you ready to let go of?",
  "When did you last feel truly rested?",
  "Who would you be without the hurry?",
  "What restores you — and how often do you allow it?",
];

export const FAQS = [
  { q: "Do I need meditation experience?", a: "No. Every sit is guided from the first breath. Beginners and long-time practitioners sit together." },
  { q: "Is the daily program really free?", a: "Yes — always. There is no fee, no upsell and no membership wall. We ask for nothing but a better world." },
  { q: "What if my mind keeps wandering?", a: "That is the practice. Noticing the wander and gently returning is the whole exercise — not a failure of it." },
  { q: "Do I have to attend every day?", a: "Come when you can. Daily is the invitation, not a rule; 41 consecutive days is simply where most people notice the change." },
];

export function chapterData(question) {
  return [
    { label: "Rituals", kicker: "Small rituals", title: "Feeling better begins with being present.", cta: "Open Rituals" },
    { label: "Daily pause", kicker: "Your daily pause", title: "30 minutes. Every day. Just for you.", cta: "Open Daily pause" },
    { label: "Nourish", kicker: "Nourish your body", title: "Eat well. Slow down. Savor life.", cta: "Open Nourish" },
    { label: "One minute", kicker: "A moment, right here", title: "Your next breath is a new beginning.", cta: "Start a one-minute pause" },
    { label: "Reflect", kicker: "Meet yourself with curiosity", title: question, cta: "Take a moment to reflect" },
    { label: "New here?", kicker: "A few things to know", title: "New here? You’re welcome.", cta: "Open New here?" },
  ];
}
