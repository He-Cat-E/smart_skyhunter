import type { Metadata } from "next";
import Link from "next/link";
import { JobBoard } from "@/components/JobBoard";
import { listJobs } from "@/lib/jobs-data";
import { AuthSwitch } from "@/components/AuthSwitch";

// Static HTML, refreshed at most every 10 min; admin job edits bust it via
// revalidateTag("jobs"). Sign-in-aware CTAs resolve on the client.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Jobs · SkyHunter",
  description:
    "Real openings chosen for their human edge — roles that lean on judgment, care, and craft.",
};

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-steel-line/80 bg-navy/50 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            <AuthSwitch guest="Preview" authed="Open roles" />
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            Find work that needs a human
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-mist">
            Every role here was picked for one reason: it&apos;s hard to hand to a
            model.{" "}
            <AuthSwitch
              guest="Browse the preview — then sign up to unlock full details and apply."
              authed="Open any role to see the full details and apply."
            />
          </p>
        </div>
        <AuthSwitch
          guest={
            <Link
              href="/signup"
              className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
            >
              Sign up to unlock
            </Link>
          }
          authed={
            <Link
              href="/dashboard"
              className="rounded-lg border border-steel-line px-6 py-3 font-semibold text-chrome transition-colors hover:border-blue-500/60"
            >
              Your dashboard
            </Link>
          }
        />
      </div>

      <div className="mt-10">
        <JobBoard jobs={jobs} />
      </div>
    </section>
  );
}
