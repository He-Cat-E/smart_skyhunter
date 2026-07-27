import { NextResponse } from "next/server";
import { requireAdmin, findUser, isAdminUser } from "@/lib/auth";
import { patchUser, removeUser } from "@/lib/store";

export const runtime = "nodejs";

const forbidden = () =>
  NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return forbidden();

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 });
  }

  // Suspend / unsuspend an account.
  if (typeof body?.suspended === "boolean") {
    const suspend = body.suspended as boolean;
    if (email.toLowerCase() === admin.email.toLowerCase()) {
      return NextResponse.json(
        { ok: false, error: "You can't suspend your own account." },
        { status: 400 },
      );
    }
    const target = await findUser(email);
    if (!target) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }
    // Guard against locking out admins by mistake.
    if (suspend && isAdminUser(target)) {
      return NextResponse.json(
        { ok: false, error: "Revoke admin before suspending this account." },
        { status: 400 },
      );
    }
    const updated = await patchUser(email, {
      profile: suspend
        ? {
            suspended: true,
            suspendedAt: new Date().toISOString(),
            suspendedReason: String(body.reason ?? "").trim() || undefined,
          }
        : { suspended: false, suspendedAt: undefined, suspendedReason: undefined },
    });
    if (!updated) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      user: { email: updated.email, suspended: !!updated.profile?.suspended },
    });
  }

  // Toggle admin role.
  const updated = await patchUser(email, { is_admin: !!body.is_admin });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    user: { email: updated.email, is_admin: !!updated.is_admin },
  });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return forbidden();

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 });
  }
  if (email.toLowerCase() === admin.email.toLowerCase()) {
    return NextResponse.json(
      { ok: false, error: "You can't delete your own account here." },
      { status: 400 },
    );
  }
  await removeUser(email);
  return NextResponse.json({ ok: true });
}
