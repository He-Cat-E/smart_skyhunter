"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  INTERVIEW_STATUSES,
  APPLICATION_STATUSES,
  STATUS_BADGE,
  OPEN_STATUSES,
  formatSchedule,
} from "@/lib/requests";
import { Spinner, Check, Calendar, Trash, ChevronDown } from "@/components/icons";
import { MemberPicker } from "./MemberPicker";

export type RequestRow = {
  kind: "interview" | "application";
  id: string;
  createdAt: string;
  memberName: string;
  memberEmail: string;
  contactEmail: string;
  phone: string;
  title: string; // partner name / job title
  subtitle: string; // role / job id
  detail: string; // message / goals
  status: string;
  // interviews only — set once an admin schedules & sends it
  scheduledAt?: string;
  meetingLink?: string;
  scheduleNote?: string;
};

// ISO -> value for <input type="datetime-local"> in the admin's local time.
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Filter = "all" | "interview" | "application";

const KIND_LABEL: Record<RequestRow["kind"], string> = {
  interview: "Interview",
  application: "Job application",
};

const KIND_TAG: Record<RequestRow["kind"], string> = {
  interview: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/25",
  application: "bg-cyan/10 text-cyan ring-1 ring-cyan/25",
};

function statusesFor(kind: RequestRow["kind"]): readonly string[] {
  return kind === "interview" ? INTERVIEW_STATUSES : APPLICATION_STATUSES;
}

export function RequestsManager({
  rows,
  members = [],
}: {
  rows: RequestRow[];
  members?: { email: string; name: string }[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Schedule modal state. `scheduling` = an existing interview row being
  // (re)scheduled; `creating` = a brand-new interview for any member.
  const [scheduling, setScheduling] = useState<RequestRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [schedWhen, setSchedWhen] = useState("");
  const [schedLink, setSchedLink] = useState("");
  const [schedNote, setSchedNote] = useState("");
  const [schedErr, setSchedErr] = useState("");
  const [schedBusy, setSchedBusy] = useState(false);

  function resetScheduleFields() {
    setSchedWhen("");
    setSchedLink("");
    setSchedNote("");
    setSchedErr("");
  }

  function openSchedule(row: RequestRow) {
    setCreating(false);
    setScheduling(row);
    setSchedWhen(toLocalInput(row.scheduledAt));
    setSchedLink(row.meetingLink ?? "");
    setSchedNote(row.scheduleNote ?? "");
    setSchedErr("");
  }

  function openCreate() {
    setScheduling(null);
    setNewEmail(""); // admin searches & picks a member
    setNewRole("");
    resetScheduleFields();
    setCreating(true);
  }

  function closeModal() {
    setScheduling(null);
    setCreating(false);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const d = new Date(schedWhen);
    if (!newEmail) {
      setSchedErr("Pick a member.");
      return;
    }
    if (!schedWhen || isNaN(d.getTime())) {
      setSchedErr("Pick a valid date and time.");
      return;
    }
    setSchedBusy(true);
    setSchedErr("");
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          role: newRole.trim(),
          scheduledAt: d.toISOString(),
          meetingLink: schedLink.trim(),
          scheduleNote: schedNote.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to schedule.");
      const who =
        members.find((m) => m.email === newEmail)?.name || newEmail;
      setFlash(
        `Interview scheduled for ${formatSchedule(d.toISOString())} — ${who} was notified.`,
      );
      setCreating(false);
      router.refresh();
    } catch (err) {
      setSchedErr(err instanceof Error ? err.message : "Failed to schedule.");
    } finally {
      setSchedBusy(false);
    }
  }

  async function submitSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduling) return;
    const d = new Date(schedWhen);
    if (!schedWhen || isNaN(d.getTime())) {
      setSchedErr("Pick a valid date and time.");
      return;
    }
    setSchedBusy(true);
    setSchedErr("");
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "interview",
          action: "schedule",
          id: scheduling.id,
          scheduledAt: d.toISOString(),
          meetingLink: schedLink.trim(),
          scheduleNote: schedNote.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to schedule.");
      setFlash(
        `Interview scheduled for ${formatSchedule(d.toISOString())} — ${scheduling.memberName || "the member"} was notified.`,
      );
      setScheduling(null);
      router.refresh();
    } catch (err) {
      setSchedErr(err instanceof Error ? err.message : "Failed to schedule.");
    } finally {
      setSchedBusy(false);
    }
  }

  const counts = useMemo(() => {
    const open = rows.filter((r) => OPEN_STATUSES.has(r.status)).length;
    return {
      total: rows.length,
      interview: rows.filter((r) => r.kind === "interview").length,
      application: rows.filter((r) => r.kind === "application").length,
      open,
    };
  }, [rows]);

  const shown = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.kind === filter)),
    [rows, filter],
  );

  async function setStatus(row: RequestRow, status: string) {
    if (status === row.status) return;
    setBusy(row.id);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: row.kind, id: row.id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Update failed.");
      setFlash(`Status updated to "${status}" — ${row.memberName || "the member"} was notified.`);
      router.refresh();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteRequest(row: RequestRow) {
    const label = row.kind === "interview" ? "interview request" : "job application";
    if (
      !window.confirm(
        `Delete this ${label} from ${row.memberName || row.memberEmail}? This can't be undone — the member will be notified it was removed.`,
      )
    )
      return;
    setBusy(row.id);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: row.kind, id: row.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Delete failed.");
      setFlash(`Request deleted — ${row.memberName || "the member"} was notified.`);
      router.refresh();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  const chips: { key: Filter; label: string; n: number }[] = [
    { key: "all", label: "All", n: counts.total },
    { key: "interview", label: "Interviews", n: counts.interview },
    { key: "application", label: "Applications", n: counts.application },
  ];

  return (
    <div>
      {/* Summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Total requests", n: counts.total },
          { l: "Interviews", n: counts.interview },
          { l: "Applications", n: counts.application },
          { l: "Open / needs action", n: counts.open },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-xl border border-steel-line bg-navy p-4"
          >
            <div className="font-display text-2xl font-semibold text-chrome">
              {s.n}
            </div>
            <div className="mt-0.5 text-xs text-fog">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter + flash */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === c.key
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-mist hover:bg-abyss hover:text-chrome"
              }`}
            >
              {c.label}{" "}
              <span className="text-xs text-fog">({c.n})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {flash && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan/10 px-3 py-1.5 text-xs font-medium text-cyan ring-1 ring-cyan/25">
              <Check className="h-3.5 w-3.5" /> {flash}
            </span>
          )}
          <button
            onClick={openCreate}
            disabled={members.length === 0}
            title={members.length === 0 ? "No registered members yet" : undefined}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-50"
          >
            Schedule an interview
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-steel-line">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-navy text-xs uppercase tracking-wider text-fog">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Member &amp; contact</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-line">
            {shown.map((r) => (
              <tr key={`${r.kind}-${r.id}`} className="bg-void/40 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-fog">
                  {new Date(r.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-chrome">
                    {r.memberName || "—"}
                  </div>
                  <div className="text-xs text-fog">
                    {r.contactEmail || r.memberEmail}
                  </div>
                  {r.phone && <div className="text-xs text-fog">{r.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${KIND_TAG[r.kind]}`}
                  >
                    {KIND_LABEL[r.kind]}
                  </span>
                </td>
                <td className="max-w-[22rem] px-4 py-3">
                  {r.title && (
                    <div className="font-medium text-chrome">{r.title}</div>
                  )}
                  {r.subtitle && (
                    <div className="text-xs text-fog">{r.subtitle}</div>
                  )}
                  {r.detail && (
                    <p
                      className="mt-1 line-clamp-3 text-xs text-mist"
                      title={r.detail}
                    >
                      {r.detail}
                    </p>
                  )}
                  {r.kind === "interview" && r.scheduledAt && (
                    <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-600 ring-1 ring-amber-400/30">
                      Scheduled · {formatSchedule(r.scheduledAt)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                      STATUS_BADGE[r.status] ?? "bg-steel text-fog"
                    }`}
                  >
                    {busy === r.id && <Spinner className="h-3 w-3" />}
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-nowrap items-center justify-end gap-1.5">
                    <div className="relative">
                      <select
                        value={r.status}
                        disabled={busy === r.id}
                        onChange={(e) => setStatus(r, e.target.value)}
                        className="appearance-none rounded-lg border border-steel-line bg-void py-1.5 pl-3 pr-8 text-xs font-medium capitalize text-chrome outline-none transition-colors hover:border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {statusesFor(r.kind).map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog" />
                    </div>
                    {r.kind === "interview" && r.status === "scheduled" && (
                      <button
                        onClick={() => openSchedule(r)}
                        disabled={busy === r.id}
                        title={r.scheduledAt ? "Reschedule interview" : "Schedule interview"}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-500 ring-1 ring-inset ring-blue-500/25 transition-colors hover:bg-blue-500/20 hover:ring-blue-500/40 disabled:opacity-50"
                      >
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {r.scheduledAt ? "Reschedule" : "Schedule"}
                      </button>
                    )}
                    <button
                      onClick={() => deleteRequest(r)}
                      disabled={busy === r.id}
                      title="Delete request"
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-fog ring-1 ring-inset ring-steel-line transition-colors hover:bg-red-500/10 hover:text-red-600 hover:ring-red-400/40 disabled:opacity-50"
                    >
                      <Trash className="h-3.5 w-3.5 shrink-0" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fog">
                  No requests here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fog">
        Changing a status notifies the member automatically. Use{" "}
        <span className="font-medium text-mist">Schedule an interview</span> to
        send a confirmed time to any member — even one who hasn&apos;t requested
        one. For an existing request, set its status to{" "}
        <span className="font-medium text-mist">Scheduled</span> and the{" "}
        <span className="font-medium text-mist">Schedule</span> button appears to
        set the time and link.
      </p>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-chrome/40 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="lift relative w-full max-w-md rounded-2xl border border-steel-line bg-void p-6 text-left">
            <h3 className="font-display text-xl font-semibold text-chrome">
              Schedule an interview
            </h3>
            <p className="mt-1 text-sm text-fog">
              Send a confirmed interview time to any registered member. They&apos;ll
              be notified and see it in their requests panel.
            </p>

            <form onSubmit={submitCreate} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-mist">
                  Member
                </label>
                <MemberPicker
                  members={members}
                  value={newEmail}
                  onChange={setNewEmail}
                />
              </div>
              <div>
                <label
                  htmlFor="new-role"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Topic / role <span className="text-faint">(optional)</span>
                </label>
                <input
                  id="new-role"
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Intro call, Content strategist"
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="new-when"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Date &amp; time
                </label>
                <input
                  id="new-when"
                  type="datetime-local"
                  required
                  value={schedWhen}
                  onChange={(e) => setSchedWhen(e.target.value)}
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="new-link"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Meeting link{" "}
                  <span className="text-faint">(Lark / video call)</span>
                </label>
                <input
                  id="new-link"
                  type="url"
                  value={schedLink}
                  onChange={(e) => setSchedLink(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="new-note"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Note <span className="text-faint">(optional)</span>
                </label>
                <textarea
                  id="new-note"
                  rows={3}
                  value={schedNote}
                  onChange={(e) => setSchedNote(e.target.value)}
                  placeholder="e.g. Download Lark beforehand; bring your portfolio."
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {schedErr && (
                <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {schedErr}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-steel-line px-4 py-2.5 text-sm font-medium text-mist transition-colors hover:text-chrome"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedBusy}
                  className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
                >
                  {schedBusy && <Spinner className="h-4 w-4" />}
                  {schedBusy ? "Sending…" : "Schedule & send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-chrome/40 backdrop-blur-sm"
            onClick={() => setScheduling(null)}
            aria-hidden="true"
          />
          <div className="lift relative w-full max-w-md rounded-2xl border border-steel-line bg-void p-6 text-left">
            <h3 className="font-display text-xl font-semibold text-chrome">
              Schedule interview
            </h3>
            <p className="mt-1 text-sm text-fog">
              For{" "}
              <span className="font-medium text-mist">
                {scheduling.memberName || scheduling.memberEmail}
              </span>
              {scheduling.title ? ` · ${scheduling.title}` : ""}. They&apos;ll be
              notified with the time and link.
            </p>

            <form onSubmit={submitSchedule} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="sched-when"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Date &amp; time
                </label>
                <input
                  id="sched-when"
                  type="datetime-local"
                  required
                  value={schedWhen}
                  onChange={(e) => setSchedWhen(e.target.value)}
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="sched-link"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Meeting link{" "}
                  <span className="text-faint">(Lark / video call)</span>
                </label>
                <input
                  id="sched-link"
                  type="url"
                  value={schedLink}
                  onChange={(e) => setSchedLink(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="sched-note"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Note <span className="text-faint">(optional)</span>
                </label>
                <textarea
                  id="sched-note"
                  rows={3}
                  value={schedNote}
                  onChange={(e) => setSchedNote(e.target.value)}
                  placeholder="e.g. Download Lark beforehand; bring your portfolio."
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {schedErr && (
                <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {schedErr}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setScheduling(null)}
                  className="rounded-lg border border-steel-line px-4 py-2.5 text-sm font-medium text-mist transition-colors hover:text-chrome"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedBusy}
                  className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
                >
                  {schedBusy && <Spinner className="h-4 w-4" />}
                  {schedBusy ? "Sending…" : "Schedule & send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
