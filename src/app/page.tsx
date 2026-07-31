import Link from "next/link";
import Image from "next/image";
import { listJobs } from "@/lib/jobs-data";
import { STEPS as SEED_STEPS, STORIES as SEED_STORIES } from "@/lib/content";
import { collectionGet } from "@/lib/cache";
import { JobCard } from "@/components/JobCard";
import { Reveal } from "@/components/Reveal";
import { AuthSwitch } from "@/components/AuthSwitch";
import {
  ArrowRight,
  Lifebuoy,
  Compass,
  Book,
  Briefcase,
  Spark,
} from "@/components/icons";
import { Logo } from "@/components/Logo";

// Professional icon per step of the "Four honest steps" flow (breathe →
// discover → learn → apply). Falls back to Spark if steps are edited/added.
const STEP_ICONS = [Lifebuoy, Compass, Book, Briefcase];

// Static HTML, refreshed at most every 10 min; admin job/content edits bust it
// via revalidateTag. Sign-in-aware CTAs resolve on the client (AuthSwitch).
export const revalidate = 600;

const accentDot: Record<string, string> = {
  clay: "bg-blue-500",
  sage: "bg-cyan",
  sky: "bg-blue-400",
};

export default async function HomePage() {
  const [featured, STEPS, STORIES] = await Promise.all([
    listJobs().then((j) => j.slice(0, 3)),
    collectionGet("steps", SEED_STEPS),
    collectionGet("stories", SEED_STORIES),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-sky-art relative overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-16 pt-20 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="rise-in">
            <span className="inline-flex items-center gap-2.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              <span className="h-px w-6 bg-blue-400/60" />
              Build · Innovate · Elevate
            </span>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-chrome sm:text-6xl">
              Rise above the <span className="sky-text">AI shakeup</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
              SkyHunter is the job platform for people whose roles were changed
              or replaced by AI. We surface real work that leans on human
              judgment, care, and craft<AuthSwitch guest=" — and we're opening the doors soon." authed="." />
            </p>

            {/* Earnings highlight — what members typically make */}
            <div className="mt-7 inline-flex max-w-lg items-center gap-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 px-5 py-4">
              <span className="h-11 w-1 shrink-0 rounded-full bg-blue-500" />
              <div>
                <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  <span className="sky-text">$2.5K–$3.5K</span>
                  <span className="ml-1.5 align-middle text-sm font-medium text-fog">
                    / month
                  </span>
                </p>
                <p className="mt-1 text-sm text-mist">
                  what members typically earn from contracts with our developer
                  &amp; startup-manager network.
                </p>
              </div>
            </div>

            <AuthSwitch
              authed={
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
                  >
                    Go to your dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/jobs"
                    className="rounded-xl border border-steel-line px-6 py-3 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                  >
                    Browse jobs
                  </Link>
                </div>
              }
              guest={
                <>
                  {/* Early-access capture */}
                  <form
                    action="/signup"
                    method="get"
                    className="mt-9 flex max-w-lg flex-col gap-2.5 sm:flex-row"
                  >
                    <label htmlFor="hero-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="hero-email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="flex-1 rounded-xl border border-steel-line bg-navy/60 px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
                    >
                      Get early access
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                  <p className="mt-3 text-sm text-fog">
                    Free to join · No spam · Be first in line when we launch.
                  </p>
                </>
              }
            />

            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-8">
              {[
                { n: "3×", l: "more likely to get rehired with real reskilling support" },
                { n: "Free", l: "training paths — no bootcamp debt required" },
                { n: "8", l: "curated roles at launch, chosen for their human edge" },
              ].map((s) => (
                <div key={s.l} className="border-l border-steel-line pl-4">
                  <dt className="font-display text-3xl font-semibold text-chrome">
                    {s.n}
                  </dt>
                  <dd className="mt-1.5 text-xs leading-snug text-fog">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Our company photo */}
          <div className="rise-in relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-steel-line">
            <Image
              src="/company/company.jpg"
              alt="The SkyHunter team collaborating in the office"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            {/* Brand badge — marks the photo as SkyHunter's */}
            <div className="absolute bottom-4 left-4 rounded-xl border border-steel-line bg-void/90 px-4 py-2.5 backdrop-blur-sm">
              <Logo size={22} />
              <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.25em] text-fog">
                Build · Innovate · Elevate
              </p>
            </div>
          </div>
        </div>
        <div className="streak mx-auto max-w-[1400px] px-5" />
      </section>

      {/* Reassurance */}
      <section className="border-b border-steel-line/50 bg-abyss">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <Reveal>
            <p className="text-center font-display text-2xl font-medium leading-snug text-chrome sm:text-3xl">
              Losing a job to a machine feels personal. It isn&apos;t. What you
              carry — taste, patience, the read on a room — is exactly what&apos;s
              becoming <span className="sky-text">scarce and valuable</span>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              How it works
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              Four honest steps
            </h2>
            <p className="mt-3 text-lg text-mist">
              No dashboards to master, no algorithm to game.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-steel-line/70 bg-steel-line/70 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? Spark;
            return (
              <Reveal key={step.title} delay={i * 80} className="h-full">
                <div className="flex h-full flex-col bg-navy p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                  A preview
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                  Roles waiting inside
                </h2>
                <p className="mt-3 text-lg text-mist">
                  <AuthSwitch
                    guest="A taste of the board. Sign up to unlock the rest and apply."
                    authed="Real openings chosen for their human edge. Open one to apply."
                  />
                </p>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-400"
              >
                <AuthSwitch guest="Preview all roles" authed="See all roles" />
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((job, i) => (
              <Reveal key={job.id} delay={i * 80}>
                <JobCard job={job} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              Stories
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              People who were exactly here
            </h2>
            <p className="mt-3 text-lg text-mist">
              Not influencers — just folks who got knocked down by the same wave
              and found their footing.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STORIES.map((story, i) => (
            <Reveal key={story.name} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy/60 p-6">
                <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-mist">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-steel-line/70 pt-4">
                  {story.avatar ? (
                    <Image
                      src={story.avatar}
                      alt={story.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${accentDot[story.accent]}`}
                    >
                      {story.initials}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-chrome">
                      {story.name}
                    </p>
                    <p className="text-xs text-fog">
                      {story.was.split(",")[0]} → {story.now}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 font-semibold text-blue-300 hover:text-blue-400"
            >
              Read all the stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1400px] px-5 pb-8">
        <Reveal>
          <div className="lift overflow-hidden rounded-2xl border border-steel-line bg-navy">
            <div className="bg-sky-art px-8 py-16 text-center sm:px-16">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                <AuthSwitch guest="Free for job seekers" authed="Your next move" />
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
                Your next chapter is cleared for takeoff
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                <AuthSwitch
                  guest="Create your free account, get matched to human-first roles, and start your next chapter today."
                  authed="Browse open roles, apply in one click, and track it all from your dashboard."
                />
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <AuthSwitch
                  guest={
                    <>
                      <Link
                        href="/signup"
                        className="rounded-xl bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                      >
                        Sign up for early access
                      </Link>
                      <Link
                        href="/reskill"
                        className="rounded-xl border border-steel-line px-8 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                      >
                        Explore free reskilling
                      </Link>
                    </>
                  }
                  authed={
                    <>
                      <Link
                        href="/jobs"
                        className="rounded-xl bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                      >
                        Browse jobs
                      </Link>
                      <Link
                        href="/dashboard"
                        className="rounded-xl border border-steel-line px-8 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                      >
                        Go to dashboard
                      </Link>
                    </>
                  }
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
