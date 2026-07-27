import { NextResponse } from "next/server";
import {
  getPending,
  upsertPending,
  generateCode,
  CODE_TTL_MS,
} from "@/lib/pending";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const pending = await getPending(email);
  if (!pending) {
    return NextResponse.json(
      { ok: false, error: "Nothing to resend. Please sign up again." },
      { status: 400 },
    );
  }

  const code = generateCode();
  await upsertPending({
    ...pending,
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });

  const { sent, provider } = await sendVerificationEmail(email, pending.name, code);
  if (!sent && provider !== "none") {
    return NextResponse.json(
      { ok: false, error: "We couldn't resend the email. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...(provider === "none" ? { devCode: code } : {}),
  });
}
