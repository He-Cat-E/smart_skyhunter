"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "./Select";
import { useAuth } from "./AuthProvider";
import { Check, Spinner } from "./icons";

const TIME_SLOTS = [
  "Morning (9:00am – 12:00pm)",
  "Midday (12:00pm – 2:00pm)",
  "Afternoon (2:00pm – 5:00pm)",
  "Evening (5:00pm – 7:00pm)",
];

const inputCls =
  "w-full rounded-xl border border-steel-line bg-void px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelCls = "mb-1.5 block text-sm font-medium text-mist";

export function InterviewForm({
  partner,
  role,
}: {
  partner: string;
  role: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [timezone, setTimezone] = useState("");
  const [message, setMessage] = useState("");
  const [today, setToday] = useState("");

  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  // Prefill from the account + detect the browser timezone.
  useEffect(() => {
    if (user) {
      setName((n) => n || user.name || "");
      setEmail((e) => e || user.email || "");
    }
    try {
      setTimezone((t) => t || Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      /* ignore */
    }
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    setToday(iso);
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner,
          role,
          name,
          email,
          phone,
          preferredDate,
          timeSlot,
          timezone,
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Couldn't book your interview.");
      }
      setState("done");
      router.refresh();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-cyan/40 bg-cyan/5 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
          Your interview request is in
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-mist">
          The SkyHunter team will email{" "}
          <span className="font-medium text-chrome">{email}</span> to confirm a
          time — usually within one business day. Check your inbox (and spam) for
          the calendar invite and video link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="iv-name" className={labelCls}>
            Full name
          </label>
          <input
            id="iv-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="iv-email" className={labelCls}>
            Email
          </label>
          <input
            id="iv-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="iv-phone" className={labelCls}>
          Phone <span className="text-faint">(optional, for reminders)</span>
        </label>
        <input
          id="iv-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
          placeholder="+1 555 123 4567"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="iv-date" className={labelCls}>
            Preferred date
          </label>
          <input
            id="iv-date"
            type="date"
            required
            min={today}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <span className={labelCls}>Preferred time</span>
          <Select
            name="timeSlot"
            options={TIME_SLOTS}
            defaultValue={timeSlot}
            placeholder="Choose a window"
            onChange={setTimeSlot}
          />
        </div>
      </div>

      <div>
        <label htmlFor="iv-tz" className={labelCls}>
          Your timezone
        </label>
        <input
          id="iv-tz"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className={inputCls}
          placeholder="e.g. America/New_York"
        />
      </div>

      <div>
        <label htmlFor="iv-msg" className={labelCls}>
          What would you like to get out of the interview?
        </label>
        <textarea
          id="iv-msg"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls}
          placeholder="e.g. I'd like to confirm the contract scope, hours, and pay, and ask how payments work."
        />
      </div>

      {state === "error" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
      >
        {state === "sending" && <Spinner className="h-4 w-4" />}
        {state === "sending" ? "Booking…" : "Request my interview"}
      </button>

      <p className="text-center text-xs text-fog">
        Free, no obligation. You can reschedule anytime from the email we send.
      </p>
    </form>
  );
}
