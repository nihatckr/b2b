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
  "/notifications",
];

const authRoutes = ["/auth/login", "/auth/signup", "/auth/reset"];

const publicRoutes = ["/", "/api/auth"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // CRITICAL FIX: Only bypass auth routes with session-expired error
  // This prevents redirect loops while maintaining security for protected routes
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  if (
    isAuthRoute &&
    req.nextUrl.searchParams.get("error") === "session-expired"
  ) {
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

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages to dashboard
  // BUT NOT if there's any error in the URL (like session-expired)
  if (isAuthRoute && token && !req.nextUrl.searchParams.has("error")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Role-based access control
  if (token && isProtectedRoute) {
    const userRole = token.role as string;
    const companyType = token.companyType as string;

    // Manufacturer-only routes (check companyType, not role)
    if (path.startsWith("/production")) {
      const isManufacturer =
        companyType === "MANUFACTURER" || companyType === "BOTH";
      if (!isManufacturer && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Quality control - manufacturers and admins
    if (path.startsWith("/quality-control")) {
      const isManufacturer =
        companyType === "MANUFACTURER" || companyType === "BOTH";
      if (!isManufacturer && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Orders, Collections, Samples - accessible by all authenticated users
    // Visibility and actions controlled by:
    // - Frontend: session.user.role checks (ADMIN sees extra features)
    // - Backend: GraphQL authScopes and resolver-level permission checks
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
