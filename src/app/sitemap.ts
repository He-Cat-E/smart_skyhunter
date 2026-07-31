import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listJobs } from "@/lib/jobs-data";

// Public URLs for search engines. Regenerated on each build (and when the jobs
// data revalidates), so newly added roles appear automatically.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: "daily" | "weekly" | "monthly";
    priority: number;
  }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/jobs", changeFrequency: "daily", priority: 0.9 },
    { path: "/community", changeFrequency: "weekly", priority: 0.6 },
    { path: "/stories", changeFrequency: "weekly", priority: 0.6 },
    { path: "/reskill", changeFrequency: "weekly", priority: 0.6 },
    { path: "/support", changeFrequency: "weekly", priority: 0.6 },
    { path: "/signup", changeFrequency: "monthly", priority: 0.5 },
    { path: "/signin", changeFrequency: "monthly", priority: 0.3 },
  ];

  const base: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const jobs: MetadataRoute.Sitemap = (await listJobs()).map((j) => ({
    url: `${SITE_URL}/jobs/${j.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...base, ...jobs];
}
