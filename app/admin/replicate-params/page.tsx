import { ReplicateParamsForm } from "@/components/admin/ReplicateParamsForm";
import { protectPageWithAdminAuth } from "@/lib/adminAuth";
import redis from "@/lib/redis";
import { DEFAULT_MODEL_INPUT, type StyleizePhotoInput } from "@/lib/replicate";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await protectPageWithAdminAuth({
    callbackToOnComplete: "/admin/replicate-params",
  });

  // Fetch initial values from Redis
  const paramsStr = await redis.get<StyleizePhotoInput>(
    "replicate-input-params"
  );
  const initialParams: StyleizePhotoInput = paramsStr
    ? paramsStr
    : DEFAULT_MODEL_INPUT;

  return (
    <div className="container max-w-2xl py-8 bg-slate-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Admin - Replicate Parameters</h1>
      <ReplicateParamsForm initialParams={initialParams} />
    </div>
  );
}
