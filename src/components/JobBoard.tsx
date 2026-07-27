"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Job } from "@/lib/jobs";
import { JobCard } from "./JobCard";

export function JobBoard({ jobs }: { jobs: Job[] }) {
  const [category, setCategory] = useState<string>("All roles");
  const [query, setQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (category !== "All roles" && job.category !== category) return false;
      if (remoteOnly && job.mode !== "Remote") return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.summary.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q)) ||
        job.broughtFrom.toLowerCase().includes(q)
      );
    });
  }, [jobs, category, query, remoteOnly]);

  return (
    <div>
      <div className="rounded-2xl border border-steel-line/70 bg-navy/60 p-4 sm:p-5">
        <label className="sr-only" htmlFor="job-search">
          Search roles or the job you used to have
        </label>
        <input
          id="job-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'editor', 'remote', or the job you used to have…"
          className="w-full rounded-xl border border-steel-line bg-void/70 px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "bg-blue-500 text-white"
                  : "bg-steel/50 text-mist hover:bg-steel"
              }`}
            >
              {c}
            </button>
          ))}

          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            Remote only
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm text-fog">
        {filtered.length} {filtered.length === 1 ? "role" : "roles"} that lean on
        what makes you human.
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-steel-line bg-navy/40 p-10 text-center">
          <p className="font-display text-xl text-chrome">No matches — yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-fog">
            Try a broader search or clear the filters. New roles land here every
            week, so it&apos;s worth checking back.
          </p>
          <button
            onClick={() => {
              setCategory("All roles");
              setQuery("");
              setRemoteOnly(false);
            }}
            className="mt-5 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
