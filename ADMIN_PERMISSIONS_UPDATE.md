# 🔐 Admin Yetkilendirme Güncellemesi

## ✅ Tamamlandı

Admin'in tüm yetkilere sahip olması için gerekli güncellemeler yapıldı.

## 📋 Yapılan Değişiklikler

### Backend Güncellemeleri

#### 1. Sample Mutations (`server/src/mutations/sampleResolver.ts`)

**createSample**:

```typescript
// Eski ❌
if (userRole !== "CUSTOMER") {
  throw new Error("Only customers can create sample requests");
}

// Yeni ✅
if (userRole !== "CUSTOMER" && userRole !== "ADMIN") {
  throw new Error("Only customers and admins can create sample requests");
}
```

**deleteSample**:

```typescript
// Status kontrolü sadece admin değilse
if (!isAdmin) {
  if (status !== "REQUESTED" && status !== "REJECTED") {
    throw new Error("Can only delete samples in REQUESTED or REJECTED status");
  }
}
// Admin her durumda silebilir
```

**updateSampleStatus**:

```typescript
// Zaten var ✅
const isManufacture = existingSample.manufactureId === userId;
const isAdmin = userRole === "ADMIN";

if (!isManufacture && !isAdmin) {
  throw new Error("Only manufacturer can update sample status");
}
```

#### 2. Sample Queries (`server/src/query/sampleQuery.ts`)

**samples** (all samples query):

```typescript
// Role-based filtering
if (userRole === "CUSTOMER") {
  where.customerId = userId;
} else if (userRole === "MANUFACTURE") {
  where.OR = [{ manufactureId: userId }, { companyId: user.companyId }];
}
// Admins see all samples ✅
```

---

### Frontend Güncellemeleri

#### 1. Samples Page (`client/src/app/(protected)/dashboard/samples/page.tsx`)

**Role-based Query Selection**:

```typescript
const userRole = user?.role || "CUSTOMER";
const isAdmin = userRole === "ADMIN";
const isManufacturer = userRole === "MANUFACTURE";
const isCustomer = userRole === "CUSTOMER";

// Select appropriate query based on role
const samplesQuery = isAdmin
  ? ALL_SAMPLES_QUERY // Admin → tüm numuneler
  : isManufacturer
  ? ASSIGNED_SAMPLES_QUERY // Manufacturer → atanan numuneler
  : MY_SAMPLES_QUERY; // Customer → kendi numuneleri
```

**Create Button Permission**:

```typescript
{
  /* Admin and Customer can create samples */
}
{
  (isAdmin || isCustomer) && (
    <Button onClick={handleCreateClick}>
      <Plus className="h-4 w-4 mr-2" />
      Yeni Numune Talebi
    </Button>
  );
}
```

**Delete Button Permission**:

```typescript
{
  /* Admin can always delete, others only in REQUESTED/REJECTED status */
}
{
  (isAdmin ||
    sample.status === "REQUESTED" ||
    sample.status === "REJECTED") && (
    <Button onClick={() => handleDeleteClick(sample)}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}
```

**Dynamic Messages**:

```typescript
<p className="text-gray-500 mt-1">
  {isAdmin && "Tüm numune taleplerini görüntüleyin ve yönetin"}
  {isManufacturer && "Size atanan numune taleplerini görüntüleyin ve yönetin"}
  {isCustomer && "Numune taleplerini görüntüleyin ve yönetin"}
</p>
```

---

## 🎯 Yetki Matrisi

### Sample Management

| İşlem                        | Customer | Manufacturer | Admin |
| ---------------------------- | -------- | ------------ | ----- |
| Kendi numunelerini görüntüle | ✅       | -            | ✅    |
| Atanan numuneleri görüntüle  | -        | ✅           | ✅    |
| Tüm numuneleri görüntüle     | ❌       | ❌           | ✅    |
| Numune talebi oluştur        | ✅       | ❌           | ✅    |
| Numune durum güncelle        | ❌       | ✅           | ✅    |
| REQUESTED/REJECTED sil       | ✅       | ❌           | ✅    |
| Her durumda sil              | ❌       | ❌           | ✅    |
| Üretim bilgilerini güncelle  | ❌       | ✅           | ✅    |

---

## 🔄 Query Mapping

### Backend Queries

```graphql
# Admin için
query AllSamples {
  samples { ... }  # Tüm numuneler
}

# Manufacturer için
query AssignedSamples {
  assignedSamples { ... }  # Atanan numuneler
}

# Customer için
query MySamples {
  mySamples { ... }  # Kendi numuneleri
}
```

### Frontend Query Selection

```typescript
// Otomatik role-based query seçimi
const samplesQuery = isAdmin
  ? ALL_SAMPLES_QUERY
  : isManufacturer
  ? ASSIGNED_SAMPLES_QUERY
  : MY_SAMPLES_QUERY;

// Data extraction
const samples =
  samplesResult.data?.samples || // Admin
  samplesResult.data?.assignedSamples || // Manufacturer
  samplesResult.data?.mySamples || // Customer
  [];
```

---

## ✅ Test Senaryoları

### Admin Test

1. ✅ Login as Admin
2. ✅ Tüm kullanıcıların numunelerini görebilmeli
3. ✅ "Yeni Numune Talebi" butonu görünmeli
4. ✅ Her numunede delete butonu görünmeli
5. ✅ IN_PRODUCTION durumunda bile silebilmeli
6. ✅ Durum güncelleyebilmeli

### Manufacturer Test

1. ✅ Login as Manufacturer
2. ✅ Sadece kendisine atanan numuneleri görmeli
3. ✅ "Yeni Numune Talebi" butonu görünmemeli
4. ✅ Sadece REQUESTED/REJECTED'da delete butonu
5. ✅ Durum güncelleyebilmeli

### Customer Test

1. ✅ Login as Customer
2. ✅ Sadece kendi numunelerini görmeli
3. ✅ "Yeni Numune Talebi" butonu görünmeli
4. ✅ Sadece REQUESTED/REJECTED'da delete butonu
5. ✅ Durum güncelleyemez

---

## 📁 Değiştirilen Dosyalar

### Backend

- ✅ `server/src/mutations/sampleResolver.ts`
  - createSample: Admin eklendi
  - deleteSample: Admin için status kontrolü kaldırıldı

### Frontend

- ✅ `client/src/app/(protected)/dashboard/samples/page.tsx`
  - useAuth() hook eklendi
  - Role-based query selection
  - Role-based UI permissions
  - Dynamic messages

---

## 🚀 Deployment Notları

1. **Backend**: Schema yeniden generate edildi ✅
2. **Frontend**: Linter temiz ✅
3. **Breaking Changes**: Yok
4. **Database Migration**: Gerekli değil

---

## 📝 Özet

✅ Admin artık:

- Tüm numuneleri görebilir
- Numune oluşturabilir
- Her durumda silebilir
- Durum güncelleyebilir
- Tüm Customer ve Manufacturer yetkilerine sahip

✅ Diğer roller:

- Kendi yetki sınırları korundu
- Hiçbir yetki kaybı olmadı
- UI mesajları role-based

✅ Kod kalitesi:

- Linter hatasız
- Type-safe
- Clean code principles
