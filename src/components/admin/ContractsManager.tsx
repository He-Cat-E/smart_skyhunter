"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, Check, ArrowRight } from "@/components/icons";
import { MemberPicker } from "./MemberPicker";

export type ContractRow = {
  id: string;
  memberA: { name: string; email: string };
  memberB: { name: string; email: string };
  title: string;
  createdAt: string;
  lastMessage: string;
  lastMessageAt: string;
};

type Member = { email: string; name: string };

function when(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/12 text-xs font-semibold text-blue-500">
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

export function ContractsManager({
  contracts,
  members,
}: {
  contracts: ContractRow[];
  members: Member[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Match modal
  const [open, setOpen] = useState(false);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Who each member is already contracted with, so the pickers can hide anyone
  // who'd form an already-existing pair with the other selection.
  const contractedWith = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const c of contracts) {
      const ea = c.memberA.email.toLowerCase();
      const eb = c.memberB.email.toLowerCase();
      (map[ea] ??= new Set()).add(eb);
      (map[eb] ??= new Set()).add(ea);
    }
    return map;
  }, [contracts]);

  const availableExcept = (other: string) => {
    const o = other.toLowerCase();
    return members.filter(
      (m) =>
        m.email.toLowerCase() !== o &&
        !contractedWith[m.email.toLowerCase()]?.has(o),
    );
  };
  const membersForA = b ? availableExcept(b) : members;
  const membersForB = a ? availableExcept(a) : members;

  function openMatch() {
    setA("");
    setB("");
    setTitle("");
    setErr("");
    setOpen(true);
  }

  async function submitMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!a || !b || a === b) {
      setErr("Pick two different members.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/messages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contract", emailA: a, emailB: b, title: title.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Couldn't match.");
      setOpen(false);
      router.push(`/messages/${json.id}`);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Couldn't match.");
    } finally {
      setSaving(false);
    }
  }

  async function unmatch(row: ContractRow) {
    if (
      !window.confirm(
        `Close the contract chat between ${row.memberA.name} and ${row.memberB.name}? This deletes the chat and its messages, and notifies both members.`,
      )
    )
      return;
    setBusy(row.id);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed.");
      setFlash("Contract closed — both members were notified.");
      router.refresh();
    } catch (e2) {
      setFlash(e2 instanceof Error ? e2.message : "Failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-steel-line bg-navy px-3.5 py-2 text-sm">
            <span className="font-display text-lg font-semibold text-chrome">
              {contracts.length}
            </span>{" "}
            <span className="text-fog">active contracts</span>
          </span>
          {flash && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan/10 px-3 py-1.5 text-xs font-medium text-cyan ring-1 ring-cyan/25">
              <Check className="h-3.5 w-3.5" /> {flash}
            </span>
          )}
        </div>
        <button
          onClick={openMatch}
          disabled={members.length < 2}
          title={members.length < 2 ? "Need at least two members" : undefined}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-50"
        >
          Match two members
        </button>
      </div>

      {contracts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-steel-line bg-navy/40 p-10 text-center">
          <p className="text-mist">No contract matches yet.</p>
          <p className="mt-1 text-sm text-fog">
            Use <span className="font-medium text-chrome">Match two members</span>{" "}
            to connect two members in a private contract chat.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-steel-line">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-navy text-xs uppercase tracking-wider text-fog">
              <tr>
                <th className="px-4 py-3 font-semibold">Members</th>
                <th className="px-4 py-3 font-semibold">Context</th>
                <th className="px-4 py-3 font-semibold">Matched</th>
                <th className="px-4 py-3 font-semibold">Last activity</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-line">
              {contracts.map((c) => (
                <tr key={c.id} className="bg-void/40 align-top">
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={c.memberA.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-chrome">
                            {c.memberA.name}
                          </div>
                          <div className="truncate text-xs text-fog">
                            {c.memberA.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar name={c.memberB.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-chrome">
                            {c.memberB.name}
                          </div>
                          <div className="truncate text-xs text-fog">
                            {c.memberB.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-mist">{c.title || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-fog">
                    {when(c.createdAt)}
                  </td>
                  <td className="max-w-[16rem] px-4 py-3">
                    <p className="truncate text-mist" title={c.lastMessage}>
                      {c.lastMessage || "No messages yet"}
                    </p>
                    <p className="text-xs text-faint">{when(c.lastMessageAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/messages/${c.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-500 ring-1 ring-inset ring-blue-500/25 transition-colors hover:bg-blue-500/20"
                      >
                        Open chat <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => unmatch(c)}
                        disabled={busy === c.id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-fog ring-1 ring-inset ring-steel-line transition-colors hover:bg-red-500/10 hover:text-red-600 hover:ring-red-400/40 disabled:opacity-50"
                      >
                        {busy === c.id && <Spinner className="h-3 w-3" />}
                        Unmatch
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-chrome/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="lift relative w-full max-w-md rounded-2xl border border-steel-line bg-void p-6 text-left">
            <h3 className="font-display text-xl font-semibold text-chrome">
              Match two members
            </h3>
            <p className="mt-1 text-sm text-fog">
              Open a private real-time chat between two members for a contract.
              Both are notified in-app and by email.
            </p>
            <form onSubmit={submitMatch} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-mist">
                  First member
                </label>
                <MemberPicker members={membersForA} value={a} onChange={setA} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-mist">
                  Second member
                </label>
                <MemberPicker members={membersForB} value={b} onChange={setB} />
              </div>
              <div>
                <label
                  htmlFor="ct-title"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Context <span className="text-faint">(optional)</span>
                </label>
                <input
                  id="ct-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI-oversight contract"
                  className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {err && (
                <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {err}
                </p>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-steel-line px-4 py-2.5 text-sm font-medium text-mist transition-colors hover:text-chrome"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-w-[9rem] items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
                >
                  {saving && <Spinner className="h-4 w-4" />}
                  {saving ? "Connecting…" : "Connect & open chat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
