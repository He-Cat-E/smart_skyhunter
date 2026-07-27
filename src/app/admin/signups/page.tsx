import { registrationList } from "@/lib/store";

export default async function AdminSignupsPage() {
  const rows = await registrationList();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-chrome">Signups</h2>
        <span className="text-sm text-fog">{rows.length} total</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-steel-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy text-xs uppercase tracking-wider text-fog">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Industry</th>
              <th className="px-4 py-3 font-semibold">Situation</th>
              <th className="px-4 py-3 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-line">
            {rows.map((r, i) => (
              <tr key={i} className="bg-void/40">
                <td className="whitespace-nowrap px-4 py-3 text-fog">
                  {new Date(r.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-chrome">{r.name || "—"}</td>
                <td className="px-4 py-3 text-mist">{r.email || "—"}</td>
                <td className="px-4 py-3 text-mist">{r.industry || "—"}</td>
                <td className="px-4 py-3 text-mist">{r.situation || "—"}</td>
                <td className="px-4 py-3 text-mist">{r.location || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fog">
                  No signups recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
