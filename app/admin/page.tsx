import { AdminDashboard } from "@/components/admin/Dashboard";
import { protectPageWithAdminAuth } from "@/lib/adminAuth";

export default async function AdminPage() {
  await protectPageWithAdminAuth({
    callbackToOnComplete: "/admin",
  });

  return <AdminDashboard />;
}
