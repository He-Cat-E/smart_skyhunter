import { NextResponse } from "next/server";
import { requireAdmin, findUser } from "@/lib/auth";
import {
  introUpdateStatus,
  introSchedule,
  introCreateScheduled,
  applicationUpdateStatus,
} from "@/lib/store";
import { notifyUser } from "@/lib/notify";
import {
  INTERVIEW_STATUSES,
  APPLICATION_STATUSES,
  formatSchedule,
} from "@/lib/requests";

export const runtime = "nodejs";

// Admin creates & sends a brand-new scheduled interview to any registered
// member — even one who never requested one.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Pick a member." }, { status: 400 });
  }
  const user = await findUser(email);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "That email isn't a registered member." },
      { status: 400 },
    );
  }

  const scheduledAt = String(body?.scheduledAt ?? "").trim();
  const when = new Date(scheduledAt);
  if (!scheduledAt || isNaN(when.getTime())) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid date and time." },
      { status: 400 },
    );
  }

  const role = String(body?.role ?? "").trim();
  const meetingLink = String(body?.meetingLink ?? "").trim();
  const scheduleNote = String(body?.scheduleNote ?? "").trim();

  const row = await introCreateScheduled(email, user.name, {
    role,
    scheduledAt: when.toISOString(),
    meetingLink,
    scheduleNote,
  });
  if (row) {
    const linkLine = meetingLink ? ` Join here: ${meetingLink}` : "";
    await notifyUser(row.email, {
      type: `request:interview:${row.id}`,
      title: "Interview scheduled",
      body: `The SkyHunter team scheduled an interview with you for ${formatSchedule(
        when.toISOString(),
      )}.${linkLine}`,
    });
  }
  return NextResponse.json({ ok: true, id: row?.id ?? null });
}

const INTERVIEW_MSG: Record<string, string> = {
  pending: "Your interview request is pending review by the SkyHunter team.",
  contacted:
    "The SkyHunter team has reviewed your interview request and will reach out shortly.",
  scheduled:
    "Your interview has been scheduled — check your email for the confirmed time and video link.",
  connected:
    "You've been connected — congratulations! The team will guide you through the next steps.",
  declined:
    "We couldn't move your interview request forward right now. The team will suggest alternatives.",
  closed:
    "Your interview request has been closed. Reach out anytime to reopen it.",
};

function applicationMsg(job: string, status: string): string {
  const j = job || "your application";
  const map: Record<string, string> = {
    applied: `We received your application for ${j}.`,
    reviewing: `Your application for ${j} is now being reviewed.`,
    interviewing: `Good news — you're moving to the interview stage for ${j}!`,
    offer: `There's an offer waiting on your ${j} application — well done!`,
    hired: `Congratulations! You've been hired for ${j}.`,
    rejected: `Your ${j} application wasn't selected this time. Keep going — more roles are coming.`,
  };
  return map[status] ?? `Your application for ${j} is now "${status}".`;
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const type = String(body?.type ?? "").trim();
  const id = String(body?.id ?? "").trim();
  const status = String(body?.status ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  // Admin schedules & sends an interview (sets the confirmed time/link).
  if (type === "interview" && body?.action === "schedule") {
    const scheduledAt = String(body?.scheduledAt ?? "").trim();
    const when = new Date(scheduledAt);
    if (!scheduledAt || isNaN(when.getTime())) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid date and time." },
        { status: 400 },
      );
    }
    const meetingLink = String(body?.meetingLink ?? "").trim();
    const scheduleNote = String(body?.scheduleNote ?? "").trim();
    const row = await introSchedule(id, {
      scheduledAt: when.toISOString(),
      meetingLink,
      scheduleNote,
    });
    if (row) {
      const context = row.partner
        ? ` (${row.partner}${row.role ? ` – ${row.role}` : ""})`
        : "";
      const linkLine = meetingLink ? ` Join here: ${meetingLink}` : "";
      await notifyUser(row.email, {
        type: `request:interview:${row.id}`,
        title: "Interview scheduled",
        body: `Your interview${context} is set for ${formatSchedule(when.toISOString())}.${linkLine}`,
      });
    }
    return NextResponse.json({ ok: true, notified: !!row });
  }

  if (type === "interview") {
    if (!(INTERVIEW_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, error: "Bad status." }, { status: 400 });
    }
    const row = await introUpdateStatus(id, status);
    if (row) {
      const context = row.partner
        ? ` (${row.partner}${row.role ? ` – ${row.role}` : ""})`
        : "";
      await notifyUser(row.email, {
        // The type carries the deep-link target (kind:id) so the bell can open
        // this exact request — no extra notifications column needed.
        type: `request:interview:${row.id}`,
        title: "Interview update",
        body: (INTERVIEW_MSG[status] ?? `Your request is now "${status}".`) + context,
      });
    }
    return NextResponse.json({ ok: true, notified: !!row });
  }

  if (type === "application") {
    if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, error: "Bad status." }, { status: 400 });
    }
    const row = await applicationUpdateStatus(id, status);
    if (row) {
      await notifyUser(row.email, {
        type: `request:application:${row.id}`,
        title: "Application update",
        body: applicationMsg(row.jobTitle, status),
      });
    }
    return NextResponse.json({ ok: true, notified: !!row });
  }

  return NextResponse.json({ ok: false, error: "Unknown request type." }, { status: 400 });
}
