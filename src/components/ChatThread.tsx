"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/icons";
import { MemberProfileModal } from "@/components/MemberProfileModal";

type Msg = {
  id: string;
  senderEmail: string;
  senderName: string;
  body: string;
  createdAt: string;
};

const POLL_MS = 2500;

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

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === today) return "Today";
  if (d.toDateString() === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function ChatThread({ conversationId }: { conversationId: string }) {
  const [me, setMe] = useState("");
  const [display, setDisplay] = useState("Conversation");
  const [kind, setKind] = useState<"support" | "contract">("support");
  const [peerEmail, setPeerEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const countRef = useRef(0);
  const lastPingRef = useRef(0);
  const deadRef = useRef(false); // conversation gone → stop polling
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ping the server that we're typing (throttled to once every ~2s).
  function pingTyping() {
    const now = Date.now();
    if (now - lastPingRef.current < 2000) return;
    lastPingRef.current = now;
    fetch(`/api/messages/${conversationId}/typing`, { method: "POST" }).catch(
      () => {},
    );
  }

  async function load(initial = false) {
    if (busyRef.current || deadRef.current) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        cache: "no-store",
      });
      if (res.status === 403 || res.status === 404) {
        // Conversation is gone/inaccessible — stop polling instead of hammering
        // the endpoint every couple of seconds.
        deadRef.current = true;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setError("This conversation isn't available.");
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setMe(json.me);
        setDisplay(json.conversation?.display ?? "Conversation");
        setKind(json.conversation?.kind === "contract" ? "contract" : "support");
        setPeerEmail(json.conversation?.peerEmail ?? null);
        setAvatarUrl(json.conversation?.avatarUrl ?? "");
        setMessages(json.messages ?? []);
        setTyping(json.typing ?? null);
      }
    } catch {
      /* keep last state */
    } finally {
      busyRef.current = false;
      if (initial) setLoaded(true);
    }
  }

  useEffect(() => {
    deadRef.current = false;
    setError("");
    setLoaded(false);
    countRef.current = 0;
    load(true);
    timerRef.current = setInterval(() => load(false), POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (messages.length !== countRef.current) {
      const grew = messages.length > countRef.current;
      countRef.current = messages.length;
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      // A newly-arrived incoming message means the peer just sent — so they're
      // no longer typing. Clear it instantly rather than waiting for the next
      // poll, keeping the header in sync with the message that just landed.
      const last = messages[messages.length - 1];
      if (grew && last && me && last.senderEmail !== me) setTyping(null);
    }
  }, [messages, me]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (json.ok && json.message) {
        setMessages((prev) =>
          prev.some((m) => m.id === json.message.id)
            ? prev
            : [...prev, json.message],
        );
      } else {
        setInput(body);
      }
    } catch {
      setInput(body);
    } finally {
      setSending(false);
    }
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-fog">{error}</p>
        <Link
          href="/messages"
          className="text-sm font-semibold text-blue-500 hover:text-blue-400"
        >
          ← Back to messages
        </Link>
      </div>
    );
  }

  let lastDay = "";

  return (
    <div className="flex h-full min-h-0 flex-col bg-void">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-steel-line bg-abyss px-4 py-2.5">
        <Link
          href="/messages"
          className="text-fog transition-colors hover:text-chrome md:hidden"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {peerEmail ? (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            title={`View ${display}'s profile`}
            className="flex min-w-0 items-center gap-3 rounded-lg text-left transition-opacity hover:opacity-80"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white ${avatarUrl ? "bg-steel" : colorFor(conversationId)}`}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                display.slice(0, 1).toUpperCase()
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-chrome">{display}</p>
              <p className="flex items-center gap-1.5 truncate text-xs">
                <span className="text-fog">View profile</span>
                {typing && (
                  <span className="font-medium text-blue-500">· typing…</span>
                )}
              </p>
            </div>
          </button>
        ) : (
          <>
        <span
          className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white ${avatarUrl ? "bg-steel" : colorFor(conversationId)}`}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            display.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-chrome">{display}</p>
          <p className="flex items-center gap-1.5 truncate text-xs">
            <span className="text-fog">
              {kind === "contract" ? "Contract chat" : "Support chat"}
            </span>
            {typing && (
              <span className="font-medium text-blue-500">· typing…</span>
            )}
          </p>
        </div>
          </>
        )}
      </div>

      {/* Messages — simple sky-tinted wallpaper with a faint dotted texture */}
      <div className="chat-wallpaper min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-6">
        {!loaded ? (
          <div className="flex h-full items-center justify-center text-fog">
            <Spinner className="h-5 w-5" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-fog">
            <p>No messages yet.</p>
            <p className="mt-1 text-sm">Say hello to get things started.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderEmail === me;
            const day = new Date(m.createdAt).toDateString();
            const showDate = day !== lastDay;
            lastDay = day;
            return (
              <div key={m.id}>
                {showDate && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-void px-3 py-1 text-xs font-medium text-fog shadow-sm">
                      {dateLabel(m.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      mine
                        ? "rounded-br-md bg-blue-500 text-white"
                        : "rounded-bl-md border border-steel-line bg-void text-chrome"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <span
                      className={`mt-0.5 block text-right text-[0.65rem] ${mine ? "text-white/70" : "text-faint"}`}
                    >
                      {timeLabel(m.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={send}
        className="flex shrink-0 items-center gap-2 border-t border-steel-line bg-abyss px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.trim()) pingTyping();
          }}
          placeholder="Message"
          className="flex-1 rounded-full border border-steel-line bg-void px-4 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-400 disabled:opacity-40"
        >
          {sending ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M4 12l16-7-7 16-2.5-6.5L4 12z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </form>

      {profileOpen && peerEmail && (
        <MemberProfileModal
          email={peerEmail}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
