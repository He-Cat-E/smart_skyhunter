import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatNotifier } from "@/components/ChatNotifier";
import { VisitTracker } from "@/components/VisitTracker";
import { PresenceBeacon } from "@/components/PresenceBeacon";

// Variable fonts: omitting `weight` loads a single variable file that covers
// every weight we use (Tailwind's medium→extrabold), instead of one static
// file per weight — fewer requests, smaller total payload, faster text paint.
// These are variable fonts; next/font serves the variable file (covering every
// weight Tailwind uses) whether or not we pin weights, so we omit the arrays.
// Display + brand wordmark: Sora — a modern geometric sans.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

// Body copy: Manrope — clean, friendly, highly readable.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkyHunter — Build. Innovate. Elevate.",
  description:
    "SkyHunter is launching soon: the elevated job platform for people ready to rise above the AI shakeup. Sign up now for early access.",
  keywords: [
    "SkyHunter",
    "AI job loss",
    "career reinvention",
    "early access",
    "job platform",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* Set the theme before first paint so there's no light/dark flash.
            Reads the saved choice, else falls back to the OS preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('sky_theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-blue-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <AuthProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <ChatNotifier />
          <VisitTracker />
          <PresenceBeacon />
        </AuthProvider>
      </body>
    </html>
  );
}
