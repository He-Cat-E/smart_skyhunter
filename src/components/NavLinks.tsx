"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const DASHBOARD = { href: "/dashboard", label: "Dashboard" };
const MESSAGES = { href: "/messages", label: "Messages" };

// Renders the top-bar links and highlights the one for the current page.
// Signed-in members also get a "Dashboard" link prepended. Because the Navbar
// renders statically (no server cookie read), sign-in state is resolved on the
// client: the `sky_auth` hint cookie gives it instantly on first paint, and the
// auth context (from /api/auth/me) is authoritative once it loads.
export function NavLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Read the hint cookie after mount (not during render) so the first client
  // render matches the server HTML — no hydration mismatch, then it reveals.
  const [hint, setHint] = useState(false);
  useEffect(() => {
    setHint(document.cookie.split("; ").some((c) => c === "sky_auth=1"));
  }, []);

  // Until /me resolves, trust the hint; afterwards, trust the real user (so a
  // sign-out correctly drops the link even if the cookie lingers a moment).
  const signedIn = loading ? hint : !!user;
  const all = signedIn ? [DASHBOARD, MESSAGES, ...links] : links;

  return (
    <>
      {all.map((l) => {
        const active =
          pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-4 py-2.5 text-base font-medium transition-colors ${
              active
                ? "bg-blue-500/10 font-semibold text-blue-500"
                : "text-mist hover:bg-abyss hover:text-chrome"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
