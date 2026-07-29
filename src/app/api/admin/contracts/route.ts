import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { conversationGet, conversationDelete } from "@/lib/store";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

// Admin removes a member↔member contract (deletes the chat + its messages) and
// notifies both members. POST (not DELETE) so it works everywhere.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  const conv = await conversationGet(id);
  if (!conv || conv.kind !== "contract") {
    return NextResponse.json(
      { ok: false, error: "Contract not found." },
      { status: 404 },
    );
  }

  await conversationDelete(id);

  for (const email of conv.participants) {
    await notifyUser(email, {
      type: "request-update",
      title: "Contract chat closed",
      body: "The SkyHunter team closed this contract match. Reach out to support with any questions.",
    });
  }

  return NextResponse.json({ ok: true });
}
