"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/icons";

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
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const countRef = useRef(0);

  async function load(initial = false) {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        cache: "no-store",
      });
      if (res.status === 403 || res.status === 404) {
        setError("This conversation isn't available.");
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setMe(json.me);
        setDisplay(json.conversation?.display ?? "Conversation");
        setKind(json.conversation?.kind === "contract" ? "contract" : "support");
        setMessages(json.messages ?? []);
      }
    } catch {
      /* keep last state */
    } finally {
      busyRef.current = false;
      if (initial) setLoaded(true);
    }
  }

  useEffect(() => {
    setLoaded(false);
    countRef.current = 0;
    load(true);
    const t = setInterval(() => load(false), POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (messages.length !== countRef.current) {
      countRef.current = messages.length;
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

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
        <p className="text-gray-400">{error}</p>
        <Link
          href="/messages"
          className="text-sm font-semibold text-[#b794f6] hover:text-[#c9b3fb]"
        >
          ← Back to messages
        </Link>
      </div>
    );
  }

  let lastDay = "";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0c10]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/5 bg-[#16171d] px-4 py-2.5">
        <Link
          href="/messages"
          className="text-gray-400 transition-colors hover:text-white md:hidden"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${colorFor(conversationId)}`}
        >
          {display.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{display}</p>
          <p className="text-xs text-gray-500">
            {kind === "contract" ? "Contract chat" : "Support chat"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-6"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 50% -10%, rgba(135,16,216,0.06), transparent 60%)",
        }}
      >
        {!loaded ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <Spinner className="h-5 w-5" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
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
                    <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-gray-300">
                      {dateLabel(m.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      mine
                        ? "rounded-br-md bg-[#8710d8] text-white"
                        : "rounded-bl-md bg-[#26272e] text-gray-100"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-xs font-semibold text-[#b794f6]">
                        {m.senderName}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <span
                      className={`mt-0.5 block text-right text-[0.65rem] ${mine ? "text-white/60" : "text-gray-500"}`}
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
        className="flex shrink-0 items-center gap-2 border-t border-white/5 bg-[#16171d] px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message"
          className="flex-1 rounded-full border border-white/10 bg-[#26272e] px-4 py-2.5 text-sm text-gray-100 outline-none transition-colors placeholder:text-gray-500 focus:border-[#8710d8]/60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8710d8] text-white transition-colors hover:bg-[#9a2bea] disabled:opacity-40"
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
    </div>
  );
}
