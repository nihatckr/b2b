# 🚀 Development Guide

Complete development workflow for ProtexFlow B2B Textile Management System.

**Last Updated:** October 20, 2025 | **Version:** 3.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Development Environment](#development-environment)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Best Practices](#best-practices)

---

## Overview

ProtexFlow uses a modern full-stack architecture:

- **Backend**: Node.js + Express + GraphQL Yoga + Pothos + Prisma + MySQL
- **Frontend**: Next.js 15 + React 19 + TypeScript + URQL + GraphQL Codegen
- **Real-Time**: WebSocket subscriptions via GraphQL

### Development Philosophy

1. **Type-Safe**: End-to-end TypeScript with GraphQL Codegen
2. **Code-First**: Pothos GraphQL schema builder
3. **Reusable**: Custom hooks and utilities
4. **DRY**: Don't Repeat Yourself principle
5. **Convention Over Configuration**: Consistent patterns

---

## Development Environment

### Required Tools

```bash
# Core Requirements
Node.js 18+
MySQL 8.0+
npm or yarn

# Recommended Tools
VS Code with extensions:
  - Prisma
  - GraphQL: Language Feature Support
  - ESLint
  - Prettier
  - TypeScript Error Translator

# Optional
Prisma Studio (built-in: npx prisma studio)
GraphQL Playground (built-in at /graphql)
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/nihatckr/fullstack.git
cd fullstack

# Backend setup
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run codegen
npm run dev
```

### Environment Variables

**Backend** (`server/.env`):

```env
DATABASE_URL="mysql://username:password@localhost:3306/protexflow"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
NEXT_PUBLIC_WS_ENDPOINT="ws://localhost:4000/graphql"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-characters"
```

---

## Project Architecture

### High-Level Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│   Browser   │ ◄─────► │ Next.js App  │ ◄─────► │ GraphQL  │
│  (Client)   │  HTTP   │  (Frontend)  │  HTTP   │  Server  │
└─────────────┘         └──────────────┘         └────┬─────┘
                               │                       │
                               │                  ┌────▼─────┐
                               │                  │  Prisma  │
                               └─────WebSocket────►    ORM   │
                                                  └────┬─────┘
                                                       │
                                                  ┌────▼─────┐
                                                  │  MySQL   │
                                                  │ Database │
                                                  └──────────┘
```

### Technology Stack Layers

1. **Database Layer**: MySQL + Prisma ORM
2. **API Layer**: GraphQL Yoga + Pothos Schema Builder
3. **Business Logic**: Resolvers + Services
4. **Client Layer**: URQL + GraphQL Codegen
5. **UI Layer**: Next.js + React + Shadcn UI

---

## Development Workflow

### Complete Feature Development Process

```mermaid
graph TD
    A[1. Design Feature] --> B[2. Update Prisma Schema]
    B --> C[3. Create Migration]
    C --> D[4. Define GraphQL Types]
    D --> E[5. Write Resolvers]
    E --> F[6. Test in Playground]
    F --> G[7. Write Frontend Operations]
    G --> H[8. Run Codegen]
    H --> I[9. Build UI Components]
    I --> J[10. Test E2E]
    J --> K[11. Document]
```

### Step-by-Step Workflow

#### 1. Design Feature

- Define requirements
- Design database schema
- Plan API structure
- Design UI/UX

#### 2. Backend Development

```bash
cd server

# 1. Update Prisma schema
# Edit prisma/schema.prisma

# 2. Generate Prisma client
npx prisma generate

# 3. Create migration
npx prisma migrate dev --name add_feature_name

# 4. Define GraphQL types (Pothos)
# Create/edit src/graphql/types/FeatureName.ts

# 5. Write resolvers
# Create/edit src/graphql/queries/featureName.ts
# Create/edit src/graphql/mutations/featureName.ts

# 6. Test in GraphQL Playground
# Open http://localhost:4000/graphql
```

#### 3. Frontend Development

```bash
cd frontend

# 1. Write GraphQL operations
# Create src/graphql/featureName.graphql

# 2. Generate TypeScript types
npm run codegen

# 3. Build components
# Create src/components/FeatureName/

# 4. Add pages
# Create src/app/(protected)/feature-name/page.tsx

# 5. Test in browser
npm run dev
```

#### 4. After Schema Changes

```bash
# Backend
cd server
npx prisma generate
npx prisma migrate dev --name migration_name
npm run dev

# Frontend
cd frontend
npm run codegen
npm run dev
```

---

## Backend Development

### Prisma Schema

**Location**: `server/prisma/schema.prisma`

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  role      Role     @default(COMPANY_EMPLOYEE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  company   Company? @relation(fields: [companyId], references: [id])
  companyId Int?

  @@index([email])
  @@index([companyId])
}
```

### GraphQL Types with Pothos

**Location**: `server/src/graphql/types/User.ts`

```typescript
import { builder } from "../schema";

// Define User type
builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name"),
    role: t.exposeString("role"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    company: t.relation("company"),
  }),
});
```

### Queries

**Location**: `server/src/graphql/queries/user.ts`

```typescript
import { builder } from "../schema";
import { prisma } from "../../prisma";

builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      search: t.arg.string(),
    },
    resolve: async (query, root, args) => {
      return prisma.user.findMany({
        ...query,
        skip: args.skip || 0,
        take: args.take || 20,
        where: args.search
          ? {
              OR: [
                { email: { contains: args.search } },
                { name: { contains: args.search } },
              ],
            }
          : undefined,
      });
    },
  })
);
```

### Mutations

**Location**: `server/src/graphql/mutations/user.ts`

```typescript
import { builder } from "../schema";
import { prisma } from "../../prisma";
import bcrypt from "bcryptjs";

builder.mutationField("createUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      // Check permissions
      if (!ctx.user || ctx.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Validate
      if (args.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(args.password, 10);

      // Create user
      return prisma.user.create({
        ...query,
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name,
          role: args.role,
        },
      });
    },
  })
);
```

### Testing Backend

```bash
# Start server
cd server
npm run dev

# Open GraphQL Playground
# http://localhost:4000/graphql

# Test query
query Users {
  users {
    id
    name
    email
    role
  }
}

# Test mutation
mutation CreateUser {
  createUser(
    email: "test@example.com"
    password: "password123"
    name: "Test User"
    role: "COMPANY_EMPLOYEE"
  ) {
    id
    name
    email
  }
}
```

---

## Frontend Development

### GraphQL Operations

**Location**: `frontend/src/graphql/users.graphql`

```graphql
# Query
query Users($skip: Int, $take: Int, $search: String) {
  users(skip: $skip, take: $take, search: $search) {
    id
    email
    name
    role
    createdAt
    company {
      id
      name
    }
  }
}

# Mutation
mutation CreateUser(
  $email: String!
  $password: String!
  $name: String!
  $role: String!
) {
  createUser(email: $email, password: $password, name: $name, role: $role) {
    id
    name
    email
  }
}
```

### GraphQL Codegen

**Config**: `frontend/codegen.ts`

```typescript
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/__generated__/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-urql"],
    },
  },
};

export default config;
```

**Run Codegen**:

```bash
cd frontend
npm run codegen
```

### Using Generated Hooks

```typescript
import { useQuery, useMutation } from "urql";
import { UsersDocument, CreateUserDocument } from "@/__generated__/graphql";

function UsersPage() {
  // Query
  const [{ data, fetching, error }, refetchUsers] = useQuery({
    query: UsersDocument,
    variables: { skip: 0, take: 20 },
  });

  // Mutation
  const [, createUser] = useMutation(CreateUserDocument);

  const handleCreate = async () => {
    const result = await createUser({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      role: "COMPANY_EMPLOYEE",
    });

    if (result.error) {
      toast.error("Error creating user");
      return;
    }

    toast.success("User created");
    refetchUsers({ requestPolicy: "network-only" });
  };

  if (fetching) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      <Button onClick={handleCreate}>Create User</Button>
    </div>
  );
}
```

### Reusable Hooks

```typescript
import { useRelayIds } from "@/hooks/useRelayIds";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";

function UserManagement() {
  const { decodeGlobalId } = useRelayIds();

  const deleteUserMutation = useMutation(DeleteUserDocument);

  const { execute: deleteUser } = useOptimisticMutation({
    mutation: deleteUserMutation,
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user",
    refetchQueries: [{ refetch: refetchUsers }],
  });

  const handleDelete = async (globalId: string) => {
    const numericId = decodeGlobalId(globalId);
    await deleteUser({ id: numericId });
  };

  return <Button onClick={() => handleDelete(user.id)}>Delete</Button>;
}
```

---

## Testing

### Backend Testing

```bash
cd server

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

---

## Deployment

### Backend Deployment

```bash
cd server

# Build
npm run build

# Start production server
npm start

# Migration (production)
npx prisma migrate deploy
```

### Frontend Deployment

```bash
cd frontend

# Build
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

**Backend**:

```env
DATABASE_URL="mysql://prod_user:password@prod_host:3306/prod_db"
JWT_SECRET="production-secret-key-min-32-chars"
NODE_ENV=production
PORT=4000
CORS_ORIGIN="https://yourdomain.com"
```

**Frontend**:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT="https://api.yourdomain.com/graphql"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-nextauth-secret"
```

---

## Best Practices

### Backend

1. **Always use Prisma for database queries** (prevents SQL injection)
2. **Validate all inputs** before processing
3. **Check permissions** in every resolver
4. **Use transactions** for related operations
5. **Handle errors gracefully**
6. **Log important operations**

### Frontend

1. **Use GraphQL Codegen types** (never manual types)
2. **Always handle loading and error states**
3. **Use reusable hooks** (useRelayIds, useOptimisticMutation)
4. **Refetch after mutations** with `requestPolicy: 'network-only'`
5. **Use await Promise.all** for parallel refetch
6. **Validate forms** before submission (use Zod)

### General

1. **Write meaningful commit messages**
2. **Document complex logic**
3. **Keep functions small and focused**
4. **Follow TypeScript strict mode**
5. **Test critical paths**
6. **Review your own code** before committing

---

## Common Issues & Solutions

### Issue: GraphQL Codegen not generating types

**Solution**:

```bash
# Make sure backend is running
cd server && npm run dev

# Then run codegen
cd frontend && npm run codegen
```

### Issue: Prisma Client out of sync

**Solution**:

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### Issue: URQL cache not updating

**Solution**:

```typescript
// Use requestPolicy: 'network-only' and await refetch
await Promise.all([
  refetchUsers({ requestPolicy: "network-only" }),
  refetchStats({ requestPolicy: "network-only" }),
]);
```

### Issue: Relay Global ID errors

**Solution**:

```typescript
import { useRelayIds } from "@/hooks/useRelayIds";

const { decodeGlobalId } = useRelayIds();
const numericId = decodeGlobalId(globalId);
```

---

## Next Steps

1. Read **[BACKEND_DEVELOPMENT.md](./BACKEND_DEVELOPMENT.md)** for detailed backend guide
2. Read **[FRONTEND_DEVELOPMENT.md](./FRONTEND_DEVELOPMENT.md)** for detailed frontend guide
3. Check **[docs/GUIDES/NEW_FEATURES.md](./docs/GUIDES/NEW_FEATURES.md)** for adding features
4. Review **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** for system design

---

**Happy Coding! 🚀**

_ProtexFlow Development Team_
