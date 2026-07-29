import { redirect } from "next/navigation";

// Signups were merged into the Users page ("Signup log" tab).
export default function AdminSignupsRedirect() {
  redirect("/admin/users");
}
