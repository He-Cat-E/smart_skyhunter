import { NextResponse } from "next/server";
import { requireAdmin, findUser } from "@/lib/auth";
import {
  introUpdateStatus,
  introSchedule,
  introCreateScheduled,
  introDelete,
  applicationUpdateStatus,
  applicationDelete,
} from "@/lib/store";
import { notifyUser } from "@/lib/notify";
import { sendRequestUpdateEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import {
  INTERVIEW_STATUSES,
  APPLICATION_STATUSES,
  formatSchedule,
} from "@/lib/requests";

export const runtime = "nodejs";

const REQUESTS_URL = `${SITE_URL}/requests`;
const JOBS_URL = `${SITE_URL}/jobs`;

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
    const whenText = formatSchedule(when.toISOString());
    await notifyUser(row.email, {
      type: `request:interview:${row.id}`,
      title: "Interview scheduled",
      body: `The SkyHunter team scheduled an interview with you for ${whenText}.${linkLine}`,
    });
    await sendRequestUpdateEmail({
      to: row.email,
      name: row.name,
      subject: "Your SkyHunter interview is scheduled",
      heading: "Interview scheduled",
      message: `The SkyHunter team scheduled an interview with you for ${whenText}.${
        scheduleNote ? ` Note: ${scheduleNote}` : ""
      }`,
      cta: meetingLink
        ? { label: "Join the interview", url: meetingLink }
        : { label: "View your requests", url: REQUESTS_URL },
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
      const whenText = formatSchedule(when.toISOString());
      await notifyUser(row.email, {
        type: `request:interview:${row.id}`,
        title: "Interview scheduled",
        body: `Your interview${context} is set for ${whenText}.${linkLine}`,
      });
      await sendRequestUpdateEmail({
        to: row.email,
        name: row.name,
        subject: "Your SkyHunter interview is scheduled",
        heading: "Interview scheduled",
        message: `Your interview${context} is set for ${whenText}.${
          scheduleNote ? ` Note: ${scheduleNote}` : ""
        }`,
        cta: meetingLink
          ? { label: "Join the interview", url: meetingLink }
          : { label: "View your requests", url: REQUESTS_URL },
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
      const msg = (INTERVIEW_MSG[status] ?? `Your request is now "${status}".`) + context;
      await notifyUser(row.email, {
        // The type carries the deep-link target (kind:id) so the bell can open
        // this exact request — no extra notifications column needed.
        type: `request:interview:${row.id}`,
        title: "Interview update",
        body: msg,
      });
      await sendRequestUpdateEmail({
        to: row.email,
        name: row.name,
        subject: `Interview update — your request is now "${status}"`,
        heading: "Interview update",
        message: msg,
        cta: { label: "View your requests", url: REQUESTS_URL },
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
      const msg = applicationMsg(row.jobTitle, status);
      await notifyUser(row.email, {
        type: `request:application:${row.id}`,
        title: "Application update",
        body: msg,
      });
      const applicant = await findUser(row.email);
      await sendRequestUpdateEmail({
        to: row.email,
        name: applicant?.name || row.email.split("@")[0],
        subject: `Application update — ${row.jobTitle || "your application"}`,
        heading: "Application update",
        message: msg,
        cta: { label: "View your requests", url: REQUESTS_URL },
      });
    }
    return NextResponse.json({ ok: true, notified: !!row });
  }

  return NextResponse.json({ ok: false, error: "Unknown request type." }, { status: 400 });
}

// Admin deletes a member's request (interview or job application). The member
// is notified that it was removed.
export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const type = String(body?.type ?? "").trim();
  const id = String(body?.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  if (type === "interview") {
    const row = await introDelete(id);
    if (row) {
      const context = row.partner
        ? ` (${row.partner}${row.role ? ` – ${row.role}` : ""})`
        : "";
      const msg = `Your interview request${context} was removed by the SkyHunter team. Reach out to support if you have questions.`;
      await notifyUser(row.email, {
        type: "request-update",
        title: "Interview request removed",
        body: msg,
      });
      await sendRequestUpdateEmail({
        to: row.email,
        name: row.name,
        subject: "Your SkyHunter interview request was removed",
        heading: "Interview request removed",
        message: msg,
        cta: { label: "View your requests", url: REQUESTS_URL },
      });
    }
    return NextResponse.json({ ok: true, deleted: !!row, notified: !!row });
  }

  if (type === "application") {
    const row = await applicationDelete(id);
    if (row) {
      const msg = `Your application for ${row.jobTitle || "a role"} was removed by the SkyHunter team. You can re-apply anytime.`;
      await notifyUser(row.email, {
        type: "request-update",
        title: "Application removed",
        body: msg,
      });
      const applicant = await findUser(row.email);
      await sendRequestUpdateEmail({
        to: row.email,
        name: applicant?.name || row.email.split("@")[0],
        subject: "Your SkyHunter application was removed",
        heading: "Application removed",
        message: msg,
        cta: { label: "Browse open roles", url: JOBS_URL },
      });
    }
    return NextResponse.json({ ok: true, deleted: !!row, notified: !!row });
  }

  return NextResponse.json({ ok: false, error: "Unknown request type." }, { status: 400 });
}
