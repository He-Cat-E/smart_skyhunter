// Central site constants for SEO (metadata, canonical/OG URLs, sitemap, robots).
// Override the domain per-environment with NEXT_PUBLIC_SITE_URL if it changes.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyhunterlab.online"
).replace(/\/+$/, "");

export const SITE_NAME = "SkyHunter";

export const SITE_TAGLINE = "Rise above the AI shakeup";

export const SITE_DESCRIPTION =
  "SkyHunter is the job platform for people whose roles were changed or replaced by AI. We surface real work that leans on human judgment, care, and craft — plus reskilling, community, and support.";
