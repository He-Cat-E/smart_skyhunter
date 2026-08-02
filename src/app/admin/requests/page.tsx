import { introList, applicationsAll, listUsers } from "@/lib/store";
import { findUser } from "@/lib/auth";
import {
  RequestsManager,
  type RequestRow,
} from "@/components/admin/RequestsManager";

export const dynamic = "force-dynamic";

// Applications pack the cover note, portfolio link, and phone into one " · "
// separated string (see /api/apply). Split it back out so the admin can read
// each field — and open the portfolio/CV as a real link.
function parseApplicationDetail(raw: string): {
  note: string;
  portfolio: string;
  phone: string;
} {
  const detail = raw || "";
  const portfolio =
    detail.match(/Portfolio\/CV:\s*(\S[^·]*?)(?=\s·\s|$)/i)?.[1]?.trim() ?? "";
  const phone =
    detail.match(/(?:^|·\s*)Phone:\s*([^·]+?)(?=\s·\s|$)/i)?.[1]?.trim() ?? "";
  const cut = detail.search(/\s·\s(?:Portfolio\/CV|Phone):/i);
  const note =
    cut >= 0
      ? detail.slice(0, cut).trim()
      : /^(Portfolio\/CV|Phone):/i.test(detail)
        ? ""
        : detail.trim();
  return { note, portfolio, phone };
}

export default async function AdminRequestsPage() {
  const [intros, applications, users] = await Promise.all([
    introList(),
    applicationsAll(),
    listUsers(),
  ]);

  // Every registered member the admin can send a scheduled interview to.
  const memberOptions = users
    .filter((u) => !u.profile?.suspended)
    .map((u) => ({ email: u.email, name: u.name }));

  const introRows: RequestRow[] = intros.map((i) => ({
    kind: "interview",
    id: i.id,
    createdAt: i.createdAt,
    memberName: i.name,
    memberEmail: i.email,
    contactEmail: i.contactEmail,
    phone: i.phone,
    title: i.partner,
    subtitle: i.role,
    detail: i.message,
    status: i.status,
    scheduledAt: i.scheduledAt,
    meetingLink: i.meetingLink,
    scheduleNote: i.scheduleNote,
  }));

  const appRows: RequestRow[] = await Promise.all(
    applications.map(async (a) => {
      const u = await findUser(a.email);
      const { note, portfolio, phone } = parseApplicationDetail(a.note ?? "");
      const p = u?.profile;
      return {
        kind: "application" as const,
        id: a.id,
        createdAt: a.createdAt,
        memberName: u?.name || a.email.split("@")[0],
        memberEmail: a.email,
        contactEmail: a.email,
        phone: phone || p?.phone || "",
        title: a.jobTitle || a.jobId,
        subtitle: `Job · ${a.jobId}`,
        detail: note,
        status: a.status,
        portfolioUrl: portfolio,
        profile: p
          ? {
              headline: p.headline,
              summary: p.summary,
              skills: p.skills,
              experienceYears: p.experienceYears,
              desiredRole: p.desiredRole,
              workPreference: p.workPreference,
              availability: p.availability,
              desiredSalary: p.desiredSalary,
              website: p.website,
              linkedinUrl: p.linkedinUrl,
              githubUrl: p.githubUrl,
            }
          : undefined,
      };
    }),
  );

  const rows = [...introRows, ...appRows].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-chrome">
          Requests
        </h2>
        <span className="text-sm text-fog">{rows.length} total</span>
      </div>
      <p className="mb-5 max-w-2xl text-sm text-fog">
        Every member request in one place — interview bookings and job
        applications. Update a status to move it along; the member is notified
        automatically.
      </p>

      <RequestsManager rows={rows} members={memberOptions} />
    </div>
  );
}
