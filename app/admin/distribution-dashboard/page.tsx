import { AllocatorSettingsForm } from "@/components/admin/AllocatorSettingsForm";
import { protectPageWithAdminAuth } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { DEFAULT_SETTINGS, AllocatorSettings } from "@/lib/tokenAllocation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await protectPageWithAdminAuth({
    callbackToOnComplete: "/admin/distribution-dashboard",
  });

  // Fetch the single configuration record
  const config = (await prisma.allocatorSettings.findUnique({
    where: { id: 1 },
  })) as AllocatorSettings | null;

  const initialSettings = config || DEFAULT_SETTINGS;

  return (
    <div className="container py-8 bg-slate-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">
        Admin - Token Allocation Parameters
      </h1>
      <AllocatorSettingsForm initialSettings={initialSettings} />
    </div>
  );
}
