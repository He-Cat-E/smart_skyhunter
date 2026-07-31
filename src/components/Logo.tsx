import { Wordmark } from "./Wordmark";

// SkyHunter mark: two rising chevrons — a clean geometric "ascent" that pairs
// with the Sora wordmark. Badgeless so it reads as a modern brand mark on any
// background; the violet gradient carries the brand.
export function Logo({
  className = "",
  size = 34,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient
            id="sh-asc"
            x1="6"
            y1="8"
            x2="34"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        {/* leading chevron */}
        <path d="M20 7 L34 20 L29 20 L20 12 L11 20 L6 20 Z" fill="url(#sh-asc)" />
        {/* trailing chevron — the rising echo */}
        <path
          d="M20 16 L34 29 L29 29 L20 21 L11 29 L6 29 Z"
          fill="url(#sh-asc)"
          fillOpacity="0.42"
        />
      </svg>
      <Wordmark className="text-2xl" />
    </span>
  );
}
