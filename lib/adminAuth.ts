import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function protectPageWithAdminAuth({
  callbackToOnComplete,
}: {
  callbackToOnComplete: string;
}) {
  const cookieStore = await cookies();
  // Get the admin token from cookies
  const adminToken = cookieStore.get("admin_token")?.value;

  const isAuthenticated = adminToken === process.env.ADMIN_PASSWORD;

  // Create login redirect URL with callback
  if (!isAuthenticated)
    return redirect(
      `/admin/login?callbackUrl=${encodeURIComponent(callbackToOnComplete)}`
    );
}
