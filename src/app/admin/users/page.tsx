import { listUsers } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await listUsers();

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-semibold text-chrome">
        Users
      </h2>
      <UsersManager
        currentEmail={admin?.email ?? ""}
        users={users.map((u) => ({
          email: u.email,
          name: u.name,
          provider: u.provider,
          is_admin: !!u.is_admin,
          suspended: !!u.profile?.suspended,
          createdAt: u.createdAt,
          industry: u.profile?.industry ?? "",
          location: u.profile?.location ?? "",
        }))}
      />
    </div>
  );
}
