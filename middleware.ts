import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // check if accessing protected routes
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login";

  if (isProtectedRoute) {
    // check if user is authenticated via cookie
    const isAuthenticated =
      request.cookies.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
    // continue the user along if it's a protected route
    if (isAuthenticated) return NextResponse.next();
    else {
      // redirect to login page with return URL
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

      return NextResponse.redirect(loginUrl);
    }
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
