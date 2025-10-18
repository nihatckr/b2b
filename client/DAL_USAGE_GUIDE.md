# Data Access Layer (DAL) Usage Guide

## Overview

The Data Access Layer provides centralized authorization logic for server components. It uses React's `cache()` function for optimal performance within the request lifecycle.

## Installation

```typescript
import {
  verifySession,
  getSession,
  verifyRole,
  verifyAdmin,
  verifyManufacturer,
  verifyCustomer,
  verifyResourceOwnership,
  verifyCompanyAccess,
  getAuthHeader,
  UserRole,
} from "@/lib/dal";
```

## Basic Usage

### 1. Protected Server Component

```tsx
// app/dashboard/page.tsx
import { verifySession } from "@/lib/dal";

export default async function DashboardPage() {
  // Verify user is authenticated (throws if not)
  const session = await verifySession();

  return (
    <div>
      <h1>Welcome, {session.email}</h1>
      <p>Role: {session.role}</p>
    </div>
  );
}
```

### 2. Role-Based Access Control

```tsx
// app/admin/page.tsx
import { verifyAdmin } from "@/lib/dal";

export default async function AdminPage() {
  // Verify user is admin (throws if not)
  await verifyAdmin();

  return <div>Admin Dashboard</div>;
}
```

### 3. Manufacturer-Only Page

```tsx
// app/production/page.tsx
import { verifyManufacturer } from "@/lib/dal";

export default async function ProductionPage() {
  await verifyManufacturer();

  return <div>Production Management</div>;
}
```

### 4. Customer-Only Page

```tsx
// app/orders/page.tsx
import { verifyCustomer } from "@/lib/dal";

export default async function OrdersPage() {
  await verifyCustomer();

  return <div>My Orders</div>;
}
```

## Advanced Usage

### 5. Resource Ownership

```tsx
// app/profile/[userId]/page.tsx
import { verifySession, verifyResourceOwnership } from "@/lib/dal";

export default async function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await verifySession();

  // Verify user owns this profile (or is admin)
  await verifyResourceOwnership(params.userId);

  return <div>Profile for {session.email}</div>;
}
```

### 6. Company Access Control

```tsx
// app/companies/[companyId]/page.tsx
import { verifySession, verifyCompanyAccess } from "@/lib/dal";

export default async function CompanyPage({
  params,
}: {
  params: { companyId: string };
}) {
  await verifySession();
  await verifyCompanyAccess(params.companyId);

  return <div>Company Dashboard</div>;
}
```

### 7. Conditional Rendering

```tsx
// app/dashboard/page.tsx
import { getSession, isAdmin, isManufacturer } from "@/lib/dal";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return <div>Please log in</div>;
  }

  const adminAccess = await isAdmin();
  const manufacturerAccess = await isManufacturer();

  return (
    <div>
      <h1>Dashboard</h1>
      {adminAccess && <AdminPanel />}
      {manufacturerAccess && <ProductionTools />}
    </div>
  );
}
```

## API Route Protection

### 8. Protected API Route

```tsx
// app/api/users/route.ts
import { verifySession, getAuthHeader } from "@/lib/dal";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verify authentication
    const session = await verifySession();

    // Get backend auth header
    const authHeader = await getAuthHeader();

    // Call backend GraphQL API
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: authHeader,
      },
      body: JSON.stringify({
        query: `query GetUsers { users { id name email } }`,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 }
    );
  }
}
```

### 9. Role-Based API Route

```tsx
// app/api/admin/users/route.ts
import { verifyAdmin } from "@/lib/dal";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    // Verify admin access
    await verifyAdmin();

    const { userId } = await request.json();

    // Delete user logic...

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 403 }
    );
  }
}
```

## Error Handling

### 10. Custom Error Boundaries

```tsx
// app/protected/page.tsx
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  try {
    await verifySession();
  } catch (error) {
    // Redirect to login if not authenticated
    redirect("/auth/login?callbackUrl=/protected");
  }

  return <div>Protected Content</div>;
}
```

### 11. Error Response Helper

```tsx
// lib/api-helpers.ts
import { NextResponse } from "next/server";

export function handleAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "Authentication failed";

  if (message.includes("Unauthorized")) {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (message.includes("Forbidden")) {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  return NextResponse.json({ error: message }, { status: 500 });
}
```

## Performance Optimization

The DAL uses React's `cache()` function, which means:

- ✅ **Session data is cached** per request
- ✅ **Multiple calls** to `verifySession()` in same request = **1 database query**
- ✅ **Automatic cleanup** after request completes
- ✅ **Type-safe** with TypeScript

## Best Practices

1. **Always use DAL in server components** instead of directly calling `getServerSession()`
2. **Use `verifySession()`** when authentication is required (throws on failure)
3. **Use `getSession()`** when authentication is optional (returns null on failure)
4. **Use role-specific helpers** (`verifyAdmin`, `verifyManufacturer`) for cleaner code
5. **Handle errors gracefully** with try/catch or error boundaries
6. **Use resource ownership checks** for user-specific data
7. **Use company access checks** for multi-tenant resources

## Migration from Direct getServerSession

### Before:
```tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }
  // Use session...
}
```

### After:
```tsx
import { verifySession } from "@/lib/dal";

export default async function Page() {
  const session = await verifySession(); // Throws if not authenticated
  // Use session...
}
```

## Available Functions

| Function | Description | Returns | Throws |
|----------|-------------|---------|--------|
| `verifySession()` | Get authenticated session | `SessionData` | Yes |
| `getSession()` | Get session without throwing | `SessionData \| null` | No |
| `hasRole(roles[])` | Check if user has role | `boolean` | No |
| `verifyRole(roles[])` | Verify user has role | `void` | Yes |
| `isAdmin()` | Check admin status | `boolean` | No |
| `verifyAdmin()` | Verify admin access | `void` | Yes |
| `isManufacturer()` | Check manufacturer status | `boolean` | No |
| `verifyManufacturer()` | Verify manufacturer access | `void` | Yes |
| `isCustomer()` | Check customer status | `boolean` | No |
| `verifyCustomer()` | Verify customer access | `void` | Yes |
| `ownsResource(userId)` | Check resource ownership | `boolean` | No |
| `verifyResourceOwnership(userId)` | Verify resource ownership | `void` | Yes |
| `belongsToCompany(companyId)` | Check company membership | `boolean` | No |
| `verifyCompanyAccess(companyId)` | Verify company access | `void` | Yes |
| `getAuthHeader()` | Get backend auth header | `string` | Yes |

## TypeScript Types

```typescript
enum UserRole {
  ADMIN = "ADMIN",
  MANUFACTURER = "MANUFACTURER",
  CUSTOMER = "CUSTOMER",
  USER = "USER",
}

interface SessionData {
  isAuth: boolean;
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string;
  backendToken?: string;
}
```

---

**Created**: January 2025
**Last Updated**: January 2025
**Status**: Production-Ready
