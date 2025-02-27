import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

/**
 * Handles user logout by clearing all cookies and redirecting to the homepage
 */
export async function GET(request: NextRequest) {
  // Create a response that will redirect to the homepage
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Get all cookies and delete them
  const allCookies = request.cookies.getAll();
  debugger
  for (const cookie of allCookies) {
    response.cookies.set({
      name: cookie.name,
      value: '',
      expires: new Date(0), // Set expiration to the past
      path: '/', // Ensure the cookie is deleted from all paths
    });
  }
  
  return response;
}
