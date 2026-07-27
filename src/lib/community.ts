// Community page content: the welcome intro, personas, members, and stats.
// NOTE: member photos in /public/members are royalty-free placeholder portraits.
// Swap them (and the names/blurbs) for your real members before launch.

export type Persona = {
  title: string;
  body: string;
};

export const PERSONAS: Persona[] = [
  {
    title: "Remote professionals",
    body: "Experienced people looking for remote work and meaningful projects that value their skills.",
  },
  {
    title: "New-skill learners",
    body: "People ready to learn something new and start a fresh career path in the digital economy.",
  },
  {
    title: "Income seekers",
    body: "Anyone searching for flexible, additional income opportunities that fit around their life.",
  },
  {
    title: "Companies & projects",
    body: "Teams and project owners looking for skilled, motivated contributors to build alongside.",
  },
];

// The people we're looking for: roles AI is reshaping, and the new AI-era
// roles we connect them to. Intentionally no icons.
export type RoleTrack = {
  category: string;
  from: string; // who they are today
  to: string[]; // the new AI-era roles they can grow into
};

export const ROLE_TRACKS: RoleTrack[] = [
  {
    category: "Writing & Content",
    from: "Copywriters, blog writers, basic content creators",
    to: ["AI Content Editor", "AI Writing Assistant", "Prompt Writer", "Content Reviewer"],
  },
  {
    category: "Design",
    from: "Graphic designers creating simple banners, logos, social posts",
    to: ["AI Design Specialist", "AI Image Reviewer", "Brand Assistant"],
  },
  {
    category: "Programming",
    from: "Junior developers doing repetitive coding tasks",
    to: ["AI Coding Assistant", "Software Tester", "AI Code Reviewer"],
  },
  {
    category: "Customer Support",
    from: "Customer service agents replaced by chatbots",
    to: ["AI Chat Support Specialist", "Customer Experience Trainer"],
  },
  {
    category: "Translation",
    from: "Basic translators",
    to: ["AI Translation Reviewer", "Localization Specialist"],
  },
  {
    category: "Data Entry",
    from: "Data entry operators",
    to: ["AI Data Verification Specialist", "Data Quality Reviewer"],
  },
  {
    category: "Research",
    from: "Basic online researchers",
    to: ["AI Research Assistant", "Fact Checker"],
  },
  {
    category: "Social Media",
    from: "Social media assistants creating simple posts",
    to: ["AI Social Media Manager", "Content Strategist"],
  },
  {
    category: "Video Editing",
    from: "Basic video editors",
    to: ["AI Video Editor", "Short Video Creator"],
  },
  {
    category: "Voice & Audio",
    from: "Voice-over workers for simple projects",
    to: ["AI Voice Quality Reviewer", "Audio Data Specialist"],
  },
  {
    category: "Transcription",
    from: "Human transcriptionists",
    to: ["AI Transcription Reviewer", "Speech Data Annotator"],
  },
  {
    category: "Testing",
    from: "Manual testers doing repetitive tests",
    to: ["AI Application Tester", "AI Output Evaluator"],
  },
];

export type Member = {
  name: string;
  role: string;
  location: string;
  blurb: string;
  photo: string;
  persona: string;
};

export const MEMBERS: Member[] = [
  {
    name: "Daniel R.",
    role: "Automation Specialist",
    location: "Toronto, CA",
    blurb:
      "Former IT support. Now builds and supervises automation workflows for a remote team.",
    photo: "/members/m1.jpg",
    persona: "Remote professional",
  },
  {
    name: "Sofia M.",
    role: "UX Researcher",
    location: "Austin, TX",
    blurb:
      "Left retail management, reskilled through free courses, and moved into product research.",
    photo: "/members/w1.jpg",
    persona: "New-skill learner",
  },
  {
    name: "Marcus T.",
    role: "Freelance Contributor",
    location: "Remote",
    blurb:
      "Picks up flexible AI data-review projects on SkyHunter for steady extra income.",
    photo: "/members/m2.jpg",
    persona: "Income seeker",
  },
  {
    name: "Elena K.",
    role: "Founder, Northlight",
    location: "Berlin, DE",
    blurb:
      "Runs a small studio and hires vetted SkyHunter contributors for AI-oversight work.",
    photo: "/members/w2.jpg",
    persona: "Project owner",
  },
  {
    name: "James O.",
    role: "Content Humanizer",
    location: "Manchester, UK",
    blurb:
      "A veteran editor who now gives machine-drafted content a real human voice.",
    photo: "/members/m3.jpg",
    persona: "Remote professional",
  },
  {
    name: "Aisha B.",
    role: "Reskilling Mentor",
    location: "Chicago, IL",
    blurb:
      "Teaches evening cohorts, helping career-changers find their footing in new fields.",
    photo: "/members/w3.jpg",
    persona: "Educator",
  },
];

export const COMMUNITY_STATS = [
  { n: "2,400+", l: "members in the community" },
  { n: "35+", l: "countries represented" },
  { n: "120+", l: "projects seeking talent" },
  { n: "4.9★", l: "average community rating" },
];

// Core values — the "Our Principles" section.
export type Principle = { icon: string; title: string; body: string };

export const PRINCIPLES: Principle[] = [
  {
    icon: "spark",
    title: "Human-first",
    body: "Every role and project we surface leans on judgment, creativity, and care — the things AI can't replace.",
  },
  {
    icon: "shield",
    title: "Always free for job seekers",
    body: "No fees, no upsells, no catch. Honest support for people rebuilding their careers.",
  },
  {
    icon: "users",
    title: "A community that's been there",
    body: "Real people who've navigated AI disruption, sharing what actually helped them land on their feet.",
  },
];

// What SkyHunter offers — the "Services" section.
export type Offering = {
  icon: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

export const OFFERINGS: Offering[] = [
  {
    icon: "users",
    title: "Contracts from our network",
    body: "Work directly with professional developers and startup managers in our community who bring real, paid contracts — typically $2.5K–$3.5K a month.",
    href: "/dashboard",
    cta: "See contracts",
  },
  {
    icon: "briefcase",
    title: "Curated opportunities",
    body: "A hand-picked board of roles and projects chosen for their human edge — and a plain note on how your past work already transfers.",
    href: "/jobs",
    cta: "Preview the board",
  },
  {
    icon: "book",
    title: "Free reskilling paths",
    body: "Legit, no-cost training matched to your background. Grow into an AI-era role without bootcamp debt.",
    href: "/reskill",
    cta: "Explore reskilling",
  },
  {
    icon: "lifebuoy",
    title: "Support when it's hard",
    body: "Financial help, benefits guidance, and real people to talk to. You don't have to navigate this alone.",
    href: "/support",
    cta: "Find support",
  },
];

// Extra-income paths — the core promise: if AI reshaped your work, here are the
// real, flexible ways our members earn again. Shown on the dashboard (as action)
// and the community page (as mission). Intentionally honest about earnings.
export type IncomePath = {
  icon: string;
  title: string;
  body: string;
  earn: string; // typical earnings
  effort: string; // time commitment
  href: string;
  cta: string;
};

export const INCOME_INTRO = {
  eyebrow: "Extra income",
  title: "Turn AI disruption into extra income",
  body: "You didn't fall behind — the market moved. SkyHunter turns the same shift that changed your job into flexible, real income. These are the ways our members earn again, on their own terms.",
};

export const INCOME_PATHS: IncomePath[] = [
  {
    icon: "users",
    title: "Network contracts",
    body: "Get introduced to vetted developers and startup managers in our community who bring real, paid contracts.",
    earn: "$2.5K–$3.5K / mo",
    effort: "20–30 hrs / week",
    href: "/interview",
    cta: "Request an interview",
  },
  {
    icon: "briefcase",
    title: "AI-oversight micro-projects",
    body: "Review, test, and evaluate AI output on short, flexible projects that fit around your life.",
    earn: "$15–40 / hr",
    effort: "Flexible, part-time",
    href: "/jobs",
    cta: "Browse projects",
  },
  {
    icon: "spark",
    title: "Humanize AI content",
    body: "Give machine-drafted writing, design, and audio the human voice and judgment only a person brings.",
    earn: "$25–50 / hr",
    effort: "Project-based",
    href: "/jobs",
    cta: "See roles",
  },
  {
    icon: "book",
    title: "Reskill into a higher rate",
    body: "Free, legit training matched to your background — grow into AI-era roles that simply pay more.",
    earn: "Raise your ceiling",
    effort: "Learn at your pace",
    href: "/reskill",
    cta: "Start reskilling",
  },
];

// Contract partners — professional developers & startup managers in the
// community who offer paid contracts to members. Editable in Admin → Content.
export type Partner = {
  name: string;
  role: string;
  company: string;
  offer: string;
  initials: string;
  accent: "clay" | "sage" | "sky";
};

export const PARTNERS: Partner[] = [
  {
    name: "Marcus Chen",
    role: "Senior Full-Stack Developer",
    company: "Vercel-backed startup",
    offer: "Paid contracts building & supervising AI-oversight dashboards — no CS degree required.",
    initials: "MC",
    accent: "sky",
  },
  {
    name: "Elena Ruiz",
    role: "Startup Manager",
    company: "Northlight (Seed)",
    offer: "3–6 month contracts for content reviewers and QA specialists.",
    initials: "ER",
    accent: "sage",
  },
  {
    name: "David Osei",
    role: "Engineering Lead",
    company: "Fintech scale-up",
    offer: "Remote data-labeling & prompt-writing contracts, $30–55/hr.",
    initials: "DO",
    accent: "clay",
  },
  {
    name: "Priya Nair",
    role: "Founder & CEO",
    company: "Early-stage SaaS",
    offer: "Part-time operations and customer-success contracts, flexible hours.",
    initials: "PN",
    accent: "sky",
  },
  {
    name: "Tomás Vidal",
    role: "Product Manager",
    company: "YC-backed startup",
    offer: "Short project contracts for editors and localization reviewers.",
    initials: "TV",
    accent: "sage",
  },
  {
    name: "Aisha Khan",
    role: "CTO",
    company: "Health-tech startup",
    offer: "Ongoing contracts for AI application testers and output evaluators.",
    initials: "AK",
    accent: "clay",
  },
];

// How it works — steps to join.
export const JOIN_STEPS = [
  {
    title: "Create your free account",
    body: "Sign up in under a minute. No cost, no commitment — just a door in.",
  },
  {
    title: "Tell us your background",
    body: "Share your past role, skills, and where you are. It helps us point you the right way.",
  },
  {
    title: "Get matched & grow",
    body: "Discover opportunities and free training that fit you — with a community cheering you on.",
  },
];
