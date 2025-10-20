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

### Adding Features (Step-by-Step)

**Backend Development:**

1. Update `prisma/schema.prisma` with new models/fields
2. Run `npx prisma generate && npx prisma migrate dev`
3. Create GraphQL types in `src/graphql/types/EntityName.ts`
4. Add queries in `src/graphql/queries/entityName.ts`
5. Add mutations in `src/graphql/mutations/entityName.ts`
6. Test in GraphQL Playground at `http://localhost:4000/graphql`

**Frontend Development:**

1. Create `.graphql` file in `src/graphql/` with unique query/mutation names

   - Use descriptive prefixes: `Admin`, `UserProfile`, `Dashboard`, etc.
   - Example: `src/graphql/admin/users.graphql`

   ```graphql
   query AdminUsers($skip: Int, $take: Int) {
     users(skip: $skip, take: $take) {
       id
       name
       email
     }
   }

   mutation AdminCreateUser($email: String!, $name: String!) {
     createUser(email: $email, name: $name) {
       id
       name
     }
   }
   ```

2. Run GraphQL Codegen to generate TypeScript types

   ```bash
   cd frontend && npm run codegen
   ```

3. Import generated types in components

   ```tsx
   import {
     AdminUsersDocument,
     AdminCreateUserDocument,
   } from "@/__generated__/graphql";
   ```

4. Build UI components in `src/components/feature-name/`
5. Create pages in `src/app/(protected)/feature-name/page.tsx`
6. Add custom hooks in `src/hooks/` if needed

**Type Safety Guarantee:**

- ✅ Backend schema → Frontend types (automatic)
- ✅ TypeScript catches mismatches at compile time
- ✅ No runtime type errors from GraphQL operations

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

### GraphQL Codegen Workflow (CRITICAL)

**Backend → Frontend Type-Safe Integration Process:**

1. **Backend GraphQL Schema (Pothos)**

   - Define types in `backend/src/graphql/types/EntityName.ts`
   - Create queries/mutations in `backend/src/graphql/queries|mutations/`
   - Test in GraphQL Playground at `http://localhost:4001/graphql`

2. **Frontend GraphQL Operations**

   - Create `.graphql` files in `frontend/src/graphql/`
   - Name queries/mutations with descriptive prefixes (e.g., `AdminUsers`, `UserProfile`)
   - **CRITICAL**: Query/mutation names MUST be unique across entire project

   ```graphql
   # ✅ GOOD: Unique, descriptive names
   query AdminUsers($skip: Int, $take: Int) { ... }
   mutation AdminCreateUser($email: String!) { ... }

   # ❌ BAD: Generic names cause conflicts
   query Users { ... }
   mutation CreateUser { ... }
   ```

3. **Run GraphQL Codegen**

   ```bash
   cd frontend && npm run codegen
   ```

   - Generates TypeScript types in `frontend/src/__generated__/graphql.ts`
   - Creates typed hooks: `useAdminUsersQuery`, `useAdminCreateUserMutation`
   - Document suffixes: `AdminUsersDocument`, `AdminCreateUserDocument`

4. **Import and Use Generated Types**

   ```tsx
   // ✅ Import generated documents and types
   import {
     AdminUsersDocument,
     AdminCreateUserDocument,
     AdminUsersQuery,
     AdminCreateUserMutation,
   } from "@/__generated__/graphql";

   // Use with URQL
   const [{ data }] = useQuery({ query: AdminUsersDocument });
   const [, createUser] = useMutation(AdminCreateUserDocument);
   ```

**Naming Convention Rules:**

| Context          | Prefix        | Example                                            |
| ---------------- | ------------- | -------------------------------------------------- |
| Admin operations | `Admin`       | `AdminUsersDocument`, `AdminCreateUserDocument`    |
| User profile     | `UserProfile` | `UserProfileDocument`, `UpdateUserProfileDocument` |
| Settings         | `Settings`    | `SettingsDocument`, `UpdateSettingsDocument`       |
| Dashboard        | `Dashboard`   | `DashboardStatsDocument`                           |

**Common Codegen Errors & Fixes:**

```tsx
// ❌ ERROR: Cannot find name 'UsersDocument'
const [{ data }] = useQuery({ query: UsersDocument });

// ✅ FIX: Use the correct prefixed name from .graphql file
const [{ data }] = useQuery({ query: AdminUsersDocument });

// ❌ ERROR: Duplicate query name
// frontend/src/graphql/users.graphql: query Users { ... }
// frontend/src/graphql/admin/users.graphql: query Users { ... }

// ✅ FIX: Use unique names with context prefix
// frontend/src/graphql/users.graphql: query UserProfile { ... }
// frontend/src/graphql/admin/users.graphql: query AdminUsers { ... }
```

**After Every Backend Schema Change:**

```bash
# 1. Backend: Generate Prisma Client + Migrate
cd backend
npx prisma generate
npx prisma migrate dev

# 2. Frontend: Regenerate GraphQL Types
cd ../frontend
npm run codegen

# 3. Verify no TypeScript errors
# Check imports in components using the updated schema
```

### Frontend Data Patterns

```tsx
// ✅ Standard URQL pattern with reusable hooks
const { decodeGlobalId } = useRelayIds();
const deleteUserMutation = useMutation(AdminDeleteUserDocument); // Note: Admin prefix

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

- **Backend**:

  - `src/graphql/types/EntityName.ts` - GraphQL type definitions
  - `src/graphql/queries/entityName.ts` - Query resolvers
  - `src/graphql/mutations/entityName.ts` - Mutation resolvers
  - Test endpoint: `http://localhost:4000/graphql` (GraphQL Playground)

- **Frontend**:

  - `src/graphql/feature.graphql` - GraphQL operations (queries/mutations)
  - **Naming Rule**: Use unique, descriptive names with context prefix
    - `src/graphql/admin/users.graphql` → `AdminUsers`, `AdminCreateUser`
    - `src/graphql/settings.graphql` → `Settings`, `UpdateSettings`
    - `src/graphql/dashboard.graphql` → `DashboardStats`
  - `npm run codegen` → `src/__generated__/graphql.ts` (auto-generated types)
  - `src/components/feature/` - React components
  - `src/app/(protected)/feature/page.tsx` - Next.js pages

- **Hooks**:
  - `src/hooks/useFeatureName.ts` with README.md documentation
  - `useRelayIds` - Global ID encode/decode utilities
  - `useOptimisticMutation` - Mutation patterns with auto-refetch

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
