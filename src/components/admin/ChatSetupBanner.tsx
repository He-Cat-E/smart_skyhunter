"use client";

import { useEffect, useState } from "react";

// Shown on the Contracts page only when the chat tables are missing in
// Supabase. Dismissible (remembered in localStorage) so it informs once without
// nagging — and it disappears on its own once the tables are created.
export function ChatSetupBanner() {
  const [hidden, setHidden] = useState(true); // start hidden to avoid a flash

  useEffect(() => {
    setHidden(localStorage.getItem("sky_chat_banner_dismissed") === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="relative mb-5 rounded-2xl border border-amber-400/50 bg-amber-50 p-4 pr-10 text-sm text-amber-800">
      <button
        onClick={() => {
          localStorage.setItem("sky_chat_banner_dismissed", "1");
          setHidden(true);
        }}
        aria-label="Dismiss"
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-md text-amber-700 transition-colors hover:bg-amber-400/20"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <p className="font-semibold">Chat isn&apos;t saving to your database yet.</p>
      <p className="mt-1">
        The <code className="rounded bg-amber-400/20 px-1">conversations</code> and{" "}
        <code className="rounded bg-amber-400/20 px-1">messages</code> tables
        don&apos;t exist in Supabase, so chats fall back to a local store that
        isn&apos;t durable on a deployment — matched members won&apos;t see them.
        Run the two tables from{" "}
        <code className="rounded bg-amber-400/20 px-1">supabase/schema.sql</code>{" "}
        in your Supabase SQL editor, then create a fresh match. (Works fine on a
        single local server without this.)
      </p>
    </div>
  );
}
