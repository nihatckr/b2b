# Frontend Permission System Usage Guide

## Overview

This guide explains how to use the department-based permission system in the frontend application.

## Components

### 1. Hooks

#### `usePermissions()`

Hook to check user permissions and get department information.

```typescript
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const {
    permissions, // Array of permission strings
    permissionLabels, // Object with permission labels
    departmentLabel, // User's department label
    hasPermission, // Function to check single permission
    hasAnyPermission, // Function to check if user has any of multiple permissions
    hasAllPermissions, // Function to check if user has all permissions
    loading, // Loading state
    error, // Error state
  } = usePermissions();

  // Check single permission
  if (hasPermission("PRODUCTION_MANAGE")) {
    return <DeleteButton />;
  }

  // Check multiple permissions (any)
  if (hasAnyPermission(["PRODUCTION_EDIT", "PRODUCTION_MANAGE"])) {
    return <EditButton />;
  }

  // Check multiple permissions (all)
  if (hasAllPermissions(["PRODUCTION_VIEW", "QUALITY_VIEW"])) {
    return <AdvancedDashboard />;
  }
}
```

#### `useCanAccessRoute(route)`

Hook to check if user can access a specific route.

```typescript
import { useCanAccessRoute } from "@/hooks/usePermissions";

function MyComponent() {
  const { canAccess, loading, error } = useCanAccessRoute("/production");

  if (!canAccess && !loading) {
    router.push("/unauthorized");
  }
}
```

#### `useDepartmentInfo()`

Hook to get detailed department information.

```typescript
import { useDepartmentInfo } from "@/hooks/usePermissions";

function MyComponent() {
  const {
    department, // Department label
    permissions, // Array of permissions
    permissionLabels, // Permission labels
    loading,
    error,
  } = useDepartmentInfo();
}
```

### 2. Components

#### `<PermissionGate>`

Component that conditionally renders children based on permissions.

```typescript
import { PermissionGate } from '@/components/auth/PermissionGate';

// Single permission
<PermissionGate permission="PRODUCTION_MANAGE">
  <DeleteButton />
</PermissionGate>

// Multiple permissions (any)
<PermissionGate permission={["PRODUCTION_EDIT", "PRODUCTION_MANAGE"]}>
  <EditButton />
</PermissionGate>

// Multiple permissions (all required)
<PermissionGate
  permission={["PRODUCTION_VIEW", "QUALITY_VIEW"]}
  requireAll
>
  <AdvancedDashboard />
</PermissionGate>

// With fallback
<PermissionGate
  permission="ADMIN_PANEL"
  fallback={<p>Admin access required</p>}
>
  <AdminPanel />
</PermissionGate>
```

#### `<DepartmentGate>`

Component that conditionally renders children based on department.

```typescript
import { DepartmentGate } from '@/components/auth/PermissionGate';

<DepartmentGate department="PRODUCTION">
  <ProductionDashboard />
</DepartmentGate>

<DepartmentGate department={["PRODUCTION", "QUALITY"]}>
  <FactoryFloorView />
</DepartmentGate>
```

#### `<ProtectedRoute>`

Component that protects entire routes, redirecting unauthorized users.

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Protect with single permission
<ProtectedRoute permission="PRODUCTION_VIEW">
  <ProductionPage />
</ProtectedRoute>

// Protect with route check
<ProtectedRoute route="/production">
  <ProductionPage />
</ProtectedRoute>

// Protect with multiple permissions (any)
<ProtectedRoute permission={["PRODUCTION_EDIT", "PRODUCTION_MANAGE"]}>
  <EditProductionPage />
</ProtectedRoute>

// Protect with multiple permissions (all required)
<ProtectedRoute
  permission={["PRODUCTION_VIEW", "QUALITY_VIEW"]}
  requireAll
>
  <AdvancedDashboard />
</ProtectedRoute>

// Custom redirect
<ProtectedRoute
  permission="ADMIN_PANEL"
  redirectTo="/dashboard"
>
  <AdminPanel />
</ProtectedRoute>
```

#### `<DepartmentRoute>`

Component that protects routes based on department.

```typescript
import { DepartmentRoute } from '@/components/auth/ProtectedRoute';

<DepartmentRoute department="PRODUCTION">
  <ProductionDashboard />
</DepartmentRoute>

<DepartmentRoute department={["PRODUCTION", "QUALITY"]}>
  <FactoryFloorDashboard />
</DepartmentRoute>
```

## Example Pages

### Production Page (`/production`)

Protected route that requires `PRODUCTION_VIEW` permission. Shows different UI elements based on permissions:

- Create button: `PRODUCTION_CREATE`
- Edit button: `PRODUCTION_EDIT` or `PRODUCTION_MANAGE`
- Delete button: `PRODUCTION_MANAGE` only
- Advanced management: `PRODUCTION_MANAGE` only

### Quality Page (`/quality`)

Protected route that requires `QUALITY_VIEW` permission. Shows different UI elements based on permissions:

- Approve button: `QUALITY_APPROVE` only
- Reject button: `QUALITY_REJECT` only
- Quality approval section: Both `QUALITY_APPROVE` and `QUALITY_REJECT`

### Unauthorized Page (`/unauthorized`)

Shows when user tries to access a page without required permissions.

## Common Patterns

### 1. Conditional Rendering Based on Permission

```typescript
function MyComponent() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission("PRODUCTION_MANAGE") && <DeleteButton />}
      {hasPermission("PRODUCTION_EDIT") && <EditButton />}
    </div>
  );
}
```

### 2. Disable Button Based on Permission

```typescript
function MyComponent() {
  const { hasPermission } = usePermissions();

  return (
    <button
      disabled={!hasPermission("PRODUCTION_MANAGE")}
      className={
        !hasPermission("PRODUCTION_MANAGE")
          ? "opacity-50 cursor-not-allowed"
          : ""
      }
    >
      Delete Production
    </button>
  );
}
```

### 3. Show Different Content Based on Department

```typescript
function MyComponent() {
  const { departmentLabel } = usePermissions();

  if (departmentLabel === "PRODUCTION") {
    return <ProductionDashboard />;
  }

  if (departmentLabel === "QUALITY") {
    return <QualityDashboard />;
  }

  return <GeneralDashboard />;
}
```

### 4. Protect Entire Page

```typescript
// app/production/page.tsx
export default function ProductionPage() {
  return (
    <ProtectedRoute permission="PRODUCTION_VIEW">
      <div>{/* Page content */}</div>
    </ProtectedRoute>
  );
}
```

### 5. Show Fallback for Missing Permissions

```typescript
<PermissionGate
  permission="PRODUCTION_MANAGE"
  fallback={
    <div className="bg-yellow-100 p-4 rounded">
      <p>You need PRODUCTION_MANAGE permission to access this feature.</p>
    </div>
  }
>
  <AdvancedFeatures />
</PermissionGate>
```

## Permission List

### Production Permissions

- `PRODUCTION_VIEW` - View production data
- `PRODUCTION_CREATE` - Create production orders
- `PRODUCTION_EDIT` - Edit production details
- `PRODUCTION_DELETE` - Delete production records
- `PRODUCTION_MANAGE` - Full production control (Production dept only)

### Quality Permissions

- `QUALITY_VIEW` - View quality reports
- `QUALITY_CREATE` - Create quality reports
- `QUALITY_EDIT` - Edit quality reports
- `QUALITY_APPROVE` - Approve quality checks (Quality dept only)
- `QUALITY_REJECT` - Reject quality checks (Quality dept only)

### Sample Permissions

- `SAMPLE_VIEW` - View samples
- `SAMPLE_CREATE` - Create new samples
- `SAMPLE_EDIT` - Edit existing samples
- `SAMPLE_DELETE` - Delete samples
- `SAMPLE_APPROVE` - Approve sample designs

### Order Permissions

- `ORDER_VIEW` - View orders
- `ORDER_CREATE` - Create orders
- `ORDER_EDIT` - Edit orders
- `ORDER_DELETE` - Delete orders
- `ORDER_APPROVE` - Approve orders

See [DEPARTMENT_ACCESS_CONTROL.md](../../DEPARTMENT_ACCESS_CONTROL.md) for complete list.

## Department List

- `PURCHASING` - Purchasing Department
- `PRODUCTION` - Production Department (exclusive: PRODUCTION_MANAGE)
- `QUALITY` - Quality Department (exclusive: QUALITY_APPROVE, QUALITY_REJECT)
- `DESIGN` - Design Department
- `SALES` - Sales Department
- `MANAGEMENT` - Management (has all permissions)

## Testing

### Test as Production User

1. Login with a user assigned to Production department
2. Navigate to `/production`
3. Verify you can see:
   - ✅ All production data (PRODUCTION_VIEW)
   - ✅ Create button (PRODUCTION_CREATE)
   - ✅ Edit buttons (PRODUCTION_EDIT)
   - ✅ Delete buttons (PRODUCTION_MANAGE)
   - ✅ Advanced management section (PRODUCTION_MANAGE)

### Test as Quality User

1. Login with a user assigned to Quality department
2. Navigate to `/quality`
3. Verify you can see:
   - ✅ All quality data (QUALITY_VIEW)
   - ✅ Approve buttons (QUALITY_APPROVE)
   - ✅ Reject buttons (QUALITY_REJECT)
   - ✅ Quality approval section (both QUALITY_APPROVE and QUALITY_REJECT)

### Test Unauthorized Access

1. Login with a user without PRODUCTION_VIEW
2. Try to navigate to `/production`
3. Should be redirected to `/unauthorized`

## Troubleshooting

### Permission check not working

- Verify user is logged in (JWT token exists)
- Check browser console for errors
- Verify GraphQL query is returning data
- Check that permission string matches exactly (case-sensitive)

### Component not rendering

- Check if `loading` state is handled
- Verify permission exists in backend permission list
- Check browser console for errors

### Redirect not working

- Verify `redirectTo` prop is set correctly
- Check if router is available (client component)
- Verify unauthorized page exists

## Related Files

- Backend: `backend/src/utils/permissions.ts`
- Backend: `backend/src/graphql/queries/permissionQuery.ts`
- Frontend: `frontend/src/hooks/usePermissions.ts`
- Frontend: `frontend/src/components/auth/PermissionGate.tsx`
- Frontend: `frontend/src/components/auth/ProtectedRoute.tsx`
- Docs: `DEPARTMENT_ACCESS_CONTROL.md`
