"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/icons";

type Conv = {
  id: string;
  kind: "support" | "contract";
  display: string;
  lastMessage: string;
  lastMessageAt: string;
};

const AVATAR_COLORS = [
  "bg-[#8710d8]",
  "bg-[#2aa79b]",
  "bg-[#e17076]",
  "bg-[#3c8ce7]",
  "bg-[#e6a04c]",
  "bg-[#6bc86b]",
];
function colorFor(s: string): string {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function whenLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConversationList() {
  const pathname = usePathname();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/messages/conversations", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && json.ok) setConvs(json.conversations ?? []);
      } catch {
        /* keep last */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return convs;
    return convs.filter((c) =>
      `${c.display} ${c.lastMessage}`.toLowerCase().includes(s),
    );
  }, [convs, q]);

  return (
    <div className="flex h-full flex-col">
      {/* Header + search */}
      <div className="shrink-0 border-b border-white/5 p-3">
        <h1 className="px-1 pb-2.5 text-lg font-semibold text-white">Messages</h1>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full border border-white/10 bg-[#0f1014] py-2 pl-9 pr-3 text-sm text-gray-100 outline-none transition-colors placeholder:text-gray-500 focus:border-[#8710d8]/60"
          />
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {!loaded ? (
          <div className="flex justify-center py-10 text-gray-500">
            <Spinner className="h-5 w-5" />
          </div>
        ) : shown.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            {convs.length === 0
              ? "No conversations yet. When the team opens a chat or matches you with a contract, it appears here."
              : "No chats match your search."}
          </div>
        ) : (
          shown.map((c) => {
            const active = pathname === `/messages/${c.id}`;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={`mx-2 flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
                  active ? "bg-[#8710d8]" : "hover:bg-white/5"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${colorFor(c.id)}`}
                >
                  {c.display.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate font-medium ${active ? "text-white" : "text-gray-100"}`}
                    >
                      {c.display}
                    </p>
                    <span
                      className={`shrink-0 text-xs ${active ? "text-white/70" : "text-gray-500"}`}
                    >
                      {whenLabel(c.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 flex items-center gap-1.5 truncate text-sm ${active ? "text-white/80" : "text-gray-400"}`}
                  >
                    {c.kind === "contract" && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase ${active ? "bg-white/20 text-white" : "bg-[#2aa79b]/20 text-[#4fd1c5]"}`}
                      >
                        Contract
                      </span>
                    )}
                    <span className="truncate">
                      {c.lastMessage || "No messages yet"}
                    </span>
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
