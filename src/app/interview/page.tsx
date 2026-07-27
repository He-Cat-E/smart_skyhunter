import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { InterviewForm } from "@/components/InterviewForm";
import { Check, Spark, Shield, Users, Briefcase, Book, Lifebuoy } from "@/components/icons";

export const metadata: Metadata = {
  title: "Book your interview · SkyHunter",
  description:
    "Before starting a paid contract with a partner developer or company manager, book a short interview with the SkyHunter support team.",
};

export const dynamic = "force-dynamic";

const FACTS = [
  { icon: "book", label: "Length", value: "About 25 minutes" },
  { icon: "users", label: "Format", value: "Video call on Lark" },
  { icon: "shield", label: "Cost", value: "Free — always" },
  { icon: "lifebuoy", label: "You'll meet", value: "A SkyHunter specialist" },
];

const ICONS: Record<string, (p: { className?: string }) => React.ReactElement> = {
  spark: Spark,
  shield: Shield,
  users: Users,
  briefcase: Briefcase,
  book: Book,
  lifebuoy: Lifebuoy,
};

const STEPS = [
  {
    title: "Request your interview",
    body: "Pick a date and time window below. It takes under a minute — your details are already filled in.",
  },
  {
    title: "We confirm by email",
    body: "Within one business day we email a confirmed time, a calendar invite, and a video-call link.",
  },
  {
    title: "Join the video call",
    body: "Meet your SkyHunter specialist. We confirm the role fit, expectations, hours, and how pay works.",
  },
  {
    title: "Get matched to the contract",
    body: "Once we've both said yes, we make the introduction to the partner and help you start on the right foot.",
  },
];

const AGENDA = [
  "Your background and what kind of work fits you best",
  "The specific contract, its scope, hours, and expected pay",
  "How payments are handled and protected on both sides",
  "Timeline for starting, and what the first week looks like",
  "Any questions or concerns you have — this is your call too",
];

const PREPARE = [
  "Complete your profile so we can match you faster",
  "Have your most recent role and key skills in mind",
  "Note your realistic weekly availability and rate",
  "Write down any questions about the contract or pay",
  "Find a quiet spot with a stable internet connection",
];

const FAQ = [
  {
    q: "Why do I need an interview?",
    a: "Before you start a paid contract with one of our partner developers or company managers, a short interview with the SkyHunter team makes sure the role genuinely fits you, that expectations and pay are clear, and that both you and the partner are protected. It's a safeguard, not a test.",
  },
  {
    q: "Is this a job interview I can fail?",
    a: "No. It's a friendly working session with our support team — not a pass/fail exam. We're on your side and want to set you up to succeed.",
  },
  {
    q: "Do I need to prepare a lot?",
    a: "Not much. A complete profile and a rough sense of your availability and questions is plenty. See the short checklist above.",
  },
  {
    q: "What if the time doesn't work?",
    a: "Every confirmation email includes a link to reschedule. Pick whatever works — mornings, evenings, weekends included where available.",
  },
  {
    q: "Does it cost anything?",
    a: "No. SkyHunter is always free for people looking for work. There are no fees at any step.",
  },
];

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string; role?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/signin?next=/interview");

  // Admins manage the platform — they don't book member interviews.
  if (isAdminUser(session)) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
          Interview
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-chrome">
          Interviews are for members
        </h1>
        <p className="mt-3 text-mist">
          Admin accounts can&apos;t book interviews. You can manage members&apos;
          interview requests from the control panel instead.
        </p>
        <Link
          href="/admin/requests"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
        >
          Go to requests
        </Link>
      </section>
    );
  }

  const sp = await searchParams;
  const partner = (sp.partner ?? "").trim();
  const role = (sp.role ?? "").trim();

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      {/* Hero */}
      <div className="max-w-3xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
          Interview
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
          Book your interview with the SkyHunter team
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          {partner ? (
            <>
              You&apos;re one step from working with{" "}
              <span className="font-semibold text-chrome">{partner}</span>
              {role ? ` (${role})` : ""}. Before any paid contract begins, we do a
              short, friendly interview to make sure it&apos;s the right fit — for
              you and for the partner.
            </>
          ) : (
            <>
              Before you start a paid contract with one of our partner developers
              or company managers, you&apos;ll have a short, friendly interview
              with our support team. It confirms the fit, sets clear expectations,
              and protects everyone involved.
            </>
          )}
        </p>
      </div>

      {/* Quick facts */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <div
              key={f.label}
              className="rounded-2xl border border-steel-line bg-navy p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                {Icon && <Icon className="h-5 w-5" />}
              </span>
              <p className="mt-3 text-xs uppercase tracking-wider text-fog">
                {f.label}
              </p>
              <p className="mt-0.5 font-semibold text-chrome">{f.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Left: the details */}
        <div className="space-y-12">
          {/* How it works */}
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              How it works
            </h2>
            <ol className="mt-6 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 font-display text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-chrome">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mist">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* What we'll cover */}
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              What we&apos;ll cover
            </h2>
            <ul className="mt-5 space-y-3">
              {AGENDA.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm text-mist">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                    <Check className="h-3 w-3" />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* How to prepare */}
          <div className="rounded-2xl border border-steel-line bg-abyss p-6">
            <h2 className="font-display text-xl font-semibold tracking-tight text-chrome">
              How to prepare
            </h2>
            <p className="mt-1 text-sm text-fog">
              Five minutes is plenty — none of this is mandatory.
            </p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {PREPARE.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-mist">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-steel-line" />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href="/profile"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-400"
            >
              Complete your profile first →
            </Link>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              Common questions
            </h2>
            <div className="mt-5 divide-y divide-steel-line overflow-hidden rounded-2xl border border-steel-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group bg-navy/50 p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-chrome">
                    {f.q}
                    <span className="ml-4 text-fog transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Right: the booking form (sticky on desktop) */}
        <div>
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
              <h2 className="font-display text-xl font-semibold tracking-tight text-chrome">
                Request your interview
              </h2>
              {partner && (
                <p className="mt-1 text-sm text-mist">
                  For your contract with{" "}
                  <span className="font-medium text-chrome">{partner}</span>
                  {role ? ` · ${role}` : ""}.
                </p>
              )}
              <p className="mt-1 text-sm text-fog">
                Pick a date and window — we&apos;ll confirm the exact time by
                email.
              </p>
              <div className="mt-5">
                <InterviewForm partner={partner} role={role} />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-fog">
              Prefer email?{" "}
              <Link href="/support" className="font-medium text-blue-300 hover:text-blue-400">
                Contact the team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
