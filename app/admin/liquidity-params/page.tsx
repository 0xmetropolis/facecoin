import { protectPageWithAdminAuth } from "@/lib/adminAuth";

export default async function AdminPage() {
  await protectPageWithAdminAuth({
    callbackToOnComplete: "/admin/liquidity-params",
  });

  return <p className="text-white">todo</p>;
}
