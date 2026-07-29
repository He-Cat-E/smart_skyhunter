import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listUsers, eventsSince, onlineUsers } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS = 14;
const ONLINE_WINDOW_MS = 2 * 60 * 1000; // "online" = seen in the last 2 minutes

// yyyy-mm-dd (UTC) bucket key.
function dayKey(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  const now = Date.now();
  const since = new Date(now - DAYS * 86400000).toISOString();

  const [users, events, online] = await Promise.all([
    listUsers(),
    eventsSince(since),
    onlineUsers(new Date(now - ONLINE_WINDOW_MS).toISOString()),
  ]);

  // Build the last DAYS day buckets (oldest → newest).
  const days: {
    date: string;
    signups: number;
    logins: number;
    visits: number;
  }[] = [];
  const index: Record<string, number> = {};
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
    index[d] = days.length;
    days.push({ date: d, signups: 0, logins: 0, visits: 0 });
  }

  // Signups are authoritative from the users table (covers history).
  for (const u of users) {
    const d = dayKey(u.createdAt);
    if (d in index) days[index[d]].signups++;
  }
  // Logins + visits from the event log.
  const loginUsersToday = new Set<string>();
  const todayKey = new Date(now).toISOString().slice(0, 10);
  for (const e of events) {
    const d = dayKey(e.createdAt);
    if (!(d in index)) continue;
    if (e.type === "login") {
      days[index[d]].logins++;
      if (d === todayKey && e.email) loginUsersToday.add(e.email);
    } else if (e.type === "visit") {
      days[index[d]].visits++;
    }
  }

  const today = days[days.length - 1];

  return NextResponse.json({
    ok: true,
    totals: {
      members: users.length,
      signupsToday: today.signups,
      loginsToday: today.logins,
      loginUsersToday: loginUsersToday.size,
      visitsToday: today.visits,
      online: online.length,
    },
    days,
    online: online.map((p) => ({
      name: p.name,
      email: p.email,
      lastSeenAt: p.lastSeenAt,
    })),
  });
}
