import { introList, applicationsAll, listUsers } from "@/lib/store";
import {
  RequestsManager,
  type RequestRow,
} from "@/components/admin/RequestsManager";

export const dynamic = "force-dynamic";

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

  const appRows: RequestRow[] = applications.map((a) => ({
    kind: "application",
    id: a.id,
    createdAt: a.createdAt,
    memberName: a.email.split("@")[0],
    memberEmail: a.email,
    contactEmail: a.email,
    phone: "",
    title: a.jobTitle || a.jobId,
    subtitle: `Job · ${a.jobId}`,
    detail: a.note ?? "",
    status: a.status,
  }));

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
