"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/icons";
import { MemberProfileModal } from "@/components/MemberProfileModal";

type Conv = {
  id: string;
  kind: "support" | "contract";
  display: string;
  lastMessage: string;
  lastMessageAt: string;
  typing?: boolean;
  peerEmail?: string | null;
  unread?: number;
  avatarUrl?: string;
  online?: boolean;
  lastSeenAt?: string | null;
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

function lastSeenLabel(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "last seen just now";
  if (mins < 60) return `last seen ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `last seen ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `last seen ${days}d ago`;
  return `last seen ${new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function ConversationList() {
  const pathname = usePathname();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [profileEmail, setProfileEmail] = useState<string | null>(null);

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
      <div className="shrink-0 border-b border-steel-line p-3">
        <h1 className="px-1 pb-2.5 text-lg font-semibold text-chrome">Chat</h1>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full border border-steel-line bg-void py-2 pl-9 pr-3 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {!loaded ? (
          <div className="flex justify-center py-10 text-fog">
            <Spinner className="h-5 w-5" />
          </div>
        ) : shown.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-fog">
            {convs.length === 0
              ? "No conversations yet. When the team opens a chat or matches you with a contract, it appears here."
              : "No chats match your search."}
          </div>
        ) : (
          shown.map((c) => {
            const active = pathname === `/messages/${c.id}`;
            // The chat you're viewing is being marked read server-side — don't
            // flash a stale badge on it.
            const unread = active ? 0 : c.unread ?? 0;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={`mx-2 flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
                  active ? "bg-blue-500/10" : "hover:bg-navy-soft"
                }`}
              >
                <div className="relative shrink-0">
                  <span
                    role={c.peerEmail ? "button" : undefined}
                    tabIndex={c.peerEmail ? 0 : undefined}
                    title={c.peerEmail ? `View ${c.display}'s profile` : undefined}
                    onClick={
                      c.peerEmail
                        ? (e) => {
                            // Open the profile instead of navigating into the chat.
                            e.preventDefault();
                            e.stopPropagation();
                            setProfileEmail(c.peerEmail ?? null);
                          }
                        : undefined
                    }
                    onKeyDown={
                      c.peerEmail
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              setProfileEmail(c.peerEmail ?? null);
                            }
                          }
                        : undefined
                    }
                    className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-base font-semibold text-white ${c.avatarUrl ? "bg-steel" : colorFor(c.id)} ${c.peerEmail ? "cursor-pointer transition-opacity hover:opacity-80" : ""}`}
                  >
                    {c.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      c.display.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  {c.online && (
                    <span
                      aria-label="Online"
                      className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-void"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate font-semibold ${active ? "text-blue-500" : "text-chrome"}`}
                    >
                      {c.display}
                    </p>
                    <span
                      className={`shrink-0 text-xs ${
                        unread > 0 ? "font-semibold text-blue-500" : "text-faint"
                      }`}
                    >
                      {whenLabel(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm ${
                        unread > 0 ? "font-medium text-chrome" : "text-fog"
                      }`}
                    >
                      {c.kind === "contract" && (
                        <span className="rounded bg-cyan/10 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase text-cyan">
                          Contract
                        </span>
                      )}
                      {c.typing ? (
                        <span className="truncate font-medium text-blue-500">
                          typing…
                        </span>
                      ) : (
                        <span className="truncate">
                          {c.lastMessage || "No messages yet"}
                        </span>
                      )}
                    </p>
                    {unread > 0 && (
                      <span
                        aria-label={`${unread} unread`}
                        className="ml-1 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-semibold text-white"
                      >
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                  {c.online ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      online
                    </p>
                  ) : c.lastSeenAt ? (
                    <p className="mt-0.5 truncate text-xs text-faint">
                      {lastSeenLabel(c.lastSeenAt)}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })
        )}
      </div>

      {profileEmail && (
        <MemberProfileModal
          email={profileEmail}
          onClose={() => setProfileEmail(null)}
        />
      )}
    </div>
  );
}
