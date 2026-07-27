import { listJobs } from "@/lib/jobs-data";
import { JobsManager } from "@/components/admin/JobsManager";

export default async function AdminJobsPage() {
  const jobs = await listJobs();
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-semibold text-chrome">
        Job listings
      </h2>
      <JobsManager jobs={jobs} />
    </div>
  );
}
