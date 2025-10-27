# ⚛️ Frontend Development Guide

Complete guide for frontend development with Next.js 15, URQL, and GraphQL Codegen.

**Last Updated:** January 27, 2025

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Component Architecture (🆕 January 2025)](#component-architecture-january-2025)
- [Next.js App Router](#nextjs-app-router)
- [URQL GraphQL Client](#urql-graphql-client)
- [GraphQL Codegen](#graphql-codegen)
- [Authentication](#authentication)
- [Reusable Hooks](#reusable-hooks)
- [Forms](#forms)
- [Best Practices](#best-practices)

---

## Overview

ProtexFlow frontend is built with:

- **Next.js 15**: React framework with App Router
- **URQL**: Lightweight GraphQL client
- **GraphQL Codegen**: Type-safe GraphQL operations
- **NextAuth.js**: Authentication solution
- **Shadcn UI**: Component library
- **TailwindCSS**: Utility-first CSS
- **🆕 Component Library**: 15+ reusable components with TypeScript support

### Architecture

```
┌────────────────┐
│    Browser     │
└────────┬───────┘
         │
┌────────▼───────┐
│   Next.js App  │
│   (App Router) │
└────────┬───────┘
         │
┌────────▼───────┐
│  URQL Client   │ ◄── Generated Types
└────────┬───────┘
         │
┌────────▼───────┐
│  GraphQL API   │
└────────────────┘
```

---

## Tech Stack

| Category            | Technology           | Version |
| ------------------- | -------------------- | ------- |
| **Framework**       | Next.js              | 15.5.4  |
| **Language**        | TypeScript           | 5.7.3   |
| **UI Library**      | React                | 19.1.0  |
| **GraphQL Client**  | URQL                 | 4.1.0   |
| **Code Generation** | GraphQL Codegen      | 5.0.0   |
| **Styling**         | Tailwind CSS         | 3.4.18  |
| **Components**      | Radix UI + Shadcn UI | Latest  |
| **Forms**           | React Hook Form      | Latest  |
| **Validation**      | Zod                  | Latest  |
| **Auth**            | NextAuth.js          | 4.24.11 |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Auth pages (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (protected)/             # Protected routes
│   │   │   └── dashboard/
│   │   │       ├── page.tsx         # Dashboard home
│   │   │       ├── admin/
│   │   │       │   └── users/
│   │   │       │       └── page.tsx # User management
│   │   │       ├── collections/
│   │   │       ├── samples/
│   │   │       ├── orders/
│   │   │       └── settings/
│   │   ├── layout.tsx               # Root layout
│   │   └── providers.tsx            # Context providers
│   │
│   ├── components/                  # React components
│   │   ├── ui/                     # Shadcn UI base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── auth/                   # Auth components
│   │   ├── dashboard/              # Dashboard components
│   │   └── ...
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useRelayIds.ts         # Global ID utilities
│   │   ├── useOptimisticMutation.ts # Mutation patterns
│   │   └── README.md              # Hook documentation
│   │
│   ├── lib/                        # Utilities & config
│   │   ├── urql-client.ts         # URQL configuration
│   │   ├── auth.ts                # NextAuth config
│   │   ├── user-utils.tsx         # User domain helpers
│   │   └── utils.ts               # General utilities
│   │
│   ├── graphql/                    # GraphQL operations
│   │   ├── auth.graphql
│   │   ├── users.graphql
│   │   ├── companies.graphql
│   │   └── ...
│   │
│   ├── __generated__/              # Generated types (auto)
│   │   └── graphql.ts             # GraphQL Codegen output
│   │
│   └── middleware.ts               # Route protection
│
├── public/                          # Static assets
├── codegen.ts                       # GraphQL Codegen config
├── next.config.ts                   # Next.js config
├── tailwind.config.ts               # Tailwind config
├── components.json                  # Shadcn UI config
└── package.json
```

---

## Next.js App Router

### File-based Routing

```
app/
├── (auth)/
│   ├── login/page.tsx          → /login
│   └── signup/page.tsx         → /signup
│
├── (protected)/
│   └── dashboard/
│       ├── page.tsx            → /dashboard
│       ├── users/page.tsx      → /dashboard/users
│       └── settings/page.tsx   → /dashboard/settings
│
├── layout.tsx                   → Root layout
└── page.tsx                     → Home page (/)
```

### Creating a Page

**File**: `src/app/(protected)/dashboard/users/page.tsx`

```typescript
"use client";

import { useQuery } from "urql";
import { UsersDocument } from "@/__generated__/graphql";

export default function UsersPage() {
  const [{ data, fetching, error }] = useQuery({
    query: UsersDocument,
  });

  if (fetching) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      {data?.users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Layouts

**File**: `src/app/(protected)/layout.tsx`

```typescript
import { DashboardNav } from "@/components/dashboard/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardNav />
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
}
```

### Route Groups

- `(auth)` - Pages without dashboard layout
- `(protected)` - Pages with dashboard layout and auth check

---

## URQL GraphQL Client

### Client Setup

**File**: `src/lib/urql-client.ts`

```typescript
import {
  cacheExchange,
  createClient,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { createClient as createWSClient } from "graphql-ws";

const wsClient = createWSClient({
  url: process.env.NEXT_PUBLIC_WS_ENDPOINT!,
});

export const urqlClient = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (operation) => ({
        subscribe: (sink) => ({
          unsubscribe: wsClient.subscribe(operation, sink),
        }),
      }),
    }),
  ],
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

### Provider Setup

**File**: `src/app/providers.tsx`

```typescript
"use client";

import { Provider as URQLProvider } from "urql";
import { urqlClient } from "@/lib/urql-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <URQLProvider value={urqlClient}>{children}</URQLProvider>;
}
```

**File**: `src/app/layout.tsx`

```typescript
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Using URQL Hooks

#### Query

```typescript
import { useQuery } from "urql";
import { UsersDocument } from "@/__generated__/graphql";

function UsersList() {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: UsersDocument,
    variables: { skip: 0, take: 20 },
  });

  if (fetching) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      <Button onClick={() => refetch({ requestPolicy: "network-only" })}>
        Refresh
      </Button>
    </div>
  );
}
```

#### Mutation

```typescript
import { useMutation } from "urql";
import { CreateUserDocument } from "@/__generated__/graphql";

function CreateUserForm() {
  const [result, createUser] = useMutation(CreateUserDocument);

  const handleSubmit = async (formData: FormData) => {
    const result = await createUser({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role,
    });

    if (result.error) {
      toast.error("Failed to create user");
      return;
    }

    toast.success("User created successfully");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={result.fetching}>
        {result.fetching ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
```

#### Subscription

```typescript
import { useSubscription } from "urql";
import { NotificationAddedDocument } from "@/__generated__/graphql";

function NotificationBell() {
  const [{ data }] = useSubscription({
    query: NotificationAddedDocument,
  });

  useEffect(() => {
    if (data?.notificationAdded) {
      toast.info(data.notificationAdded.message);
    }
  }, [data]);

  return <BellIcon />;
}
```

---

## GraphQL Codegen

### Configuration

**File**: `codegen.ts`

```typescript
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/__generated__/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-urql"],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
```

### Writing Operations

**File**: `src/graphql/users.graphql`

```graphql
# Query - Get all users
query Users($skip: Int, $take: Int, $search: String) {
  users(skip: $skip, take: $take, search: $search) {
    id
    email
    name
    role
    department
    isActive
    createdAt
    company {
      id
      name
      type
    }
  }
}

# Query - Get single user
query User($id: Int!) {
  user(id: $id) {
    id
    email
    name
    role
    department
    jobTitle
    phone
    isActive
    createdAt
    updatedAt
    company {
      id
      name
    }
  }
}

# Mutation - Create user
mutation CreateUser(
  $email: String!
  $password: String!
  $name: String!
  $role: String!
  $companyId: Int
) {
  createUser(
    email: $email
    password: $password
    name: $name
    role: $role
    companyId: $companyId
  ) {
    id
    email
    name
    role
  }
}

# Mutation - Update user
mutation UpdateUser(
  $id: Int!
  $name: String
  $email: String
  $department: String
) {
  updateUser(id: $id, name: $name, email: $email, department: $department) {
    id
    name
    email
  }
}

# Mutation - Delete user
mutation DeleteUser($id: Int!) {
  deleteUser(id: $id)
}
```

### Running Codegen

```bash
# Generate types
npm run codegen

# Watch mode (auto-regenerate on file changes)
npm run codegen -- --watch
```

### Generated Output

**File**: `src/__generated__/graphql.ts` (auto-generated)

```typescript
// Generated types
export type User = {
  __typename?: "User";
  id: Scalars["ID"];
  email: Scalars["String"];
  name: Scalars["String"];
  role: Scalars["String"];
  // ...
};

// Generated query hook
export function useUsersQuery(
  options?: Omit<Urql.UseQueryArgs<UsersQueryVariables>, "query">
) {
  return Urql.useQuery<UsersQuery, UsersQueryVariables>({
    query: UsersDocument,
    ...options,
  });
}

// Generated mutation hook
export function useCreateUserMutation() {
  return Urql.useMutation<CreateUserMutation, CreateUserMutationVariables>(
    CreateUserDocument
  );
}
```

### Using Generated Hooks

```typescript
import { useUsersQuery, useCreateUserMutation } from "@/__generated__/graphql";

function UsersPage() {
  // Use generated query hook
  const [{ data, fetching }] = useUsersQuery({
    variables: { skip: 0, take: 20 },
  });

  // Use generated mutation hook
  const [, createUser] = useCreateUserMutation();

  return <div>{/* ... */}</div>;
}
```

---

## Authentication

### NextAuth Setup

**File**: `src/lib/auth.ts`

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
              mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                  token
                  user {
                    id
                    email
                    name
                    role
                  }
                }
              }
            `,
              variables: {
                email: credentials?.email,
                password: credentials?.password,
              },
            }),
          }
        );

        const data = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        const { token, user } = data.data.login;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accessToken: token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
```

### Middleware (Route Protection)

**File**: `src/middleware.ts`

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;

      // Public routes
      if (path.startsWith("/login") || path.startsWith("/signup")) {
        return true;
      }

      // Protected routes require token
      if (path.startsWith("/dashboard")) {
        return !!token;
      }

      // Admin routes
      if (path.startsWith("/dashboard/admin")) {
        return token?.role === "ADMIN";
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
```

### Login Page

**File**: `src/app/(auth)/login/page.tsx`

```typescript
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid credentials");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Reusable Hooks

### useRelayIds - Global ID Management

**File**: `src/hooks/useRelayIds.ts`

```typescript
export function useRelayIds() {
  const decodeGlobalId = (globalId: string): number | null => {
    try {
      const decoded = atob(globalId);
      const parts = decoded.split(":");
      return parseInt(parts[1], 10);
    } catch {
      return null;
    }
  };

  const encodeGlobalId = (typeName: string, numericId: number): string => {
    return btoa(`${typeName}:${numericId}`);
  };

  const findGlobalIdByNumericId = <T extends { id: string }>(
    items: T[],
    numericId: number | null
  ): string | undefined => {
    if (!numericId) return undefined;
    return items.find((item) => decodeGlobalId(item.id) === numericId)?.id;
  };

  return {
    decodeGlobalId,
    encodeGlobalId,
    findGlobalIdByNumericId,
  };
}
```

**Usage**:

```typescript
import { useRelayIds } from "@/hooks/useRelayIds";

function UserCard({ user }) {
  const { decodeGlobalId } = useRelayIds();

  const handleDelete = async () => {
    const numericId = decodeGlobalId(user.id);
    await deleteUser({ id: numericId });
  };

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

### useOptimisticMutation - Mutation Patterns

**File**: `src/hooks/useOptimisticMutation.ts`

```typescript
import { useMemo } from "urql";

export function useOptimisticMutation({
  mutation,
  successMessage,
  errorMessage,
  refetchQueries = [],
  onSuccess,
  onError,
}) {
  const [result, executeMutation] = mutation;

  const execute = async (variables: any) => {
    const result = await executeMutation(variables);

    if (result.error) {
      const message =
        typeof errorMessage === "function"
          ? errorMessage(result.error)
          : errorMessage;
      toast.error(message);
      await onError?.(result.error);
      return result;
    }

    toast.success(successMessage);

    // Refetch queries in parallel
    if (refetchQueries.length > 0) {
      await Promise.all(
        refetchQueries.map(({ refetch, requestPolicy }) =>
          refetch({ requestPolicy: requestPolicy || "network-only" })
        )
      );
    }

    await onSuccess?.(result.data);
    return result;
  };

  return {
    execute,
    loading: result.fetching,
    error: result.error,
    data: result.data,
  };
}
```

**Usage**:

```typescript
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";

function UserManagement() {
  const [{ data: usersData }, refetchUsers] = useQuery({
    query: UsersDocument,
  });
  const deleteUserMutation = useMutation(DeleteUserDocument);

  const { execute: deleteUser, loading } = useOptimisticMutation({
    mutation: deleteUserMutation,
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user",
    refetchQueries: [{ refetch: refetchUsers, requestPolicy: "network-only" }],
  });

  return (
    <Button onClick={() => deleteUser({ id: userId })} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}
```

---

## Forms

### React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "COMPANY_OWNER", "COMPANY_EMPLOYEE"]),
});

type UserFormData = z.infer<typeof userSchema>;

function UserForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "COMPANY_EMPLOYEE",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    const result = await createUser(data);
    if (result.error) {
      form.setError("root", { message: result.error.message });
      return;
    }
    toast.success("User created");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && (
        <p className="text-red-500">{form.formState.errors.email.message}</p>
      )}

      <input {...form.register("name")} />
      {form.formState.errors.name && (
        <p className="text-red-500">{form.formState.errors.name.message}</p>
      )}

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

---

## Best Practices

### 1. Always Use GraphQL Codegen Types

```typescript
// ✅ Good - Type-safe
import { User, useUsersQuery } from "@/__generated__/graphql";

const [{ data }] = useUsersQuery();
const users: User[] = data?.users || [];

// ❌ Bad - Manual types
interface User {
  id: string;
  name: string;
}
```

### 2. Handle Loading & Error States

```typescript
// ✅ Good
function UsersList() {
  const [{ data, fetching, error }] = useUsersQuery();

  if (fetching) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data) return null;

  return <div>{/* Render data */}</div>;
}

// ❌ Bad
function UsersList() {
  const [{ data }] = useUsersQuery();
  return <div>{data.users.map(...)}</div>; // Can crash if data is null
}
```

### 3. Refetch After Mutations

```typescript
// ✅ Good - Await refetch
await Promise.all([
  refetchUsers({ requestPolicy: "network-only" }),
  refetchStats({ requestPolicy: "network-only" }),
]);
setModalOpen(false);

// ❌ Bad - Fire and forget
refetchUsers({ requestPolicy: "network-only" });
setModalOpen(false); // Modal closes before data updates
```

### 4. Use Reusable Hooks

```typescript
// ✅ Good - Reusable pattern
const { decodeGlobalId } = useRelayIds();
const { execute: deleteUser } = useOptimisticMutation({
  mutation: deleteUserMutation,
  successMessage: "Deleted",
  refetchQueries: [{ refetch: refetchUsers }],
});

// ❌ Bad - Repeated code
const [, deleteUser] = useMutation(DeleteUserDocument);
const handleDelete = async (id: string) => {
  const numericId = atob(id).split(":")[1];
  const result = await deleteUser({ id: parseInt(numericId) });
  if (result.error) {
    toast.error("Failed");
    return;
  }
  toast.success("Deleted");
  refetchUsers({ requestPolicy: "network-only" });
};
```

### 5. Validate Forms

```typescript
// ✅ Good - Schema validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ❌ Bad - No validation
const handleSubmit = (email, password) => {
  createUser({ email, password }); // Can fail with invalid data
};
```

---

## Testing Frontend

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

---

## Next Steps

- Read **[BACKEND_DEVELOPMENT.md](./BACKEND_DEVELOPMENT.md)** for backend guide
- Check **[frontend/URQL_USAGE_GUIDE.md](./frontend/URQL_USAGE_GUIDE.md)** for URQL details
- Review **[frontend/src/hooks/README.md](./frontend/src/hooks/README.md)** for hooks documentation

---

**Happy Frontend Development! ⚛️**
