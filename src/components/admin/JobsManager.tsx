"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, JOB_STATUSES, type Job } from "@/lib/jobs";
import { Spinner, Check } from "@/components/icons";

const MODES: Job["mode"][] = ["Remote", "Hybrid", "On-site"];
const TYPES: Job["type"][] = ["Full-time", "Part-time", "Contract"];
const CATS = CATEGORIES.filter((c) => c !== "All roles");

const BLANK: Job = {
  id: "",
  title: "",
  company: "",
  location: "",
  mode: "Remote",
  type: "Full-time",
  salary: "",
  category: "Operations",
  status: "Hiring",
  postedDaysAgo: 0,
  humanEdge: "",
  summary: "",
  responsibilities: [""],
  broughtFrom: "",
  tags: [],
};

const jsonHeaders = { "Content-Type": "application/json" };
const input =
  "w-full rounded-lg border border-steel-line bg-void px-3 py-2 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500";
const label = "mb-1 block text-xs font-medium text-fog";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Save = "idle" | "saving" | "saved" | "error";

export function JobsManager({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [original, setOriginal] = useState(""); // JSON of the loaded job
  const [isNew, setIsNew] = useState(false);
  const [save, setSave] = useState<Save>("idle");
  const [status, setStatus] = useState("");

  const dirty = job ? JSON.stringify(job) !== original : false;
  const canSave = isNew ? !!job?.title?.trim() : dirty;

  function edit(j: Job | null) {
    const next = j
      ? { ...j, responsibilities: [...j.responsibilities], tags: [...j.tags] }
      : { ...BLANK };
    setJob(next);
    setOriginal(JSON.stringify(next));
    setIsNew(!j);
    setSave("idle");
    setStatus("");
  }
  function set<K extends keyof Job>(key: K, value: Job[K]) {
    setJob((j) => (j ? { ...j, [key]: value } : j));
    if (save === "saved" || save === "error") setSave("idle");
  }

  async function doSave() {
    if (!job) return;
    const payload: Job = {
      ...job,
      id: (job.id || slugify(job.title)).trim(),
      postedDaysAgo: Number(job.postedDaysAgo) || 0,
      responsibilities: job.responsibilities.map((r) => r.trim()).filter(Boolean),
      tags: job.tags.map((t) => t.trim()).filter(Boolean),
    };
    if (!payload.id || !payload.title) {
      setSave("error");
      setStatus("A title (and id) is required.");
      return;
    }
    setSave("saving");
    setStatus("");
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ job: payload }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed.");
      setJob(payload);
      setOriginal(JSON.stringify(payload));
      setIsNew(false);
      setSave("saved");
      router.refresh();
      setTimeout(() => setSave((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch (err) {
      setSave("error");
      setStatus(err instanceof Error ? err.message : "Save failed.");
    }
  }

  async function del() {
    if (!job || isNew) return;
    if (!window.confirm(`Delete "${job.title}"?`)) return;
    const res = await fetch("/api/admin/jobs", {
      method: "DELETE",
      headers: jsonHeaders,
      body: JSON.stringify({ id: job.id }),
    });
    const json = await res.json();
    if (!json.ok) return setStatus(json.error || "Delete failed.");
    setJob(null);
    router.refresh();
  }

  async function seedDefaults() {
    const res = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ seedAll: true }),
    });
    const json = await res.json();
    setStatus(json.ok ? "Default jobs loaded." : json.error || "Failed.");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => edit(null)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
        >
          + New job
        </button>
        <button
          onClick={seedDefaults}
          className="rounded-lg border border-steel-line px-4 py-2 text-sm font-medium text-mist hover:border-blue-500/60 hover:text-chrome"
        >
          Load default jobs
        </button>
        {status && save !== "error" && (
          <span className="text-sm text-fog">{status}</span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* List */}
        <ul className="space-y-1.5">
          {jobs.map((j) => (
            <li key={j.id}>
              <button
                onClick={() => edit(j)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  job && !isNew && job.id === j.id
                    ? "border-blue-500/60 bg-blue-500/5"
                    : "border-steel-line bg-navy hover:border-blue-500/40"
                }`}
              >
                <span className="block text-sm font-medium text-chrome">{j.title}</span>
                <span className="block text-xs text-fog">{j.company}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Form */}
        {job ? (
          <div className="rounded-2xl border border-steel-line bg-navy p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label}>Title</label>
                <input
                  className={input}
                  value={job.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="AI Output Auditor"
                />
              </div>
              <div>
                <label className={label}>Company</label>
                <input className={input} value={job.company} onChange={(e) => set("company", e.target.value)} />
              </div>
              <div>
                <label className={label}>Location</label>
                <input className={input} value={job.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <div>
                <label className={label}>Work mode</label>
                <select className={input} value={job.mode} onChange={(e) => set("mode", e.target.value as Job["mode"])}>
                  {MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Employment type</label>
                <select className={input} value={job.type} onChange={(e) => set("type", e.target.value as Job["type"])}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Category</label>
                <select className={input} value={job.category} onChange={(e) => set("category", e.target.value)}>
                  {CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Status</label>
                <select
                  className={input}
                  value={job.status || "Hiring"}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {JOB_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Salary</label>
                <input className={input} value={job.salary} onChange={(e) => set("salary", e.target.value)} placeholder="$78k – $96k" />
              </div>
              <div>
                <label className={label}>Posted (days ago)</label>
                <input type="number" min={0} className={input} value={job.postedDaysAgo} onChange={(e) => set("postedDaysAgo", Number(e.target.value))} />
              </div>
              <div>
                <label className={label}>URL id (slug)</label>
                <input
                  className={input}
                  value={job.id}
                  onChange={(e) => set("id", e.target.value)}
                  placeholder={slugify(job.title) || "auto from title"}
                  disabled={!isNew}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={label}>Why it holds up (human edge)</label>
                <textarea className={`${input} h-20`} value={job.humanEdge} onChange={(e) => set("humanEdge", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Summary</label>
                <textarea className={`${input} h-20`} value={job.summary} onChange={(e) => set("summary", e.target.value)} />
              </div>

              {/* Responsibilities list */}
              <div className="sm:col-span-2">
                <label className={label}>Responsibilities</label>
                <div className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className={input}
                        value={r}
                        onChange={(e) => {
                          const next = [...job.responsibilities];
                          next[i] = e.target.value;
                          set("responsibilities", next);
                        }}
                        placeholder="Responsibility"
                      />
                      <button
                        type="button"
                        onClick={() => set("responsibilities", job.responsibilities.filter((_, k) => k !== i))}
                        className="shrink-0 rounded-lg border border-steel-line px-3 text-sm text-fog hover:text-red-600"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => set("responsibilities", [...job.responsibilities, ""])}
                    className="text-sm font-medium text-blue-300 hover:text-blue-400"
                  >
                    + Add responsibility
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={label}>Transfers from</label>
                <textarea className={`${input} h-16`} value={job.broughtFrom} onChange={(e) => set("broughtFrom", e.target.value)} placeholder="You already do this if you were a ___" />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Tags <span className="text-faint">(comma-separated)</span></label>
                <input
                  className={input}
                  value={job.tags.join(", ")}
                  onChange={(e) => set("tags", e.target.value.split(","))}
                  placeholder="No-code, Domain expertise, Growing field"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={doSave}
                disabled={!canSave || save === "saving"}
                className="inline-flex min-w-[8rem] items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {save === "saving" && <Spinner className="h-4 w-4" />}
                {save === "saved" && <Check className="h-4 w-4" />}
                {save === "saving"
                  ? "Saving…"
                  : save === "saved"
                    ? "Saved"
                    : isNew
                      ? "Create job"
                      : "Save job"}
              </button>
              {!isNew && (
                <button
                  onClick={del}
                  disabled={save === "saving"}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
              {save === "error" && (
                <span className="text-sm text-red-600">{status}</span>
              )}
              {!canSave && !isNew && save === "idle" && (
                <span className="text-sm text-fog">No changes to save.</span>
              )}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-steel-line p-8 text-center text-sm text-fog">
            Select a job to edit, or add a new one.
          </p>
        )}
      </div>
    </div>
  );
}
