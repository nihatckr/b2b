# Unused Hooks Analysis Report

**Date**: 2 Kasım 2025  
**Analysis**: Hooks klasöründeki kullanılmayan ve gereksiz dosyalar

---

## ❌ Kullanılmayan Hooks (Silinmesi Önerilen)

### 1. `useFormActions.ts` ❌

**Durum**: Hiçbir yerde kullanılmıyor  
**Amaç**: React Hook Form için form action wrapper  
**Kullanım Yeri**: 0 dosya

**Neden Gereksiz**:

- React Hook Form zaten kendi `handleSubmit` fonksiyonunu sağlıyor
- Ek bir wrapper'a ihtiyaç yok
- Kodda hiç import edilmiyor

**Silme Önerisi**: ✅ **SİLİNEBİLİR**

---

### 2. `useFormModal.ts` ❌

**Durum**: Hiçbir yerde kullanılmıyor  
**Amaç**: Form modal state management  
**Kullanım Yeri**: 0 dosya

**Neden Gereksiz**:

- Generic modal state hook
- Projeye özgü değil
- Başka hook'larla (useModalState) aynı işlevi görüyor

**Silme Önerisi**: ✅ **SİLİNEBİLİR**

---

### 3. `useModalState.ts` ❌

**Durum**: Hiçbir yerde kullanılmıyor  
**Amaç**: Generic modal open/close state  
**Kullanım Yeri**: 0 dosya

**Neden Gereksiz**:

- Çok basit state management (useState ile yapılabilir)
- Projeye özgü değil
- Kimse kullanmıyor

**Silme Önerisi**: ✅ **SİLİNEBİLİR**

---

### 4. `useMutationState.ts` ❌

**Durum**: Hiçbir yerde kullanılmıyor  
**Amaç**: Generic mutation state with toast  
**Kullanım Yeri**: 0 dosya

**Neden Gereksiz**:

- `useOptimisticMutation.ts` zaten daha gelişmiş mutation handling sağlıyor
- Duplicate functionality
- URQL zaten kendi mutation state'ini yönetiyor

**Silme Önerisi**: ✅ **SİLİNEBİLİR**

---

## ✅ Kullanılan Hooks (Tutulmalı)

### 1. `use-mobile.ts` ✅

**Durum**: **KULLANILIYOR**  
**Kullanım Yeri**: `components/ui/sidebar.tsx`  
**Amaç**: Responsive design için mobile detection

```typescript
import { useIsMobile } from "@/hooks/use-mobile";
```

**Silme Önerisi**: ❌ **TUTULMALI** - shadcn/ui sidebar bileşeni kullanıyor

---

### 2. `useSubscription.ts` ✅

**Durum**: **KULLANILIYOR** (İçeriğinde URQL useSubscription re-export)  
**Kullanım Yeri**: `components/providers/notification-context.tsx`  
**Amaç**: Subscription (abonelik) sistemi için 8 farklı hook içeriyor

**İçerik**:

- `useSubscription()` - Subscription bilgileri
- `useActionCheck()` - Limit kontrolü
- `useFeatureAccess()` - Feature flag kontrolü
- `useUsageStats()` - Kullanım istatistikleri
- `useSubscriptionWarnings()` - Uyarı mesajları
- `useUpgradeSubscription()` - Upgrade mutation
- `useCancelSubscription()` - Cancel mutation
- `useReactivateSubscription()` - Reactivate mutation

**Silme Önerisi**: ❌ **TUTULMALI** - Backend subscription sistemi için kritik

---

### 3. `useAdminAuth.ts` ✅

**Durum**: **KULLANILIYOR**  
**Amaç**: Admin sayfaları için auth guard  
**Backend Sync**: ✅ 100%

**Silme Önerisi**: ❌ **TUTULMALI**

---

### 4. `useRoleAuth.ts` ✅

**Durum**: **KULLANILIYOR**  
**Amaç**: Generic role-based auth  
**Backend Sync**: ✅ 100%

**Silme Önerisi**: ❌ **TUTULMALI**

---

### 5. `usePermissions.ts` ✅

**Durum**: **KULLANILIYOR**  
**Amaç**: Permission ve department access control  
**Backend Sync**: ✅ 100%

**Silme Önerisi**: ❌ **TUTULMALI**

---

### 6. `withAdminAuth.tsx` ✅

**Durum**: **KULLANILIYOR**  
**Amaç**: Admin-only HOC  
**Backend Sync**: ✅ 100%

**Silme Önerisi**: ❌ **TUTULMALI**

---

### 7. `useGraphQL.ts` ✅

**Durum**: **KULLANILIYOR** (URQL wrapper)  
**Amaç**: URQL hooks re-export + documentation

```typescript
export { useMutation, useQuery, useSubscription } from "urql";
```

**Silme Önerisi**: ❌ **TUTULMALI** - URQL core hooks

---

### 8. `useOptimisticMutation.ts` ✅

**Durum**: **KULLANILIYOR**  
**Amaç**: Standardized mutation pattern with refetch  
**Özellikler**: Turkish toast, parallel refetch, error handling

**Silme Önerisi**: ❌ **TUTULMALI** - Mutation pattern standardizasyonu için kritik

---

### 9. `useRelayIds.ts` ✅

**Durum**: **KULLANILIYOR**  
**Amaç**: Relay Global ID encode/decode  
**Backend Pattern**: Pothos Relay

**Silme Önerisi**: ❌ **TUTULMALI** - Backend Relay pattern için gerekli

---

## 📊 Özet

| Hook Dosyası               | Kullanım Durumu  | Backend Sync | Önerisi |
| -------------------------- | ---------------- | ------------ | ------- |
| `useFormActions.ts`        | ❌ Kullanılmıyor | N/A          | 🗑️ SİL  |
| `useFormModal.ts`          | ❌ Kullanılmıyor | N/A          | 🗑️ SİL  |
| `useModalState.ts`         | ❌ Kullanılmıyor | N/A          | 🗑️ SİL  |
| `useMutationState.ts`      | ❌ Kullanılmıyor | N/A          | 🗑️ SİL  |
| `use-mobile.ts`            | ✅ Kullanılıyor  | N/A          | ✅ TUT  |
| `useSubscription.ts`       | ✅ Kullanılıyor  | ✅ 100%      | ✅ TUT  |
| `useAdminAuth.ts`          | ✅ Kullanılıyor  | ✅ 100%      | ✅ TUT  |
| `useRoleAuth.ts`           | ✅ Kullanılıyor  | ✅ 100%      | ✅ TUT  |
| `usePermissions.ts`        | ✅ Kullanılıyor  | ✅ 100%      | ✅ TUT  |
| `withAdminAuth.tsx`        | ✅ Kullanılıyor  | ✅ 100%      | ✅ TUT  |
| `useGraphQL.ts`            | ✅ Kullanılıyor  | N/A          | ✅ TUT  |
| `useOptimisticMutation.ts` | ✅ Kullanılıyor  | N/A          | ✅ TUT  |
| `useRelayIds.ts`           | ✅ Kullanılıyor  | ✅ 100%      | ✅ TUT  |

**Toplam**: 13 hook dosyası  
**Silinecek**: 4 dosya (❌)  
**Tutulacak**: 9 dosya (✅)

---

## 🗑️ Silme İşlemi

Aşağıdaki dosyalar güvenle silinebilir:

```bash
cd frontend/src/hooks
rm useFormActions.ts
rm useFormModal.ts
rm useModalState.ts
rm useMutationState.ts
```

**Etkilenen Dosyalar**: 0 (hiçbir yerde import edilmiyor)

---

## ✅ Kalacak Hook'ların Kategorileri

### 1. Authentication & Authorization (4 dosya)

- `useAdminAuth.ts` - Admin guard
- `useRoleAuth.ts` - Role-based guard
- `usePermissions.ts` - Permission control
- `withAdminAuth.tsx` - Admin HOC

### 2. GraphQL & Data Management (3 dosya)

- `useGraphQL.ts` - URQL wrapper
- `useOptimisticMutation.ts` - Mutation pattern
- `useRelayIds.ts` - ID encoding/decoding

### 3. Business Logic (1 dosya)

- `useSubscription.ts` - Subscription system (8 hooks)

### 4. UI Utilities (1 dosya)

- `use-mobile.ts` - Responsive detection

---

## 🎯 Projeye Özgüllük Analizi

### Projeye Özgü Hooks (Backend-aligned)

✅ `useAdminAuth.ts` - ProtexFlow RBAC sistem
✅ `useRoleAuth.ts` - ProtexFlow Role enum
✅ `usePermissions.ts` - ProtexFlow Permission system
✅ `useSubscription.ts` - ProtexFlow Subscription system
✅ `useRelayIds.ts` - ProtexFlow Pothos Relay pattern

### Generic Hooks (Herhangi bir projede kullanılabilir)

✅ `useGraphQL.ts` - URQL re-export (documentation)
✅ `useOptimisticMutation.ts` - Generic mutation pattern
✅ `use-mobile.ts` - Generic responsive hook

### Gereksiz Generic Hooks (Kullanılmayan)

❌ `useFormActions.ts` - Generic form helper
❌ `useFormModal.ts` - Generic modal state
❌ `useModalState.ts` - Generic modal state
❌ `useMutationState.ts` - Generic mutation state

---

## 📝 Sonuç

**Kullanılmayan 4 hook dosyası projeye özgü değil ve hiçbir yerde kullanılmıyor.**

Bu dosyaların silinmesi:

- ✅ Kod tabanını temizler
- ✅ Karmaşayı azaltır
- ✅ Maintenance yükünü düşürür
- ✅ Hiçbir fonksiyonelliği bozmaz (0 import)

**Önerilen Aksiyon**:
Kullanılmayan 4 hook dosyasını sil ve HOOKS_BACKEND_SYNC.md'yi güncelle.
