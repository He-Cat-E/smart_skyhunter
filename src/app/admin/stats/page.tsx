import type { Metadata } from "next";
import { StatsDashboard } from "@/components/admin/StatsDashboard";

export const metadata: Metadata = { title: "Analytics · SkyHunter admin" };
export const dynamic = "force-dynamic";

// Access is enforced by the admin layout (requireAdmin) and the /api/admin/stats
// route itself.
export default function AdminStatsPage() {
  return <StatsDashboard />;
}
