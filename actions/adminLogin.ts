"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLoginAction(
  prevState: { error: string | null },
  formData: FormData
) {
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  if (
    !password ||
    !process.env.ADMIN_PASSWORD ||
    password !== process.env.ADMIN_PASSWORD
  )
    return { error: "Invalid password" };

  // Set admin cookie
  (await cookies()).set("admin_token", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 1, // 1 day
  });

  const redirectTo = `${callbackUrl?.toString() || "/admin"}?success=true`;
  // Redirect to callback URL or admin page
  redirect(redirectTo);
}
