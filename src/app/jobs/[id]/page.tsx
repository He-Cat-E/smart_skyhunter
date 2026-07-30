import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getJobById } from "@/lib/jobs-data";
import { getSession } from "@/lib/auth";
import { JOB_STATUS_STYLE, isJobOpen } from "@/lib/jobs";
import { ApplyButton } from "@/components/ApplyButton";
import { AuthSwitch } from "@/components/AuthSwitch";

// Role detail is gated behind sign-up: viewing a specific role requires an
// account, so this renders on demand (reads the session cookie) rather than as
// a static page.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Role not found · SkyHunter" };
  return {
    title: `${job.title} at ${job.company} · SkyHunter`,
    description: job.summary,
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Viewing a role requires an account — send signed-out visitors to sign up.
  const session = await getSession();
  if (!session) redirect("/signup");

  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href="/jobs"
        className="text-sm font-medium text-fog transition-colors hover:text-blue-300"
      >
        ← Back to all roles
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-3 py-1 text-xs font-semibold ${JOB_STATUS_STYLE[job.status || "Hiring"] ?? JOB_STATUS_STYLE.Hiring}`}
          >
            {job.status || "Hiring"}
          </span>
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-chrome sm:text-5xl">
          {job.title}
        </h1>
        <p className="mt-3 text-lg text-mist">
          {job.company} · {job.location} · {job.type} · {job.mode}
        </p>
        <p className="mt-2 font-display text-2xl font-semibold text-blue-300">
          {job.salary}
        </p>
      </header>

      <div className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
          Why this role holds up next to AI
        </p>
        <p className="mt-2 text-lg leading-relaxed text-chrome">{job.humanEdge}</p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-2xl font-bold text-chrome">
          What the work is
        </h2>
        <p className="mt-3 leading-relaxed text-mist">{job.summary}</p>

        <h2 className="mt-8 font-display text-2xl font-bold text-chrome">
          Day to day, you&apos;d
        </h2>
        <ul className="mt-3 space-y-2.5">
          {job.responsibilities.map((r) => (
            <li key={r} className="flex gap-3 text-mist">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-2xl border border-cyan/25 bg-cyan/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
          You&apos;re more ready than you think
        </p>
        <p className="mt-2 leading-relaxed text-chrome">{job.broughtFrom}</p>
      </div>

      {/* Apply — registered members apply directly; guests are prompted to join */}
      <div className="lift mt-10 rounded-2xl border border-steel-line bg-navy px-6 py-10 text-center">
        {isJobOpen(job.status) ? (
          <>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              <AuthSwitch guest="Apply for this role" authed="Ready to apply?" />
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-mist">
              <AuthSwitch
                guest="Create your free account to apply — it takes under a minute."
                authed="Submit your application in one click. You can withdraw it any time."
              />
            </p>
            <div className="mt-6 flex justify-center">
              <ApplyButton jobId={job.id} jobTitle={job.title} />
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              Applications closed
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-mist">
              This role is marked <span className="font-semibold">{job.status}</span> and
              is no longer accepting applications. Browse other open roles.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-block rounded-lg border border-steel-line px-6 py-3 font-semibold text-chrome transition-colors hover:border-blue-500/60"
            >
              See open roles
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
