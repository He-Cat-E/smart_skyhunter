// Non-job content: support resources and community stories.

export type Resource = {
  title: string;
  provider: string;
  cost: "Free" | "Free + paid" | "Low-cost";
  blurb: string;
  href: string;
  kind: "Reskilling" | "Financial" | "Government" | "Mental health";
};

export const RESOURCES: Resource[] = [
  {
    title: "Dislocated Worker Program (WIOA)",
    provider: "U.S. Dept. of Labor",
    cost: "Free",
    blurb:
      "The main federal program for people whose jobs went away. Career counseling and funded retraining through your local job center.",
    href: "https://www.dol.gov/agencies/eta/dislocated-workers",
    kind: "Government",
  },
  {
    title: "Grow with Google",
    provider: "Google",
    cost: "Free",
    blurb:
      "Free certificates in fields like IT support, UX, and data analytics — designed for people starting from zero.",
    href: "https://grow.google/certificates/",
    kind: "Reskilling",
  },
  {
    title: "IBM SkillsBuild",
    provider: "IBM",
    cost: "Free",
    blurb:
      "Free courses and credentials in AI, cloud, and cybersecurity, with a track built for career changers.",
    href: "https://skillsbuild.org/",
    kind: "Reskilling",
  },
  {
    title: "Unemployment Insurance",
    provider: "Your state",
    cost: "Free",
    blurb:
      "If your role was eliminated, you may qualify for weekly income while you look. Apply early — benefits aren't retroactive.",
    href: "https://www.dol.gov/general/topic/unemployment-insurance",
    kind: "Financial",
  },
  {
    title: "988 Suicide & Crisis Lifeline",
    provider: "SAMHSA",
    cost: "Free",
    blurb:
      "Losing work hits hard. If the weight feels like too much, call or text 988 — a real person, any hour.",
    href: "https://988lifeline.org/",
    kind: "Mental health",
  },
  {
    title: "Registered Apprenticeships",
    provider: "Apprenticeship.gov",
    cost: "Free",
    blurb:
      "Get paid while you learn a skilled trade. Search thousands of earn-while-you-learn programs near you.",
    href: "https://www.apprenticeship.gov/",
    kind: "Reskilling",
  },
];

export type Story = {
  name: string;
  was: string;
  now: string;
  quote: string;
  monthsToRehire: number;
  initials: string;
  accent: "clay" | "sage" | "sky";
  avatar?: string; // real portrait; falls back to initials if unset
};

export const STORIES: Story[] = [
  {
    name: "Marcus D.",
    was: "Copywriter, laid off after his team adopted AI drafting",
    now: "Content Humanizer at a brand studio",
    quote:
      "For a month I thought my whole skill set was obsolete. Turns out the thing I do — making words sound like a person — is the part that got more valuable, not less.",
    monthsToRehire: 3,
    initials: "MD",
    accent: "clay",
    avatar: "/members/m1.jpg",
  },
  {
    name: "Priya S.",
    was: "Bookkeeper replaced by an automated ledger system",
    now: "AI Output Auditor at a credit union",
    quote:
      "I didn't need to learn to code. I needed to trust that noticing when numbers are wrong is a real, hireable skill. SkyHunter helped me see that.",
    monthsToRehire: 2,
    initials: "PS",
    accent: "sage",
    avatar: "/members/w1.jpg",
  },
  {
    name: "Terrell W.",
    was: "Call-center supervisor, department automated",
    now: "Agent Workflow Supervisor (remote)",
    quote:
      "Same job, honestly — I keep a team on track and step in when things go sideways. The team just happens to be AI agents now. My people skills transferred cleanly.",
    monthsToRehire: 4,
    initials: "TW",
    accent: "sky",
    avatar: "/members/m2.jpg",
  },
];

export const STEPS = [
  {
    title: "Land here, take a breath",
    body: "This isn't your fault, and you're not behind. Start by reading a story from someone who was exactly where you are.",
  },
  {
    title: "Find what already transfers",
    body: "Every role we list says plainly which past jobs it grows from. You probably have more of it than you think.",
  },
  {
    title: "Reskill only where it counts",
    body: "We point you to free, legit training — no bootcamp debt for skills you don't actually need.",
  },
  {
    title: "Apply as a whole person",
    body: "Roles here are chosen because they lean on human judgment, care, and craft. Apply, and let's get you working again.",
  },
];
