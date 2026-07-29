import Link from "next/link";
import { Logo } from "./Logo";
import { AuthNav } from "./AuthNav";
import { NavLinks } from "./NavLinks";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { LarkBar } from "./LarkBar";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/jobs", label: "Jobs" },
  { href: "/reskill", label: "Reskill" },
  { href: "/support", label: "Support" },
];

// Server component with no cookie read — keeps the shared shell (and every
// page under it) statically renderable. The signed-in state (Dashboard link,
// avatar menu, notification bell) is resolved on the client via AuthProvider.
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-steel-line bg-void/85 backdrop-blur-xl">
      <LarkBar />
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
        <Link href="/" aria-label="SkyHunter home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <span data-tour="tour-nav" className="flex items-center gap-1">
            <NavLinks links={LINKS} />
          </span>
          <span className="ml-3 flex items-center gap-2.5">
            <ThemeToggle />
            <span data-tour="tour-notifications" className="flex">
              <NotificationBell />
            </span>
            <span data-tour="tour-account" className="flex">
              <AuthNav />
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <NotificationBell />
          <AuthNav compact />
        </div>
      </nav>
    </header>
  );
}
