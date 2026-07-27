import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { collectionSet } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const key = String(body?.key ?? "").trim();
  if (!key || body.value === undefined) {
    return NextResponse.json(
      { ok: false, error: "Missing key or value." },
      { status: 400 },
    );
  }
  await collectionSet(key, body.value);
  revalidateTag("content"); // publish the edit immediately
  return NextResponse.json({ ok: true });
}
