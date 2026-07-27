"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Select } from "./Select";
import { LocationPicker } from "./LocationPicker";
import { HumanCheck } from "./HumanCheck";
import { PasswordField } from "./PasswordField";
import { OAuthButtons } from "./OAuthButtons";
import { useAuth } from "./AuthProvider";
import { isStrongPassword } from "@/lib/password";
import { IS_DEV } from "@/lib/flags";

const SITUATIONS = [
  "My role was eliminated by AI/automation",
  "My role changed a lot because of AI",
  "I'm worried my role is next",
  "Just exploring what's out there",
];

const INDUSTRIES = [
  "Writing / Media / Marketing",
  "Customer Support / Call Center",
  "Finance / Accounting / Admin",
  "Software / Data / IT",
  "Design / Creative",
  "Operations / Logistics",
  "Education / Training",
  "Healthcare / Care",
  "Skilled Trades",
  "Other",
];

type Status = "idle" | "submitting" | "error";

const inputClass =
  "w-full rounded-xl border border-steel-line bg-void px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1.5 block text-sm font-medium text-mist";

export function SignUpForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { refresh } = useAuth();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // verify-step state
  const [pendingEmail, setPendingEmail] = useState("");
  const [devCode, setDevCode] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");

  // Step 1 — submit details, receive a code by email.
  async function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    // Bot check: honeypot must be empty and the human box must be verified.
    if (String(data.company ?? "").trim()) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      return;
    }
    if (data.human !== "verified") {
      setStatus("error");
      setMessage("Please complete the 'Verify you are human' check.");
      return;
    }
    // Strong-password gate (also enforced on the server).
    if (!isStrongPassword(String(data.password ?? ""))) {
      setStatus("error");
      setMessage("Please choose a stronger password (see the requirements).");
      return;
    }
    // Location fields are custom controls, so validate them here.
    if (!String(data.street ?? "").trim()) {
      setStatus("error");
      setMessage("Please complete your location (country, street, city).");
      return;
    }
    if (!String(data.city ?? "").trim()) {
      setStatus("error");
      setMessage("Please enter your city.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Something went wrong.");
      }

      // Dev mode: the account was created immediately (no email verification).
      if (!json.pending) {
        await refresh();
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Prod: move to the 6-digit code step.
      setPendingEmail(String(data.email ?? ""));
      setDevCode(json.devCode ?? "");
      setCode("");
      setNotice("");
      setStatus("idle");
      setStep("verify");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "We couldn't create your account.",
      );
    }
  }

  // Step 2 — verify the 6-digit code, which creates the account.
  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Verification failed.");
      }
      await refresh(); // now signed in
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "We couldn't verify that code.",
      );
    }
  }

  async function handleResend() {
    setStatus("idle");
    setMessage("");
    setNotice("");
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Couldn't resend the code.");
      }
      if (json.devCode) setDevCode(json.devCode);
      setNotice("A new code is on its way.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't resend the code.");
    }
  }

  // ---- Step 2: verify --------------------------------------------------
  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
            Check your email
          </h2>
          <p className="mt-1 text-sm text-fog">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-mist">{pendingEmail}</span>. Enter it
            below to finish creating your account.
          </p>
        </div>

        {devCode && (
          <p className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm text-blue-600">
            Dev mode (no email provider configured): your code is{" "}
            <span className="font-semibold tracking-widest">{devCode}</span>.
          </p>
        )}

        <div>
          <label htmlFor="code" className={labelClass}>
            Verification code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className={`${inputClass} text-center text-2xl font-semibold tracking-[0.5em]`}
          />
        </div>

        {notice && <p className="text-sm text-cyan">{notice}</p>}
        {status === "error" && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || code.length !== 6}
          className="w-full rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Verifying…" : "Verify & create account"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-blue-300 hover:text-blue-400"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setStatus("idle");
              setMessage("");
            }}
            className="text-fog hover:text-chrome"
          >
            Use a different email
          </button>
        </div>
      </form>
    );
  }

  // ---- Step 1: details -------------------------------------------------
  return (
    <form onSubmit={handleDetails} className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-fog">
          Already have one?{" "}
          <Link href="/signin" className="font-medium text-blue-300 hover:text-blue-400">
            Sign in
          </Link>
        </p>
      </div>

      <OAuthButtons action="Sign up" />

      <div>
        <label htmlFor="name" className={labelClass}>
          Full name
        </label>
        <input id="name" name="name" required autoComplete="name" className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={params.get("email") ?? ""}
          className={inputClass}
        />
      </div>

      <PasswordField />

      <div>
        <label htmlFor="previousRole" className={labelClass}>
          What was your most recent role?
        </label>
        <input
          id="previousRole"
          name="previousRole"
          placeholder="e.g. Copywriter, Bookkeeper, Support Lead"
          className={inputClass}
        />
      </div>

      <div>
        <span className={labelClass}>Industry</span>
        <Select name="industry" options={INDUSTRIES} required />
      </div>

      <div>
        <span className={labelClass}>What brings you here?</span>
        <Select name="situation" options={SITUATIONS} required />
      </div>

      <LocationPicker />

      <HumanCheck />

      {status === "error" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending your code…" : "Sign Up"}
      </button>

      <p className="text-center text-xs text-fog">
        By signing up you agree to hear from SkyHunter about launch.
        {!IS_DEV && " We'll email you a 6-digit code to confirm your address."}
      </p>
    </form>
  );
}
