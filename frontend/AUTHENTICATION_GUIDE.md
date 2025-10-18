# 🔐 Frontend Authentication & Authorization Guide

**Framework**: Next.js 15.5.6 + NextAuth v4.24.11 + URQL 4.1.0
**Backend**: GraphQL Yoga v5 + Pothos (backend/ directory - Production)
**Last Updated**: October 19, 2025
**Status**: ✅ Production Ready

> **✅ Production Backend**: This guide refers to the **`/backend`** directory (GraphQL Yoga + Pothos).
> **Port**: 4001 | **GraphQL Endpoint**: `http://localhost:4001/graphql`
> The `/server` directory is legacy (Apollo + Nexus). See [BACKEND_INFO.md](../BACKEND_INFO.md)---

## 📑 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [Authorization & RBAC](#authorization--rbac)
4. [Adding New Pages](#adding-new-pages)
5. [Adding New Roles](#adding-new-roles)
6. [Page Protection](#page-protection)
7. [Backend Integration](#backend-integration)
8. [Development Roadmap](#development-roadmap)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND STACK                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔐 Authentication: NextAuth v4.24.11               │
│     ├─ JWT Strategy                                │
│     ├─ Credentials Provider (Email/Password)       │
│     └─ GitHub OAuth Provider                       │
│                                                     │
│  🔑 Authorization: Data Access Layer (DAL)          │
│     ├─ Role-Based Access Control (RBAC)            │
│     ├─ React cache() optimization                  │
│     └─ 12+ helper functions                        │
│                                                     │
│  🌐 GraphQL Client: URQL 4.1.0                      │
│     ├─ Cache Exchange                              │
│     ├─ SSR Exchange                                │
│     └─ Fetch Exchange (Bearer token auto-inject)  │
│                                                     │
│  🛡️ Route Protection: Middleware                    │
│     ├─ Server-side auth check                      │
│     ├─ Role-based routing                          │
│     └─ Automatic redirects                         │
│                                                     │
│  🔄 Token Management:                               │
│     ├─ Backend JWT stored in session               │
│     ├─ 12-hour automatic refresh                   │
│     └─ Rate limiting (5 attempts/15min)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Directory Structure

```
frontend/
├── middleware.ts                    # 🛡️ Route protection
├── src/
│   ├── lib/
│   │   ├── auth.ts                 # 🔐 NextAuth configuration
│   │   ├── dal.ts                  # 🔑 Data Access Layer (RBAC)
│   │   ├── rate-limit.ts           # 🚦 Brute force protection
│   │   └── graphql/
│   │       └── urqlClient.ts       # 🌐 URQL client setup
│   │
│   ├── app/
│   │   ├── (auth)/                 # 🔓 Public auth pages
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (protected)/            # 🔒 Protected pages
│   │   │   ├── dashboard/
│   │   │   ├── collections/
│   │   │   ├── samples/
│   │   │   ├── orders/
│   │   │   ├── production/
│   │   │   ├── messages/
│   │   │   └── admin/              # 👑 Admin-only pages
│   │   │
│   │   └── api/
│   │       └── auth/[...nextauth]/ # NextAuth API routes
│   │
│   └── components/
│       ├── Auth/
│       │   ├── login-form.tsx
│       │   └── register-form.tsx
│       └── ...
│
└── types/
    └── next-auth.d.ts              # TypeScript declarations
```

---

## 🔐 Authentication System

### 1. NextAuth Configuration

**File**: `frontend/src/lib/auth.ts`

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

// OAuth Provider Map (for dynamic rendering)
export const oauthProviders = [
  { id: "github" as const, name: "GitHub" },
  // Add more providers here:
  // { id: "google" as const, name: "Google" },
  // { id: "discord" as const, name: "Discord" },
] as const;

export type OAuthProviderId = typeof oauthProviders[number]["id"];

export const authOptions: NextAuthOptions = {
  providers: [
    // 📧 Email/Password Authentication
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gereklidir");
        }

        // Rate limiting check
        const rateLimitResult = checkRateLimit(credentials.email);
        if (!rateLimitResult.allowed) {
          throw new Error("Çok fazla başarısız giriş denemesi");
        }

        // Call GraphQL backend
        const response = await fetch(
          process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                mutation Login($email: String!, $password: String!) {
                  login(email: $email, password: $password)
                }
              `,
              variables: {
                email: credentials.email,
                password: credentials.password,
              },
            }),
          }
        );

        const data = await response.json();

        if (data.errors || !data.data?.login) {
          throw new Error(data.errors?.[0]?.message || "Giriş başarısız");
        }

        const loginResult = JSON.parse(data.data.login);

        // Reset rate limit on success
        resetRateLimit(credentials.email);

        return {
          id: String(loginResult.user.id),
          email: loginResult.user.email,
          name: loginResult.user.name || "",
          role: loginResult.user.role,
          companyId: loginResult.user.companyId,
          backendToken: loginResult.token, // ✅ Backend JWT
        };
      },
    }),

    // 🔗 GitHub OAuth
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],

  callbacks: {
    // 🔗 OAuth → Backend Sync
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.email) {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: `
                  mutation SignupOAuth($email: String!, $name: String!) {
                    signupOAuth(email: $email, name: $name)
                  }
                `,
                variables: {
                  email: user.email,
                  name: user.name || user.email.split("@")[0],
                },
              }),
            }
          );

          const data = await response.json();

          if (data.data?.signupOAuth) {
            const signupResult = JSON.parse(data.data.signupOAuth);
            user.backendToken = signupResult.token;
            user.id = String(signupResult.user.id);
            user.role = signupResult.user.role;
            user.companyId = signupResult.user.companyId;
          }
        } catch (error) {
          console.error("GitHub OAuth Backend sync error:", error);
        }
      }

      return true;
    },

    // 🔑 JWT Callback (Store backend token & role)
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.backendToken = user.backendToken;
      }

      // 🔄 Token Refresh Rotation (12-hour)
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = token.iat ? now - token.iat : 0;
      const twelveHours = 12 * 60 * 60;

      if (tokenAge > twelveHours && token.backendToken && trigger !== "update") {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${token.backendToken}`,
              },
              body: JSON.stringify({
                query: `mutation RefreshToken { refreshToken }`,
              }),
            }
          );

          const data = await response.json();

          if (data.data?.refreshToken) {
            token.backendToken = data.data.refreshToken;
            token.iat = now;
          }
        } catch (error) {
          console.error("Token refresh error:", error);
        }
      }

      return token;
    },

    // 📤 Session Callback (Expose to client)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || "";
        session.user.role = token.role || "USER";
        session.user.companyId = token.companyId;
        session.user.backendToken = token.backendToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60,   // 1 hour
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60,
  },
};
```

### 2. TypeScript Declarations

**File**: `frontend/next-env.d.ts` or `types/next-auth.d.ts`

```typescript
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      companyId?: string;
      backendToken?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
    companyId?: string;
    backendToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    companyId?: string;
    backendToken?: string;
    iat?: number;
    exp?: number;
  }
}
```

### 3. Login Component

**File**: `frontend/src/components/Auth/login-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { oauthProviders, type OAuthProviderId } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Giriş yapılamadı",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (providerId: OAuthProviderId) => {
    await signIn(providerId, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="space-y-6">
      {/* Email/Password Form */}
      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            veya
          </span>
        </div>
      </div>

      {/* Dynamic OAuth Buttons */}
      <div className="space-y-2">
        {oauthProviders.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn(provider.id)}
          >
            {provider.name} ile Giriş Yap
          </Button>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔑 Authorization & RBAC

### 1. Data Access Layer (DAL)

**File**: `frontend/src/lib/dal.ts`

```typescript
import { getServerSession } from "next-auth/next";
import { cache } from "react";
import { authOptions } from "./auth";

// 👤 User Roles
export enum UserRole {
  ADMIN = "ADMIN",
  MANUFACTURER = "MANUFACTURER",
  CUSTOMER = "CUSTOMER",
  USER = "USER",
}

// 📦 Session Data Type
export interface SessionData {
  isAuth: boolean;
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string;
  backendToken?: string;
}

// ✅ Verify Session (with React cache)
export const verifySession = cache(async (): Promise<SessionData> => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized: No active session");
  }

  return {
    isAuth: true,
    userId: session.user.id,
    email: session.user.email || "",
    role: session.user.role as UserRole,
    companyId: session.user.companyId,
    backendToken: session.user.backendToken,
  };
});

// 📋 Get Session (without throwing)
export const getSession = cache(async (): Promise<SessionData | null> => {
  try {
    return await verifySession();
  } catch {
    return null;
  }
});

// 🔍 Check if user has role
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return allowedRoles.includes(session.role);
}

// ✅ Verify user has role (throws if not)
export async function verifyRole(allowedRoles: UserRole[]): Promise<void> {
  const session = await verifySession();

  if (!allowedRoles.includes(session.role)) {
    throw new Error(
      `Forbidden: Required role ${allowedRoles.join(" or ")}, but user has ${session.role}`
    );
  }
}

// 👑 Admin Helpers
export async function isAdmin(): Promise<boolean> {
  return hasRole([UserRole.ADMIN]);
}

export async function verifyAdmin(): Promise<void> {
  return verifyRole([UserRole.ADMIN]);
}

// 🏭 Manufacturer Helpers
export async function isManufacturer(): Promise<boolean> {
  return hasRole([UserRole.MANUFACTURER, UserRole.ADMIN]);
}

export async function verifyManufacturer(): Promise<void> {
  return verifyRole([UserRole.MANUFACTURER, UserRole.ADMIN]);
}

// 🛒 Customer Helpers
export async function isCustomer(): Promise<boolean> {
  return hasRole([UserRole.CUSTOMER, UserRole.ADMIN]);
}

export async function verifyCustomer(): Promise<void> {
  return verifyRole([UserRole.CUSTOMER, UserRole.ADMIN]);
}

// 📝 Resource Ownership
export async function ownsResource(resourceUserId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Admin can access all resources
  if (session.role === UserRole.ADMIN) return true;

  return session.userId === resourceUserId;
}

export async function verifyResourceOwnership(resourceUserId: string): Promise<void> {
  const isOwner = await ownsResource(resourceUserId);

  if (!isOwner) {
    throw new Error("Forbidden: You don't have access to this resource");
  }
}

// 🏢 Company Access
export async function belongsToCompany(companyId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Admin can access all companies
  if (session.role === UserRole.ADMIN) return true;

  return session.companyId === companyId;
}

export async function verifyCompanyAccess(companyId: string): Promise<void> {
  const hasAccess = await belongsToCompany(companyId);

  if (!hasAccess) {
    throw new Error("Forbidden: You don't have access to this company");
  }
}

// 🔐 Get Backend Authorization Header
export async function getAuthHeader(): Promise<string> {
  const session = await verifySession();

  if (!session.backendToken) {
    throw new Error("No backend token available");
  }

  return `Bearer ${session.backendToken}`;
}
```

### 2. Middleware (Route Protection)

**File**: `frontend/middleware.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Check authentication
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const userRole = token.role as string;

  // 👑 Admin-only routes
  if (path.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 🏭 Manufacturer-only routes
  if (
    path.startsWith("/production") &&
    userRole !== "MANUFACTURER" &&
    userRole !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 🛒 Customer-only routes
  if (
    path.startsWith("/orders") &&
    userRole !== "CUSTOMER" &&
    userRole !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

---

## ➕ Adding New Pages

### Step-by-Step Guide

#### 1. Create Page File

```typescript
// frontend/src/app/(protected)/your-new-page/page.tsx

import { verifySession, verifyRole, UserRole } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function YourNewPage() {
  // ✅ Option 1: Verify authentication only
  try {
    await verifySession();
  } catch {
    redirect("/auth/login");
  }

  // ✅ Option 2: Verify specific role
  try {
    await verifyRole([UserRole.ADMIN, UserRole.MANUFACTURER]);
  } catch {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1>Your New Page</h1>
      {/* Your content */}
    </div>
  );
}
```

#### 2. Add Navigation Link

```typescript
// frontend/src/components/Navigation/sidebar.tsx

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["ADMIN", "MANUFACTURER", "CUSTOMER", "USER"],
  },
  {
    title: "Your New Page",
    href: "/your-new-page",
    icon: YourIcon,
    roles: ["ADMIN", "MANUFACTURER"], // Visible only to these roles
  },
  // ... more items
];

export function Sidebar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <nav>
      {navigationItems
        .filter((item) => item.roles.includes(userRole))
        .map((item) => (
          <Link key={item.href} href={item.href}>
            <item.icon />
            {item.title}
          </Link>
        ))}
    </nav>
  );
}
```

#### 3. Update Middleware (if role-specific)

```typescript
// frontend/middleware.ts

export async function middleware(req: NextRequest) {
  // ... existing code ...

  // Add your new route protection
  if (
    path.startsWith("/your-new-page") &&
    userRole !== "ADMIN" &&
    userRole !== "MANUFACTURER"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
```

#### 4. Create API Route (if needed)

```typescript
// frontend/src/app/api/your-endpoint/route.ts

import { verifyRole, UserRole, getAuthHeader } from "@/lib/dal";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verify role
    await verifyRole([UserRole.ADMIN]);

    // Get backend token
    const authHeader = await getAuthHeader();

    // Call GraphQL backend
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: authHeader,
      },
      body: JSON.stringify({
        query: `
          query YourQuery {
            yourData {
              id
              name
            }
          }
        `,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data.yourData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 403 }
    );
  }
}
```

---

## 👥 Adding New Roles

### Complete Guide

#### 1. Update Backend Enum

**File**: `server/prisma/schema.prisma`

```prisma
enum UserRole {
  ADMIN
  MANUFACTURER
  CUSTOMER
  USER
  NEW_ROLE  // ← Add your new role
}
```

Run migration:
```bash
cd server
npx prisma migrate dev --name add_new_role
```

#### 2. Update Frontend DAL

**File**: `frontend/src/lib/dal.ts`

```typescript
export enum UserRole {
  ADMIN = "ADMIN",
  MANUFACTURER = "MANUFACTURER",
  CUSTOMER = "CUSTOMER",
  USER = "USER",
  NEW_ROLE = "NEW_ROLE", // ← Add your new role
}

// Add helper functions
export async function isNewRole(): Promise<boolean> {
  return hasRole([UserRole.NEW_ROLE, UserRole.ADMIN]);
}

export async function verifyNewRole(): Promise<void> {
  return verifyRole([UserRole.NEW_ROLE, UserRole.ADMIN]);
}
```

#### 3. Update Middleware

**File**: `frontend/middleware.ts`

```typescript
export async function middleware(req: NextRequest) {
  // ... existing code ...

  // Add NEW_ROLE specific routes
  if (
    path.startsWith("/new-role-route") &&
    userRole !== "NEW_ROLE" &&
    userRole !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
```

#### 4. Update Backend Authorization (Pothos)

**File**: `backend/src/graphql/builder.ts`

```typescript
// Update authScopes type definition
const builder = new SchemaBuilder<{
  AuthScopes: {
    public: boolean;
    authenticated: boolean;
    admin: boolean;
    manufacturer: boolean;
    customer: boolean;
    newRole: boolean; // Add new role scope
  };
}>({
  plugins: [ScopeAuthPlugin],
  authScopes: async (context) => ({
    public: true,
    authenticated: !!context.user,
    admin: context.user?.role === "ADMIN",
    manufacturer: context.user?.role === "MANUFACTURER",
    customer: context.user?.role === "CUSTOMER",
    newRole: context.user?.role === "NEW_ROLE", // Add scope resolver
  }),
});

// Apply to queries/mutations
builder.queryField("newRoleSpecificQuery", (t) =>
  t.field({
    type: "String",
    authScopes: { newRole: true }, // Require new role
    resolve: () => "Data for new role",
  })
);

builder.mutationField("newRoleSpecificMutation", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { newRole: true },
    resolve: () => true,
  })
);
```

#### 5. Update Navigation

```typescript
const navigationItems = [
  {
    title: "New Role Dashboard",
    href: "/new-role-dashboard",
    icon: Icon,
    roles: ["NEW_ROLE", "ADMIN"],
  },
];
```

#### 6. Backend-Frontend Sync Checklist

**When adding a new role, update in this order**:

1. ✅ **Backend Schema** (`backend/prisma/schema.prisma`)
   - Add to `UserRole` enum
   - Run migration: `npx prisma migrate dev --name add_new_role`

2. ✅ **Backend Authorization** (`backend/src/graphql/builder.ts`)
   - Add to `AuthScopes` type: `newRole: boolean`
   - Add scope resolver: `newRole: context.user?.role === "NEW_ROLE"`
   - Apply to queries/mutations with `authScopes: { newRole: true }`

3. ✅ **Frontend DAL** (`frontend/src/lib/dal.ts`)
   - Add to `UserRole` enum (must match backend)
   - Create helpers: `isNewRole()`, `verifyNewRole()`

4. ✅ **Frontend Middleware** (`frontend/middleware.ts`)
   - Add route protection logic
   - Define role-specific redirects

5. ✅ **Frontend Navigation**
   - Update nav items with role restrictions
   - Add new menu items

6. ✅ **Test Both Sides**
   ```bash
   # Backend
   cd server && npm run dev

   # Frontend
   cd frontend && npm run dev
   ```

---

## 🛡️ Page Protection

### Protection Strategies

#### Strategy 1: Server Component (Recommended)

```typescript
// app/(protected)/admin/page.tsx

import { verifyAdmin } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  try {
    await verifyAdmin();
  } catch {
    redirect("/dashboard");
  }

  return <div>Admin Content</div>;
}
```

**Pros**:
- ✅ Server-side verification
- ✅ No client-side flash
- ✅ Better SEO
- ✅ Secure by default

#### Strategy 2: Client Component

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <div>Protected Content</div>;
}
```

**Pros**:
- ✅ Interactive features
- ✅ Real-time updates
- ❌ Client-side flash
- ❌ SEO limitations

#### Strategy 3: Middleware (Global)

Best for entire route groups:

```typescript
// middleware.ts

if (path.startsWith("/admin") && userRole !== "ADMIN") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

**Pros**:
- ✅ Runs before page load
- ✅ No client-side code
- ✅ Efficient
- ❌ Less granular

---

## 🔗 Backend Integration

> **✅ Production Backend**: All references to "backend" in this section point to the **`/backend`** directory.
> **Tech Stack**: GraphQL Yoga v5 + Pothos + Prisma
> **GraphQL Endpoint**: `http://localhost:4001/graphql` (development)
> **Backend Structure**:
> ```
> backend/
> ├── src/
> │   ├── server.ts                # GraphQL Yoga server + JWT middleware
> │   └── graphql/
> │       ├── builder.ts           # Pothos schema builder
> │       ├── context.ts           # GraphQL context (user from JWT)
> │       ├── schema.ts            # Combined schema
> │       ├── mutations/           # GraphQL mutations (login, signup, etc.)
> │       │   ├── authMutation.ts  # Login/Signup/OAuth
> │       │   ├── userMutation.ts
> │       │   └── ...
> │       ├── queries/             # GraphQL queries (me, users, etc.)
> │       │   ├── userQuery.ts
> │       │   └── ...
> │       ├── types/               # Pothos type definitions
> │       └── enums/               # GraphQL enums (UserRole, etc.)
> └── prisma/
>     └── schema.prisma            # Database schema (MySQL)
> ```
>
> **Authorization**: Pothos ScopeAuth plugin (field-level authorization)### 1. URQL Client Setup

**File**: `frontend/src/lib/graphql/urqlClient.ts`

```typescript
import { cacheExchange, createClient, fetchExchange, ssrExchange } from "urql";

const isServerSide = typeof window === "undefined";
const ssrCache = ssrExchange({ isClient: !isServerSide });

const client = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
  exchanges: [cacheExchange, ssrCache, fetchExchange],
  fetchOptions: () => {
    // Get token from localStorage (client-side only)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    return {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  },
});

export { client, ssrCache };
export default client;
```

### 2. Server-Side GraphQL Calls

```typescript
// app/(protected)/collections/page.tsx

import { getAuthHeader } from "@/lib/dal";

export default async function CollectionsPage() {
  const authHeader = await getAuthHeader();

  const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: authHeader,
    },
    body: JSON.stringify({
      query: `
        query Collections {
          collections {
            id
            name
            description
          }
        }
      `,
    }),
  });

  const data = await response.json();
  const collections = data.data.collections;

  return (
    <div>
      {collections.map((collection: any) => (
        <div key={collection.id}>{collection.name}</div>
      ))}
    </div>
  );
}
```

### 3. Client-Side GraphQL Calls

```typescript
"use client";

import { useQuery } from "urql";

const COLLECTIONS_QUERY = `
  query Collections {
    collections {
      id
      name
      description
    }
  }
`;

export default function CollectionsList() {
  const [result] = useQuery({ query: COLLECTIONS_QUERY });

  if (result.fetching) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return (
    <div>
      {result.data?.collections.map((collection: any) => (
        <div key={collection.id}>{collection.name}</div>
      ))}
    </div>
  );
}
```

### 4. Backend Authorization (Pothos ScopeAuth)

**File**: `backend/src/graphql/builder.ts` ✅ Production Backend

> **How it works**:
> 1. Frontend sends request with `Authorization: Bearer <jwt>`
> 2. `backend/src/server.ts` validates JWT with express-jwt
> 3. User extracted from JWT and added to GraphQL context
> 4. Pothos ScopeAuth checks permissions at field-level```typescript
// backend/src/graphql/builder.ts
import SchemaBuilder from "@pothos/core";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";

const builder = new SchemaBuilder<{
  Context: {
    user?: {
      id: number;
      email: string;
      role: string;
    };
  };
  AuthScopes: {
    public: boolean;
    authenticated: boolean;
    admin: boolean;
    manufacturer: boolean;
  };
}>({
  plugins: [ScopeAuthPlugin],
  authScopes: async (context) => ({
    public: true,
    authenticated: !!context.user,
    admin: context.user?.role === "ADMIN",
    manufacturer:
      context.user?.role === "MANUFACTURER" ||
      context.user?.role === "ADMIN",
  }),
});

// Example: Protected Query
builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { authenticated: true }, // ✅ Requires authentication
    resolve: async (query, root, args, ctx) => {
      return ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.user!.id },
      });
    },
  })
);

// Example: Admin-only Query
builder.queryField("allUsers", (t) =>
  t.prismaField({
    type: ["User"],
    authScopes: { admin: true }, // ✅ Admin only
    resolve: async (query, root, args, ctx) => {
      return ctx.prisma.user.findMany();
    },
  })
);

// Example: Manufacturer Mutation
builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: "Collection",
    authScopes: { manufacturer: true }, // ✅ Manufacturer or Admin
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      return ctx.prisma.collection.create({
        data: { name: args.name },
      });
    },
  })
);
```

**Adding New Protected Query/Mutation**:
1. Add `authScopes` to field definition in mutation/query file
2. Choose appropriate scope: `public`, `authenticated`, `admin`, `manufacturer`
3. Frontend DAL will automatically enforce same rules

**Pothos Advantages over graphql-shield**:
- ✅ Field-level authorization (more granular)
- ✅ Type-safe with TypeScript
- ✅ Better performance (no separate middleware layer)
- ✅ Easier to debug

### 5. Backend Endpoints Reference

> **Quick Reference**: Available GraphQL queries and mutations in production backend (`/backend`)

#### Authentication Mutations

| Mutation | Role Required | Description | Location |
|----------|--------------|-------------|----------|
| `login(email, password)` | Public | Login with credentials | `backend/src/graphql/mutations/authMutation.ts` |
| `signup(email, password, name, role)` | Public | Register new user | `backend/src/graphql/mutations/authMutation.ts` |
| `signupOAuth(email, name)` | Public | OAuth user sync | `backend/src/graphql/mutations/authMutation.ts` |
| `refreshToken()` | Authenticated | Refresh JWT token | `backend/src/graphql/mutations/authMutation.ts` |

#### User Queries & Mutations

| Operation | Type | Role Required | Description | Location |
|-----------|------|--------------|-------------|----------|
| `me()` | Query | Authenticated | Get current user | `backend/src/graphql/queries/userQuery.ts` |
| `users()` | Query | Admin | List all users | `backend/src/graphql/queries/userQuery.ts` |
| `user(id)` | Query | Authenticated | Get user by ID | `backend/src/graphql/queries/userQuery.ts` |
| `updateUser()` | Mutation | Authenticated | Update user profile | `backend/src/graphql/mutations/userMutation.ts` |
| `deleteUser(id)` | Mutation | Admin | Delete user | `backend/src/graphql/mutations/userMutation.ts` |

#### Resource Queries (Examples)

| Query | Role Required | Description | Location |
|-------|--------------|-------------|----------|
| `collections()` | Public | List collections | `backend/src/graphql/queries/collectionQuery.ts` |
| `samples()` | Authenticated | List samples | `backend/src/graphql/queries/sampleQuery.ts` |
| `orders()` | Authenticated | List orders | `backend/src/graphql/queries/orderQuery.ts` |
| `messages()` | Authenticated | List messages | `backend/src/graphql/queries/messageQuery.ts` |

#### Resource Mutations (Examples)

| Mutation | Role Required | Description | Location |
|----------|--------------|-------------|----------|
| `createCollection()` | Manufacturer | Create collection | `backend/src/graphql/mutations/collectionMutation.ts` |
| `createSample()` | Customer | Request sample | `backend/src/graphql/mutations/sampleMutation.ts` |
| `updateOrder()` | Authenticated | Update order | `backend/src/graphql/mutations/orderMutation.ts` |
| `createMessage()` | Authenticated | Send message | `backend/src/graphql/mutations/messageMutation.ts` |

**Finding More Endpoints**:
```bash
# View all queries
ls backend/src/graphql/queries/*.ts

# View all mutations
ls backend/src/graphql/mutations/*.ts

# Or explore GraphQL Playground
http://localhost:4001/graphql
```

**Pothos Structure**:
```typescript
// Each file exports field definitions
// backend/src/graphql/mutations/collectionMutation.ts
builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: "Collection",
    authScopes: { manufacturer: true },
    args: { name: t.arg.string({ required: true }) },
    resolve: async (query, root, args, ctx) => {
      return ctx.prisma.collection.create({
        data: { name: args.name },
      });
    },
  })
);
```

### 6. Full Stack Authentication Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└────────────────────────────────────────────────────────────────┘

1️⃣  USER ACTION (Frontend)
    ↓
    User enters credentials in login form
    frontend/src/components/Auth/login-form.tsx

2️⃣  NEXTAUTH AUTHORIZE (Frontend)
    ↓
    CredentialsProvider.authorize() called
    frontend/src/lib/auth.ts
    ↓
    GraphQL mutation sent to backend:
    mutation Login($email: String!, $password: String!)

3️⃣  BACKEND RECEIVES REQUEST (Server)
    ↓
    GraphQL Yoga server receives request
    backend/src/server.ts
    ↓
    Pothos routes to mutation resolver
    backend/src/graphql/mutations/authMutation.ts

4️⃣  BACKEND VALIDATION (Server)
    ↓
    • Verify email exists in database
    • Check password with bcrypt
    • Generate JWT token with user data
    ↓
    Return: { token: "jwt...", user: {...} }

5️⃣  FRONTEND STORES TOKEN (Frontend)
    ↓
    NextAuth JWT callback stores token
    frontend/src/lib/auth.ts
    ↓
    • token.backendToken = user.backendToken
    • token.role = user.role
    ↓
    NextAuth Session callback exposes to client
    • session.user.backendToken = token.backendToken
    • session.user.role = token.role

6️⃣  MIDDLEWARE PROTECTION (Frontend)
    ↓
    User navigates to protected page
    ↓
    Middleware checks authentication & role
    frontend/middleware.ts
    ↓
    • Extract token with getToken()
    • Check user role
    • Allow access or redirect

7️⃣  API REQUEST (Frontend → Server)
    ↓
    Page needs data from backend
    ↓
    OPTION A: Server Component
    • const authHeader = await getAuthHeader()
    • fetch(GRAPHQL_URL, { headers: { authorization: authHeader } })
    ↓
    OPTION B: Client Component (URQL)
    • URQL auto-injects token from localStorage
    • useQuery({ query: "..." })

8️⃣  BACKEND AUTHORIZATION (Server)
    ↓
    Request arrives with Authorization: Bearer <jwt>
    ↓
    JWT middleware validates token
    backend/src/server.ts
    ↓
    • Verify JWT signature
    • Extract user from token
    • Add to GraphQL context
    ↓
    Pothos ScopeAuth checks permissions
    backend/src/graphql/builder.ts
    ↓
    • Evaluate authScopes for query/mutation
    • Check if user has required role
    • Allow or deny access

9️⃣  DATA RETURNED (Server → Frontend)
    ↓
    Resolver executes and returns data
    ↓
    Frontend receives response
    ↓
    Page renders with data

┌────────────────────────────────────────────────────────────────┐
│              🔄 TOKEN REFRESH (Every 12 Hours)                  │
├────────────────────────────────────────────────────────────────┤
│  JWT callback checks token age                                 │
│  ↓                                                             │
│  If > 12 hours:                                                │
│  • Call refreshToken mutation                                  │
│  • Send old token in Authorization header                      │
│  • Backend generates new token                                 │
│  • Store new token in session                                  │
│  ✅ User never notices (transparent refresh)                   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Development Roadmap

### Phase 1: Current State ✅ (COMPLETED)

- [x] NextAuth v4 setup with JWT strategy
- [x] Credentials + GitHub OAuth providers
- [x] Data Access Layer with 12+ helpers
- [x] Middleware route protection
- [x] 4 user roles (ADMIN, MANUFACTURER, CUSTOMER, USER)
- [x] Rate limiting (5 attempts/15min)
- [x] Token refresh rotation (12-hour)
- [x] Backend JWT integration
- [x] URQL client with Bearer token
- [x] TypeScript type safety

**Status**: Production Ready 🚀

---

### Phase 2: Enhanced Security (Next 2 Weeks)

#### Week 1: Two-Factor Authentication (2FA)

**Tasks**:
1. Install dependencies
   ```bash
   npm install qrcode speakeasy
   ```

2. Add 2FA to backend schema
   ```prisma
   model User {
     // ... existing fields
     twoFactorEnabled Boolean @default(false)
     twoFactorSecret  String?
   }
   ```

3. Create 2FA setup page
   ```typescript
   // app/(protected)/settings/2fa/page.tsx
   ```

4. Update login flow
   ```typescript
   // If user has 2FA → redirect to /auth/verify-2fa
   ```

**Files to Create**:
- `frontend/src/lib/2fa.ts` - 2FA utilities
- `frontend/src/app/(protected)/settings/2fa/page.tsx` - Setup page
- `frontend/src/app/(auth)/verify-2fa/page.tsx` - Verification page
- `backend/src/graphql/mutations/setup2FA.ts` - Backend mutation

**Estimated Time**: 3-4 days

---

#### Week 2: Session Management & Security

**Tasks**:
1. Add session list page (active devices)
2. Add "Logout from all devices" feature
3. Add suspicious login detection
4. Add email notifications for new logins
5. Add IP-based rate limiting

**Files to Create**:
- `frontend/src/app/(protected)/settings/sessions/page.tsx`
- `frontend/src/lib/security.ts` - Security utilities
- `backend/src/graphql/mutations/revokeAllSessions.ts`

**Estimated Time**: 3-4 days

---

### Phase 3: Permission System (Weeks 3-4)

#### Week 3: Granular Permissions

**Current**: Role-based (4 roles)
**Goal**: Permission-based (100+ permissions)

**Tasks**:
1. Create permission system
   ```typescript
   // frontend/src/lib/permissions.ts
   export const permissions = {
     collections: {
       view: ["ADMIN", "MANUFACTURER", "CUSTOMER"],
       create: ["ADMIN", "MANUFACTURER"],
       edit: ["ADMIN", "MANUFACTURER"],
       delete: ["ADMIN"],
     },
     samples: {
       view: ["ADMIN", "MANUFACTURER", "CUSTOMER"],
       create: ["ADMIN", "CUSTOMER"],
       approve: ["ADMIN", "MANUFACTURER"],
     },
     // ... more permissions
   };
   ```

2. Add permission checks
   ```typescript
   // frontend/src/lib/dal.ts
   export async function hasPermission(
     category: string,
     action: string
   ): Promise<boolean> {
     const session = await getSession();
     const allowed = permissions[category][action];
     return allowed.includes(session.role);
   }
   ```

3. Update all protected routes
4. Add permission management UI (admin)

**Files to Update**:
- `frontend/src/lib/dal.ts` - Add permission functions
- `frontend/src/lib/permissions.ts` - Permission definitions
- `frontend/src/app/(protected)/admin/permissions/page.tsx` - UI

**Estimated Time**: 5-6 days

---

#### Week 4: Custom Role Builder

**Goal**: Allow admins to create custom roles with specific permissions

**Tasks**:
1. Add roles management page
2. Add permission matrix UI
3. Backend: Dynamic permission loading
4. Cache permission checks

**Files to Create**:
- `frontend/src/app/(protected)/admin/roles/page.tsx`
- `frontend/src/components/Admin/RoleBuilder.tsx`
- `backend/src/graphql/mutations/createCustomRole.ts`

**Estimated Time**: 5-6 days

---

### Phase 4: OAuth Expansion (Week 5)

#### Add Multiple OAuth Providers

**Current**: GitHub only
**Goal**: GitHub, Google, Discord, Microsoft

**Tasks**:
1. Add Google OAuth
   ```typescript
   // frontend/src/lib/auth.ts
   import GoogleProvider from "next-auth/providers/google";

   export const oauthProviders = [
     { id: "github" as const, name: "GitHub" },
     { id: "google" as const, name: "Google" },
     { id: "discord" as const, name: "Discord" },
     { id: "microsoft" as const, name: "Microsoft" },
   ] as const;

   // Add to providers array:
   GoogleProvider({
     clientId: process.env.GOOGLE_ID!,
     clientSecret: process.env.GOOGLE_SECRET!,
   }),
   ```

2. Update OAuth callback to handle all providers
3. Add provider icons to login form
4. Test each provider

**Files to Update**:
- `frontend/src/lib/auth.ts`
- `frontend/src/components/Auth/login-form.tsx`
- `.env.local` - Add OAuth credentials

**Estimated Time**: 2-3 days

---

### Phase 5: Advanced Features (Weeks 6-8)

#### Week 6: Magic Link Authentication

**Tasks**:
1. Add Email provider
   ```typescript
   import EmailProvider from "next-auth/providers/email";
   ```
2. Setup email sending (Resend/SendGrid)
3. Create email templates
4. Add "Login with Email" button

**Estimated Time**: 3-4 days

---

#### Week 7: Password Reset Flow

**Tasks**:
1. Create forgot password page
2. Generate reset tokens
3. Send reset emails
4. Create reset password page
5. Add password strength meter

**Files to Create**:
- `frontend/src/app/(auth)/forgot-password/page.tsx`
- `frontend/src/app/(auth)/reset-password/page.tsx`
- `backend/src/graphql/mutations/requestPasswordReset.ts`
- `backend/src/graphql/mutations/resetPassword.ts`

**Estimated Time**: 3-4 days

---

#### Week 8: Account Management

**Tasks**:
1. Profile settings page
2. Change password functionality
3. Update email (with verification)
4. Delete account feature
5. Export user data (GDPR compliance)

**Files to Create**:
- `frontend/src/app/(protected)/settings/profile/page.tsx`
- `frontend/src/app/(protected)/settings/security/page.tsx`
- `frontend/src/app/(protected)/settings/data/page.tsx`

**Estimated Time**: 4-5 days

---

### Phase 6: Monitoring & Analytics (Week 9-10)

#### Week 9: Authentication Analytics

**Tasks**:
1. Track login attempts (success/failure)
2. Track OAuth vs Credentials ratio
3. Track geographical login data
4. Create admin dashboard

**Files to Create**:
- `frontend/src/app/(protected)/admin/analytics/auth/page.tsx`
- `backend/src/utils/analytics.ts`

**Estimated Time**: 4-5 days

---

#### Week 10: Security Monitoring

**Tasks**:
1. Suspicious activity detection
2. Failed login alerts
3. New device notifications
4. Security audit log

**Files to Create**:
- `frontend/src/app/(protected)/admin/security/page.tsx`
- `backend/src/utils/security-monitor.ts`

**Estimated Time**: 4-5 days

---

### Phase 7: Testing & Documentation (Week 11-12)

#### Week 11: Testing

**Tasks**:
1. Unit tests for DAL functions
2. Integration tests for auth flow
3. E2E tests with Playwright
4. Load testing with k6

**Files to Create**:
- `frontend/__tests__/lib/dal.test.ts`
- `frontend/__tests__/auth-flow.test.ts`
- `frontend/e2e/auth.spec.ts`

**Estimated Time**: 5-6 days

---

#### Week 12: Documentation

**Tasks**:
1. Update this guide
2. Add inline code comments
3. Create video tutorials
4. Add migration guides

**Estimated Time**: 3-4 days

---

## 🔍 Troubleshooting

### Common Issues

#### Issue 1: "Unauthorized: No active session"

**Cause**: Session expired or not logged in

**Solution**:
```typescript
// Check session status
const { data: session, status } = useSession();

if (status === "loading") {
  return <div>Loading...</div>;
}

if (status === "unauthenticated") {
  redirect("/auth/login");
}
```

---

#### Issue 2: "No backend token available"

**Cause**: Backend JWT not in session

**Solution**:
1. Check login mutation returns token
2. Verify JWT callback stores token
3. Check session callback exposes token

```typescript
// Debug in browser console
console.log(session?.user?.backendToken);
```

---

#### Issue 3: Middleware not running

**Cause**: Route not in matcher config

**Solution**:
```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

---

#### Issue 4: URQL not sending token

**Cause**: Token not in localStorage or headers

**Solution**:
```typescript
// Check token
console.log(localStorage.getItem("token"));

// Update URQL client
const client = createClient({
  fetchOptions: () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  },
});
```

---

#### Issue 5: Authorization blocking queries

**Cause**: Missing authScopes in Pothos field definition

**Solution**:
```typescript
// backend/src/graphql/queries/yourQuery.ts
builder.queryField("yourQuery", (t) =>
  t.field({
    type: "String",
    authScopes: { authenticated: true }, // Add this
    resolve: () => "data",
  })
);
```

---

## 📚 Quick Reference

### DAL Functions

| Function | Purpose | Returns | Throws |
|----------|---------|---------|--------|
| `verifySession()` | Get authenticated session | `SessionData` | Yes |
| `getSession()` | Get session without error | `SessionData \| null` | No |
| `hasRole(roles)` | Check if user has role | `boolean` | No |
| `verifyRole(roles)` | Verify user has role | `void` | Yes |
| `isAdmin()` | Check if admin | `boolean` | No |
| `verifyAdmin()` | Verify admin role | `void` | Yes |
| `isManufacturer()` | Check if manufacturer | `boolean` | No |
| `verifyManufacturer()` | Verify manufacturer | `void` | Yes |
| `isCustomer()` | Check if customer | `boolean` | No |
| `verifyCustomer()` | Verify customer | `void` | Yes |
| `ownsResource(userId)` | Check resource ownership | `boolean` | No |
| `verifyResourceOwnership(userId)` | Verify ownership | `void` | Yes |
| `belongsToCompany(companyId)` | Check company access | `boolean` | No |
| `verifyCompanyAccess(companyId)` | Verify company access | `void` | Yes |
| `getAuthHeader()` | Get Bearer token | `string` | Yes |

### User Roles

| Role | Access Level | Common Use Cases |
|------|--------------|------------------|
| `ADMIN` | Full access | System management, user management |
| `MANUFACTURER` | Production access | Collections, samples, production |
| `CUSTOMER` | Order access | Samples, orders, messages |
| `USER` | Basic access | View collections, basic features |

### Protection Strategies

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| Server Component | Static pages, SEO-important | Secure, no flash, SEO-friendly | No interactivity |
| Client Component | Interactive features | Real-time, dynamic | Client-side flash |
| Middleware | Route groups | Efficient, no client code | Less granular |
| API Routes | Backend calls | Secure, server-side | Extra request |

---

## 🎯 Best Practices

### ✅ DO

1. **Always verify on server-side**
   ```typescript
   // ✅ Good
   await verifyAdmin();
   ```

2. **Use DAL helpers**
   ```typescript
   // ✅ Good
   await verifyRole([UserRole.ADMIN]);

   // ❌ Bad
   const session = await getServerSession();
   if (session?.user?.role !== "ADMIN") throw new Error();
   ```

3. **Protect API routes**
   ```typescript
   // ✅ Good
   export async function GET() {
     await verifyAuthenticated();
     // ... logic
   }
   ```

4. **Use TypeScript types**
   ```typescript
   // ✅ Good
   role: UserRole.ADMIN

   // ❌ Bad
   role: "ADMIN"
   ```

5. **Cache session data**
   ```typescript
   // ✅ Good (already implemented)
   export const verifySession = cache(async () => {
     // React cache() ensures single call per request
   });
   ```

### ❌ DON'T

1. **Don't trust client-side checks alone**
   ```typescript
   // ❌ Bad
   "use client";
   if (session?.user?.role === "ADMIN") {
     // Only client-side check
   }
   ```

2. **Don't expose sensitive data**
   ```typescript
   // ❌ Bad
   return { password: user.password };
   ```

3. **Don't store tokens in localStorage for SSR**
   ```typescript
   // ❌ Bad (SSR won't have access)
   const token = localStorage.getItem("token");

   // ✅ Good (use session)
   const session = await getServerSession();
   const token = session?.user?.backendToken;
   ```

4. **Don't skip error handling**
   ```typescript
   // ❌ Bad
   await verifyAdmin();

   // ✅ Good
   try {
     await verifyAdmin();
   } catch (error) {
     redirect("/dashboard");
   }
   ```

---

## 📞 Support

**Issues**: [GitHub Issues](https://github.com/your-repo/issues)
**Documentation**: This file
**Backend Docs**: `server/README.md`

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintainers**: Development Team
