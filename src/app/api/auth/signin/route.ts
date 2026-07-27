import { NextResponse } from "next/server";
import { findUser, setSession, verifyPassword, isSuspended } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot bot check.
  if (String(body.company ?? "").trim()) {
    return NextResponse.json({ ok: false, error: "Bot detected." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  const user = await findUser(email);
  // Same message whether the email or password is wrong — don't leak which.
  // Accounts created via Google/LinkedIn have no password to check.
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { ok: false, error: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  // Suspended accounts are disabled.
  if (isSuspended(user)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This account has been suspended. If you think this is a mistake, contact support.",
      },
      { status: 403 },
    );
  }

  const remember = body.remember !== false; // default to remembering
  await setSession({ email: user.email, name: user.name }, remember);
  await notifyUser(user.email, {
    type: "signin",
    title: "New sign-in",
    body: "You just signed in to your SkyHunter account.",
  });
  return NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
}
