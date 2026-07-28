import { listUsers } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { signupLocationLabel } from "@/lib/geo";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await listUsers();

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-semibold text-chrome">
        Users
      </h2>
      <p className="mb-4 max-w-2xl text-sm text-fog">
        Each member&apos;s sign-up location and whether they signed up behind a
        VPN/proxy or a VPS/hosting IP.
      </p>
      <UsersManager
        currentEmail={admin?.email ?? ""}
        users={users.map((u) => {
          const s = u.profile?.signup;
          return {
            email: u.email,
            name: u.name,
            provider: u.provider,
            is_admin: !!u.is_admin,
            suspended: !!u.profile?.suspended,
            createdAt: u.createdAt,
            industry: u.profile?.industry ?? "",
            location: u.profile?.location ?? "",
            signupLocation: signupLocationLabel(s),
            signupIp: s?.ip ?? "",
            isp: s?.isp ?? "",
            vpn: !!s?.vpn,
            vps: !!s?.vps,
            ipChecked: !!s?.checked,
          };
        })}
      />
    </div>
  );
}
