import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { STORIES as SEED_STORIES } from "@/lib/content";
import { collectionGet } from "@/lib/cache";
import { Reveal } from "@/components/Reveal";

// Static HTML, refreshed at most every 10 min. Admin edits publish instantly
// via revalidateTag("content"), which busts this route's cached data reads too.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Stories · SkyHunter",
  description:
    "Real people who lost their jobs to AI and found their footing again. Honest stories, not highlight reels.",
};

const accent: Record<string, string> = {
  clay: "bg-blue-500",
  sage: "bg-cyan",
  sky: "bg-blue-400",
};

export default async function StoriesPage() {
  const STORIES = await collectionGet("stories", SEED_STORIES);
  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
          You are not the only one
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          When your job disappears overnight, it&apos;s easy to feel like the
          only person it happened to. You&apos;re not. Here are people who stood
          exactly where you&apos;re standing.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        {STORIES.map((story, i) => (
          <Reveal key={story.name} delay={i * 90}>
            <article className="rounded-2xl border border-steel-line/70 bg-navy/60 p-7 sm:p-9">
              <div className="flex flex-wrap items-center gap-4">
                {story.avatar ? (
                  <Image
                    src={story.avatar}
                    alt={story.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white ${accent[story.accent]}`}
                  >
                    {story.initials}
                  </span>
                )}
                <div>
                  <h2 className="font-display text-2xl font-bold text-chrome">
                    {story.name}
                  </h2>
                  <p className="text-sm text-fog">
                    Back to work in {story.monthsToRehire}{" "}
                    {story.monthsToRehire === 1 ? "month" : "months"}
                  </p>
                </div>
              </div>

              <blockquote className="mt-6 border-l-2 border-blue-500/50 pl-5 font-display text-xl leading-relaxed text-chrome">
                &ldquo;{story.quote}&rdquo;
              </blockquote>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-steel-line/70 bg-void/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-fog">
                    Before
                  </p>
                  <p className="mt-1 text-sm text-mist">{story.was}</p>
                </div>
                <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
                    Now
                  </p>
                  <p className="mt-1 text-sm text-chrome">{story.now}</p>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="lift mt-14 rounded-2xl border border-steel-line bg-navy px-8 py-12 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome">
          Your story isn&apos;t over — it&apos;s mid-sentence.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-mist">
          Sign up now, and when you land your next thing, come back and tell us.
          Someone in week one needs to hear it.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block rounded-lg bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
        >
          Sign up for early access
        </Link>
      </div>
    </section>
  );
}
