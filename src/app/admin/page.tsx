import { listUsers, applicationsAll, introList } from "@/lib/store";
import { isAdminUser } from "@/lib/auth";
import {
  BarRows,
  DonutChart,
  AreaChart,
  ChartCard,
  CHART,
} from "@/components/admin/charts";

function tally(items: string[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const raw of items) {
    const key = raw?.trim() || "—";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

const providerName = (p?: string) =>
  p === "google" ? "Google" : p === "linkedin" ? "LinkedIn" : "Email & password";

export default async function AdminDashboard() {
  const [users, applications, intros] = await Promise.all([
    listUsers(),
    applicationsAll(),
    introList(),
  ]);

  const total = users.length;
  const admins = users.filter((u) => isAdminUser(u)).length;
  const viaOAuth = users.filter((u) => u.provider).length;

  // Signups over the last 6 months (chronological).
  const now = new Date();
  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      count: 0,
    });
  }
  const mIdx = new Map(months.map((m, i) => [m.key, i]));
  for (const u of users) {
    const d = new Date(u.createdAt);
    const idx = mIdx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx !== undefined) months[idx].count++;
  }

  // Provider composition (donut).
  const providerRows = tally(users.map((u) => providerName(u.provider))).map(
    (r, i) => ({ ...r, color: CHART.categorical[i % CHART.categorical.length] }),
  );

  const byIndustry = tally(users.map((u) => u.profile?.industry || "—"));
  const bySituation = tally(users.map((u) => u.profile?.situation || "—"));
  const byCountry = tally(
    users.map((u) => {
      const parts = (u.profile?.location || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return parts[parts.length - 1] || "—";
    }),
  );
  const topRoles = tally(applications.map((a) => a.jobTitle || a.jobId));
  const topPartners = tally(intros.map((i) => i.partner));

  const tiles = [
    { n: total, l: "Total members", c: CHART.categorical[0] },
    { n: applications.length, l: "Applications", c: CHART.categorical[1] },
    { n: intros.length, l: "Intro requests", c: CHART.categorical[2] },
    { n: admins, l: "Admins", c: CHART.categorical[3] },
  ];

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.l}
            className="relative overflow-hidden rounded-2xl border border-steel-line bg-navy p-5"
          >
            <span
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: t.c }}
            />
            <dt className="font-display text-3xl font-semibold text-chrome">
              {t.n}
            </dt>
            <dd className="mt-1 text-xs text-fog">{t.l}</dd>
          </div>
        ))}
      </dl>

      {/* Trend + composition */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Signups · last 6 months">
          <AreaChart points={months} />
        </ChartCard>
        <ChartCard title="By sign-up method">
          <DonutChart data={providerRows} centerLabel="members" />
        </ChartCard>
      </div>

      {/* Category breakdowns */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="By industry">
          <BarRows rows={byIndustry} />
        </ChartCard>
        <ChartCard title="By situation">
          <BarRows rows={bySituation} />
        </ChartCard>
        <ChartCard title="By country">
          <BarRows rows={byCountry} />
        </ChartCard>
        <ChartCard title="Top roles applied to">
          <BarRows rows={topRoles} />
        </ChartCard>
        <ChartCard title="Most-requested partners">
          <BarRows rows={topPartners} />
        </ChartCard>
      </div>
    </div>
  );
}
