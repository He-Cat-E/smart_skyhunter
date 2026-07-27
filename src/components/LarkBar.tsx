const LARK_DOWNLOAD = "https://www.larksuite.com/en_us/download";

// A permanent strip explaining that interviews happen on Lark, with a download
// link. Rendered inside the sticky header so it's always visible.
export function LarkBar() {
  return (
    <div className="border-b border-blue-500/20 bg-blue-500/10">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-6 py-2 text-sm">
        <span className="text-center text-mist">
          Interviews are held on{" "}
          <span className="font-semibold text-chrome">Lark</span> — download the
          app so you&apos;re ready when our team invites you to a call.
        </span>
        <a
          href={LARK_DOWNLOAD}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-400"
        >
          Download Lark
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15h12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
