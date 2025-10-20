# Reusable Hooks

Bu klasör, uygulama genelinde tekrar kullanılabilir React hook'ları içerir.

## 📦 Mevcut Hook'lar

### 1. `useRelayIds` - Relay Global ID Yönetimi

Pothos GraphQL'in kullandığı Relay Global Object Identification pattern'i için yardımcı fonksiyonlar.

**Ne İçin Kullanılır:**

- GraphQL'den gelen Global ID'leri (Base64) numeric ID'lere çevirme
- Numeric ID'leri Global ID'lere çevirme
- Dropdown'larda doğru değeri seçmek için ID eşleştirme

**Kullanım:**

```typescript
import { useRelayIds } from "@/hooks/useRelayIds";

function MyComponent() {
  const { decodeGlobalId, encodeGlobalId, findGlobalIdByNumericId } =
    useRelayIds();

  // Delete mutation için numeric ID'ye çevirme
  const numericId = decodeGlobalId(user.id); // "Q29tcGFueTox" -> 1
  await deleteUser({ id: numericId });

  // Dropdown için Global ID bulma
  const companyGlobalId = findGlobalIdByNumericId(companies, user.companyId);

  return <Select value={companyGlobalId}>{/* ... */}</Select>;
}
```

**API:**

- `decodeGlobalId(globalId: string): number | null` - Base64 → numeric
- `encodeGlobalId(typeName: string, numericId: number): string` - numeric → Base64
- `findGlobalIdByNumericId(items: T[], numericId: number): string | undefined` - Liste içinde ara
- `decodeGlobalIds(globalIds: string[]): (number | null)[]` - Toplu çevirme
- `getTypeName(globalId: string): string | null` - Type adını çıkar

---

### 2. `useOptimisticMutation` - Optimistic UI Updates

Mutation'ları execute ederken otomatik olarak:

- Toast notification gösterme
- Query'leri refetch etme
- Error handling
- Loading state yönetimi

**Ne İçin Kullanılır:**

- CRUD işlemlerinde kod tekrarını önleme
- Tutarlı kullanıcı deneyimi (her mutation aynı şekilde çalışır)
- Otomatik cache invalidation

**Kullanım:**

```typescript
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { useMutation, useQuery } from "urql";

function UserManagement() {
  const [{ data: usersData }, refetchUsers] = useQuery({
    query: UsersDocument,
  });
  const [{ data: statsData }, refetchStats] = useQuery({
    query: StatsDocument,
  });
  const deleteUserMutation = useMutation(DeleteUserDocument);

  const { execute: deleteUser, loading } = useOptimisticMutation({
    mutation: deleteUserMutation,
    successMessage: "Kullanıcı başarıyla silindi",
    errorMessage: "Kullanıcı silinemedi",
    refetchQueries: [
      { refetch: refetchUsers, requestPolicy: "network-only" },
      { refetch: refetchStats, requestPolicy: "network-only" },
    ],
    onSuccess: () => console.log("✅ Deleted!"),
    debug: true, // Development için log'ları aç
  });

  return (
    <Button onClick={() => deleteUser({ id: userId })} disabled={loading}>
      {loading ? "Siliniyor..." : "Sil"}
    </Button>
  );
}
```

**Options:**

- `mutation: UseMutationResponse` - URQL mutation hook result
- `successMessage: string` - Başarılı toast mesajı
- `errorMessage: string | (error) => string` - Hata mesajı
- `refetchQueries?: Array<{refetch, requestPolicy}>` - Refetch edilecek query'ler
- `onSuccess?: (data) => void | Promise<void>` - Başarı callback'i
- `onError?: (error) => void | Promise<void>` - Hata callback'i
- `debug?: boolean` - Console log'ları aktif et

**Returns:**

- `execute: (variables) => Promise<OperationResult>` - Mutation'ı çalıştır
- `loading: boolean` - Loading state
- `error: CombinedError | undefined` - Hata state'i
- `data: T | undefined` - Response data

---

## 🎯 Best Practices

### ✅ DO:

```typescript
// ✅ Hook'ları component içinde kullan
function MyComponent() {
  const { decodeGlobalId } = useRelayIds();
  const { execute } = useOptimisticMutation({...});

  // Component logic
}

// ✅ Paralel refetch için Promise.all kullan
refetchQueries: [
  { refetch: refetchUsers, requestPolicy: "network-only" },
  { refetch: refetchStats, requestPolicy: "network-only" }
]

// ✅ Debug mode'u development'ta kullan
debug: process.env.NODE_ENV === "development"
```

### ❌ DON'T:

```typescript
// ❌ Hook'ları component dışında kullanma
const helper = useRelayIds(); // ❌ Not allowed outside component

// ❌ Conditional hooks kullanma
if (someCondition) {
  const { execute } = useOptimisticMutation({...}); // ❌ Breaks Rules of Hooks
}

// ❌ Fire-and-forget refetch (await kullanmadan)
refetchUsers({ requestPolicy: "network-only" }); // ❌ Cache güncellenme garantisi yok
setModalOpen(false); // ❌ Modal kapanıyor ama liste henüz güncellenmedi
```

---

## 📚 İlgili Dosyalar

- `/src/lib/user-utils.tsx` - User domain logic helpers
- `/src/lib/urql-client.ts` - URQL client configuration
- `/src/app/(protected)/dashboard/admin/users/page.tsx` - Usage example

---

## 🔄 Migration Guide

Eski kodları yeni hook'lara migrate etmek için:

### Before (Tekrar Eden Kod):

```typescript
// Her mutation'da aynı kod
const [, deleteUser] = useMutation(DeleteUserDocument);

const handleDelete = async (id: string) => {
  const numericId = atob(id).split(":")[1]; // ❌ Tekrar eden decode logic

  const result = await deleteUser({ id: parseInt(numericId) });

  if (result.error) {
    // ❌ Tekrar eden error handling
    toast.error("Hata", { description: "Silinemedi" });
    return;
  }

  toast.success("Başarılı", { description: "Silindi" }); // ❌ Tekrar eden toast
  refetchUsers({ requestPolicy: "network-only" }); // ❌ Refetch manuel
  refetchStats({ requestPolicy: "network-only" });
};
```

### After (Reusable Hooks):

```typescript
const { decodeGlobalId } = useRelayIds();
const deleteUserMutation = useMutation(DeleteUserDocument);

const { execute: deleteUser } = useOptimisticMutation({
  mutation: deleteUserMutation,
  successMessage: "Silindi",
  errorMessage: "Silinemedi",
  refetchQueries: [{ refetch: refetchUsers }, { refetch: refetchStats }],
});

// Artık sadece:
await deleteUser({ id: decodeGlobalId(userId) });
```

**Kazanımlar:**

- 50+ satır kod → 10 satır
- Tutarlı error handling
- Otomatik refetch
- Daha az bug riski

---

## 🚀 Gelecek Hook'lar

Eklenebilecek hook'lar:

- `useDebounce` - Input debouncing
- `useLocalStorage` - Persistent state
- `usePagination` - Sayfalama logic'i
- `useMediaQuery` - Responsive hooks
- `usePermissions` - RBAC permissions check

---

**Son Güncelleme:** 2025-10-20
**Geliştirici:** Admin User Management Team
