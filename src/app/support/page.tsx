import type { Metadata } from "next";
import { RESOURCES as SEED_RESOURCES } from "@/lib/content";
import { collectionGet } from "@/lib/cache";
import { Reveal } from "@/components/Reveal";
import { Telegram, ArrowRight } from "@/components/icons";

// Company help/community channel.
const TELEGRAM_URL = "https://t.me/+SNHbY6Ky4XxiMTNi";

// Static HTML, refreshed at most every 10 min. Admin edits publish instantly
// via revalidateTag("content"), which busts this route's cached data reads too.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Support & benefits · SkyHunter",
  description:
    "Financial help, government programs, and mental-health support for people who lost their jobs to AI. You don't have to carry this alone.",
};

const kindStyles: Record<string, string> = {
  Reskilling: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Financial: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  Government: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  "Mental health": "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
};

export default async function SupportPage() {
  const RESOURCES = await collectionGet("resources", SEED_RESOURCES);
  const support = RESOURCES.filter((r) => r.kind !== "Reskilling");
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
          You don&apos;t have to carry this alone
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Before the next job, there&apos;s rent, and there&apos;s the weight of
          it all. These are real programs — financial, practical, and emotional —
          for exactly right now.
        </p>
      </div>

      {/* Crisis banner up top, where it belongs */}
      <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-blue-500/40 bg-blue-500/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold text-chrome">
            If today feels like too much
          </p>
          <p className="mt-1 text-sm text-mist">
            You matter far more than any job title. Talk to someone right now.
          </p>
        </div>
        <a
          href="https://988lifeline.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
        >
          Call, text, or chat 988
        </a>
      </div>

      {/* Live help via our Telegram channel */}
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-6 flex flex-col items-start gap-5 rounded-2xl border border-[#229ED9]/40 bg-[#229ED9]/5 p-6 transition-all hover:-translate-y-0.5 hover:border-[#229ED9]/70 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#229ED9] text-white shadow-sm">
            <Telegram className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-chrome">
              Need a hand? Talk to our team on Telegram
            </p>
            <p className="mt-1 text-sm text-mist">
              Join our channel for quick answers, guidance, and support from real
              people — you&apos;ll never be left on read.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#229ED9] px-6 py-3 font-semibold text-white transition-colors group-hover:bg-[#1c8dc0]">
          Open our Telegram
          <ArrowRight className="h-4 w-4" />
        </span>
      </a>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {support.map((r, i) => (
          <Reveal key={r.title} delay={i * 80}>
            <a
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy/60 p-6 transition-all hover:-translate-y-1 hover:border-blue-500/50"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${kindStyles[r.kind]}`}
                >
                  {r.kind}
                </span>
                <span className="rounded-md bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan ring-1 ring-cyan/30">
                  {r.cost}
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-chrome group-hover:text-blue-500">
                {r.title}
              </h2>
              <p className="mt-1 text-sm text-fog">{r.provider}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">
                {r.blurb}
              </p>
              <span className="mt-4 text-sm font-semibold text-blue-300">
                Learn more →
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
