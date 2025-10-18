import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Define route patterns
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/orders",
  "/collections",
  "/samples",
  "/production",
  "/quality-control",
  "/messages",
];

const authRoutes = ["/auth/login", "/auth/signup"];

const publicRoutes = ["/", "/api/auth"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // Check if current route is auth route
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Role-based access control (optional)
  if (token && isProtectedRoute) {
    const userRole = token.role as string;

    // Admin-only routes
    if (path.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Manufacturer-only routes
    if (
      path.startsWith("/production") &&
      userRole !== "MANUFACTURER" &&
      userRole !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Customer-only routes
    if (
      path.startsWith("/orders") &&
      userRole !== "CUSTOMER" &&
      userRole !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth/* (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
