"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type AdminUser = {
  email: string;
  name: string;
  provider?: string;
  is_admin?: boolean;
  suspended?: boolean;
  createdAt: string;
  industry: string;
  location: string;
};

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

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.industry} ${u.location}`
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
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
          placeholder="Search name, email, industry…"
          className="w-full max-w-sm rounded-xl border border-steel-line bg-void px-4 py-2.5 text-sm text-chrome outline-none placeholder:text-faint focus:border-blue-500"
        />
        <span className="shrink-0 text-sm text-fog">
          {filtered.length} of {users.length}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-steel-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-navy text-xs uppercase tracking-wider text-fog">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Signed up</th>
              <th className="px-4 py-3 font-semibold">Via</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-line">
            {filtered.map((u) => (
              <tr
                key={u.email}
                className={u.suspended ? "bg-red-50/60" : "bg-void/40"}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-chrome">
                    {u.name}
                    {u.is_admin && (
                      <span className="ml-2 rounded bg-blue-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-blue-300 ring-1 ring-blue-500/25">
                        ADMIN
                      </span>
                    )}
                    {u.suspended && (
                      <span className="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-red-600 ring-1 ring-red-500/25">
                        SUSPENDED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-fog">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-fog">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-mist">
                  {u.provider ?? "Email"}
                </td>
                <td className="px-4 py-3 text-mist">{u.industry || "—"}</td>
                <td className="px-4 py-3">
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
                          : "border-amber-300 text-amber-600 hover:bg-amber-50"
                      }`}
                    >
                      {u.suspended ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => del(u)}
                      disabled={busy === u.email || u.email === currentEmail}
                      className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fog">
                  No users match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
