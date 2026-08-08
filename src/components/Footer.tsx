import Link from "next/link";
import { Logo } from "./Logo";
import { FooterPrimaryCta, FooterAccountLinks } from "./FooterCtas";

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
            <FooterPrimaryCta />
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
                <a
                  href="https://988lifeline.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300"
                >
                  Call, text, or chat 988
                </a>
              </li>
              <FooterAccountLinks />
            </ul>
          </div>
        </div>

        <div className="streak mt-12" />
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-faint sm:flex-row sm:items-center">
          <p>© {2026} SkyHunter. Build. Innovate. Elevate.</p>
          <p>
            Questions?{" "}
            <a
              href="mailto:support@skyhunterlab.online"
              className="font-medium text-fog transition-colors hover:text-blue-300"
            >
              support@skyhunterlab.online
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
