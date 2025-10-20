# 📁 Project Structure Guide

Detailed folder structure and conventions for ProtexFlow.

**Last Updated:** October 20, 2025

---

## 📋 Overview

ProtexFlow follows a monorepo-style structure with separate frontend and backend directories:

```
fullstack/
├── frontend/          # Next.js frontend application
├── server/            # Express + GraphQL backend
├── docs/              # Documentation
└── README.md          # Main documentation
```

---

## 🎨 Frontend Structure

### Complete Tree

```
frontend/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                  # Auth routes (no dashboard layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # /login
│   │   │   └── signup/
│   │   │       └── page.tsx         # /signup
│   │   │
│   │   ├── (protected)/             # Protected routes (with layout)
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx       # Dashboard layout
│   │   │       ├── page.tsx         # /dashboard
│   │   │       ├── admin/
│   │   │       │   ├── users/
│   │   │       │   │   └── page.tsx # /dashboard/admin/users
│   │   │       │   ├── companies/
│   │   │       │   └── settings/
│   │   │       ├── collections/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── [id]/
│   │   │       │   └── new/
│   │   │       ├── samples/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       ├── orders/
│   │   │       ├── production/
│   │   │       ├── quality/
│   │   │       ├── messages/
│   │   │       ├── notifications/
│   │   │       └── settings/
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page (/)
│   │   ├── providers.tsx            # Context providers
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                  # React components
│   │   ├── ui/                     # Shadcn UI base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...                 # 50+ UI components
│   │   │
│   │   ├── auth/                   # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   │
│   │   ├── dashboard/              # Dashboard-specific components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Stats.tsx
│   │   │   └── ...
│   │   │
│   │   ├── collections/            # Collection feature components
│   │   │   ├── CollectionCard.tsx
│   │   │   ├── CollectionForm.tsx
│   │   │   └── CollectionList.tsx
│   │   │
│   │   ├── samples/                # Sample feature components
│   │   ├── orders/                 # Order feature components
│   │   ├── production/             # Production feature components
│   │   └── ...
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useRelayIds.ts         # Global ID management
│   │   ├── useOptimisticMutation.ts # Mutation patterns
│   │   ├── usePermissions.ts      # RBAC permissions
│   │   ├── useDebounce.ts         # Input debouncing
│   │   └── README.md              # Hooks documentation
│   │
│   ├── lib/                        # Utilities & configuration
│   │   ├── urql-client.ts         # URQL GraphQL client config
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── permissions.ts         # Permission utilities
│   │   ├── user-utils.tsx         # User domain helpers
│   │   ├── utils.ts               # General utilities (cn, etc.)
│   │   └── USER_UTILITIES_README.md # Utilities documentation
│   │
│   ├── graphql/                    # GraphQL operations (.graphql files)
│   │   ├── auth.graphql           # Login, signup mutations
│   │   ├── users.graphql          # User queries & mutations
│   │   ├── companies.graphql      # Company operations
│   │   ├── collections.graphql    # Collection operations
│   │   ├── samples.graphql        # Sample operations
│   │   ├── orders.graphql         # Order operations
│   │   ├── production.graphql     # Production tracking
│   │   ├── tasks.graphql          # Task management
│   │   └── notifications.graphql  # Notifications
│   │
│   ├── __generated__/              # GraphQL Codegen output (auto)
│   │   └── graphql.ts             # Generated TypeScript types
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── next-auth.d.ts         # NextAuth type extensions
│   │   └── global.d.ts            # Global types
│   │
│   └── middleware.ts               # Next.js middleware (auth)
│
├── public/                          # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── codegen.ts                       # GraphQL Codegen configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── components.json                  # Shadcn UI configuration
├── postcss.config.mjs               # PostCSS configuration
├── eslint.config.mjs                # ESLint configuration
├── package.json                     # Dependencies & scripts
└── README.md                        # Frontend documentation
```

### Key Directories

#### `/src/app/`

Next.js 15 App Router. File-based routing.

**Conventions:**

- `page.tsx` → Route page
- `layout.tsx` → Layout wrapper
- `loading.tsx` → Loading UI
- `error.tsx` → Error boundary
- `(folder)` → Route group (doesn't affect URL)
- `[id]` → Dynamic segment

#### `/src/components/`

React components organized by feature.

**Naming:**

- PascalCase for component files: `UserCard.tsx`
- Export default component
- Co-locate styles if needed

**Example:**

```typescript
// UserCard.tsx
export default function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

#### `/src/hooks/`

Custom React hooks.

**Naming:**

- Start with `use`: `useRelayIds.ts`
- Export named function
- Document in README.md

**Example:**

```typescript
// useRelayIds.ts
export function useRelayIds() {
  const decodeGlobalId = (id: string) => {
    // ...
  };
  return { decodeGlobalId };
}
```

#### `/src/lib/`

Utilities, configurations, helpers.

**Naming:**

- Kebab-case: `urql-client.ts`, `user-utils.tsx`
- Export named functions/constants

#### `/src/graphql/`

GraphQL operations in `.graphql` files.

**Naming:**

- Kebab-case: `users.graphql`, `create-user.graphql`
- Group by feature

**Example:**

```graphql
# users.graphql
query Users {
  users {
    id
    name
  }
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
  }
}
```

---

## ⚙️ Backend Structure

### Complete Tree

```
server/
├── prisma/
│   ├── schema.prisma               # Database schema (Prisma)
│   ├── seed.ts                     # Seed data script
│   └── migrations/                 # Migration history
│       ├── 20250101120000_init/
│       └── 20250115140000_add_users/
│
├── src/
│   ├── graphql/
│   │   ├── schema.ts              # Pothos schema builder
│   │   │
│   │   ├── types/                 # GraphQL type definitions
│   │   │   ├── User.ts            # User type
│   │   │   ├── Company.ts         # Company type
│   │   │   ├── Sample.ts          # Sample type
│   │   │   ├── Order.ts           # Order type
│   │   │   ├── Task.ts            # Task type
│   │   │   ├── Notification.ts    # Notification type
│   │   │   └── ...               # 20+ types
│   │   │
│   │   ├── queries/               # Query resolvers
│   │   │   ├── index.ts          # Export all queries
│   │   │   ├── user.ts           # User queries
│   │   │   ├── company.ts        # Company queries
│   │   │   ├── sample.ts         # Sample queries
│   │   │   ├── order.ts          # Order queries
│   │   │   └── ...
│   │   │
│   │   ├── mutations/             # Mutation resolvers
│   │   │   ├── index.ts          # Export all mutations
│   │   │   ├── auth.ts           # Login, signup, refresh token
│   │   │   ├── user.ts           # User CRUD
│   │   │   ├── company.ts        # Company CRUD
│   │   │   ├── sample.ts         # Sample management
│   │   │   ├── order.ts          # Order management
│   │   │   ├── production.ts     # Production tracking
│   │   │   └── ...
│   │   │
│   │   └── subscriptions/         # Real-time subscriptions
│   │       ├── notification.ts    # Notification subscription
│   │       └── task.ts           # Task updates
│   │
│   ├── utils/                     # Utility functions
│   │   ├── auth.ts               # JWT utilities
│   │   ├── permissions.ts        # Permission helpers
│   │   ├── dynamicTaskHelper.ts  # Task automation (700+ lines)
│   │   ├── validation.ts         # Input validation
│   │   └── email.ts              # Email utilities
│   │
│   ├── context.ts                 # GraphQL context (user, prisma)
│   ├── prisma.ts                  # Prisma client instance
│   ├── pubsub.ts                  # PubSub for subscriptions
│   └── server.ts                  # Express + GraphQL Yoga server
│
├── uploads/                        # File uploads storage
│   ├── images/
│   ├── documents/
│   └── temp/
│
├── .env                            # Environment variables
├── .env.example                    # Env template
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # Backend documentation
```

### Key Directories

#### `/prisma/`

Database schema and migrations.

**Files:**

- `schema.prisma` - Database models, relations, enums
- `seed.ts` - Seed data for development
- `migrations/` - Migration history (auto-generated)

#### `/src/graphql/types/`

Pothos GraphQL type definitions.

**Naming:**

- PascalCase: `User.ts`, `Company.ts`
- One type per file
- Export with `builder.prismaObject()`

**Example:**

```typescript
// User.ts
import { builder } from "../schema";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name"),
    company: t.relation("company"),
  }),
});
```

#### `/src/graphql/queries/`

GraphQL query resolvers.

**Naming:**

- Kebab-case: `user.ts`, `get-users.ts`
- Group by entity

**Example:**

```typescript
// user.ts
import { builder } from "../schema";

builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    resolve: async (query, root, args, ctx) => {
      return ctx.prisma.user.findMany({ ...query });
    },
  })
);
```

#### `/src/graphql/mutations/`

GraphQL mutation resolvers.

**Naming:**

- Kebab-case: `user.ts`, `create-user.ts`
- CRUD operations per entity

**Example:**

```typescript
// user.ts
builder.mutationField("createUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      email: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      return ctx.prisma.user.create({
        ...query,
        data: args,
      });
    },
  })
);
```

#### `/src/utils/`

Helper functions and utilities.

**Naming:**

- Kebab-case: `auth.ts`, `dynamic-task-helper.ts`
- Export named functions

---

## 📚 Documentation Structure

```
docs/
├── README.md                      # Documentation index
├── ARCHITECTURE.md                # System architecture
├── DATABASE.md                    # Database schema & ERD
├── AUTHENTICATION.md              # Auth & security
├── RBAC.md                       # Permissions
│
├── FEATURES/                      # Feature-specific docs
│   ├── NOTIFICATIONS.md
│   ├── ONBOARDING.md
│   ├── REVISIONS.md
│   └── ...
│
└── GUIDES/                        # Development guides
    ├── NEW_FEATURES.md           # Add new features
    ├── GETTING_STARTED.md        # Setup guide
    ├── BEST_PRACTICES.md         # Code standards
    ├── TESTING.md                # Testing guide
    └── DEPLOYMENT.md             # Production deployment
```

---

## 🎯 File Naming Conventions

### Frontend

| Type       | Convention                  | Example                  |
| ---------- | --------------------------- | ------------------------ |
| Pages      | `page.tsx`                  | `app/dashboard/page.tsx` |
| Components | PascalCase                  | `UserCard.tsx`           |
| Hooks      | camelCase with `use` prefix | `useRelayIds.ts`         |
| Utilities  | kebab-case                  | `urql-client.ts`         |
| GraphQL    | kebab-case                  | `users.graphql`          |
| Types      | PascalCase                  | `User.ts`                |

### Backend

| Type          | Convention             | Example              |
| ------------- | ---------------------- | -------------------- |
| Models        | PascalCase (Prisma)    | `User`, `Company`    |
| GraphQL Types | PascalCase             | `User.ts`            |
| Resolvers     | kebab-case             | `user.ts`            |
| Utilities     | kebab-case             | `auth.ts`            |
| Migrations    | timestamp + snake_case | `20250101_add_users` |

---

## 🔧 Import Path Aliases

### Frontend

```typescript
// @ alias points to src/
import { Button } from "@/components/ui/button";
import { useRelayIds } from "@/hooks/useRelayIds";
import { urqlClient } from "@/lib/urql-client";
import { UsersDocument } from "@/__generated__/graphql";
```

**Config** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Backend

```typescript
// Relative imports
import { prisma } from "../prisma";
import { builder } from "../schema";
import { requireAuth } from "../utils/permissions";
```

---

## 📁 Where to Add New Features

### Frontend

1. **GraphQL Operations** → `src/graphql/feature-name.graphql`
2. **Run Codegen** → `npm run codegen`
3. **Components** → `src/components/feature-name/`
4. **Page** → `src/app/(protected)/feature-name/page.tsx`
5. **Hooks** (if needed) → `src/hooks/useFeatureName.ts`
6. **Utilities** (if needed) → `src/lib/feature-utils.ts`

### Backend

1. **Database Model** → `prisma/schema.prisma`
2. **Migration** → `npx prisma migrate dev`
3. **GraphQL Type** → `src/graphql/types/FeatureName.ts`
4. **Queries** → `src/graphql/queries/featureName.ts`
5. **Mutations** → `src/graphql/mutations/featureName.ts`
6. **Utilities** (if needed) → `src/utils/featureHelper.ts`

---

## 🎨 Component Organization

### By Feature

```
components/
├── users/
│   ├── UserCard.tsx
│   ├── UserList.tsx
│   ├── UserForm.tsx
│   └── UserModal.tsx
│
├── samples/
│   ├── SampleCard.tsx
│   ├── SampleList.tsx
│   └── SampleForm.tsx
│
└── ui/                    # Shared UI components
    ├── button.tsx
    ├── dialog.tsx
    └── ...
```

### Component Structure

```typescript
// UserCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/__generated__/graphql";

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card>
      <h3>{user.name}</h3>
      <Badge>{user.role}</Badge>
      {onEdit && <Button onClick={() => onEdit(user)}>Edit</Button>}
      {onDelete && <Button onClick={() => onDelete(user.id)}>Delete</Button>}
    </Card>
  );
}
```

---

## 📝 Code Organization Best Practices

### 1. Keep Files Small

- Max 300 lines per file
- Split large components into smaller ones
- Extract utilities and helpers

### 2. Single Responsibility

- One component = one purpose
- One function = one task
- One file = one export (preferably)

### 3. Co-locate Related Code

```
features/
└── users/
    ├── components/
    ├── hooks/
    ├── utils/
    └── types/
```

### 4. Use Barrel Exports

```typescript
// components/users/index.ts
export { default as UserCard } from "./UserCard";
export { default as UserList } from "./UserList";
export { default as UserForm } from "./UserForm";

// Usage
import { UserCard, UserList } from "@/components/users";
```

---

## 🚀 Next Steps

- Read **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** for workflow
- Check **[BACKEND_DEVELOPMENT.md](./BACKEND_DEVELOPMENT.md)** for backend guide
- Review **[FRONTEND_DEVELOPMENT.md](./FRONTEND_DEVELOPMENT.md)** for frontend guide

---

**Happy Organizing! 📁**
