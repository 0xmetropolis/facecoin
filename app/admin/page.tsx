import { StylizeParamsForm } from "@/components/admin/StylizeParamsForm";
import redis from "@/lib/redis";
import { DEFAULT_MODEL_INPUT, type StyleizePhotoInput } from "@/lib/replicate";

export default async function AdminPage() {
  // Fetch initial values from Redis
  const paramsStr = await redis.get<StyleizePhotoInput>(
    "replicate-input-params"
  );
  const initialParams: StyleizePhotoInput = paramsStr
    ? paramsStr
    : DEFAULT_MODEL_INPUT;

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Admin - Stylize Parameters</h1>
      <StylizeParamsForm initialParams={initialParams} />
    </div>
  );
}
