import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-steel-line/60 bg-abyss">
      <div className="mx-auto max-w-[1400px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fog">
              The elevated job platform for people rising above the AI shakeup.
              Build. Innovate. Elevate.
            </p>
            <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
              Launching soon
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-chrome">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-fog">
              <li>
                <Link href="/community" className="hover:text-blue-300">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-blue-300">
                  Preview jobs
                </Link>
              </li>
              <li>
                <Link href="/reskill" className="hover:text-blue-300">
                  Reskill for free
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-blue-300">
                  Read a story
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-chrome">When it&apos;s heavy</h3>
            <ul className="mt-3 space-y-2 text-sm text-fog">
              <li>
                <Link href="/support" className="hover:text-blue-300">
                  Support &amp; benefits
                </Link>
              </li>
              <li>
                <a href="tel:988" className="hover:text-blue-300">
                  Call or text 988
                </a>
              </li>
              <li>
                <Link href="/signup" className="text-blue-300 hover:text-blue-400">
                  Sign up for early access →
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-blue-300">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="streak mt-12" />
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-faint sm:flex-row sm:items-center">
          <p>© {2026} SkyHunter. Build. Innovate. Elevate.</p>
          <p>Not a government site. Always verify benefits with official sources.</p>
        </div>
      </div>
    </footer>
  );
}
