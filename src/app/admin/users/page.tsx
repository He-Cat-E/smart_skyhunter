import { listUsers, registrationList } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { signupLocationLabel } from "@/lib/geo";
import { UsersView } from "@/components/admin/UsersView";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const [users, signups] = await Promise.all([listUsers(), registrationList()]);

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-semibold text-chrome">
        Users &amp; signups
      </h2>
      <p className="mb-4 max-w-2xl text-sm text-fog">
        Members and their sign-up details — location, whether they used a
        VPN/proxy or VPS IP, plus the raw signup log.
      </p>
      <UsersView
        currentEmail={admin?.email ?? ""}
        signups={signups}
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
