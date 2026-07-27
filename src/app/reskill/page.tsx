import type { Metadata } from "next";
import { RESOURCES as SEED_RESOURCES } from "@/lib/content";
import { collectionGet } from "@/lib/cache";
import { Reveal } from "@/components/Reveal";

// Static HTML, refreshed at most every 10 min. Admin edits publish instantly
// via revalidateTag("content"), which busts this route's cached data reads too.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Reskill for free · SkyHunter",
  description:
    "Legitimate, free reskilling paths — no bootcamp debt. Government programs, employer academies, and apprenticeships for displaced workers.",
};

const kindStyles: Record<string, string> = {
  Reskilling: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Financial: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  Government: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  "Mental health": "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
};

export default async function ReskillPage() {
  const RESOURCES = await collectionGet("resources", SEED_RESOURCES);
  const reskilling = RESOURCES.filter((r) => r.kind === "Reskilling");
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
          Reskill without the debt
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          The reskilling industry loves to sell panic. You usually don&apos;t
          need a $15,000 bootcamp — you need the right free program and a little
          direction. Start here.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {reskilling.map((r, i) => (
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
                Visit program →
              </span>
            </a>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-steel-line/70 bg-navy/50 p-8">
        <h2 className="font-display text-2xl font-bold text-chrome">
          A word before you sign up for anything
        </h2>
        <ul className="mt-4 space-y-3 text-mist">
          {[
            "If a program guarantees a six-figure job in eight weeks, be skeptical. Real reskilling is honest about the work.",
            "Ask your state's Dislocated Worker program first — they often pay for training you'd otherwise borrow for.",
            "Pick a path that builds on what you already know. The fastest route is rarely starting from scratch.",
          ].map((tip) => (
            <li key={tip} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
