export type Accent = "blue" | "amber" | "mint" | "violet";

export const accentText: Record<Accent, string> = {
  blue: "text-primary",
  amber: "text-amber",
  mint: "text-mint",
  violet: "text-violet",
};

export const accentBg: Record<Accent, string> = {
  blue: "bg-primary",
  amber: "bg-amber",
  mint: "bg-mint",
  violet: "bg-violet",
};

export const accentSoftBg: Record<Accent, string> = {
  blue: "bg-blue-50",
  amber: "bg-amber-50",
  mint: "bg-emerald-50",
  violet: "bg-purple-50",
};

/* ------------------------------------------------------------------ */
/* One fictional recording, many outputs — powers the OutputMorph      */
/* ------------------------------------------------------------------ */

export type OutputLine =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "bullet"; text: string }
  | { type: "check"; text: string; done?: boolean };

export type OutputSample = {
  id: string;
  label: string;
  accent: Accent;
  docTitle: string;
  lines: OutputLine[];
};

export const outputSamples: OutputSample[] = [
  {
    id: "meeting_minutes",
    label: "Meeting Minutes",
    accent: "blue",
    docTitle: "Onboarding Revamp — Kickoff",
    lines: [
      { type: "heading", text: "Attendees" },
      { type: "para", text: "Aarav, Meera, Dev, Sana — 24 min call" },
      { type: "heading", text: "Decisions" },
      { type: "bullet", text: "Ship the new 3-step onboarding by March 14" },
      { type: "bullet", text: "Drop email verification from the first run" },
      { type: "bullet", text: "Meera owns the welcome screen redesign" },
      { type: "heading", text: "Open questions" },
      { type: "bullet", text: "Do we A/B test the skip button placement?" },
    ],
  },
  {
    id: "action_items",
    label: "Action Items",
    accent: "mint",
    docTitle: "Next steps",
    lines: [
      { type: "check", text: "Meera — welcome screen mockups by Friday", done: true },
      { type: "check", text: "Dev — remove email gate behind a flag" },
      { type: "check", text: "Sana — draft copy for the 3 new steps" },
      { type: "check", text: "Aarav — book usability sessions next week" },
      { type: "check", text: "All — review funnel numbers before Thursday" },
    ],
  },
  {
    id: "email_draft",
    label: "Email Draft",
    accent: "violet",
    docTitle: "To: leadership@company.com",
    lines: [
      { type: "para", text: "Subject: Onboarding revamp — kickoff summary" },
      { type: "para", text: "Hi all," },
      {
        type: "para",
        text: "We kicked off the onboarding revamp today. The team aligned on a 3-step flow shipping March 14, with email verification moved out of the first run.",
      },
      {
        type: "para",
        text: "Meera is leading design, Dev has the engineering plan, and usability sessions start next week. Full notes attached.",
      },
      { type: "para", text: "— Aarav" },
    ],
  },
  {
    id: "linkedin_post",
    label: "LinkedIn Post",
    accent: "blue",
    docTitle: "Draft post",
    lines: [
      {
        type: "para",
        text: "We just rebuilt our onboarding for the third time. Here's what finally worked:",
      },
      { type: "bullet", text: "Cut sign-up friction before adding features" },
      { type: "bullet", text: "Three steps. Not seven. Three." },
      { type: "bullet", text: "Let users feel value before asking for anything" },
      {
        type: "para",
        text: "Shipping March 14. I'll share the funnel numbers once we have them. 📈",
      },
    ],
  },
  {
    id: "video_script",
    label: "Video Script",
    accent: "amber",
    docTitle: "60-second script",
    lines: [
      { type: "heading", text: "Hook (0-5s)" },
      { type: "para", text: "\"Most apps lose half their users at sign-up. We did too.\"" },
      { type: "heading", text: "Body (5-45s)" },
      {
        type: "para",
        text: "Walk through the old 7-step flow, then reveal the new 3-step version. Cut to the funnel chart.",
      },
      { type: "heading", text: "CTA (45-60s)" },
      { type: "para", text: "\"Follow along — results drop March 14.\"" },
    ],
  },
  {
    id: "summary",
    label: "Summary",
    accent: "violet",
    docTitle: "TL;DR",
    lines: [
      {
        type: "para",
        text: "The team kicked off a revamp of the product onboarding, replacing the current 7-step flow with a 3-step version that defers email verification.",
      },
      {
        type: "para",
        text: "Design and engineering owners are assigned, usability testing begins next week, and launch is set for March 14.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* The 16 real rewrite formats, as shipped in the app                  */
/* ------------------------------------------------------------------ */

export const rewriteFormats: { category: string; formats: string[] }[] = [
  {
    category: "Core Productivity",
    formats: ["Quick List", "Meeting Notes", "To-do List"],
  },
  {
    category: "Work & Collaboration",
    formats: [
      "Daily Standup",
      "Feature Discussion",
      "User Interview Summary",
      "Delegation Note",
    ],
  },
  {
    category: "Professional Writing",
    formats: ["Email — Casual", "Email — Formal"],
  },
  {
    category: "Creator",
    formats: [
      "X Post",
      "X Thread",
      "Short Video Script",
      "LinkedIn Post",
      "Content Outline",
    ],
  },
  {
    category: "Learning & Research",
    formats: ["Lecture Summary"],
  },
  {
    category: "Journaling & Personal",
    formats: ["Daily Journal Entry"],
  },
];

/* ------------------------------------------------------------------ */
/* Use-case tabs (merged sections 4 + 5 of the copy)                   */
/* ------------------------------------------------------------------ */

export type UseCase = {
  id: string;
  tab: string;
  emojiLabel: string;
  headline: string;
  body: string;
  perfectFor: string[];
  outputs: string[];
  accent: Accent;
};

export const useCases: UseCase[] = [
  {
    id: "work",
    tab: "Meetings & Work",
    emojiLabel: "💼",
    headline: "Stay present in every discussion.",
    body: "Stop splitting your attention between the conversation and your notes. SVAR captures everything so you can actually participate.",
    perfectFor: [
      "Team Meetings",
      "Client Calls",
      "Interviews",
      "Workshops",
      "Standups",
      "Brainstorms",
    ],
    outputs: ["Meeting Minutes", "Action Items", "Follow-up Emails", "Project Updates"],
    accent: "blue",
  },
  {
    id: "content",
    tab: "Content Creation",
    emojiLabel: "✍️",
    headline: "Capture ideas the moment they arrive.",
    body: "Talk through your next post on a walk. By the time you're back, it's a draft ready to publish.",
    perfectFor: [
      "LinkedIn Posts",
      "Blogs",
      "Video Scripts",
      "Podcast Ideas",
      "Content Planning",
    ],
    outputs: ["Drafts", "Outlines", "Scripts", "Social Posts"],
    accent: "amber",
  },
  {
    id: "learning",
    tab: "Learning & Research",
    emojiLabel: "🎓",
    headline: "Focus on listening, not scribbling.",
    body: "Record the lecture, stay engaged with the material, and walk away with structured notes you didn't have to write.",
    perfectFor: [
      "Lectures",
      "Online Courses",
      "Workshops",
      "Interviews",
      "Research Discussions",
    ],
    outputs: ["Lecture Notes", "Summaries", "Key Takeaways", "Revision Notes"],
    accent: "mint",
  },
  {
    id: "personal",
    tab: "Personal Thinking",
    emojiLabel: "💡",
    headline: "Ideas don't wait until you're at a desk.",
    body: "Capture them wherever they happen — walking, driving, or at 2am — and let SVAR turn the rambling into something readable.",
    perfectFor: [
      "Voice Journaling",
      "Daily Planning",
      "Brain Dumps",
      "Random Ideas",
      "Reflections",
    ],
    outputs: ["Journal Entries", "Thought Logs", "Daily Plans", "Personal Notes"],
    accent: "violet",
  },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faqs: { q: string; a: string }[] = [
  {
    q: "How accurate is the transcription?",
    a: "SVAR uses state-of-the-art speech models with support for 100+ languages, mixed-language speech and speaker-separated transcripts. Accuracy is strongest with clear audio, and you can always edit the transcript directly.",
  },
  {
    q: "Which languages are supported?",
    a: "Over 100 languages, including mixed-language conversations — for example, switching between English and Hindi mid-sentence works fine. Your outputs can be generated in the language you choose.",
  },
  {
    q: "Does it work offline?",
    a: "You can record fully offline — your audio is saved safely on your device. Transcription and AI outputs are generated the moment you're back online.",
  },
  {
    q: "Is my data private?",
    a: "Your recordings and notes belong to you. Audio is processed only to produce your transcripts and outputs, everything syncs over encrypted connections, and you can delete your data at any time.",
  },
  {
    q: "What does early access include?",
    a: "Early access members get the full SVAR experience on mobile and web — recording, transcription, summaries and all 16 rewrite formats — plus a direct line to the team to shape what we build next.",
  },
  {
    q: "Can I use SVAR on my computer?",
    a: "Yes — SVAR works on mobile and on the web, and your notes stay in sync across devices.",
  },
];

/* ------------------------------------------------------------------ */
/* Roadmap                                                             */
/* ------------------------------------------------------------------ */

export const roadmap: { title: string; desc: string }[] = [
  {
    title: "WhatsApp bot",
    desc: "Send a voice note to SVAR on WhatsApp, get notes back in the chat.",
  },
  {
    title: "Home screen widget",
    desc: "Start recording without even opening the app.",
  },
  {
    title: "Import existing audio",
    desc: "Bring in voice memos and recordings you already have.",
  },
  {
    title: "YouTube link to notes",
    desc: "Paste a link, get the transcript and summary.",
  },
];
