# 🏗️ System Architecture

> ProtexFlow's architectural design, patterns, and technical decisions

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Layers](#architecture-layers)
- [Tech Stack Decisions](#tech-stack-decisions)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)
- [Data Flow](#data-flow)
- [Real-Time Architecture](#real-time-architecture)
- [File Storage](#file-storage)

---

## 🎯 System Overview

ProtexFlow follows a **modern full-stack architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  Next.js 15.5.4 + React 19 + TypeScript 5.7.3 + URQL    │
└───────────────────────┬─────────────────────────────────┘
                        │
                   HTTP/WebSocket (graphql-ws)
                        │
┌───────────────────────┴─────────────────────────────────┐
│                   GraphQL API Layer                      │
│  GraphQL Yoga 5.10.6 + Pothos 4.3.0 + GraphQL Shield    │
│            (Code-First, Type-Safe Schema)                │
└───────────────────────┬─────────────────────────────────┘
                        │
                 Prisma ORM 6.17.1
                        │
┌───────────────────────┴─────────────────────────────────┐
│                    Database Layer                        │
│              MySQL 8.0+ (textile_test_db21)              │
│         1538 lines schema | 20 models | 150+ relations   │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Type Safety**: TypeScript end-to-end
2. **Code-First**: Pothos GraphQL for schema generation
3. **Security-First**: 4-layer authorization
4. **Real-Time**: WebSocket subscriptions
5. **Scalability**: Stateless backend, horizontal scaling ready

---

## 🏢 Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology**: Next.js 15 + React 19

**Structure**:

```
frontend/src/
├── app/              # Next.js App Router
│   ├── (auth)/      # Unauthenticated pages
│   ├── (dashboard)/ # Authenticated pages
│   └── layout.tsx   # Root layout
├── components/       # React components
│   ├── ui/          # Base UI components (shadcn)
│   ├── providers/   # Context providers
│   └── ...          # Feature components
├── lib/             # Core utilities
│   ├── auth.ts      # NextAuth configuration
│   ├── urql-client.ts  # GraphQL client setup
│   ├── dal.ts       # Data Access Layer
│   └── permissions.ts  # Permission utilities
├── hooks/           # Custom React hooks
├── graphql/         # GraphQL operations (.graphql files)
└── middleware.ts    # Route protection (Layer 1 security)
```

**Responsibilities**:

- User interface rendering
- Client-side state management (URQL cache)
- Route protection (middleware)
- Component-level permission checks
- Form validation
- Real-time updates via subscriptions

### 2. API Layer (Backend)

**Technology**: GraphQL Yoga + Pothos + Express

**Structure**:

```
backend/src/
├── graphql/
│   ├── types/         # Pothos type definitions
│   │   ├── User.ts
│   │   ├── Company.ts
│   │   ├── Order.ts
│   │   └── ...
│   ├── queries/       # Query resolvers
│   │   ├── userQueries.ts
│   │   ├── orderQueries.ts
│   │   └── ...
│   ├── mutations/     # Mutation resolvers
│   │   ├── authMutation.ts
│   │   ├── orderMutation.ts
│   │   └── ...
│   └── subscriptions/ # Real-time subscriptions
│       ├── notificationSubscription.ts
│       └── ...
├── permission/        # GraphQL Shield rules (Layer 3 security)
│   └── index.ts
├── utils/            # Helper functions
│   ├── permissions.ts # Permission checking
│   ├── jwt.ts        # JWT utilities
│   └── ...
└── server.ts         # Server entry point
```

**Responsibilities**:

- GraphQL schema generation (Pothos)
- Business logic implementation
- Data validation
- Authorization (GraphQL Shield)
- JWT token management
- File upload handling
- Real-time event publishing

### 3. Data Layer

**Technology**: Prisma ORM + MySQL

**Structure**:

```
backend/prisma/
├── schema.prisma     # Database schema (single source of truth)
├── migrations/       # Migration history
└── seed.ts          # Test data seeding
```

**Key Models**:

- **Core**: User, Company
- **Business**: Order, Sample, Collection
- **Production**: ProductionTracking, QualityControl
- **Communication**: Notification, Message
- **Library**: Color, Fabric, Size, Season, Fit

**Responsibilities**:

- Database schema management
- Type-safe database queries
- Relationship management
- Migration handling

---

## 🛠️ Tech Stack Decisions

### Frontend Choices

| Decision           | Choice                  | Rationale                                                                                                   |
| ------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Framework**      | Next.js 15 (App Router) | - Server components<br>- Streaming SSR<br>- Built-in routing<br>- Image optimization<br>- TypeScript native |
| **UI Library**     | React 19                | - Latest features (actions, transitions)<br>- Concurrent rendering<br>- Suspense support                    |
| **GraphQL Client** | URQL                    | - Lightweight (14KB)<br>- Normalized cache<br>- Subscriptions support<br>- Framework agnostic               |
| **Auth**           | NextAuth.js v4          | - JWT support<br>- OAuth providers<br>- Session management<br>- Type-safe                                   |
| **Forms**          | React Hook Form + Zod   | - Performance (uncontrolled)<br>- Schema validation<br>- TypeScript inference                               |
| **Styling**        | TailwindCSS + shadcn/ui | - Utility-first<br>- Consistent design system<br>- Accessible components                                    |

### Backend Choices

| Decision           | Choice         | Rationale                                                                                                 |
| ------------------ | -------------- | --------------------------------------------------------------------------------------------------------- |
| **GraphQL**        | GraphQL Yoga   | - Modern & fast<br>- Subscriptions built-in<br>- Plugin ecosystem<br>- SSE support                        |
| **Schema Builder** | Pothos GraphQL | - Code-first<br>- Type-safe<br>- Prisma integration<br>- Better DX than Nexus                             |
| **ORM**            | Prisma         | - Type-safe queries<br>- Auto-migrations<br>- Visual editor (Prisma Studio)<br>- Best-in-class TypeScript |
| **Database**       | MySQL 8.0+     | - Proven reliability<br>- ACID compliance<br>- JSON support<br>- Easy hosting                             |
| **Auth**           | JWT            | - Stateless<br>- Scalable<br>- Mobile-ready<br>- Industry standard                                        |
| **Authorization**  | GraphQL Shield | - Declarative rules<br>- Caching<br>- Error handling<br>- Composable                                      |

---

## 🎨 Design Patterns

### 1. Repository Pattern (Data Access Layer)

**Location**: `frontend/src/lib/dal.ts`

```typescript
// Centralized server-side data access
export async function verifySession() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return session;
}

export async function hasRole(allowedRoles: Role[]) {
  const session = await verifySession();
  return allowedRoles.includes(session.user.role);
}

export async function ownsResource(resourceOwnerId: string) {
  const session = await verifySession();
  return session.user.id === resourceOwnerId || session.user.role === "ADMIN";
}
```

**Benefits**:

- Single source of truth for data access
- Consistent authorization checks
- Easy to test
- Prevents N+1 queries

### 2. Provider Pattern (Context)

**Location**: `frontend/src/components/providers/`

```typescript
// AuthProvider - Session management
// ThemeProvider - Dark mode
// UrqlProvider - GraphQL client
// NotificationProvider - Real-time notifications
```

**Benefits**:

- Clean separation of concerns
- Global state management
- Easy to compose
- Server/Client component compatibility

### 3. Custom Hooks Pattern

**Location**: `frontend/src/hooks/`

```typescript
// usePermissions - Permission checking
// useCurrentUser - Get current user
// useNotifications - Real-time notifications
// useDebounce - Debounced values
```

**Benefits**:

- Reusable logic
- Cleaner components
- Easy to test
- Type-safe

### 4. GraphQL Shield Rules (Declarative Authorization)

**Location**: `backend/src/permission/index.ts`

```typescript
const rules = {
  isAuthenticated: rule()((_parent, _args, ctx) => {
    return !!ctx.userId;
  }),

  isAdmin: rule()((_parent, _args, ctx) => {
    return ctx.user?.role === "ADMIN";
  }),

  ownsOrder: rule()(async (parent, _args, ctx) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: parent.id },
    });
    return order?.customerId === ctx.userId;
  }),
};

export const permissions = shield({
  Query: {
    me: isAuthenticated,
    users: isAdmin,
    order: or(ownsOrder, isAdmin),
  },
  Mutation: {
    createOrder: isAuthenticated,
    updateOrder: and(isAuthenticated, ownsOrder),
    deleteOrder: isAdmin,
  },
});
```

**Benefits**:

- Declarative & readable
- Cached rules
- Composable with `and`, `or`, `not`
- Error handling built-in

---

## 🔒 Security Architecture

### 4-Layer Security Model

```
Layer 1: Middleware (Route Protection)
         ↓
Layer 2: Component (UI Permission Checks)
         ↓
Layer 3: GraphQL Shield (API Authorization)
         ↓
Layer 4: Resolver (Business Logic Validation)
```

#### Layer 1: Middleware (Next.js)

**File**: `frontend/middleware.ts`

```typescript
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Protect routes
  if (protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Role-based routing
  if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
```

**Protects**: Routes before page render

#### Layer 2: Component-Level

**Hook**: `usePermissions()`

```typescript
const { hasPermission } = usePermissions();

if (hasPermission("collection:create")) {
  return <CreateCollectionButton />;
}
return null;
```

**Protects**: UI elements from unauthorized users

#### Layer 3: GraphQL Shield

**Rules**: Declarative authorization

```typescript
permissions = shield({
  Mutation: {
    createOrder: and(isAuthenticated, isCustomer),
    approveOrder: and(isAuthenticated, isManufacturer),
  },
});
```

**Protects**: API endpoints before resolver execution

#### Layer 4: Resolver Logic

**Business Rules**: Custom validation

```typescript
async createOrder(parent, args, ctx) {
  // Additional business logic checks
  const company = await ctx.prisma.company.findUnique({
    where: { id: ctx.user.companyId }
  });

  if (company.type !== 'BUYER') {
    throw new Error('Only buyers can create orders');
  }

  // Proceed with order creation...
}
```

**Protects**: Business rules enforcement

---

## 🔄 Data Flow

### Query Flow (Read Data)

```
User Action (Click)
    ↓
Component calls URQL useQuery()
    ↓
URQL checks cache
    ↓ (cache miss)
HTTP Request to GraphQL API
    ↓
GraphQL Shield checks permissions
    ↓ (authorized)
Resolver executes
    ↓
Prisma queries database
    ↓
Data returned to resolver
    ↓
GraphQL response sent
    ↓
URQL caches result
    ↓
Component re-renders with data
```

### Mutation Flow (Write Data)

```
User Action (Form Submit)
    ↓
Component calls URQL useMutation()
    ↓
HTTP Request to GraphQL API
    ↓
GraphQL Shield checks permissions
    ↓ (authorized)
Resolver executes
    ↓
Prisma writes to database
    ↓
Database transaction committed
    ↓
Subscription event published (if applicable)
    ↓
GraphQL response sent
    ↓
URQL invalidates related cache
    ↓
Component re-renders
    ↓
WebSocket subscribers receive update
```

### Subscription Flow (Real-Time)

```
Component calls URQL useSubscription()
    ↓
WebSocket connection established
    ↓
Subscription registered on server
    ↓
... (waiting for events) ...
    ↓
Event occurs (mutation executed)
    ↓
Subscription filter applied
    ↓ (matches)
Event pushed via WebSocket
    ↓
Component re-renders with new data
```

---

## 📡 Real-Time Architecture

### WebSocket Setup

**Backend**: GraphQL Yoga with `graphql-ws`

```typescript
import { createYoga } from "graphql-yoga";
import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";

const yoga = createYoga({ schema });

// HTTP server for queries/mutations
server.use("/graphql", yoga);

// WebSocket server for subscriptions
const wss = new WebSocketServer({ server, path: "/graphql" });
useServer({ schema }, wss);
```

**Frontend**: URQL with `subscriptionExchange`

```typescript
import { createClient, subscriptionExchange } from "urql";
import { createClient as createWSClient } from "graphql-ws";

const wsClient = createWSClient({
  url: "ws://localhost:4001/graphql",
  connectionParams: () => ({
    authorization: `Bearer ${token}`,
  }),
});

const urqlClient = createClient({
  url: "http://localhost:4001/graphql",
  exchanges: [
    cacheExchange,
    subscriptionExchange({
      forwardSubscription: (request) => ({
        subscribe: (sink) => ({
          unsubscribe: wsClient.subscribe(request, sink),
        }),
      }),
    }),
    fetchExchange,
  ],
});
```

### Subscription Example

**Schema**:

```typescript
// backend/src/graphql/subscriptions/notificationSubscription.ts
builder.subscriptionField("notificationReceived", (t) =>
  t.field({
    type: NotificationType,
    args: {
      userId: t.arg.string({ required: true }),
    },
    subscribe: (parent, args, ctx) => {
      return ctx.pubsub.subscribe("NOTIFICATION_RECEIVED", args.userId);
    },
    resolve: (payload) => payload,
  })
);
```

**Frontend**:

```typescript
const [{ data }] = useSubscription({
  query: NotificationReceivedDocument,
  variables: { userId: session.user.id },
});
```

---

## 📦 File Storage

### Upload Strategy

**Storage**: Local filesystem (`backend/uploads/`)

**Structure**:

```
uploads/
├── companies/
│   ├── {companyId}/
│   │   ├── logo/
│   │   │   └── optimized_{timestamp}.webp
│   │   └── cover/
│   │       └── optimized_{timestamp}.webp
├── collections/
├── samples/
└── quality-control/
```

**Image Optimization**: Sharp

```typescript
import sharp from "sharp";

const optimized = await sharp(file.buffer)
  .resize(800, 800, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile(outputPath);
```

**Benefits**:

- Consistent quality
- Reduced bandwidth
- Fast loading
- Modern formats (WebP)

### Future: Cloud Storage

**Planned**: AWS S3 / Cloudflare R2

```typescript
// Future implementation
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

await s3Client.send(
  new PutObjectCommand({
    Bucket: "protexflow-uploads",
    Key: `companies/${companyId}/logo.webp`,
    Body: optimizedBuffer,
    ContentType: "image/webp",
  })
);
```

---

## 🚀 Scalability Considerations

### Horizontal Scaling

**Stateless Backend**: JWT tokens enable load balancing

```
           Load Balancer
                │
    ┌───────────┼───────────┐
    ↓           ↓           ↓
  Server 1   Server 2   Server 3
    │           │           │
    └───────────┴───────────┘
                │
            Database
```

### Caching Strategy

**URQL Cache**: Normalized cache on client

**Future**: Redis for server-side caching

```typescript
// Planned: Redis cache for frequent queries
const cachedUser = await redis.get(`user:${userId}`);
if (cachedUser) return JSON.parse(cachedUser);

const user = await prisma.user.findUnique({ where: { id: userId } });
await redis.set(`user:${userId}`, JSON.stringify(user), "EX", 3600);
return user;
```

### Database Optimization

**Indexes**: Created on foreign keys and frequently queried fields

```prisma
model Order {
  id          String   @id @default(cuid())
  customerId  String
  status      OrderStatus @default(PENDING)

  @@index([customerId])
  @@index([status])
  @@index([createdAt])
}
```

**Connection Pooling**: Prisma's built-in connection pool

```typescript
// Automatic in Prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

---

## 📝 Best Practices

### 1. Type Safety

✅ **DO**: Use TypeScript everywhere

```typescript
// Good
type CreateOrderInput = {
  sampleId: string;
  quantity: number;
  notes?: string;
};

async function createOrder(input: CreateOrderInput): Promise<Order> {
  // ...
}
```

❌ **DON'T**: Use `any`

```typescript
// Bad
async function createOrder(input: any): Promise<any> {
  // ...
}
```

### 2. Error Handling

✅ **DO**: Use custom error classes

```typescript
// Good
class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

throw new UnauthorizedError("You do not own this resource");
```

❌ **DON'T**: Throw generic errors

```typescript
// Bad
throw new Error("Error");
```

### 3. GraphQL Resolvers

✅ **DO**: Keep resolvers thin, use services

```typescript
// Good
async createOrder(parent, args, ctx) {
  return orderService.create(args.input, ctx.userId);
}
```

❌ **DON'T**: Put business logic in resolvers

```typescript
// Bad
async createOrder(parent, args, ctx) {
  // 100 lines of business logic...
}
```

### 4. Component Structure

✅ **DO**: Small, focused components

```typescript
// Good
<OrderCard order={order} />
<OrderActions order={order} />
<OrderTimeline order={order} />
```

❌ **DON'T**: Monolithic components

```typescript
// Bad
<OrderPageWithEverything /> // 500 lines
```

---

## 🔗 Related Documentation

- [API Reference](./API.md)
- [Database Schema](./DATABASE.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Best Practices](./GUIDES/BEST_PRACTICES.md)

---

**Last Updated**: October 20, 2025
**Version**: 2.0.0
