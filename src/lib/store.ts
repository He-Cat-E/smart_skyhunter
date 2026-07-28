import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { getSupabase, noteSupabaseDown } from "./supabase";
import { JOBS as JOB_SEED, type Job } from "./jobs";
import type { SignupMeta } from "./geo";

/*
  Storage adapter. Every data access goes through here. When Supabase is
  configured AND reachable it uses Postgres; otherwise (not configured, or a
  transient network failure) it transparently uses the local JSON files under
  .data/ so the app never 500s on a DB hiccup.
*/

export type StoredUser = {
  email: string;
  name: string;
  passwordHash?: string;
  provider?: string;
  is_admin?: boolean;
  createdAt: string;
  profile: {
    previousRole: string;
    industry: string;
    situation: string;
    location: string;
    avatarUrl?: string;
    connections?: string[];
    tourSeen?: boolean; // has the user completed/dismissed the dashboard tour
    // Professional / job-seeker profile (all optional).
    headline?: string; // e.g. "Copywriter moving into content strategy"
    summary?: string; // short professional bio
    skills?: string[]; // ["Copywriting", "SEO", "Figma"]
    experienceYears?: string; // "0-1" | "1-3" | "3-5" | "5-10" | "10+"
    desiredRole?: string; // target role
    workPreference?: string; // Remote | Hybrid | On-site | No preference
    availability?: string; // Immediately | Within 2 weeks | Within a month | Just exploring
    desiredSalary?: string; // free text, e.g. "$2.5K–$3.5K / month"
    phone?: string;
    website?: string; // portfolio / personal site
    linkedinUrl?: string;
    githubUrl?: string;
    // Account moderation — an admin can suspend a stranger/abusive account.
    // Stored in the JSONB profile so no schema migration is needed.
    suspended?: boolean;
    suspendedAt?: string; // ISO timestamp
    suspendedReason?: string; // optional admin note
    // IP geolocation + VPN/VPS detection captured at signup (admin-only).
    signup?: SignupMeta;
  };
};

export type Pending = {
  email: string;
  name: string;
  passwordHash: string;
  profile: StoredUser["profile"];
  code: string;
  expiresAt: number;
  attempts: number;
};

export type Registration = {
  timestamp: string;
  name: string;
  email: string;
  previousRole: string;
  industry: string;
  situation: string;
  location: string;
};

// ---- resilience wrapper --------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type SB = NonNullable<ReturnType<typeof getSupabase>>;

// Decide whether to fall back to the local store on a Supabase error.
//
// Fall back (return true) for:
//   - connectivity problems: fetch failed, DNS, timeout, abort — these carry no
//     code at all.
//   - transient JWT/auth-timing errors: PGRST3xx, e.g. PGRST301 "JWT expired"
//     and PGRST303 "JWT issued at future" (clock skew between this machine and
//     Supabase's servers). The token is momentarily unusable, not the query.
//
// Surface (return false) genuine query errors: other PGRST codes (bad request,
// schema/permission) and 5-char SQLSTATEs like "42P01" (missing table).
function isRecoverableError(err: any): boolean {
  const code = String(err?.code ?? "");
  if (/^PGRST3\d\d$/i.test(code)) return true;
  if (/^PGRST/i.test(code)) return false;
  if (/^[0-9A-Za-z]{5}$/.test(code)) return false;
  return true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isJwtSkew = (err: any) => /^PGRST3\d\d$/i.test(String(err?.code ?? ""));

// Run a Supabase op; on a network failure, open the breaker and use the local
// fallback instead of throwing. Real query errors (bad SQL, etc.) still throw.
//
// Transient JWT clock-skew errors (PGRST3xx, e.g. "JWT issued at future") get a
// couple of quick retries FIRST — they self-heal in well under a second, and
// falling back to the (usually empty) local store would otherwise hide real
// Supabase data. Only after the retries are exhausted do we fall back.
async function store<T>(
  sbFn: (sb: SB) => Promise<T>,
  fileFn: () => Promise<T>,
): Promise<T> {
  const sb = getSupabase();
  if (!sb) return fileFn();

  for (let attempt = 0; ; attempt++) {
    try {
      return await sbFn(sb);
    } catch (err) {
      if (isJwtSkew(err) && attempt < 3) {
        await sleep(200 * (attempt + 1)); // 200ms, 400ms, 600ms
        continue;
      }
      if (isRecoverableError(err)) {
        if (isJwtSkew(err)) {
          noteSupabaseDown(5_000);
          console.warn(
            `[store] Supabase auth ${(err as { code?: string })?.code} ` +
              `(${(err as { message?: string })?.message ?? ""}) persisted after ` +
              "retries — serving the local store, retrying Supabase in ~5s.",
          );
        } else {
          noteSupabaseDown();
          console.error(
            "[store] Supabase unreachable — falling back to the local store.",
          );
        }
        return fileFn();
      }
      throw err;
    }
  }
}

// ---- file helpers --------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), ".data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, file),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

const lc = (e: string) => e.trim().toLowerCase();

// ---- users ---------------------------------------------------------------

function rowToUser(r: any): StoredUser {
  return {
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash ?? undefined,
    provider: r.provider ?? undefined,
    is_admin: !!r.is_admin,
    createdAt: r.created_at,
    profile: r.profile ?? {
      previousRole: "",
      industry: "",
      situation: "",
      location: "",
    },
  };
}

function userToRow(u: StoredUser): any {
  return {
    email: lc(u.email),
    name: u.name,
    password_hash: u.passwordHash ?? null,
    provider: u.provider ?? null,
    is_admin: !!u.is_admin,
    profile: u.profile,
    created_at: u.createdAt,
  };
}

export async function listUsers(): Promise<StoredUser[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToUser);
    },
    () => readJson<StoredUser[]>("users.json", []),
  );
}

export async function findUserRow(email: string): Promise<StoredUser | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("users")
        .select("*")
        .eq("email", lc(email))
        .maybeSingle();
      if (error) throw error;
      return data ? rowToUser(data) : null;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      return list.find((u) => lc(u.email) === lc(email)) ?? null;
    },
  );
}

export async function insertUser(user: StoredUser): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("users").insert(userToRow(user));
      if (error) throw error;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      list.push({ ...user, email: lc(user.email) });
      await writeJson("users.json", list);
    },
  );
}

export async function patchUser(
  email: string,
  patch: {
    name?: string;
    is_admin?: boolean;
    profile?: Partial<StoredUser["profile"]>;
  },
): Promise<StoredUser | null> {
  const existing = await findUserRow(email);
  if (!existing) return null;
  const merged: StoredUser = {
    ...existing,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.is_admin !== undefined ? { is_admin: patch.is_admin } : {}),
    profile: { ...existing.profile, ...(patch.profile ?? {}) },
  };

  return store(
    async (sb) => {
      const { error } = await sb
        .from("users")
        .update({
          name: merged.name,
          is_admin: merged.is_admin,
          profile: merged.profile,
        })
        .eq("email", lc(email));
      if (error) throw error;
      return merged;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      const i = list.findIndex((u) => lc(u.email) === lc(email));
      if (i < 0) return null;
      list[i] = merged;
      await writeJson("users.json", list);
      return merged;
    },
  );
}

export async function removeUser(email: string): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("users").delete().eq("email", lc(email));
      if (error) throw error;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      await writeJson(
        "users.json",
        list.filter((u) => lc(u.email) !== lc(email)),
      );
    },
  );
}

// ---- pending signups -----------------------------------------------------

function rowToPending(r: any): Pending {
  return {
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash,
    profile: r.profile,
    code: r.code,
    expiresAt: Number(r.expires_at),
    attempts: r.attempts,
  };
}

export async function pendingGet(email: string): Promise<Pending | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("pending_signups")
        .select("*")
        .eq("email", lc(email))
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const p = rowToPending(data);
      return p.expiresAt > Date.now() ? p : null;
    },
    async () => {
      const list = await readJson<Pending[]>("pending.json", []);
      const now = Date.now();
      return (
        list.find((p) => lc(p.email) === lc(email) && p.expiresAt > now) ?? null
      );
    },
  );
}

export async function pendingUpsert(rec: Pending): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("pending_signups").upsert({
        email: lc(rec.email),
        name: rec.name,
        password_hash: rec.passwordHash,
        profile: rec.profile,
        code: rec.code,
        expires_at: rec.expiresAt,
        attempts: rec.attempts,
      });
      if (error) throw error;
    },
    async () => {
      const list = (await readJson<Pending[]>("pending.json", [])).filter(
        (p) => lc(p.email) !== lc(rec.email) && p.expiresAt > Date.now(),
      );
      list.push({ ...rec, email: lc(rec.email) });
      await writeJson("pending.json", list);
    },
  );
}

export async function pendingDelete(email: string): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("pending_signups")
        .delete()
        .eq("email", lc(email));
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Pending[]>("pending.json", []);
      await writeJson(
        "pending.json",
        list.filter((p) => lc(p.email) !== lc(email)),
      );
    },
  );
}

export async function pendingIncrement(email: string): Promise<number | null> {
  const p = await pendingGet(email);
  if (!p) return null;
  const attempts = p.attempts + 1;
  await pendingUpsert({ ...p, attempts });
  return attempts;
}

// ---- registrations (signup log) ------------------------------------------

export async function registrationAdd(rec: Registration): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("registrations").insert({
        name: rec.name,
        email: rec.email,
        previous_role: rec.previousRole,
        industry: rec.industry,
        situation: rec.situation,
        location: rec.location,
      });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Registration[]>("registrations.json", []);
      list.push(rec);
      await writeJson("registrations.json", list);
    },
  );
}

export async function registrationList(): Promise<Registration[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        timestamp: r.created_at,
        name: r.name ?? "",
        email: r.email ?? "",
        previousRole: r.previous_role ?? "",
        industry: r.industry ?? "",
        situation: r.situation ?? "",
        location: r.location ?? "",
      }));
    },
    async () => {
      const list = await readJson<Registration[]>("registrations.json", []);
      return [...list].reverse();
    },
  );
}

// ---- jobs ----------------------------------------------------------------

export async function jobsList(): Promise<Job[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("jobs")
        .select("data,sort")
        .order("sort", { ascending: true });
      if (error) throw error;
      if (data && data.length) return data.map((r: any) => r.data as Job);
      return JOB_SEED;
    },
    async () => {
      const list = await readJson<Job[]>("jobs.json", []);
      return list.length ? list : JOB_SEED;
    },
  );
}

export async function jobGet(id: string): Promise<Job | null> {
  return (await jobsList()).find((j) => j.id === id) ?? null;
}

export async function jobUpsert(job: Job): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("jobs")
        .upsert({ id: job.id, data: job, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Job[]>("jobs.json", []);
      const base = list.length ? list : [...JOB_SEED];
      const i = base.findIndex((j) => j.id === job.id);
      if (i >= 0) base[i] = job;
      else base.push(job);
      await writeJson("jobs.json", base);
    },
  );
}

export async function jobDelete(id: string): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Job[]>("jobs.json", []);
      const base = list.length ? list : [...JOB_SEED];
      await writeJson(
        "jobs.json",
        base.filter((j) => j.id !== id),
      );
    },
  );
}

// ---- content collections -------------------------------------------------

export async function collectionGet<T>(key: string, seed: T): Promise<T> {
  const all = await contentAll();
  return key in all ? (all[key] as T) : seed;
}

export async function contentAll(): Promise<Record<string, unknown>> {
  return store(
    async (sb) => {
      const { data, error } = await sb.from("content").select("key,value");
      if (error) throw error;
      const map: Record<string, unknown> = {};
      for (const r of data ?? []) map[r.key] = r.value;
      return map;
    },
    () => readJson<Record<string, unknown>>("content.json", {}),
  );
}

export async function collectionSet(key: string, value: unknown): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("content")
        .upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async () => {
      const all = await readJson<Record<string, unknown>>("content.json", {});
      all[key] = value;
      await writeJson("content.json", all);
    },
  );
}

// ---- notifications -------------------------------------------------------

export type Notification = {
  id: string;
  email: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type NewNotification = { type: string; title: string; body?: string };

export async function notifyAdd(
  email: string,
  n: NewNotification,
): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("notifications").insert({
        email: lc(email),
        type: n.type,
        title: n.title,
        body: n.body ?? "",
      });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      list.push({
        id: crypto.randomUUID(),
        email: lc(email),
        type: n.type,
        title: n.title,
        body: n.body ?? "",
        read: false,
        createdAt: new Date().toISOString(),
      });
      await writeJson("notifications.json", list);
    },
  );
}

export async function notifyList(email: string): Promise<Notification[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("notifications")
        .select("*")
        .eq("email", lc(email))
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: String(r.id),
        email: r.email,
        type: r.type,
        title: r.title,
        body: r.body ?? "",
        read: !!r.read,
        createdAt: r.created_at,
      }));
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      return list
        .filter((n) => lc(n.email) === lc(email))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 50);
    },
  );
}

export async function notifyUnread(email: string): Promise<number> {
  return store(
    async (sb) => {
      const { count, error } = await sb
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("email", lc(email))
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      return list.filter((n) => lc(n.email) === lc(email) && !n.read).length;
    },
  );
}

export async function notifyMarkRead(
  email: string,
  id?: string,
): Promise<void> {
  return store(
    async (sb) => {
      let q = sb
        .from("notifications")
        .update({ read: true })
        .eq("email", lc(email));
      if (id) q = q.eq("id", id);
      const { error } = await q;
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      for (const n of list) {
        if (lc(n.email) === lc(email) && (!id || n.id === id)) n.read = true;
      }
      await writeJson("notifications.json", list);
    },
  );
}

// ---- job applications ----------------------------------------------------

export type Application = {
  id: string;
  email: string;
  jobId: string;
  jobTitle: string;
  status: string;
  note?: string;
  createdAt: string;
};

function rowToApp(r: any): Application {
  return {
    id: String(r.id),
    email: r.email,
    jobId: r.job_id,
    jobTitle: r.job_title ?? "",
    status: r.status ?? "applied",
    note: r.note ?? "",
    createdAt: r.created_at,
  };
}

// True when Supabase rejects a write because a column doesn't exist yet — lets
// us degrade gracefully when the optional `note` column hasn't been migrated.
function isUnknownColumn(err: any): boolean {
  const code = String(err?.code ?? "");
  return code === "PGRST204" || code === "42703";
}

export async function applicationAdd(
  email: string,
  jobId: string,
  jobTitle: string,
  note = "",
): Promise<void> {
  return store(
    async (sb) => {
      const payload: Record<string, string> = {
        email: lc(email),
        job_id: jobId,
        job_title: jobTitle,
        status: "applied",
      };
      if (note) payload.note = note;
      const opts = { onConflict: "email,job_id" };
      let { error } = await sb.from("applications").upsert(payload, opts);
      // If the `note` column hasn't been migrated yet, still record the apply.
      if (error && note && isUnknownColumn(error)) {
        delete payload.note;
        ({ error } = await sb.from("applications").upsert(payload, opts));
      }
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      if (!list.some((a) => lc(a.email) === lc(email) && a.jobId === jobId)) {
        list.push({
          id: crypto.randomUUID(),
          email: lc(email),
          jobId,
          jobTitle,
          status: "applied",
          note,
          createdAt: new Date().toISOString(),
        });
        await writeJson("applications.json", list);
      }
    },
  );
}

export async function applicationRemove(
  email: string,
  jobId: string,
): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("applications")
        .delete()
        .eq("email", lc(email))
        .eq("job_id", jobId);
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      await writeJson(
        "applications.json",
        list.filter((a) => !(lc(a.email) === lc(email) && a.jobId === jobId)),
      );
    },
  );
}

export async function applicationsByUser(email: string): Promise<Application[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .select("*")
        .eq("email", lc(email))
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToApp);
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      return list
        .filter((a) => lc(a.email) === lc(email))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function applicationsAll(): Promise<Application[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToApp);
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function appliedJobIds(email: string): Promise<string[]> {
  return (await applicationsByUser(email)).map((a) => a.jobId);
}

export async function applicationUpdateStatus(
  id: string,
  status: string,
): Promise<Application | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .update({ status })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToApp(data) : null;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      let updated: Application | null = null;
      for (const a of list)
        if (a.id === id) {
          a.status = status;
          updated = a;
        }
      await writeJson("applications.json", list);
      return updated;
    },
  );
}

// Delete an application by id, returning the removed row (so the admin API can
// notify the member whose request was deleted).
export async function applicationDelete(id: string): Promise<Application | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToApp(data) : null;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      const removed = list.find((a) => a.id === id) ?? null;
      if (removed) await writeJson("applications.json", list.filter((a) => a.id !== id));
      return removed;
    },
  );
}

// ---- intro requests (contracts network) ----------------------------------

export type IntroRequest = {
  id: string;
  email: string;
  name: string;
  partner: string;
  role: string;
  contactEmail: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  // Set by an admin when they schedule and send the interview to the member.
  scheduledAt?: string; // ISO datetime of the confirmed interview
  meetingLink?: string; // Lark / video-call link
  scheduleNote?: string; // optional admin note (prep, agenda, etc.)
};

function rowToIntro(r: any): IntroRequest {
  return {
    id: String(r.id),
    email: r.email,
    name: r.name ?? "",
    partner: r.partner,
    role: r.role ?? "",
    contactEmail: r.contact_email ?? "",
    phone: r.phone ?? "",
    message: r.message ?? "",
    status: r.status ?? "pending",
    createdAt: r.created_at,
    scheduledAt: r.scheduled_at ?? undefined,
    meetingLink: r.meeting_link ?? undefined,
    scheduleNote: r.schedule_note ?? undefined,
  };
}

export async function introAdd(
  email: string,
  name: string,
  partner: string,
  role: string,
  contact: { contactEmail: string; phone: string; message: string },
): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("intro_requests").insert({
        email: lc(email),
        name,
        partner,
        role,
        contact_email: contact.contactEmail,
        phone: contact.phone,
        message: contact.message,
        status: "pending",
      });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      list.push({
        id: crypto.randomUUID(),
        email: lc(email),
        name,
        partner,
        role,
        contactEmail: contact.contactEmail,
        phone: contact.phone,
        message: contact.message,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      await writeJson("intros.json", list);
    },
  );
}

export async function introList(): Promise<IntroRequest[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToIntro);
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function introsByUser(email: string): Promise<IntroRequest[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .select("*")
        .eq("email", lc(email))
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToIntro);
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      return list
        .filter((i) => lc(i.email) === lc(email))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function introUpdateStatus(
  id: string,
  status: string,
): Promise<IntroRequest | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .update({ status })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      let updated: IntroRequest | null = null;
      for (const it of list)
        if (it.id === id) {
          it.status = status;
          updated = it;
        }
      await writeJson("intros.json", list);
      return updated;
    },
  );
}

// Delete an interview/intro request by id, returning the removed row (so the
// admin API can notify the member whose request was deleted).
export async function introDelete(id: string): Promise<IntroRequest | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      const removed = list.find((it) => it.id === id) ?? null;
      if (removed) await writeJson("intros.json", list.filter((it) => it.id !== id));
      return removed;
    },
  );
}

// Admin schedules and "sends" the interview: sets the confirmed time / meeting
// link / note and flips the status to "scheduled". Returns the updated row so
// the API can notify the member.
export async function introSchedule(
  id: string,
  schedule: { scheduledAt: string; meetingLink?: string; scheduleNote?: string },
): Promise<IntroRequest | null> {
  return store(
    async (sb) => {
      const full = {
        status: "scheduled",
        scheduled_at: schedule.scheduledAt,
        meeting_link: schedule.meetingLink ?? "",
        schedule_note: schedule.scheduleNote ?? "",
      };
      let { data, error } = await sb
        .from("intro_requests")
        .update(full)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      // If the schedule columns haven't been migrated yet, still mark it
      // scheduled (the member is notified with the details regardless).
      if (error && isUnknownColumn(error)) {
        ({ data, error } = await sb
          .from("intro_requests")
          .update({ status: "scheduled" })
          .eq("id", id)
          .select("*")
          .maybeSingle());
      }
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      let updated: IntroRequest | null = null;
      for (const it of list)
        if (it.id === id) {
          it.status = "scheduled";
          it.scheduledAt = schedule.scheduledAt;
          it.meetingLink = schedule.meetingLink || undefined;
          it.scheduleNote = schedule.scheduleNote || undefined;
          updated = it;
        }
      await writeJson("intros.json", list);
      return updated;
    },
  );
}

// Admin creates a brand-new scheduled interview for any registered member
// (they never had to request one). Returns the created row so the API can
// notify + deep-link. Reuses the same intro_requests store as booked interviews
// so it shows up in the member's panel automatically.
export async function introCreateScheduled(
  email: string,
  name: string,
  opts: {
    partner?: string;
    role?: string;
    scheduledAt: string;
    meetingLink?: string;
    scheduleNote?: string;
  },
): Promise<IntroRequest | null> {
  const partner = opts.partner || "SkyHunter interview";
  const role = opts.role || "";
  return store(
    async (sb) => {
      const base: Record<string, string> = {
        email: lc(email),
        name,
        partner,
        role,
        contact_email: lc(email),
        phone: "",
        message: "",
        status: "scheduled",
      };
      const full = {
        ...base,
        scheduled_at: opts.scheduledAt,
        meeting_link: opts.meetingLink ?? "",
        schedule_note: opts.scheduleNote ?? "",
      };
      let { data, error } = await sb
        .from("intro_requests")
        .insert(full)
        .select("*")
        .maybeSingle();
      // If the schedule columns aren't migrated, still create the interview.
      if (error && isUnknownColumn(error)) {
        ({ data, error } = await sb
          .from("intro_requests")
          .insert(base)
          .select("*")
          .maybeSingle());
      }
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      const row: IntroRequest = {
        id: crypto.randomUUID(),
        email: lc(email),
        name,
        partner,
        role,
        contactEmail: lc(email),
        phone: "",
        message: "",
        status: "scheduled",
        createdAt: new Date().toISOString(),
        scheduledAt: opts.scheduledAt,
        meetingLink: opts.meetingLink || undefined,
        scheduleNote: opts.scheduleNote || undefined,
      };
      list.push(row);
      await writeJson("intros.json", list);
      return row;
    },
  );
}
