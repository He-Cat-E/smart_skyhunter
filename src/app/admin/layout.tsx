import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { usingSupabase } from "@/lib/supabase";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/stats", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/contracts", label: "Contracts" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/content", label: "Content" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/signin?error=Admins%20only.");

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            Admin
          </p>
          <h1 className="font-display text-2xl font-semibold text-chrome">
            Control panel
          </h1>
        </div>
        <span
          className={`rounded-md px-3 py-1 text-xs font-semibold ${
            usingSupabase()
              ? "bg-cyan/10 text-cyan ring-1 ring-cyan/30"
              : "bg-steel text-fog"
          }`}
        >
          {usingSupabase() ? "Supabase connected" : "Local file store (dev)"}
        </span>
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        <aside>
          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-mist transition-colors hover:bg-abyss hover:text-chrome"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
