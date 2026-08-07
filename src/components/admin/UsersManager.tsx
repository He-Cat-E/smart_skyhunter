"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserDetailDialog } from "./UserDetailDialog";

export type AdminUser = {
  email: string;
  name: string;
  provider?: string;
  is_admin?: boolean;
  suspended?: boolean;
  suspendedReason?: string;
  suspendedAt?: string;
  createdAt: string;
  industry: string;
  location: string;
  // Full profile — shown in the row-click detail dialog.
  avatarUrl?: string;
  headline?: string;
  summary?: string;
  skills?: string[];
  previousRole?: string;
  desiredRole?: string;
  situation?: string;
  experienceYears?: string;
  availability?: string;
  workPreference?: string;
  desiredSalary?: string;
  phone?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  connections?: string[];
  // Signup IP intelligence (admin-only)
  signupLocation?: string; // geo-derived "City, Region, Country"
  signupIp?: string;
  isp?: string;
  vpn?: boolean; // signed up behind a VPN/proxy/Tor
  vps?: boolean; // signed up from a hosting/VPS IP
  ipChecked?: boolean; // the intel lookup actually ran
};

const AVATAR_COLORS = [
  "bg-[#8710d8]",
  "bg-[#2aa79b]",
  "bg-[#e17076]",
  "bg-[#3c8ce7]",
  "bg-[#e6a04c]",
  "bg-[#6bc86b]",
];
function colorFor(s: string): string {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
type SortKey = "name" | "createdAt" | "provider" | "industry";

function initials(name: string, email: string): string {
  const base = name?.trim() || email;
  return (
    base
      .split(/[\s@.]+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

export function UsersManager({
  users,
  currentEmail,
}: {
  users: AdminUser[];
  currentEmail: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "createdAt" ? "desc" : "asc" },
    );
  }

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.industry} ${u.location} ${u.signupLocation ?? ""} ${u.isp ?? ""} ${u.signupIp ?? ""}${u.vpn ? " vpn" : ""}${u.vps ? " vps" : ""}`
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );

  const flaggedCount = users.filter((u) => u.vpn || u.vps).length;

  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "createdAt") {
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
      );
    }
    const val = (u: AdminUser) =>
      sort.key === "name"
        ? u.name
        : sort.key === "provider"
          ? (u.provider ?? "Email")
          : u.industry;
    return val(a).localeCompare(val(b)) * dir;
  });

  const arrow = (k: SortKey) =>
    sort.key === k ? (sort.dir === "asc" ? "▲" : "▼") : "↕";

  const head = (label: string, k: SortKey) => (
    <th className="px-4 py-3 font-semibold">
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-chrome"
      >
        {label}
        <span
          className={`text-[0.6rem] ${sort.key === k ? "text-blue-300" : "text-faint/60"}`}
        >
          {arrow(k)}
        </span>
      </button>
    </th>
  );

  async function toggleAdmin(u: AdminUser) {
    setBusy(u.email);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: u.email, is_admin: !u.is_admin }),
    });
    setBusy(null);
    router.refresh();
  }

  async function toggleSuspend(u: AdminUser) {
    let reason = "";
    if (!u.suspended) {
      if (
        !window.confirm(
          `Suspend ${u.email}? They won't be able to sign in, and any active session ends on their next page load.`,
        )
      )
        return;
      reason = window.prompt("Reason (optional):", "") ?? "";
    }
    setBusy(u.email);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: u.email,
        suspended: !u.suspended,
        reason,
      }),
    });
    const json = await res.json();
    setBusy(null);
    if (!json.ok) window.alert(json.error || "Failed to update.");
    router.refresh();
  }

  async function del(u: AdminUser) {
    if (!window.confirm(`Delete ${u.email}? This can't be undone.`)) return;
    setBusy(u.email);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: u.email }),
    });
    const json = await res.json();
    setBusy(null);
    if (!json.ok) window.alert(json.error || "Failed to delete.");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, location, ISP, “vpn”, “vps”…"
          className="w-full max-w-sm rounded-xl border border-steel-line bg-void px-4 py-2.5 text-sm text-chrome outline-none placeholder:text-faint focus:border-blue-500"
        />
        <div className="flex shrink-0 items-center gap-3 text-sm text-fog">
          {flaggedCount > 0 && (
            <span className="rounded-md bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-400/30">
              {flaggedCount} VPN/VPS
            </span>
          )}
          <span>
            {filtered.length} of {users.length}
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-steel-line">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-navy text-xs uppercase tracking-wider text-fog">
            <tr>
              {head("User", "name")}
              {head("Signed up", "createdAt")}
              <th className="px-4 py-3 font-semibold">Location &amp; network</th>
              {head("Via", "provider")}
              {head("Role", "industry")}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-line">
            {sorted.map((u) => (
              <tr
                key={u.email}
                onClick={() => setSelected(u)}
                title="View full details"
                className={`cursor-pointer transition-colors ${u.suspended ? "bg-red-500/10 hover:bg-red-500/15" : "bg-void/40 hover:bg-abyss"}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white ${u.avatarUrl ? "bg-steel" : colorFor(u.email)}`}
                    >
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials(u.name, u.email)
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-chrome">
                        {u.name}
                        {u.is_admin && (
                          <span className="ml-2 rounded bg-blue-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-blue-300 ring-1 ring-blue-500/25">
                            ADMIN
                          </span>
                        )}
                        {u.suspended && (
                          <span className="ml-2 rounded bg-red-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-red-400 ring-1 ring-red-500/30">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-fog">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-fog">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="text-mist">{u.signupLocation || "—"}</div>
                  {u.isp && (
                    <div className="text-xs text-fog" title={u.isp}>
                      {u.isp}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {u.vpn && (
                      <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-amber-600 ring-1 ring-amber-400/30">
                        VPN / proxy
                      </span>
                    )}
                    {u.vps && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-red-600 ring-1 ring-red-500/30">
                        VPS / hosting
                      </span>
                    )}
                    {u.ipChecked && !u.vpn && !u.vps && (
                      <span className="rounded bg-cyan/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-cyan ring-1 ring-cyan/25">
                        Direct
                      </span>
                    )}
                    {!u.ipChecked && (
                      <span className="text-[0.65rem] text-faint">not checked</span>
                    )}
                  </div>
                  {u.signupIp && (
                    <div className="mt-0.5 font-mono text-[0.65rem] text-faint">
                      {u.signupIp}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-mist">
                  {u.provider ?? "Email"}
                </td>
                <td className="px-4 py-3 text-mist">{u.industry || "—"}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => toggleAdmin(u)}
                      disabled={busy === u.email}
                      className="rounded-lg border border-steel-line px-2.5 py-1 text-xs font-medium text-mist transition-colors hover:border-blue-500/60 hover:text-chrome disabled:opacity-50"
                    >
                      {u.is_admin ? "Revoke admin" : "Make admin"}
                    </button>
                    <button
                      onClick={() => toggleSuspend(u)}
                      disabled={
                        busy === u.email ||
                        u.email === currentEmail ||
                        (!u.suspended && u.is_admin)
                      }
                      title={
                        !u.suspended && u.is_admin
                          ? "Revoke admin before suspending"
                          : undefined
                      }
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
                        u.suspended
                          ? "border-cyan/40 text-cyan hover:bg-cyan/10"
                          : "border-amber-400/40 text-amber-500 hover:bg-amber-400/10"
                      }`}
                    >
                      {u.suspended ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => del(u)}
                      disabled={busy === u.email || u.email === currentEmail}
                      className="rounded-lg border border-red-500/40 px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fog">
                  No users match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <UserDetailDialog user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
