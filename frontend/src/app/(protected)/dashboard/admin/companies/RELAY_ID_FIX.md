# Relay Global ID Fix - Company Management

## Problem Summary

**Error**: `Variable "$id" of non-null type "Int!" must not be null`

**Root Cause**: Company IDs are encoded as Relay Global IDs (Base64 format like `"Q29tcGFueTox"`) in GraphQL responses, but backend mutations expect numeric IDs (like `1`, `2`, `3`).

```typescript
// ❌ BROKEN CODE
const result = await updateCompany({
  id: Number(company.id), // company.id = "Q29tcGFueTox" (Base64 string)
  ...form,
});
// Result: Number("Q29tcGFueTox") = NaN → mutation fails
```

## Solution Applied

### 1. Import useRelayIds Hook

```typescript
import { useRelayIds } from "@/hooks/useRelayIds";
```

### 2. Use decodeGlobalId in Components

**EditCompanyDialog** (Update Mutation):

```typescript
function EditCompanyDialog({ company, ... }) {
  const { decodeGlobalId } = useRelayIds();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    // ✅ Decode Relay Global ID to numeric ID
    const numericId = decodeGlobalId(company.id);
    if (!numericId) {
      toast.error("Geçersiz firma ID");
      return;
    }

    const result = await updateCompany({
      id: numericId, // ✅ Now sends numeric ID (1, 2, 3)
      ...form,
    });
    // ...
  };
}
```

**CompanyDetailDialog** (Query with ID):

```typescript
function CompanyDetailDialog({ companyId, ... }) {
  const { decodeGlobalId } = useRelayIds();

  // ✅ Decode before query
  const numericId = companyId ? decodeGlobalId(companyId) : null;

  const [{ data }] = useQuery({
    query: AdminCompanyDetailDocument,
    variables: { id: numericId || 0 },
    pause: !numericId,
  });
}
```

## Why This Pattern?

### Relay Global ID System

- **GraphQL Schema**: Uses Relay specification with Global IDs for type safety
- **Format**: Base64-encoded string containing type + numeric ID
  - Example: `"Q29tcGFueTox"` decodes to `Company:1`
- **Backend Expectation**: Numeric IDs in mutations for Prisma queries

### ID Flow

```
Backend (Prisma)
   ↓
[Numeric ID: 1, 2, 3]
   ↓
GraphQL (Pothos + Relay)
   ↓
[Relay Global ID: "Q29tcGFueTox", "Q29tcGFueToy"]
   ↓
Frontend (React Component)
   ↓
useRelayIds().decodeGlobalId()
   ↓
[Numeric ID: 1, 2, 3]
   ↓
Mutation Variables
```

## Testing Checklist

After applying this fix, verify:

- [ ] ✅ Update company mutation works (Edit dialog)
- [ ] ✅ Company detail query works (Detail dialog)
- [ ] ✅ No TypeScript errors
- [ ] ✅ No GraphQL errors in browser console
- [ ] ✅ Toast notifications show success messages

## Related Files

- **Hook**: `frontend/src/hooks/useRelayIds.ts`
- **Pattern Used In**:
  - User management: `frontend/src/app/(protected)/dashboard/admin/users/page.tsx`
  - Company management: `frontend/src/app/(protected)/dashboard/admin/companies/page.tsx`

## Future Reference

**Always use `decodeGlobalId()` when**:

- Passing IDs to mutations that expect `Int!` type
- Passing IDs to queries that use numeric IDs in backend
- Working with any Relay Global ID (starts with capital letter, Base64 encoded)

**Never decode when**:

- Using IDs directly in queries with `ID!` type (already handled by GraphQL)
- Displaying IDs in UI (use as-is)
- Comparing IDs in frontend logic (use Global IDs consistently)

---

**Fixed**: 2025-01-XX
**Issue**: Relay Global ID → Numeric ID mismatch
**Solution**: useRelayIds hook with proper null checking
**Status**: ✅ Working
