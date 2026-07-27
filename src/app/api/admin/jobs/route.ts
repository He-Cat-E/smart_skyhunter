import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { jobUpsert, jobDelete } from "@/lib/store";
import { JOBS, type Job } from "@/lib/jobs";

export const runtime = "nodejs";

const forbidden = () =>
  NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return forbidden();

  const body = await req.json().catch(() => null);

  // Load the built-in default jobs into the store (needed once on Supabase,
  // so editing a single role doesn't hide the others).
  if (body?.seedAll) {
    for (const job of JOBS) await jobUpsert(job);
    revalidateTag("jobs");
    return NextResponse.json({ ok: true, seeded: JOBS.length });
  }

  const job = body?.job as Job | undefined;
  if (!job || !job.id || !job.title) {
    return NextResponse.json(
      { ok: false, error: "A job needs at least an id and a title." },
      { status: 400 },
    );
  }
  await jobUpsert(job);
  revalidateTag("jobs");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return forbidden();

  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }
  await jobDelete(id);
  revalidateTag("jobs");
  return NextResponse.json({ ok: true });
}
