import { SuccessView } from "@/components/onboard/success/SuccessView";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <SuccessView userId={+userId} />;
}
