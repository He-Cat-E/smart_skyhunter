import { Wordmark } from "./Wordmark";

// SkyHunter mark: a cloud with a rising arrow bursting upward — echoing the key art.
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
          <linearGradient id="sh-cloud" x1="6" y1="8" x2="30" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7cc4ff" />
            <stop offset="1" stopColor="#2f7bff" />
          </linearGradient>
          <linearGradient id="sh-arrow" x1="10" y1="34" x2="34" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0e1424" />
            <stop offset="1" stopColor="#1e5fe0" />
          </linearGradient>
        </defs>
        {/* cloud */}
        <path
          d="M12 22a6 6 0 0 1 .6-11.9A8 8 0 0 1 28 12a5.5 5.5 0 0 1-1 11H13a5 5 0 0 1-1-1z"
          fill="url(#sh-cloud)"
        />
        {/* rising arrow / paper plane */}
        <path
          d="M6 33c9-1 15-5 24-15l-4-1 6-4-1 7-3-2C19 26 13 31 6 33z"
          fill="url(#sh-arrow)"
        />
        <circle cx="30" cy="12" r="1.6" fill="#aee0ff" />
      </svg>
      <Wordmark className="text-2xl" />
    </span>
  );
}
