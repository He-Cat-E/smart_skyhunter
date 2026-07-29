"use client";

import { useState } from "react";
import { UsersManager, type AdminUser } from "./UsersManager";

export type SignupRow = {
  timestamp: string;
  name: string;
  email: string;
  industry: string;
  situation: string;
  location: string;
};

// Combined Users + Signups admin view: "Members" (accounts, with actions) and
// "Signup log" (the raw registration log) as two tabs on one page.
export function UsersView({
  users,
  currentEmail,
  signups,
}: {
  users: AdminUser[];
  currentEmail: string;
  signups: SignupRow[];
}) {
  const [tab, setTab] = useState<"members" | "signups">("members");

  const tabBtn = (k: "members" | "signups", label: string, n: number) => (
    <button
      onClick={() => setTab(k)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        tab === k
          ? "bg-blue-500/10 text-blue-500"
          : "text-mist hover:bg-abyss hover:text-chrome"
      }`}
    >
      {label} <span className="text-xs text-fog">({n})</span>
    </button>
  );

  return (
    <div>
      <div className="mb-4 flex gap-1.5">
        {tabBtn("members", "Members", users.length)}
        {tabBtn("signups", "Signup log", signups.length)}
      </div>

      {tab === "members" ? (
        <UsersManager users={users} currentEmail={currentEmail} />
      ) : (
        <SignupsTable rows={signups} />
      )}
    </div>
  );
}

function SignupsTable({ rows }: { rows: SignupRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-steel-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-navy text-xs uppercase tracking-wider text-fog">
          <tr>
            <th className="px-4 py-3 font-semibold">When</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Industry</th>
            <th className="px-4 py-3 font-semibold">Situation</th>
            <th className="px-4 py-3 font-semibold">Location</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-line">
          {rows.map((r, i) => (
            <tr key={i} className="bg-void/40">
              <td className="whitespace-nowrap px-4 py-3 text-fog">
                {new Date(r.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3 text-chrome">{r.name || "—"}</td>
              <td className="px-4 py-3 text-mist">{r.email || "—"}</td>
              <td className="px-4 py-3 text-mist">{r.industry || "—"}</td>
              <td className="px-4 py-3 text-mist">{r.situation || "—"}</td>
              <td className="px-4 py-3 text-mist">{r.location || "—"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-fog">
                No signups recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
