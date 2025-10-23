# User Management Utilities

User domain için reusable helper fonksiyonları ve tip tanımları.

## 📦 Exports

### Types

```typescript
type UserRole =
  | "ADMIN"
  | "COMPANY_OWNER"
  | "COMPANY_EMPLOYEE"
  | "INDIVIDUAL_CUSTOMER";
type UserDepartment =
  | "PURCHASING"
  | "PRODUCTION"
  | "QUALITY"
  | "DESIGN"
  | "SALES"
  | "MANAGEMENT";

interface UserFormData {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  companyId?: number | null;
}

interface ValidationError {
  field: string;
  message: string;
}
```

### Configuration

**`ROLE_CONFIG`** - Rol badge ayarları

```typescript
const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon?: string;
  }
>;
```

**`DEPARTMENT_LABELS`** - Departman çevirileri

```typescript
const DEPARTMENT_LABELS: Record<UserDepartment, string>;
```

## 🎨 UI Helpers

### `getRoleBadge(role: string): JSX.Element`

Rol için Badge component döndürür.

```typescript
import { getRoleBadge } from "@/lib/user-utils";

function UserCard({ user }) {
  return <div>{getRoleBadge(user.role)}</div>;
}
```

**Output:**

- ADMIN → 🔴 Admin (destructive)
- COMPANY_OWNER → 🔵 Firma Sahibi (default)
- COMPANY_EMPLOYEE → ⚪ Çalışan (secondary)
- INDIVIDUAL_CUSTOMER → ⚫ Müşteri (outline)

---

### `getDepartmentLabel(department: string | null): string`

Departman enum'unu Türkçe'ye çevirir.

```typescript
getDepartmentLabel("PURCHASING"); // → "Satın Alma"
getDepartmentLabel(null); // → "-"
```

---

### `getRoleIcon(role: string): string`

Rol için emoji icon döndürür.

```typescript
getRoleIcon("ADMIN"); // → "👑"
getRoleIcon("COMPANY_OWNER"); // → "🏢"
```

---

### `getUserStatusLabel(isActive: boolean)`

Kullanıcı durumu için label ve variant döndürür.

```typescript
getUserStatusLabel(true); // → { label: "Aktif", variant: "default" }
getUserStatusLabel(false); // → { label: "Pasif", variant: "secondary" }
```

## 🔍 Validation

### `validateUserForm(data: UserFormData, isCreate: boolean): ValidationError[]`

Form verilerini valide eder.

```typescript
const errors = validateUserForm(
  {
    email: "test@example.com",
    password: "123",
    name: "John Doe",
    role: "COMPANY_OWNER",
    companyId: null,
  },
  true // isCreate
);

if (errors.length > 0) {
  toast.error(errors[0].message);
  // → "Şifre en az 6 karakter olmalıdır"
  // → "Firma sahibi veya çalışanı için firma seçimi zorunludur"
}
```

**Validation Rules:**

- Email: Required (create), format check
- Password: Required (create), min 6 characters
- Name: Required (create)
- CompanyId: Required if role is COMPANY_OWNER or COMPANY_EMPLOYEE

---

## 🧮 Business Logic

### `isCompanyRole(role: string): boolean`

Rol için firma gerekip gerekmediğini kontrol eder.

```typescript
isCompanyRole("COMPANY_OWNER"); // → true
isCompanyRole("COMPANY_EMPLOYEE"); // → true
isCompanyRole("ADMIN"); // → false
isCompanyRole("INDIVIDUAL_CUSTOMER"); // → false
```

**Use Case:** Conditional company dropdown rendering

```typescript
{
  isCompanyRole(form.role) && <Select>{/* Company dropdown */}</Select>;
}
```

---

## 🔎 Filtering

### `filterUsersBySearch<T>(users: T[], searchTerm: string): T[]`

Kullanıcıları ad veya email'e göre filtreler (case-insensitive).

```typescript
const filtered = filterUsersBySearch(users, "john");
// name: "John Doe" veya email: "john@example.com" içerenler
```

---

### `filterUsersByRole<T>(users: T[], roleFilter: string): T[]`

Kullanıcıları role göre filtreler.

```typescript
const admins = filterUsersByRole(users, "ADMIN");
const all = filterUsersByRole(users, "all"); // Filtreleme yok
```

---

### `filterUsersByStatus<T>(users: T[], statusFilter: string): T[]`

Kullanıcıları duruma göre filtreler.

```typescript
const activeUsers = filterUsersByStatus(users, "active");
const inactiveUsers = filterUsersByStatus(users, "inactive");
const pendingUsers = filterUsersByStatus(users, "pending");
```

---

### `filterUsers<T>(users: T[], filters): T[]`

Tüm filtreleri birden uygular (composite filter).

```typescript
const filtered = filterUsers(users, {
  searchTerm: "john",
  roleFilter: "COMPANY_OWNER",
  statusFilter: "active",
});
```

**Performance:** Tek pass ile tüm filtreler uygulanır.

---

## 📖 Usage Examples

### Complete CRUD Component

```typescript
import {
  getRoleBadge,
  getDepartmentLabel,
  isCompanyRole,
  validateUserForm,
  filterUsers,
} from "@/lib/user-utils";

function UserManagement() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    roleFilter: "all",
    statusFilter: "all",
  });

  // Apply filters
  const filteredUsers = filterUsers(users, filters);

  // Form validation
  const handleSubmit = (formData: UserFormData) => {
    const errors = validateUserForm(formData, true);
    if (errors.length > 0) {
      toast.error(errors[0].message);
      return;
    }
    // Submit form
  };

  return (
    <Table>
      {filteredUsers.map((user) => (
        <TableRow key={user.id}>
          <TableCell>{getRoleBadge(user.role)}</TableCell>
          <TableCell>{getDepartmentLabel(user.department)}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

### Conditional Company Field

```typescript
function UserForm({ form }) {
  return (
    <>
      <Select
        value={form.role}
        onValueChange={(role) => {
          setForm({
            ...form,
            role,
            // Auto-reset company if not company role
            companyId: isCompanyRole(role) ? form.companyId : null,
          });
        }}
      />

      {/* Show company dropdown only for company roles */}
      {isCompanyRole(form.role) && (
        <Select value={form.companyId}>{/* Company options */}</Select>
      )}
    </>
  );
}
```

---

## 🎯 Design Patterns

### Single Responsibility

Her fonksiyon tek bir iş yapar:

- `isCompanyRole` → Business rule check
- `validateUserForm` → Validation logic
- `filterUsers` → Data filtering

### Composition

Küçük fonksiyonlar compose edilir:

```typescript
// ✅ Good: Composable
const filtered = filterUsers(users, filters);

// ❌ Bad: Monolithic
function filterUsersComplexLogic(users, searchTerm, roleFilter, statusFilter) {
  // 100+ lines...
}
```

### Type Safety

Generic types ile type-safe filtering:

```typescript
filterUsers<User>(users, filters); // → User[]
filterUsers<Employee>(employees, filters); // → Employee[]
```

---

## 🔄 Migration Examples

### Before

```typescript
// ❌ Kod tekrarı
const getRoleBadge = (role: string) => {
  if (role === "ADMIN") return <Badge variant="destructive">Admin</Badge>;
  if (role === "COMPANY_OWNER") return <Badge>Firma Sahibi</Badge>;
  // ...
};

// Her component'ta aynı fonksiyon tekrarlanıyor
```

### After

```typescript
// ✅ Tek bir utility function
import { getRoleBadge } from "@/lib/user-utils";

// Hemen kullan
<div>{getRoleBadge(user.role)}</div>;
```

---

## 📊 Coverage

Bu utilities kullanıldığı yerler:

- `/app/(protected)/dashboard/admin/users/page.tsx` - User list page
- `/components/users/UserCard.tsx` - User card component
- `/components/users/UserForm.tsx` - User form component

---

## 🚀 Future Enhancements

Eklenebilecek utilities:

- `getUserPermissions(role)` - RBAC permissions
- `formatUserActivity(activity)` - Activity log formatting
- `exportUsersToCSV(users)` - CSV export
- `getUserInitials(name)` - Avatar initials

---

**Last Updated:** 2025-10-20
**Maintainer:** Admin User Management Team
