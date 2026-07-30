"use client";

import { useEffect } from "react";
import type { AdminUser } from "./UsersManager";

function fmt(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

// One label/value row — hidden when the value is empty.
function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 py-1.5">
      <dt className="shrink-0 text-fog">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-chrome">
        {value}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-steel-line pt-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-fog">
        {title}
      </h3>
      <dl className="text-sm">{children}</dl>
    </div>
  );
}

function initials(name: string, email: string): string {
  const base = name?.trim() || email;
  return (
    base
      .split(/[\s@.]+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

const providerLabel: Record<string, string> = {
  google: "Google",
  linkedin: "LinkedIn",
};

export function UserDetailDialog({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const signedUpWith = user.provider
    ? (providerLabel[user.provider] ?? user.provider)
    : "Email & password";
  const linked = (user.connections ?? [])
    .filter((c) => c === "google" || c === "linkedin")
    .map((c) => providerLabel[c] ?? c)
    .join(", ");
  const net = [
    user.vpn ? "VPN / proxy" : "",
    user.vps ? "VPS / hosting" : "",
    !user.vpn && !user.vps && user.ipChecked ? "Direct" : "",
    !user.ipChecked ? "not checked" : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${user.name} details`}
        onClick={(e) => e.stopPropagation()}
        className="lift my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-steel-line bg-navy shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-steel-line p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500 text-base font-semibold text-white">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(user.name, user.email)
              )}
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-chrome">
                <span className="truncate">{user.name}</span>
                {user.is_admin && (
                  <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-blue-300 ring-1 ring-blue-500/25">
                    ADMIN
                  </span>
                )}
                {user.suspended && (
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-red-600 ring-1 ring-red-500/25">
                    SUSPENDED
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-fog">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-fog transition-colors hover:bg-abyss hover:text-chrome"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <Section title="Account">
            <Field label="Member since" value={fmt(user.createdAt)} />
            <Field label="Sign-up method" value={signedUpWith} />
            <Field label="Linked accounts" value={linked} />
            <Field label="Role" value={user.is_admin ? "Admin" : "Member"} />
            <Field
              label="Status"
              value={user.suspended ? "Suspended" : "Active"}
            />
            <Field label="Suspended reason" value={user.suspendedReason} />
            <Field label="Suspended at" value={fmt(user.suspendedAt)} />
          </Section>

          <Section title="Professional profile">
            <Field label="Headline" value={user.headline} />
            <Field label="About" value={user.summary} />
            {!!user.skills?.length && (
              <div className="flex flex-wrap gap-2 py-2">
                {user.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-steel px-2.5 py-1 text-xs font-medium text-blue-300 ring-1 ring-steel-line"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            <Field label="Most recent role" value={user.previousRole} />
            <Field label="Target role" value={user.desiredRole} />
            <Field label="Industry" value={user.industry} />
            <Field label="Situation" value={user.situation} />
            <Field label="Experience" value={user.experienceYears} />
            <Field label="Availability" value={user.availability} />
            <Field label="Work preference" value={user.workPreference} />
            <Field label="Desired pay" value={user.desiredSalary} />
            <Field label="Location" value={user.location} />
            <Field label="Phone" value={user.phone} />
            <Field label="Website" value={user.website} />
            <Field label="LinkedIn" value={user.linkedinUrl} />
            <Field label="GitHub" value={user.githubUrl} />
          </Section>

          <Section title="Signup & network intel">
            <Field label="Signup location" value={user.signupLocation} />
            <Field label="IP address" value={user.signupIp} />
            <Field label="ISP" value={user.isp} />
            <Field label="Network" value={net} />
          </Section>
        </div>
      </div>
    </div>
  );
}
