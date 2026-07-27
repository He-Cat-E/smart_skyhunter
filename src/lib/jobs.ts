export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  type: "Full-time" | "Part-time" | "Contract";
  salary: string;
  category: string;
  status?: string; // Hiring | Interviewing | Hired | Closed | Draft
  postedDaysAgo: number;
  // Why this role tends to hold up well alongside AI — written for a human, not a bot.
  humanEdge: string;
  summary: string;
  responsibilities: string[];
  broughtFrom: string; // a transferable-skills note: "You already do this if you were a ___"
  tags: string[];
};

export const JOB_STATUSES = [
  "Hiring",
  "Interviewing",
  "Hired",
  "Closed",
  "Draft",
] as const;

// Tailwind classes per status (defined here so cards + detail stay consistent).
export const JOB_STATUS_STYLE: Record<string, string> = {
  Hiring: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Interviewing: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  Hired: "bg-blue-500/15 text-blue-500 ring-1 ring-blue-500/40",
  Closed: "bg-steel text-fog ring-1 ring-steel-line",
  Draft: "bg-steel text-fog ring-1 ring-steel-line",
};

// Applications are only open for these statuses.
export function isJobOpen(status?: string): boolean {
  return !status || status === "Hiring" || status === "Interviewing";
}

export const CATEGORIES = [
  "All roles",
  "People & Care",
  "AI Oversight",
  "Skilled Trades",
  "Creative",
  "Operations",
  "Education",
] as const;

export const JOBS: Job[] = [
  {
    id: "ai-output-auditor",
    title: "AI Output Auditor",
    company: "Northwind Trust",
    location: "Austin, TX",
    mode: "Hybrid",
    type: "Full-time",
    salary: "$78k – $96k",
    category: "AI Oversight",
    postedDaysAgo: 2,
    humanEdge:
      "Someone has to be accountable for what the model says. That judgment call is yours — and it can't be automated away.",
    summary:
      "Review AI-generated reports, flag hallucinations, and sign off on what reaches customers. No coding required — just sharp judgment and domain sense.",
    responsibilities: [
      "Spot-check model output for accuracy, tone, and compliance",
      "Write clear correction notes the team can act on",
      "Own the final 'yes, this is right' before anything ships",
    ],
    broughtFrom:
      "You already do this if you were an editor, claims reviewer, paralegal, or QA analyst.",
    tags: ["No-code", "Domain expertise", "Growing field"],
  },
  {
    id: "community-care-coordinator",
    title: "Community Care Coordinator",
    company: "Rosewood Health Collective",
    location: "Portland, OR",
    mode: "On-site",
    type: "Full-time",
    salary: "$52k – $64k",
    category: "People & Care",
    postedDaysAgo: 1,
    humanEdge:
      "People trust people. Sitting with someone on a hard day is the one thing a chatbot will never do.",
    summary:
      "Guide patients and families through appointments, benefits, and the human side of care. Warmth is the core skill here.",
    responsibilities: [
      "Be the steady point of contact for a caseload of families",
      "Coordinate between clinicians, social workers, and insurers",
      "Notice what people don't say and follow up anyway",
    ],
    broughtFrom:
      "You already do this if you were in customer success, retail management, or admin support.",
    tags: ["High-touch", "Stable demand", "Meaningful"],
  },
  {
    id: "agent-workflow-supervisor",
    title: "Agent Workflow Supervisor",
    company: "Lumen Operations",
    location: "Remote (US)",
    mode: "Remote",
    type: "Full-time",
    salary: "$85k – $110k",
    category: "AI Oversight",
    postedDaysAgo: 4,
    humanEdge:
      "AI agents run the tasks; you decide when they're wrong and step in. Companies are hiring humans precisely to hold the wheel.",
    summary:
      "Design, monitor, and course-correct fleets of AI agents doing back-office work. You set the guardrails and catch the edge cases.",
    responsibilities: [
      "Map out where agents help and where humans must stay in the loop",
      "Monitor dashboards and intervene before small errors compound",
      "Translate messy real-world exceptions into clear rules",
    ],
    broughtFrom:
      "You already do this if you were an operations lead, dispatcher, or team supervisor.",
    tags: ["New field", "High growth", "Remote-friendly"],
  },
  {
    id: "residential-electrician",
    title: "Residential Electrician (Apprentice-friendly)",
    company: "Brightwork Trades",
    location: "Columbus, OH",
    mode: "On-site",
    type: "Full-time",
    salary: "$58k – $82k",
    category: "Skilled Trades",
    postedDaysAgo: 6,
    humanEdge:
      "Wiring a real house in the real world is stubbornly physical. Hands-on trades are among the safest harbors right now.",
    summary:
      "Join a crew that trains as you go. Paid apprenticeship track — career changers from any background are genuinely welcome.",
    responsibilities: [
      "Install and repair wiring, panels, and fixtures",
      "Learn code and safety on the job, mentored by a licensed lead",
      "Solve the surprises every old house hides",
    ],
    broughtFrom:
      "You already do this if you're careful with your hands and like fixing things.",
    tags: ["Paid training", "Career change OK", "Hands-on"],
  },
  {
    id: "content-humanizer",
    title: "Content Humanizer & Editor",
    company: "Fable & Co.",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$40 – $60 / hr",
    category: "Creative",
    postedDaysAgo: 3,
    humanEdge:
      "AI drafts fast and flat. Making words sound like a person — with taste and a point of view — is exactly what's scarce now.",
    summary:
      "Take machine-drafted articles and give them a pulse: voice, rhythm, a reason to keep reading. Portfolio over pedigree.",
    responsibilities: [
      "Rewrite AI drafts so they actually sound human",
      "Fact-check and add the specific detail models miss",
      "Protect brand voice across everything that ships",
    ],
    broughtFrom:
      "You already do this if you were a writer, journalist, marketer, or teacher.",
    tags: ["Flexible", "Portfolio-based", "Voice matters"],
  },
  {
    id: "skilled-trades-instructor",
    title: "Reskilling Instructor",
    company: "Second Draft Academy",
    location: "Chicago, IL",
    mode: "Hybrid",
    type: "Part-time",
    salary: "$35 – $50 / hr",
    category: "Education",
    postedDaysAgo: 5,
    humanEdge:
      "Adults learning a new trade need a patient human who's been there — not a video. Your lived experience is the qualification.",
    summary:
      "Teach small cohorts of career-changers the skill you know best. We handle curriculum; you bring the realness.",
    responsibilities: [
      "Lead evening cohorts of 8–12 adult learners",
      "Share the shortcuts and hard-won lessons no textbook has",
      "Cheer people through the scary middle of a career change",
    ],
    broughtFrom:
      "You already do this if you've ever trained a new hire or mentored anyone.",
    tags: ["Part-time", "Mentorship", "Flexible hours"],
  },
  {
    id: "operations-generalist",
    title: "Operations Generalist",
    company: "Meridian Logistics",
    location: "Denver, CO",
    mode: "Hybrid",
    type: "Full-time",
    salary: "$60k – $75k",
    category: "Operations",
    postedDaysAgo: 8,
    humanEdge:
      "When the automated system breaks at 4pm on a Friday, they call a person who can think. That person is valuable.",
    summary:
      "Keep the trains running: vendors, schedules, the thousand small fires. The classic role for someone who's good at everything.",
    responsibilities: [
      "Own the day-to-day that keeps a mid-size business moving",
      "Build the simple systems that prevent repeat problems",
      "Be the calm in every operational storm",
    ],
    broughtFrom:
      "You already do this if you were an office manager, coordinator, or team lead.",
    tags: ["Generalist", "Stable", "Problem-solver"],
  },
  {
    id: "home-care-aide",
    title: "In-Home Care Aide",
    company: "Evergreen Companions",
    location: "Seattle, WA",
    mode: "On-site",
    type: "Part-time",
    salary: "$22 – $28 / hr",
    category: "People & Care",
    postedDaysAgo: 1,
    humanEdge:
      "Presence, patience, a gentle hand — care work is human to the bone, and demand keeps climbing as the population ages.",
    summary:
      "Support older adults with daily life so they can stay in their own homes. Training provided; heart required.",
    responsibilities: [
      "Help with meals, mobility, and daily routines",
      "Provide company and a watchful eye",
      "Keep families informed and reassured",
    ],
    broughtFrom:
      "You already do this if you've cared for a family member or worked in service.",
    tags: ["Training provided", "Rising demand", "Flexible shifts"],
  },
];

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
