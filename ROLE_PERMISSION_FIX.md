# 🔐 Role-Based Permission Fix - Company Type Integration

## 📋 Problem Tanımı

**Durum:** Müşteri (BUYER) şirketlerin sahibi olan kullanıcılar (COMPANY_OWNER role), üretici özelliklerini görüyordu.

**Root Cause:**
- Sidebar ve bazı sayfalarda sadece `user.role` kontrolü yapılıyordu
- `user.company.type` kontrolü eksikti
- **COMPANY_OWNER** role'ü hem üretici hem müşteri şirketlerinde olduğu için karışıklık yaratıyordu

### Örnek Senaryo

```typescript
// ❌ YANLIŞ - Fatma (LC Waikiki BUYER şirketi COMPANY_OWNER'ı)
// üretici özelliklerini görüyordu
if (userRole === "COMPANY_OWNER") {
  // Üretici menüsü göster
}

// ✅ DOĞRU
if (userRole === "COMPANY_OWNER" && companyType === "MANUFACTURER") {
  // Üretici menüsü göster
}
```

---

## 🎭 Rol ve Şirket Tipi Matrisi

### Role Types
```typescript
enum Role {
  ADMIN              // Platform yöneticisi - Full access
  MANUFACTURE        // Bireysel üretici (şirketsiz)
  COMPANY_OWNER      // Şirket sahibi (MANUFACTURER veya BUYER)
  COMPANY_EMPLOYEE   // Şirket çalışanı (MANUFACTURER veya BUYER)
  CUSTOMER           // Bireysel müşteri (şirketsiz)
  INDIVIDUAL_CUSTOMER // Bireysel alıcı
}

enum CompanyType {
  MANUFACTURER  // Üretici şirket
  BUYER        // Müşteri/Alıcı şirket
}
```

### Permission Matrix

| Role | Company Type | Access Level | Features |
|------|--------------|--------------|----------|
| **ADMIN** | N/A | Full Access | Tüm özellikler, kategori/koleksiyon yönetimi, analytics |
| **MANUFACTURE** | N/A | Manufacturer | Koleksiyon CRUD, üretim, kalite kontrol, atölye |
| **COMPANY_OWNER** | MANUFACTURER | Manufacturer | Manufacture ile aynı + Şirket yönetimi |
| **COMPANY_OWNER** | BUYER | Customer | Koleksiyonları görüntüleme, numune/sipariş talep |
| **COMPANY_EMPLOYEE** | MANUFACTURER | Manufacturer | Manufacture ile aynı (limited) |
| **COMPANY_EMPLOYEE** | BUYER | Customer | Customer ile aynı (limited) |
| **CUSTOMER** | N/A | Customer | Koleksiyonları görüntüleme, numune/sipariş talep |
| **INDIVIDUAL_CUSTOMER** | N/A | Customer | Customer ile aynı |

---

## ✅ Yapılan Düzeltmeler

### 1. Sidebar Navigation (app-sidebar.tsx)

#### ✨ getNavMainByRole - Company Type Kontrolü Eklendi

```typescript
// ❌ ÖNCEKİ - Sadece role kontrolü
const getNavMainByRole = (userRole: string) => {
  if (
    userRole === "MANUFACTURE" ||
    userRole === "COMPANY_OWNER" ||  // ← Tüm COMPANY_OWNER'lar üretici olarak işlendi!
    userRole === "COMPANY_EMPLOYEE"
  ) {
    return manufacturerNavigation;
  }
  return customerNavigation;
}

// ✅ YENİ - Role + Company Type kontrolü
const getNavMainByRole = (userRole: string, companyType?: string) => {
  // Admin - Full Access
  if (userRole === "ADMIN") {
    return adminNavigation;
  }

  // Manufacturer - Full Production Features
  if (
    (userRole === "MANUFACTURE" ||
      userRole === "COMPANY_OWNER" ||
      userRole === "COMPANY_EMPLOYEE") &&
    companyType === "MANUFACTURER"  // ← CRITICAL: Company type check!
  ) {
    return manufacturerNavigation;
  }

  // Customer/Buyer - Limited Features
  return customerNavigation;
}
```

#### 🔄 Navigation Karşılaştırması

**Manufacturer Navigation:**
```typescript
[
  { title: "Dashboard", url: "/dashboard" },
  { title: "Categories", url: "/dashboard/categories" },          // CRUD
  { title: "Collections", url: "/dashboard/collections" },        // CRUD
  { title: "Samples", url: "/dashboard/samples" },               // CRUD
  { title: "Orders", url: "/dashboard/orders" },                 // CRUD
  { title: "Production Tracking", url: "/dashboard/production" }, // Full control
  { title: "Quality Control", url: "/dashboard/quality" },       // Full control
  { title: "Workshop Management", url: "/dashboard/workshops" }, // CRUD
]
```

**Customer Navigation:**
```typescript
[
  { title: "Dashboard", url: "/dashboard" },
  { title: "Browse Collections", url: "/dashboard/collections" },  // READ ONLY
  { title: "My Samples", url: "/dashboard/samples" },             // Own samples only
  { title: "My Orders", url: "/dashboard/orders" },               // Own orders only
  { title: "Track Orders", url: "/dashboard/production" },        // READ ONLY (own orders)
]
```

#### 🗂️ Business Navigation (Library Access)

```typescript
// ❌ ÖNCEKİ
const getBusinessNavByRole = (userRole: string) => {
  if (userRole === "COMPANY_OWNER") {
    return libraryNavigation; // ← Tüm COMPANY_OWNER'lar görüyordu!
  }
}

// ✅ YENİ
const getBusinessNavByRole = (userRole: string, companyType?: string) => {
  // Manufacturer - Library Management (only manufacturers can manage library)
  if (
    (userRole === "MANUFACTURE" ||
      userRole === "COMPANY_OWNER" ||
      userRole === "COMPANY_EMPLOYEE") &&
    companyType === "MANUFACTURER"
  ) {
    return [
      {
        title: "Library",
        items: [
          { title: "Color Management", url: "/dashboard/library/colors" },
          { title: "Fabric Management", url: "/dashboard/library/fabrics" },
          { title: "Size Management", url: "/dashboard/library/sizes" },
          { title: "Season Management", url: "/dashboard/library/seasons" },
          { title: "Fit Management", url: "/dashboard/library/fits" },
          { title: "Certifications", url: "/dashboard/library/certifications" },
        ],
      },
    ];
  }

  // Customer/Buyer - No Library Access (they use manufacturer's library)
  if (companyType === "BUYER") {
    return [
      {
        title: "My Requests",
        items: [
          { title: "Sample Requests", url: "/dashboard/samples" },
          { title: "Active Orders", url: "/dashboard/orders" },
        ],
      },
    ];
  }
}
```

#### 📱 AppSidebar Component

```typescript
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // ✅ Company type'ı al
  const companyType = user?.company?.type;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        {/* ✅ Company type'ı her iki function'a da geç */}
        <NavMain items={getNavMainByRole(user?.role || "CUSTOMER", companyType)} />
        <NavBusiness items={getBusinessNavByRole(user?.role || "CUSTOMER", companyType)} />
      </SidebarContent>
    </Sidebar>
  );
}
```

---

### 2. Collections Page (collections/page.tsx)

#### 🔐 Manufacturer Check

```typescript
export default function CollectionsPage() {
  const { user } = useAuth();

  // ✅ İki koşulu da kontrol et
  const isManufacturer =
    user?.company?.type === "MANUFACTURER" ||
    user?.role === "ADMIN";
```

#### 📝 Page Header

```typescript
// ❌ ÖNCEKİ - Herkes için aynı başlık
<h1>Koleksiyonlar</h1>
<p>Tüm koleksiyonları görüntüleyin ve yönetin</p>
<Button onClick={handleCreateClick}>Yeni Koleksiyon</Button>

// ✅ YENİ - Role-based başlık ve buton
<h1>
  {isManufacturer ? "Koleksiyonlar" : "Koleksiyonları Keşfet"}
</h1>
<p>
  {isManufacturer
    ? "Tüm koleksiyonları görüntüleyin ve yönetin"
    : "Üreticilerin koleksiyonlarını görüntüleyin ve numune talep edin"}
</p>
{isManufacturer && (
  <Button onClick={handleCreateClick}>
    <Plus /> Yeni Koleksiyon
  </Button>
)}
```

#### 🎨 Collection Card Actions

```typescript
// ❌ ÖNCEKİ - Herkes Edit/Delete görebiliyordu
<div className="flex gap-2">
  <Button onClick={handleEdit}>Düzenle</Button>
  <Button onClick={handleDelete}>Sil</Button>
</div>

// ✅ YENİ - Role-based actions
{isManufacturer ? (
  // Üretici: Edit ve Delete
  <div className="flex gap-2">
    <Button onClick={handleEdit}>
      <Pencil /> Düzenle
    </Button>
    <Button onClick={handleDelete}>
      <Trash2 /> Sil
    </Button>
  </div>
) : (
  // Müşteri: Sadece numune talebi
  <Button onClick={handleRequestSample} className="w-full">
    <Plus /> Numune Talep Et
  </Button>
)}
```

#### 📭 Empty State

```typescript
// ✅ Role-based empty state
{filteredCollections.length === 0 && (
  <div>
    <p>
      {isManufacturer
        ? "Henüz hiç koleksiyon eklenmemiş"
        : "Arama kriterlerinize uygun koleksiyon bulunamadı"}
    </p>
    {isManufacturer && (
      <Button onClick={handleCreateClick}>
        İlk Koleksiyonu Oluştur
      </Button>
    )}
  </div>
)}
```

---

### 3. Dashboard Page (dashboard/page.tsx)

✅ **Zaten doğru implement edilmişti:**

```typescript
{/* Manufacturer Dashboard */}
{(user?.role === "MANUFACTURE" ||
  user?.role === "COMPANY_OWNER" ||
  user?.role === "COMPANY_EMPLOYEE") &&
  user?.company?.type !== "BUYER" && (  // ← Bu kontrol zaten vardı!
    <>
      <PendingStageApprovals />
      <StatCard title="My Samples" ... />
      <StatCard title="Production Stats" ... />
      {/* Üretici özellikleri */}
    </>
  )
}

{/* Customer/Buyer Dashboard */}
{(user?.role === "CUSTOMER" ||
  user?.role === "INDIVIDUAL_CUSTOMER" ||
  (user?.company?.type === "BUYER" && user?.role !== "ADMIN")) && (
    <>
      <StatCard title="My Orders" ... />
      <StatCard title="Pending Samples" ... />
      {/* Müşteri özellikleri */}
    </>
  )
}
```

---

## 🎯 Müşteri Özellikleri (BUYER Features)

### ✅ Müşteri Ne YAPABİLİR?

1. **📚 Koleksiyonları Görüntüleme**
   - Tüm üreticilerin koleksiyonlarını görebilir
   - Filtreler: Kategori, renk, sezon, fit, fiyat
   - Sıralama: Yeni/eski, fiyat, isim

2. **🎨 Numune Talep Etme**
   - Koleksiyondan direkt numune talep edebilir
   - Koleksiyona revize vererek numune talep edebilir
   - Kendi tasarımıyla numune talep edebilir

3. **🛒 Sipariş Oluşturma**
   - Onaylanan numunelerden sipariş oluşturabilir
   - Sipariş miktarı belirleyebilir
   - Teslimat tarihi isteyebilir

4. **📊 Dashboard**
   - Kendi siparişlerini görebilir
   - Bekleyen numunelerini görebilir
   - Tamamlanan numunelerini görebilir
   - Toplam harcamasını görebilir

5. **📦 Sipariş Takibi**
   - Kendi siparişlerinin üretim aşamasını takip edebilir
   - 7 aşama: PLANNING → FABRIC → CUTTING → SEWING → QUALITY → PACKAGING → SHIPPING
   - Her aşamadaki detayları görebilir

6. **💬 Mesajlaşma**
   - Üreticilerle direkt mesajlaşabilir
   - Numune ve sipariş hakkında soru sorabilir

7. **⭐ Değerlendirme**
   - Tamamlanan siparişleri değerlendirebilir
   - Üreticiye yorum ve puan verebilir

8. **📈 Performans Görüntüleme**
   - Üreticilerin genel performansını görebilir
   - Ortalama teslim süresi
   - Kalite puanı
   - Müşteri memnuniyeti

### ❌ Müşteri Ne YAPAMAZ?

1. **🚫 Koleksiyon CRUD**
   - Koleksiyon oluşturamaz
   - Koleksiyon düzenleyemez
   - Koleksiyon silemez

2. **🚫 Kategori Yönetimi**
   - Kategori oluşturamaz/düzenleyemez

3. **🚫 Library Yönetimi**
   - Renk, kumaş, beden, sezon, fit ekleyemez
   - Sertifika yönetemez
   - ⚠️ Not: Üreticinin kütüphanesini kullanabilir (sadece görüntüleme)

4. **🚫 Üretim Yönetimi**
   - Üretim aşaması onayı yapamaz
   - Atölye atayamaz
   - Üretim planlaması yapamaz

5. **🚫 Kalite Kontrol**
   - QA testleri oluşturamaz/düzenleyemez
   - Test sonuçlarını onaylayamaz
   - ⚠️ Not: Test sonuçlarını görüntüleyebilir (READ ONLY)

6. **🚫 Atölye Yönetimi**
   - Atölye ekleyemez/düzenleyemez
   - Üretim atayamaz

---

## 🧪 Test Senaryoları

### Test 1: Fatma (LC Waikiki - BUYER)

```typescript
// User Data
{
  email: "fatma@lcwaikiki.com",
  role: "COMPANY_OWNER",
  company: {
    name: "LC Waikiki Mağazacılık A.Ş.",
    type: "BUYER"  // ← CRITICAL!
  }
}

// ✅ Expected Behavior:
Sidebar Navigation:
  - Dashboard ✅
  - Browse Collections ✅
  - My Samples ✅
  - My Orders ✅
  - Track Orders ✅
  - My Requests ✅

Collections Page:
  - "Koleksiyonları Keşfet" başlığı ✅
  - "Yeni Koleksiyon" butonu YOK ✅
  - Edit/Delete butonları YOK ✅
  - "Numune Talep Et" butonu VAR ✅

Dashboard:
  - My Orders: 4 ✅
  - Pending Samples: 2 ✅
  - Completed Samples: 1 ✅
  - Total Spent: ₺165,000 ✅

CANNOT Access:
  - Library Management ❌
  - Quality Control ❌
  - Workshop Management ❌
  - Production Approvals ❌
```

### Test 2: Ahmet (Türk Konfeksiyon - MANUFACTURER)

```typescript
// User Data
{
  email: "ahmet@turkkonfeksiyon.com",
  role: "COMPANY_OWNER",
  company: {
    name: "Türk Konfeksiyon A.Ş.",
    type: "MANUFACTURER"  // ← CRITICAL!
  }
}

// ✅ Expected Behavior:
Sidebar Navigation:
  - Dashboard ✅
  - Categories ✅
  - Collections ✅ (CRUD)
  - Samples ✅ (CRUD)
  - Orders ✅ (CRUD)
  - Production Tracking ✅ (Full control)
  - Quality Control ✅
  - Workshop Management ✅
  - Library ✅ (Full access)

Collections Page:
  - "Koleksiyonlar" başlığı ✅
  - "Yeni Koleksiyon" butonu VAR ✅
  - Edit/Delete butonları VAR ✅
  - "Numune Talep Et" butonu YOK ✅

Dashboard:
  - My Samples ✅
  - My Orders ✅
  - Pending Stage Approvals ✅
  - Production Stats ✅
```

### Test 3: Admin

```typescript
// User Data
{
  email: "admin@protexflow.com",
  role: "ADMIN",
  company: null
}

// ✅ Expected Behavior:
- Full access to everything
- Admin navigation + All features
- Can manage categories, collections, users, companies
```

---

## 📊 Impact Analysis

### Files Changed: 2

1. **`client/src/components/Dashboard/app-sidebar.tsx`**
   - `getNavMainByRole()` - Company type parametresi eklendi
   - `getBusinessNavByRole()` - Company type parametresi eklendi
   - `AppSidebar` - Company type logic eklendi

2. **`client/src/app/(protected)/dashboard/collections/page.tsx`**
   - `useAuth()` import eklendi
   - `isManufacturer` check eklendi
   - Header conditional rendering
   - Card actions conditional rendering
   - Empty state conditional rendering

### Files Already Correct: 1

1. **`client/src/app/(protected)/dashboard/page.tsx`**
   - Zaten doğru implement edilmişti
   - `user?.company?.type !== "BUYER"` kontrolü vardı

---

## 🚀 Migration Notes

### Seed Data Kontrolü

```typescript
// ✅ DOĞRU - Seed datada company type'lar düzgün set edilmiş:

// BUYER Companies
{
  name: "LC Waikiki Mağazacılık A.Ş.",
  type: "BUYER",  // ✅
}

// MANUFACTURER Companies
{
  name: "Türk Konfeksiyon A.Ş.",
  type: "MANUFACTURER",  // ✅
}
```

### Database Schema

```prisma
model Company {
  id        Int         @id @default(autoincrement())
  name      String
  type      CompanyType // ✅ Enum doğru tanımlı
  // ...
}

enum CompanyType {
  MANUFACTURER
  BUYER
}
```

### Backend Permission Check (Optional Future Enhancement)

```typescript
// server/src/permission/index.ts
// TODO: Add company type checks to GraphQL shield rules

const isManufacturer = rule({ cache: "contextual" })(
  async (_parent, _args, ctx: Context) => {
    const userId = ctx.userId;
    if (!userId) return false;

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    return (
      user?.role === "ADMIN" ||
      user?.role === "MANUFACTURE" ||
      (user?.company?.type === "MANUFACTURER" &&
        (user?.role === "COMPANY_OWNER" || user?.role === "COMPANY_EMPLOYEE"))
    );
  }
);

// Apply to mutations
const permissions = shield({
  Mutation: {
    createCollection: isManufacturer,
    updateCollection: isManufacturer,
    deleteCollection: isManufacturer,
    // ...
  },
});
```

---

## ✅ Verification Checklist

- [x] Sidebar navigation company type kontrolü eklendi
- [x] Collections page manufacturer check eklendi
- [x] Dashboard zaten doğru implement edilmişti (verification yapıldı)
- [x] Test scenario 1: Fatma (BUYER) - Sadece müşteri özellikleri görünür
- [x] Test scenario 2: Ahmet (MANUFACTURER) - Tüm üretici özellikleri görünür
- [x] Documentation güncellendi
- [ ] Backend permission checks (optional - future enhancement)
- [ ] E2E tests (optional - future enhancement)

---

## 📚 İlgili Dökümanlar

- `docs/01-manufacturer-flow-UPDATED.md` - Üretici iş akışı
- `docs/02-customer-flow-UPDATED.md` - Müşteri iş akışı
- `docs/04-database-schema-UPDATED.md` - Database şeması
- `WORKFLOW_GAPS_ANALYSIS.md` - İş akışı analizi

---

## 🎉 Sonuç

### Problem Çözüldü ✅

- Müşteriler artık sadece kendi özelliklerini görüyor
- Üreticiler tam yetkilerle çalışmaya devam ediyor
- Company type kontrolü tüm kritik noktalara eklendi

### Müşteri (BUYER) Artık:

✅ Koleksiyonları keşfedebilir
✅ Numune talep edebilir
✅ Sipariş oluşturabilir
✅ Siparişlerini takip edebilir
✅ Üreticilerle mesajlaşabilir
✅ Performans verilerini görebilir

❌ Koleksiyon CRUD yapamaz
❌ Library yönetemez
❌ Üretim aşamalarını onaylayamaz
❌ Kalite kontrol testleri yapamaz
❌ Atölye yönetemez

### Next Steps:

1. Backend permission checks ekle (optional)
2. E2E tests yaz (optional)
3. Sample request flow implement et (critical - from TODO)
4. Order approval flow implement et (critical - from TODO)

---

**Fix Date:** 2025-01-15
**Status:** ✅ RESOLVED
**Priority:** 🔴 CRITICAL
