import { ReplicateParamsForm } from "@/components/admin/ReplicateParamsForm";
import { protectPageWithAdminAuth } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { DEFAULT_MODEL_INPUT, type StyleizePhotoInput } from "@/lib/replicate";

export const dynamic = "force-dynamic";

export default async function ReplicateParamsPage() {
  // First check auth
  await protectPageWithAdminAuth({
    callbackToOnComplete: "/admin/replicate-params",
  });
  // Then do database queries
  const config = await prisma.stylizePhotoInput.findUnique({
    where: { id: 1 },
  });

  const initialParams: StyleizePhotoInput = config || DEFAULT_MODEL_INPUT;

  return (
    <div className="container py-8 bg-slate-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Admin - Replicate Parameters</h1>
      <ReplicateParamsForm initialParams={initialParams} />
    </div>
  );
}
