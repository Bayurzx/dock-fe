// middleware.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of paths that require authentication
const protectedPaths = ["/repositories", "/configurations", "/compose-generator", "/configurations/improve"]
// List of paths that should redirect to dashboard if already authenticated
const authPaths = ["/login", "/register"]

// List of paths that should be accessible regardless of authentication status
const publicPaths = ["/login/callback", "/oauth-callback"]

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname

  // Check if the path is a public path that should always be accessible
  const isPublicPath = publicPaths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`))
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`))

  // Check if the path is an auth path
  const isAuthPath = authPaths.some((path) => currentPath === path)

  // Get the token from cookies
  const token = request.cookies.get("token")?.value

  // If the path is protected and there's no token, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname))
    return NextResponse.redirect(url)
  }

  // If the path is an auth path and there's a token, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/repositories", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
