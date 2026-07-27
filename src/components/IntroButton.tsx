import Link from "next/link";

// "Request an interview" — routes to the detailed interview booking page,
// carrying the partner/role so the page and form are pre-filled.
export function IntroButton({
  partner,
  role,
}: {
  partner: string;
  role: string;
}) {
  const qs = new URLSearchParams({
    ...(partner ? { partner } : {}),
    ...(role ? { role } : {}),
  }).toString();

  return (
    <Link
      href={`/interview${qs ? `?${qs}` : ""}`}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-steel-line px-4 py-2 text-sm font-semibold text-chrome transition-colors hover:border-blue-500/60"
    >
      Request an interview
    </Link>
  );
}
