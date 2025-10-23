# ⚙️ Backend Development Guide

Complete guide for backend development with Pothos GraphQL, Prisma, and MySQL.

**Last Updated:** October 20, 2025

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prisma ORM](#prisma-orm)
- [Pothos GraphQL](#pothos-graphql)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [File Uploads](#file-uploads)
- [Best Practices](#best-practices)

---

## Overview

ProtexFlow backend is built with:

- **GraphQL Yoga**: Modern GraphQL server
- **Pothos**: Code-first GraphQL schema builder
- **Prisma**: Type-safe ORM
- **MySQL**: Relational database
- **JWT**: Token-based authentication

### Architecture

```
┌──────────────────┐
│  GraphQL Client  │
└────────┬─────────┘
         │ HTTP/WebSocket
┌────────▼─────────┐
│  GraphQL Yoga    │ ◄── Pothos Schema
│     Server       │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Prisma Client   │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  MySQL Database  │
└──────────────────┘
```

---

## Tech Stack

| Technology   | Version | Purpose          |
| ------------ | ------- | ---------------- |
| Node.js      | 18+     | Runtime          |
| Express.js   | 5.1.0   | HTTP server      |
| GraphQL Yoga | 5.10.6  | GraphQL server   |
| Pothos       | 4.3.0   | Schema builder   |
| Prisma       | 6.17.1  | ORM              |
| MySQL        | 8.0+    | Database         |
| JWT          | -       | Authentication   |
| bcryptjs     | -       | Password hashing |
| Multer       | 2.0.2   | File uploads     |
| Sharp        | -       | Image processing |

---

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Migration history
├── src/
│   ├── graphql/
│   │   ├── schema.ts          # Pothos schema builder
│   │   ├── types/             # GraphQL type definitions
│   │   │   ├── User.ts
│   │   │   ├── Company.ts
│   │   │   ├── Sample.ts
│   │   │   └── ...
│   │   ├── queries/           # Query resolvers
│   │   │   ├── user.ts
│   │   │   ├── company.ts
│   │   │   └── ...
│   │   ├── mutations/         # Mutation resolvers
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   └── ...
│   │   └── subscriptions/     # Real-time subscriptions
│   │       └── notification.ts
│   ├── utils/
│   │   ├── auth.ts            # JWT utilities
│   │   ├── permissions.ts     # Permission helpers
│   │   └── dynamicTaskHelper.ts # Task automation
│   ├── context.ts             # GraphQL context
│   ├── prisma.ts              # Prisma client instance
│   └── server.ts              # Server entry point
├── uploads/                   # File storage
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

---

## Prisma ORM

### Schema Definition

**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// User model
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(COMPANY_EMPLOYEE)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  company   Company?  @relation(fields: [companyId], references: [id])
  companyId Int?
  samples   Sample[]
  orders    Order[]
  tasks     Task[]

  @@index([email])
  @@index([companyId])
  @@index([role])
}

// Company model
model Company {
  id          Int         @id @default(autoincrement())
  name        String
  type        CompanyType @default(MANUFACTURER)
  email       String      @unique
  logo        String?
  createdAt   DateTime    @default(now())

  // Relations
  users       User[]
  samples     Sample[]
  orders      Order[]

  @@index([email])
  @@index([type])
}

// Enums
enum Role {
  ADMIN
  COMPANY_OWNER
  COMPANY_EMPLOYEE
  INDIVIDUAL_CUSTOMER
}

enum CompanyType {
  MANUFACTURER
  BUYER
  BOTH
}
```

### Common Operations

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: {
    email: "test@example.com",
    name: "Test User",
    password: hashedPassword,
    role: "COMPANY_EMPLOYEE",
    companyId: 1,
  },
});

// Read
const users = await prisma.user.findMany({
  where: {
    isActive: true,
    role: "COMPANY_EMPLOYEE",
  },
  include: {
    company: true,
  },
  orderBy: {
    createdAt: "desc",
  },
  skip: 0,
  take: 20,
});

// Update
const updated = await prisma.user.update({
  where: { id: 1 },
  data: {
    name: "Updated Name",
    isActive: false,
  },
});

// Delete
await prisma.user.delete({
  where: { id: 1 },
});

// Transaction
await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { isActive: false } }),
  prisma.task.updateMany({
    where: { userId: 1 },
    data: { status: "CANCELLED" },
  }),
]);
```

### Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_user_fields

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

---

## Pothos GraphQL

### Schema Builder Setup

**File**: `src/graphql/schema.ts`

```typescript
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { prisma } from "../prisma";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {
    user: {
      id: number;
      email: string;
      role: string;
    } | null;
    prisma: typeof prisma;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
});

// Define DateTime scalar
builder.scalarType("DateTime", {
  serialize: (date) => date.toISOString(),
  parseValue: (value) => {
    if (typeof value === "string") {
      return new Date(value);
    }
    throw new Error("Invalid DateTime value");
  },
});

// Import all types, queries, mutations
import "./types";
import "./queries";
import "./mutations";

// Build schema
export const schema = builder.toSchema();
```

### Defining Types

**File**: `src/graphql/types/User.ts`

```typescript
import { builder } from "../schema";

// Define User type
builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name"),
    role: t.exposeString("role"),
    department: t.exposeString("department", { nullable: true }),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),

    // Relations
    company: t.relation("company", { nullable: true }),
    samples: t.relation("samples"),
    orders: t.relation("orders"),

    // Computed fields
    fullName: t.string({
      resolve: (user) => user.name,
    }),
  }),
});

// Input type for creating user
builder.inputType("CreateUserInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    name: t.string({ required: true }),
    role: t.string({ required: true }),
    companyId: t.int(),
  }),
});
```

### Writing Queries

**File**: `src/graphql/queries/user.ts`

```typescript
import { builder } from "../schema";

// Get all users
builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      role: t.arg.string(),
      search: t.arg.string(),
    },
    resolve: async (query, root, args, ctx) => {
      // Authorization check
      if (!ctx.user || ctx.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      return ctx.prisma.user.findMany({
        ...query,
        where: {
          role: args.role || undefined,
          OR: args.search
            ? [
                { email: { contains: args.search } },
                { name: { contains: args.search } },
              ]
            : undefined,
        },
        skip: args.skip || 0,
        take: args.take || 20,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Get single user
builder.queryField("user", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.int({ required: true }),
    },
    nullable: true,
    resolve: async (query, root, args, ctx) => {
      // Users can view themselves, admins can view anyone
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      if (ctx.user.role !== "ADMIN" && ctx.user.id !== args.id) {
        throw new Error("Unauthorized");
      }

      return ctx.prisma.user.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);
```

### Writing Mutations

**File**: `src/graphql/mutations/user.ts`

```typescript
import { builder } from "../schema";
import bcrypt from "bcryptjs";

// Create user
builder.mutationField("createUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
      companyId: t.arg.int(),
    },
    resolve: async (query, root, args, ctx) => {
      // Authorization
      if (!ctx.user || ctx.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Validation
      if (args.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check if email exists
      const existing = await ctx.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (existing) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(args.password, 10);

      // Create user
      return ctx.prisma.user.create({
        ...query,
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name,
          role: args.role,
          companyId: args.companyId,
        },
      });
    },
  })
);

// Update user
builder.mutationField("updateUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      email: t.arg.string(),
      department: t.arg.string(),
    },
    resolve: async (query, root, args, ctx) => {
      // Authorization
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Users can update themselves, admins can update anyone
      if (ctx.user.role !== "ADMIN" && ctx.user.id !== args.id) {
        throw new Error("Unauthorized");
      }

      // Update
      return ctx.prisma.user.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name,
          email: args.email,
          department: args.department,
        },
      });
    },
  })
);

// Delete user
builder.mutationField("deleteUser", (t) =>
  t.boolean({
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      // Admin only
      if (!ctx.user || ctx.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await ctx.prisma.user.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);
```

### Subscriptions

**File**: `src/graphql/subscriptions/notification.ts`

```typescript
import { builder } from "../schema";
import { pubsub } from "../../pubsub";

builder.subscriptionField("notificationAdded", (t) =>
  t.field({
    type: "Notification",
    subscribe: (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
      return pubsub.subscribe(`notification:${ctx.user.id}`);
    },
    resolve: (notification) => notification,
  })
);
```

---

## Authentication

### JWT Token Generation

**File**: `src/utils/auth.ts`

```typescript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateToken(user: {
  id: number;
  email: string;
  role: string;
}) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };
  } catch (error) {
    return null;
  }
}
```

### Login Mutation

```typescript
builder.mutationField("login", (t) =>
  t.field({
    type: "AuthPayload",
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      // Find user
      const user = await ctx.prisma.user.findUnique({
        where: { email: args.email },
        include: { company: true },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Check if active
      if (!user.isActive) {
        throw new Error("Account is disabled");
      }

      // Verify password
      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    },
  })
);
```

### Context Setup

**File**: `src/context.ts`

```typescript
import { YogaInitialContext } from "graphql-yoga";
import { prisma } from "./prisma";
import { verifyToken } from "./utils/auth";

export async function createContext(initialContext: YogaInitialContext) {
  const authHeader = initialContext.request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let user = null;
  if (token) {
    user = verifyToken(token);
  }

  return {
    user,
    prisma,
  };
}
```

---

## Authorization

### Permission Checks

**In Resolvers**:

```typescript
builder.queryField("sensitiveData", (t) =>
  t.field({
    type: "String",
    resolve: (root, args, ctx) => {
      // Check if user is logged in
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Check if user is admin
      if (ctx.user.role !== "ADMIN") {
        throw new Error("Forbidden");
      }

      return "Sensitive data";
    },
  })
);
```

### Permission Helpers

```typescript
export function requireAuth(ctx: Context) {
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }
  return ctx.user;
}

export function requireAdmin(ctx: Context) {
  const user = requireAuth(ctx);
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export function requireRole(ctx: Context, roles: string[]) {
  const user = requireAuth(ctx);
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

// Usage
builder.queryField("adminOnly", (t) =>
  t.field({
    type: "String",
    resolve: (root, args, ctx) => {
      requireAdmin(ctx);
      return "Admin data";
    },
  })
);
```

---

## File Uploads

### Multer Setup

**File**: `src/server.ts`

```typescript
import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});
```

### Image Optimization with Sharp

```typescript
import sharp from "sharp";

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filename = `optimized-${req.file.filename}`;
  const outputPath = path.join("uploads", filename);

  // Optimize image
  await sharp(req.file.path)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  // Delete original
  fs.unlinkSync(req.file.path);

  const fileUrl = `/uploads/${filename}`;
  res.json({ url: fileUrl });
});
```

---

## Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
if (args.password.length < 6) {
  throw new Error("Password must be at least 6 characters");
}

// ❌ Bad
const user = await prisma.user.create({ data: args });
```

### 2. Check Permissions

```typescript
// ✅ Good
if (!ctx.user || ctx.user.role !== "ADMIN") {
  throw new Error("Unauthorized");
}

// ❌ Bad
return ctx.prisma.user.findMany();
```

### 3. Use Transactions

```typescript
// ✅ Good
await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.task.create({ data: taskData }),
]);

// ❌ Bad
await prisma.order.create({ data: orderData });
await prisma.task.create({ data: taskData }); // Can fail, leaving orphaned order
```

### 4. Handle Errors

```typescript
// ✅ Good
try {
  const user = await prisma.user.create({ data: args });
  return user;
} catch (error) {
  if (error.code === "P2002") {
    throw new Error("Email already exists");
  }
  throw new Error("Failed to create user");
}
```

### 5. Use Indexes

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique

  @@index([email])
  @@index([role])
  @@index([companyId])
}
```

### 6. Paginate Large Queries

```typescript
// ✅ Good
const users = await prisma.user.findMany({
  skip: args.skip || 0,
  take: args.take || 20,
});

// ❌ Bad
const users = await prisma.user.findMany(); // Returns ALL users
```

### 7. Use Relations Wisely

```typescript
// ✅ Good - Only include what you need
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    company: {
      select: { id: true, name: true },
    },
  },
});

// ❌ Bad - N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
  });
}
```

---

## Testing Backend

### GraphQL Playground

Open `http://localhost:4000/graphql`

```graphql
# Test query
query {
  users {
    id
    name
    email
  }
}

# Test mutation
mutation {
  createUser(
    email: "test@example.com"
    password: "password123"
    name: "Test User"
    role: "COMPANY_EMPLOYEE"
  ) {
    id
    name
  }
}

# With variables
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}
```

### Prisma Studio

```bash
npx prisma studio
# Open http://localhost:5555
```

---

## Next Steps

- Read **[FRONTEND_DEVELOPMENT.md](./FRONTEND_DEVELOPMENT.md)** for frontend guide
- Check **[docs/DATABASE.md](./docs/DATABASE.md)** for database schema
- Review **[backend/USER_MANAGEMENT_API.md](./backend/USER_MANAGEMENT_API.md)** for API examples

---

**Happy Backend Development! ⚙️**
