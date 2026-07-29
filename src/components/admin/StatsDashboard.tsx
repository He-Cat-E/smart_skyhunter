"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/icons";

type Day = { date: string; signups: number; logins: number; visits: number };
type OnlineUser = { name: string; email: string; lastSeenAt: string };
type Totals = {
  members: number;
  signupsToday: number;
  loginsToday: number;
  loginUsersToday: number;
  visitsToday: number;
  online: number;
};
type Stats = { totals: Totals; days: Day[]; online: OnlineUser[] };

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
function ago(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function dayLabel(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Tile({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-steel-line bg-navy p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-fog">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-3xl font-semibold ${accent ? "text-blue-300" : "text-chrome"}`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-fog">{sub}</p>}
    </div>
  );
}

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (json.ok) {
          setStats(json);
          setError("");
        } else {
          setError("Couldn't load analytics.");
        }
      } catch {
        if (alive) setError("Couldn't load analytics.");
      } finally {
        if (alive) setLoaded(true);
      }
    };
    load();
    const t = setInterval(load, 15000); // keep "online now" fresh
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20 text-fog">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  if (error || !stats) {
    return <p className="py-10 text-center text-sm text-fog">{error || "No data."}</p>;
  }

  const { totals, days, online } = stats;
  const maxVisits = Math.max(1, ...days.map((d) => d.visits));

  return (
    <div className="space-y-8">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Tile label="Online now" value={totals.online} accent />
        <Tile label="Visits today" value={totals.visitsToday} />
        <Tile
          label="Logins today"
          value={totals.loginsToday}
          sub={`${totals.loginUsersToday} unique`}
        />
        <Tile label="New signups today" value={totals.signupsToday} />
        <Tile label="Total members" value={totals.members} />
      </div>

      {/* Visits chart */}
      <div className="rounded-2xl border border-steel-line bg-navy p-5">
        <h2 className="font-display text-lg font-semibold text-chrome">
          Visits · last {days.length} days
        </h2>
        <div className="mt-5 flex h-40 items-end gap-1.5">
          {days.map((d) => (
            <div
              key={d.date}
              className="group flex flex-1 flex-col items-center justify-end"
              title={`${dayLabel(d.date)} — ${d.visits} visits, ${d.logins} logins, ${d.signups} signups`}
            >
              <div className="flex w-full items-end justify-center">
                <div
                  className="w-full max-w-[26px] rounded-t bg-blue-500/80 transition-all group-hover:bg-blue-500"
                  style={{ height: `${Math.round((d.visits / maxVisits) * 130) + 2}px` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          {days.map((d) => (
            <div
              key={d.date}
              className="flex-1 text-center text-[0.6rem] text-faint"
            >
              {new Date(`${d.date}T00:00:00Z`).getUTCDate()}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Online users */}
        <div className="rounded-2xl border border-steel-line bg-navy p-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <h2 className="font-display text-lg font-semibold text-chrome">
              Online now
            </h2>
            <span className="rounded-full bg-steel px-2 py-0.5 text-xs font-semibold text-blue-300">
              {online.length}
            </span>
          </div>
          {online.length === 0 ? (
            <p className="mt-4 text-sm text-fog">No one is online right now.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {online.map((u) => (
                <li key={u.email} className="flex items-center gap-3">
                  <span
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${colorFor(u.email)}`}
                  >
                    {initials(u.name, u.email)}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-navy" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-chrome">
                      {u.name || u.email}
                    </p>
                    <p className="truncate text-xs text-fog">{u.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-faint">
                    {ago(u.lastSeenAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Daily breakdown table */}
        <div className="rounded-2xl border border-steel-line bg-navy p-5">
          <h2 className="font-display text-lg font-semibold text-chrome">
            Daily breakdown
          </h2>
          <div className="mt-4 max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-fog">
                <tr>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 text-right font-medium">Visits</th>
                  <th className="pb-2 text-right font-medium">Logins</th>
                  <th className="pb-2 text-right font-medium">Signups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-line">
                {[...days].reverse().map((d) => (
                  <tr key={d.date} className="text-chrome">
                    <td className="py-2 text-mist">{dayLabel(d.date)}</td>
                    <td className="py-2 text-right font-medium">{d.visits}</td>
                    <td className="py-2 text-right font-medium">{d.logins}</td>
                    <td className="py-2 text-right font-medium">{d.signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-xs text-fog">
        Dates are UTC. &quot;Online&quot; means active in the last 2 minutes.
      </p>
    </div>
  );
}
