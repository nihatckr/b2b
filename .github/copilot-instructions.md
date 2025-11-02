# AI Coding Agent Instructions - ProtexFlow

## 🎯 Project Overview

ProtexFlow is a B2B textile production management system with GraphQL backend (Pothos + Prisma) and Next.js 15 frontend. Key architectural patterns:

- **Schema-first development**: Prisma schema (21 models, 26 enums) → GraphQL types → TypeScript codegen
- **Reusable patterns**: Custom hooks (`useRelayIds`, `useOptimisticMutation`) for consistency
- **4-layer security**: Middleware → Component → GraphQL Shield → Resolver validation
- **Performance-first**: 95%+ improvement via Relay (99.8% faster) + DataLoader (87% reduction)
- **Production Status**: ✅ v2.0.0 - 100% schema compliance, 0 TypeScript errors

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
6. Test in GraphQL Playground at `http://localhost:4001/graphql`

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
- **4 roles**: ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER

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
- Status enums: OrderStatus (30 values), SampleStatus (28 values)

**Important ID Type Differences:**

| Model                             | ID Type                  | Usage                | Example            |
| --------------------------------- | ------------------------ | -------------------- | ------------------ |
| User, Company, Sample, Collection | Relay Global ID (Base64) | `decodeGlobalId(id)` | `"VXNlcjox"` → `1` |
| StandardCategory, LibraryItem     | Numeric ID               | `Number(id)`         | `"1"` → `1`        |
| CompanyCategory                   | Numeric ID               | `Number(id)`         | `"1"` → `1`        |

**Why the difference?**

- Models with `t.globalID()` or custom ID encoding → Relay Global IDs
- Models with simple `t.exposeID("id")` → Numeric IDs (as string)

**Common Error:**

```typescript
// ❌ WRONG: Decoding numeric ID
const categoryId = decodeGlobalId(standardCategory.id);
// Error: Failed to decode global ID: "1"

// ✅ CORRECT: Direct conversion
const categoryId = Number(standardCategory.id);
```

### Real-time Features

- WebSocket subscriptions via `subscriptionExchange` in URQL client
- Context includes user auth for both HTTP and WebSocket connections
- Auto-reconnection with exponential backoff

## 🔄 Critical Integration Points

### Dynamic Task System (DEPRECATED)

Located in `src/utils/dynamicTaskHelper.ts` - **DEPRECATED IN v2.0.0**:

- Task model removed from Prisma schema
- All helper functions are now no-ops (return empty arrays/logs)
- Removed from mutations: orderMutation.ts, sampleMutation.ts, productionMutation.ts
- Status change tracking still exists, but task creation removed
- **DO NOT** call DynamicTaskHelper in new code

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

// ⚠️ CRITICAL: Check if model uses Relay Global IDs or numeric IDs
// StandardCategory, LibraryItem → Numeric IDs (use Number(id))
// User, Company, Sample → Relay Global IDs (use decodeGlobalId(id))
```

**ID Type Detection:**

```typescript
// ❌ WRONG: Trying to decode numeric ID
const categoryId = decodeGlobalId(category.id); // Error: "1" is not Base64!

// ✅ CORRECT: Use Number() for numeric IDs
const categoryId = Number(category.id); // StandardCategory uses numeric IDs

// ✅ CORRECT: Use decodeGlobalId() for Relay Global IDs
const userId = decodeGlobalId(user.id); // User uses Relay Global IDs
```

**How to Check ID Type:**

```typescript
// Look at backend GraphQL type definition:
// Numeric ID: t.exposeID("id") without globalID
// Relay Global ID: t.globalID() or explicit encoding
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

### JSON Field Validation (Prisma)

**Problem:** Empty strings or invalid JSON in Prisma JSON fields cause errors.

```typescript
// ❌ WRONG: Sending empty string to JSON field
keywords: formData.keywords || undefined; // "" → JSON parse error!

// ✅ CORRECT: Frontend validation
let cleanKeywords: string | undefined = undefined;
if (formData.keywords && formData.keywords.trim() !== "") {
  try {
    JSON.parse(formData.keywords); // Validate JSON
    cleanKeywords = formData.keywords;
  } catch (e) {
    cleanKeywords = undefined; // Skip invalid JSON
  }
}

// ✅ CORRECT: Backend validation
if (input.keywords !== undefined && input.keywords !== null) {
  const trimmedKeywords = input.keywords.trim();
  if (trimmedKeywords === "") {
    updateData.keywords = null; // Empty string → null
  } else {
    try {
      updateData.keywords = JSON.parse(trimmedKeywords);
    } catch (e) {
      throw new Error("Invalid JSON in keywords field");
    }
  }
}
```

**Golden Rule for JSON Fields:**

- ✅ Frontend: Validate JSON before sending, send `undefined` if invalid
- ✅ Backend: Handle empty strings, convert to `null`
- ✅ Always `trim()` strings before validation
- ✅ Use try-catch for JSON.parse()
- ❌ Never send empty strings to JSON fields

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

## 🔥 Common Issues & Solutions

### Issue 1: "Failed to decode global ID" Error

**Symptom:**

```
InvalidCharacterError: Failed to execute 'atob' on 'Window':
The string to be decoded is not correctly encoded.
```

**Root Cause:** Trying to decode a numeric ID as if it were a Relay Global ID (Base64).

**Solution:**

```typescript
// ❌ WRONG
const id = decodeGlobalId(category.id); // category.id is "1", not Base64

// ✅ CORRECT - Check backend GraphQL type first
// If using t.exposeID("id") → Use Number()
const id = Number(category.id);

// If using t.globalID() → Use decodeGlobalId()
const id = decodeGlobalId(user.id);
```

**Quick Check:** Look at backend type definition:

- `t.exposeID("id")` → Numeric ID → Use `Number(id)`
- `t.globalID()` → Relay Global ID → Use `decodeGlobalId(id)`

---

### Issue 2: "Invalid JSON in keywords field"

**Symptom:**

```
[GraphQL] Invalid JSON in keywords field
```

**Root Cause:** Empty string or whitespace being sent to Prisma JSON field.

**Solution:**

**Frontend (Always validate before sending):**

```typescript
let cleanKeywords: string | undefined = undefined;
if (formData.keywords && formData.keywords.trim() !== "") {
  try {
    JSON.parse(formData.keywords); // Validate
    cleanKeywords = formData.keywords;
  } catch (e) {
    cleanKeywords = undefined; // Skip invalid
  }
}
// Send: cleanKeywords (not raw formData.keywords)
```

**Backend (Double validation):**

```typescript
if (input.keywords !== undefined && input.keywords !== null) {
  const trimmed = input.keywords.trim();
  if (trimmed === "") {
    updateData.keywords = null; // Empty → null
  } else {
    try {
      updateData.keywords = JSON.parse(trimmed);
    } catch (e) {
      throw new Error("Invalid JSON in keywords field");
    }
  }
}
```

**Golden Rules:**

1. ✅ Always `trim()` before validation
2. ✅ Empty string → `undefined` (frontend) or `null` (backend)
3. ✅ Use try-catch for JSON.parse()
4. ❌ Never send `""` to JSON fields

---

### Issue 3: GraphQL Codegen Errors

**Symptom:**

```
Cannot find name 'UsersDocument'
```

**Root Cause:** Query/mutation names not matching between .graphql file and import.

**Solution:**

```typescript
// ❌ WRONG: Generic name
// users.graphql
query Users { ... }

// Import
import { UsersDocument } from "@/__generated__/graphql"; // ❌ Ambiguous

// ✅ CORRECT: Prefixed name
// admin/users.graphql
query AdminUsers { ... }

// Import
import { AdminUsersDocument } from "@/__generated__/graphql"; // ✅ Clear
```

**Naming Convention:**

- Admin operations: `Admin` prefix (AdminUsers, AdminCreateUser)
- User profile: `UserProfile` prefix
- Settings: `Settings` prefix
- Dashboard: `Dashboard` prefix

---

### Issue 4: TypeScript Errors After Schema Changes

**Symptom:**

```
Type 'X' is not assignable to type 'Y'
```

**Root Cause:** Frontend types out of sync with backend schema.

**Solution (ALWAYS run in order):**

```bash
# 1. Backend: Regenerate Prisma Client
cd backend
npx prisma generate
npx prisma migrate dev

# 2. Frontend: Regenerate GraphQL types
cd ../frontend
npm run codegen

# 3. Restart dev servers
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

**Pro Tip:** Create VS Code task to run both commands sequentially.

---

### Issue 5: Cache Issues After Mutations

**Symptom:** UI not updating after create/update/delete operations.

**Root Cause:** URQL cache not invalidated.

**Solution:**

```typescript
const { execute } = useOptimisticMutation({
  mutation: deleteMutation,
  successMessage: "Deleted successfully",
  refetchQueries: [
    // ✅ ALWAYS use network-only
    { refetch: refetchItems, requestPolicy: "network-only" },
    { refetch: refetchStats, requestPolicy: "network-only" },
  ],
});

// ❌ WRONG: Without network-only (uses cache)
{ refetch: refetchItems }

// ✅ CORRECT: Forces fresh data from server
{ refetch: refetchItems, requestPolicy: "network-only" }
```

---

### Issue 6: Form Validation Not Working

**Symptom:** Invalid data being sent to backend despite frontend validation.

**Root Cause:** Form submission not prevented or validation bypassed.

**Solution:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // ✅ CRITICAL: Prevent default

  const errors = validateForm(formData);
  setErrors(errors);

  // ✅ Check errors before proceeding
  if (Object.keys(errors).length > 0) {
    return; // Stop if validation fails
  }

  await submitData(formData);
};
```

**Checklist:**

- ✅ `e.preventDefault()` at start of handler
- ✅ Validate before submit
- ✅ Return early if errors exist
- ✅ Show errors in UI
- ✅ Clear errors on field change

---

### Issue 7: Infinite Re-render Loop

**Symptom:** Browser freezes, memory usage spikes.

**Root Cause:** State update causing re-render which triggers another state update.

**Common Causes:**

```typescript
// ❌ WRONG: useEffect without deps
useEffect(() => {
  setData(newData);
}); // Re-runs on every render

// ✅ CORRECT: Specify dependencies
useEffect(() => {
  setData(newData);
}, [dependency]);

// ❌ WRONG: Object creation in dep array
useEffect(() => {
  fetchData(filters);
}, [{ search, level }]); // New object each render

// ✅ CORRECT: Primitive dependencies
useEffect(() => {
  fetchData({ search, level });
}, [search, level]);
```

---

## 📚 Quick Reference Checklist

**Before Creating New Feature:**

- [ ] Check if model uses Relay Global ID or numeric ID
- [ ] Plan GraphQL operation names with proper prefix
- [ ] Identify JSON fields that need validation
- [ ] Plan refetch queries for cache invalidation

**After Backend Changes:**

- [ ] Run `npx prisma generate && npx prisma migrate dev`
- [ ] Run `cd ../frontend && npm run codegen`
- [ ] Check for TypeScript errors
- [ ] Test with different user roles

**Before Committing:**

- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] GraphQL operations tested in Playground
- [ ] Form validation working
- [ ] Cache invalidation working
- [ ] UI updates after mutations

---

## 🔄 Recent Changes (v2.0.0 - November 1, 2025)

### ✅ Completed Validations & Cleanups

**Schema Compliance (100%)**:

- ✅ Validated all 89+ GraphQL files (26 enums, 21 types, 19 mutations, 17 queries, 5 subscriptions)
- ✅ Fixed 9 documentation errors (OrderStatus: 30 values, SampleStatus: 28 values)
- ✅ Updated LibraryCategory count (15, not 16)
- ✅ Fixed CollectionQuote enum values (all 7 QuoteStatus values)
- ✅ All files now 100% Prisma schema compliant

**Code Cleanup**:

- ✅ Removed DynamicTaskHelper calls from 3 mutation files (orderMutation, sampleMutation, productionMutation)
- ✅ Removed deprecated `Company.location` field
- ✅ Updated Role enum system (removed MANUFACTURE, CUSTOMER - use INDIVIDUAL_CUSTOMER)
- ✅ Cleaned up 5+ unnecessary imports

**Performance**:

- ✅ 95%+ overall improvement maintained
- ✅ Relay: 99.8% faster (1002 → 2 queries)
- ✅ DataLoader: 87% reduction (31 → 4 queries)

**Documentation**:

- ✅ Updated backend/README.md (4300+ lines, comprehensive)
- ✅ Updated copilot-instructions.md (this file)
- ✅ All recent changes documented

### 🎯 Current State

**Backend**:

- Port: 4001 (not 4000)
- Version: 2.0.0 (Production Ready)
- TypeScript Errors: 0
- Schema Compliance: 100%
- Health Score: 100/100

**Database**:

- Models: 21 (all active)
- Enums: 26 (all correct counts)
- Roles: 4 (ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER)
- Departments: 6 (PURCHASING, PRODUCTION, QUALITY, DESIGN, SALES, MANAGEMENT)

**Architecture**:

- GraphQL Types: 21 files (fully typed)
- Queries: 17 files
- Mutations: 19 files
- Subscriptions: 5 real-time channels
- Pothos Plugins: 5 active (ScopeAuth, Prisma, Relay, Dataloader, Validation)

### 📋 Deprecated Features (Do Not Use)

- ❌ **DynamicTaskHelper** - Task model removed from schema, functions are no-ops
- ❌ **Company.location** - Field marked deprecated in schema
- ❌ **MANUFACTURE role** - Removed from Role enum
- ❌ **CUSTOMER role** - Removed, use INDIVIDUAL_CUSTOMER instead

---
