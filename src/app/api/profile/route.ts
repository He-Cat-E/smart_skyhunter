import { NextResponse } from "next/server";
import { getSession, updateUser, setSession } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Your name can't be empty." },
      { status: 400 },
    );
  }

  const str = (v: unknown) => String(v ?? "").trim();

  // Skills arrive as a comma/newline-separated string; store as a clean array.
  const skills = str(body.skills)
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

  const profile = {
    previousRole: str(body.previousRole),
    industry: str(body.industry),
    situation: str(body.situation),
    location: str(body.location),
    headline: str(body.headline),
    summary: str(body.summary),
    skills,
    experienceYears: str(body.experienceYears),
    desiredRole: str(body.desiredRole),
    workPreference: str(body.workPreference),
    availability: str(body.availability),
    desiredSalary: str(body.desiredSalary),
    phone: str(body.phone),
    website: str(body.website),
    linkedinUrl: str(body.linkedinUrl),
    githubUrl: str(body.githubUrl),
  };

  const updated = await updateUser(session.email, { name, profile });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  // Keep the session (and therefore the navbar) in sync if the name changed.
  if (name !== session.name) {
    await setSession({ email: updated.email, name: updated.name });
  }

  await notifyUser(updated.email, {
    type: "profile",
    title: "Profile updated",
    body: "Your profile details were saved.",
  });

  return NextResponse.json({
    ok: true,
    user: {
      name: updated.name,
      email: updated.email,
      profile: updated.profile,
    },
  });
}
