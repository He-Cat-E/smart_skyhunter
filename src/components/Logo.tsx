import { Wordmark } from "./Wordmark";

// SkyHunter mark: an upward origami arrow — ascent and aim — set in a violet
// brand badge. Reads as a paper plane rising / an arrowhead pointing up, echoing
// "rise above the AI shakeup." Scales cleanly down to favicon size.
export function Logo({
  className = "",
  size = 38,
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
            id="sh-badge"
            x1="4"
            y1="3"
            x2="36"
            y2="37"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        {/* violet squircle badge with a crisp hairline edge */}
        <rect x="2.5" y="2.5" width="35" height="35" rx="11" fill="url(#sh-badge)" />
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="10.5"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.18"
        />
        {/* upward origami arrow — the two faces fold along the center crease */}
        <path d="M20 8.5 L11 30 L20 25 Z" fill="#ffffff" fillOpacity="0.62" />
        <path d="M20 8.5 L29 30 L20 25 Z" fill="#ffffff" />
      </svg>
      <Wordmark className="text-2xl" />
    </span>
  );
}
