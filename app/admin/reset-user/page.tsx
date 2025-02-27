import { ResetBadUsersForm } from "@/components/admin/ResetBadUsersForm";
import { protectPageWithAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function ReplicateParamsPage() {
  // First check auth
  await protectPageWithAdminAuth({
    callbackToOnComplete: "/admin/reset-user",
  });

  return <ResetBadUsersForm />;
}
