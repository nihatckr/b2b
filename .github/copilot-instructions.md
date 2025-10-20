# AI Coding Agent Instructions - ProtexFlow

## 🎯 Project Overview

ProtexFlow is a B2B textile production management system with GraphQL backend (Pothos + Prisma) and Next.js 15 frontend. Key architectural patterns:

- **Schema-first development**: Prisma schema → GraphQL types → TypeScript codegen
- **Reusable patterns**: Custom hooks (`useRelayIds`, `useOptimisticMutation`) for consistency
- **4-layer security**: Middleware → Component → GraphQL Shield → Resolver validation
- **Dynamic task automation**: 700+ line system that auto-creates tasks on status changes

## 🔧 Essential Developer Workflows

### After Schema Changes (Critical Pattern)

```bash
# ALWAYS run in this exact order:
cd backend && npx prisma generate && npx prisma migrate dev
cd ../frontend && npm run codegen
```

### Adding Features

1. **Backend**: `prisma/schema.prisma` → `src/graphql/types/` → `src/graphql/mutations/` → Test in GraphQL Playground
2. **Frontend**: `src/graphql/feature.graphql` → `npm run codegen` → Components → Pages
3. **Always use generated types** - Never manual GraphQL types

### Testing with Roles

Use demo accounts post-seed:

- Admin: `admin@protexflow.com / Admin123!`
- Manufacturer: `owner@textile.com / Owner123!`
- Customer: `owner@fashionretail.com / Customer123!`

## 🏗️ Architecture Patterns

### GraphQL with Pothos (Code-First)

- Use `builder.prismaObject()` for types, `builder.queryField()` for resolvers
- Relay Global IDs: Use `useRelayIds()` hook to decode Base64 IDs to numeric for mutations
- All resolvers MUST check permissions via context.user

### Frontend Data Patterns

```tsx
// ✅ Standard URQL pattern with reusable hooks
const { decodeGlobalId } = useRelayIds();
const deleteUserMutation = useMutation(DeleteUserDocument);

const { execute: deleteUser } = useOptimisticMutation({
  mutation: deleteUserMutation,
  successMessage: "User deleted",
  errorMessage: "Failed to delete user",
  refetchQueries: [{ refetch: refetchUsers, requestPolicy: "network-only" }],
});

// Usage: Always decode Global ID for mutations
await deleteUser({ id: decodeGlobalId(user.id) });
```

### RBAC Implementation

- **Frontend**: Check `session.user.role` and `permissions` array
- **Backend**: GraphQL Shield + resolver-level validation
- **Route Protection**: `middleware.ts` handles role-based redirects
- **5 roles**: ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER, (legacy MANUFACTURE/CUSTOMER)

## 🎯 Project-Specific Conventions

### File Organization

- **Backend**: `src/graphql/types/EntityName.ts`, `src/graphql/mutations/entityName.ts`
- **Frontend**: `src/graphql/entityName.graphql` → codegen → `src/components/entityName/`
- **Hooks**: `src/hooks/useFeatureName.ts` with README.md documentation

### Database/GraphQL Patterns

- Prisma models use numeric IDs internally, GraphQL exposes Base64 Global IDs
- All mutations require authentication (check `context.user`)
- Use `t.prismaField()` for type-safe Prisma integration
- Status enums drive the Dynamic Task System (28 Sample statuses → auto-task creation)

### Real-time Features

- WebSocket subscriptions via `subscriptionExchange` in URQL client
- Context includes user auth for both HTTP and WebSocket connections
- Auto-reconnection with exponential backoff

## 🔄 Critical Integration Points

### Dynamic Task System (Core Feature)

Located in `src/utils/dynamicTaskHelper.ts` - **DO NOT MODIFY** without understanding:

- Maps 28 SampleStatus + 15 OrderStatus to automatic task creation
- Creates dual tasks (customer + manufacturer) on status changes
- Auto-completes old tasks when new ones are created
- Powers the entire workflow automation

### Authentication Flow

- NextAuth.js with JWT + custom backend integration
- 12-hour token rotation, 7-day expiry
- WebSocket connections authenticated via connection params
- Session-expired handling prevents redirect loops

### File Upload System

- Multer backend with Sharp image optimization
- Frontend uses standard HTML form uploads to `/upload` endpoint
- Integrated with sample/collection/company image management

## 🚨 Common Gotchas

### Cache Management

```tsx
// ✅ ALWAYS use network-only after mutations
await Promise.all([
  refetchUsers({ requestPolicy: "network-only" }),
  refetchStats({ requestPolicy: "network-only" }),
]);
```

### Global ID Handling

```tsx
// ❌ Never use Global IDs directly in mutations
await deleteUser({ id: user.id }); // user.id is Base64!

// ✅ Always decode first
await deleteUser({ id: decodeGlobalId(user.id) });
```

### Permission Checks

```tsx
// ✅ Check permissions on both frontend AND backend
// Frontend (UI visibility)
{
  hasPermission("DELETE_USER") && <DeleteButton />;
}

// Backend (resolver security)
if (!ctx.user || !hasPermission(ctx.user, "DELETE_USER")) {
  throw new Error("Unauthorized");
}
```

## 📱 Development Commands

### Backend Tasks (Use VS Code tasks when available)

- **Dev**: `🚀 Start Development Server` task or `npm run dev`
- **DB Studio**: `📊 Prisma Studio` task for visual DB management
- **Migration**: `🔄 Prisma Migrate Dev` task

### Frontend Tasks

- **Dev**: `🚀 Start Frontend` task or `npm run dev`
- **Codegen**: `🎨 GraphQL Codegen` task after any .graphql changes

### Key Directories

- `/backend/src/graphql/` - All GraphQL schema definitions
- `/frontend/src/hooks/` - Reusable patterns (documented in README.md)
- `/frontend/src/lib/user-utils.tsx` - User domain helpers
- `/docs/` - Comprehensive project documentation

## 🎯 Testing & Validation

Always test new features with:

1. Different user roles (Admin, Owner, Employee, Customer)
2. WebSocket subscriptions (notifications, real-time updates)
3. File uploads (samples, company logos)
4. Permission boundaries (try accessing restricted features)
5. Mobile responsiveness (TailwindCSS breakpoints)

Focus on the **Dynamic Task System** integration - any status changes should trigger appropriate task automation.

