import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  PERSONAS as SEED_PERSONAS,
  MEMBERS as SEED_MEMBERS,
  COMMUNITY_STATS as SEED_STATS,
  ROLE_TRACKS as SEED_TRACKS,
  PRINCIPLES as SEED_PRINCIPLES,
  OFFERINGS as SEED_OFFERINGS,
  JOIN_STEPS as SEED_JOIN,
  INCOME_PATHS,
  INCOME_INTRO,
} from "@/lib/community";
import { collectionGet } from "@/lib/cache";
import { Reveal } from "@/components/Reveal";
import { Wordmark } from "@/components/Wordmark";
import { AuthSwitch } from "@/components/AuthSwitch";

// Static HTML, refreshed at most every 10 min; admin content edits bust it via
// revalidateTag("content"). Sign-in-aware CTAs resolve on the client.
export const revalidate = 600;
import {
  ArrowRight,
  Spark,
  Shield,
  Users,
  Briefcase,
  Book,
  Lifebuoy,
  Laptop,
  Coin,
} from "@/components/icons";

// Icon per "Who it's for" persona (by position): remote, learning, income, hiring.
const PERSONA_ICONS = [Laptop, Book, Coin, Briefcase];

export const metadata: Metadata = {
  title: "Community · SkyHunter",
  description:
    "SkyHunter is a community connecting talented people with new opportunities in the AI era. See how it works, what we offer, and join us.",
};

const ICONS: Record<string, (p: { className?: string }) => React.ReactElement> = {
  spark: Spark,
  shield: Shield,
  users: Users,
  briefcase: Briefcase,
  book: Book,
  lifebuoy: Lifebuoy,
};


function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
      <span className="h-px w-6 bg-blue-400/60" />
      {children}
    </span>
  );
}

export default async function CommunityPage() {
  const [
    PERSONAS,
    MEMBERS,
    COMMUNITY_STATS,
    ROLE_TRACKS,
    PRINCIPLES,
    OFFERINGS,
    JOIN_STEPS,
  ] = await Promise.all([
    collectionGet("personas", SEED_PERSONAS),
    collectionGet("members", SEED_MEMBERS),
    collectionGet("community_stats", SEED_STATS),
    collectionGet("role_tracks", SEED_TRACKS),
    collectionGet("principles", SEED_PRINCIPLES),
    collectionGet("offerings", SEED_OFFERINGS),
    collectionGet("join_steps", SEED_JOIN),
  ]);

  return (
    <>
      {/* 1. Hero / Who we are */}
      <section className="bg-sky-art relative overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-14 pt-20 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="rise-in">
            <Eyebrow>The community</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-chrome sm:text-5xl">
              Welcome to <Wordmark />
            </h1>
            <p className="mt-4 text-xl font-medium text-mist">
              A community connecting people with new opportunities in the AI era.
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-mist">
              The world of work is changing rapidly. Many talented people have
              lost their jobs to AI transformation, while others want flexible
              ways to earn and grow. SkyHunter helps people discover new
              opportunities, connect with meaningful projects, and work together
              in the evolving digital economy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AuthSwitch
                guest={
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                    >
                      Join the community
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href="#how-it-works"
                      className="rounded-xl border border-steel-line px-7 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                    >
                      How it works
                    </a>
                  </>
                }
                authed={
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                    >
                      Go to your dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href="/jobs"
                      className="rounded-xl border border-steel-line px-7 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                    >
                      Browse jobs
                    </a>
                  </>
                }
              />
            </div>
          </div>

          <div className="rise-in">
            <Image
              src="/community/team.jpg"
              alt="A team collaborating and communicating around a table in a bright office"
              width={1400}
              height={933}
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="h-full w-full rounded-2xl border border-steel-line object-cover"
            />
          </div>
        </div>
        <div className="streak mx-auto max-w-[1400px] px-5" />
      </section>

      {/* 2. Stats / credibility */}
      <section className="bg-abyss">
        <div className="mx-auto max-w-[1400px] px-5 py-10">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-steel-line/70 bg-steel-line/70 sm:grid-cols-4">
            {COMMUNITY_STATS.map((s) => (
              <div key={s.l} className="bg-navy p-6 text-center sm:text-left">
                <dt className="font-display text-3xl font-semibold text-chrome">
                  {s.n}
                </dt>
                <dd className="mt-1.5 text-xs leading-snug text-fog">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3. Our principles */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Our principles</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              What we stand for
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => {
            const Icon = ICONS[p.icon];
            return (
              <Reveal key={p.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-steel-line/70 bg-navy/60 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 4. What we offer */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>What we offer</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Everything you need to move forward
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERINGS.map((o, i) => {
              const Icon = ICONS[o.icon];
              return (
                <Reveal key={o.title} delay={i * 80}>
                  <div className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                      {o.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
                      {o.body}
                    </p>
                    <Link
                      href={o.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-400"
                    >
                      {o.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4b. Extra income — the core promise */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>{INCOME_INTRO.eyebrow}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              {INCOME_INTRO.title}
            </h2>
            <p className="mt-3 text-lg text-mist">{INCOME_INTRO.body}</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INCOME_PATHS.map((path, i) => {
            const Icon = ICONS[path.icon];
            return (
              <Reveal key={path.title} delay={i * 80}>
                <div className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      {Icon && <Icon className="h-6 w-6" />}
                    </div>
                    <span className="rounded-md bg-cyan/10 px-2.5 py-1 text-sm font-semibold text-cyan ring-1 ring-cyan/25">
                      {path.earn}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                    {path.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
                    {path.body}
                  </p>
                  <p className="mt-3 text-xs font-medium text-fog">
                    {path.effort}
                  </p>
                  <Link
                    href={path.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-400"
                  >
                    {path.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 5. Who it's for */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              A place for four kinds of people
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p, i) => {
            const Icon = PERSONA_ICONS[i] ?? Users;
            return (
              <Reveal key={p.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-steel-line/70 bg-navy/60 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 6. From reshaped to in-demand */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>Who we&apos;re looking for</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                From reshaped to in-demand
              </h2>
              <p className="mt-3 text-lg text-mist">
                If AI changed your line of work, it also opened a new one.
                Here&apos;s where today&apos;s skills map to the AI-era roles we
                connect people to.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ROLE_TRACKS.map((track, i) => (
              <Reveal key={track.category} delay={(i % 3) * 70}>
                <div className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                  <h3 className="font-display text-lg font-semibold text-chrome">
                    {track.category}
                  </h3>
                  <div className="mt-3">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-fog">
                      If you were
                    </p>
                    <p className="mt-1 text-sm leading-snug text-mist">
                      {track.from}
                    </p>
                  </div>
                  <div className="my-4 flex items-center gap-2 text-blue-300">
                    <span className="h-px flex-1 bg-steel-line" />
                    <ArrowRight className="h-4 w-4" />
                    <span className="h-px flex-1 bg-steel-line" />
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-blue-300">
                      You could become
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {track.to.map((role) => (
                        <span
                          key={role}
                          className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-500/25"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Meet the community */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>Members</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Meet the community
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBERS.map((m, i) => (
              <Reveal key={m.name} delay={i * 60}>
                <article className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src={m.photo}
                      alt={`${m.name}, ${m.role}`}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-steel-line"
                    />
                    <div>
                      <h3 className="font-display text-lg font-semibold text-chrome">
                        {m.name}
                      </h3>
                      <p className="text-sm text-blue-300">{m.role}</p>
                      <p className="text-xs text-fog">{m.location}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-mist">
                    {m.blurb}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <p className="mt-6 text-xs text-faint">
            Member photos are placeholders — swap them for your real community
            members anytime.
          </p>
        </div>
      </section>

      {/* 9. How it works */}
      <section id="how-it-works" className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              Join in three simple steps
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {JOIN_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-steel-line/70 bg-navy/60 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 font-display text-lg font-semibold text-blue-500">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="mx-auto max-w-[1400px] px-5 pb-8">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-steel-line bg-navy">
            <div className="bg-sky-art px-8 py-16 text-center sm:px-16">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
                <AuthSwitch
                  guest="Join SkyHunter and become part of the community"
                  authed="You're part of the community"
                />
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                <AuthSwitch
                  guest="Where opportunities meet talent. Sign up today to connect, grow, and create value together."
                  authed="Where opportunities meet talent. Explore open roles and track your applications."
                />
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <AuthSwitch
                  guest={
                    <>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                      >
                        Join the community
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/jobs"
                        className="rounded-xl border border-steel-line px-8 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                      >
                        Preview opportunities
                      </Link>
                    </>
                  }
                  authed={
                    <>
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                      >
                        Browse jobs
                        <ArrowRight className="h-4 w-4" />
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
