"use client";

import { usePathname } from "next/navigation";

// Telegram-style two-pane chat shell: a persistent conversation sidebar on the
// left and the open thread on the right. On mobile it shows one pane at a time
// (list at /messages, thread at /messages/<id>).
export function MessagesShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const inThread = pathname !== "/messages";

  return (
    <div className="mx-auto max-w-[1400px] px-2 py-4 sm:px-4 sm:py-6">
      <div className="flex h-[calc(100vh-9rem)] min-h-[520px] overflow-hidden rounded-2xl border border-black/50 bg-[#0f1014] text-gray-200 shadow-2xl">
        <aside
          className={`${inThread ? "hidden md:flex" : "flex"} w-full flex-col border-r border-white/5 bg-[#16171d] md:w-80 lg:w-[22rem]`}
        >
          {sidebar}
        </aside>
        <main
          className={`${inThread ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
