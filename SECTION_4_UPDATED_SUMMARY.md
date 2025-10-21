# Section 4: UPDATED Development Plan Summary

## 🎯 ÖNEMLİ DEĞİŞİKLİK!

**YENİ GELİŞTİRME SIRASI:**

```
ÖNCE:
Week 1-3: Collections → Samples → Orders

ŞİMDİ:
Week 0 (3-4 gün): Library Management ← ÖNCE BU!
Week 1-3: Collections → Samples → Orders
```

---

## 🔍 Neden Library Önce?

### Collections Form'da Library'ye Bağımlı Alanlar:

```typescript
// Collections Create/Edit Form'da kullanıcılar şunları Library'den seçecek:

1. Colors (Renk Paleti)
   - Çoklu seçim: ["Navy Blue", "White", "Black"]
   - LibraryCategory: COLOR
   - Örnek: Koleksiyondaki tüm renk seçenekleri

2. Fit (Kesim Tipi)
   - Tekli seçim: "Slim Fit" veya "Regular Fit"
   - LibraryCategory: FIT
   - Örnek: Gömlek kesim stili

3. Size Groups (Beden Grupları)
   - Çoklu seçim: ["XS-XL", "6-16"]
   - LibraryCategory: SIZE_GROUP
   - Örnek: Yetişkin + çocuk beden grupları

4. Certifications (Sertifikalar)
   - Çoklu seçim: ["GOTS", "OEKO-TEX"]
   - LibraryCategory: CERTIFICATION
   - Örnek: Ürün sertifikaları

5. Fabric Composition (Kumaş - Opsiyonel)
   - Tekli seçim: "100% Cotton"
   - LibraryCategory: FABRIC
   - Örnek: Ana kumaş bileşimi
```

**Sonuç:** Library Management olmadan Collections form'u çalışmaz! ❌

---

## 📋 YENİ GELİŞTİRME SIRASI

### Priority 0: Library Management 🟣 PREREQUISITE

**Durum:** Backend ✅ 100% Hazır (LibraryItem unified model)

**Frontend Görevleri:**

```
Week 0 (3-4 gün):

Day 1:
- [ ] library.graphql oluştur
- [ ] npm run codegen çalıştır
- [ ] Library dashboard (library/page.tsx) - Tab yapısı

Day 2:
- [ ] Colors page (library/colors/page.tsx)
- [ ] ColorCard.tsx component
- [ ] ColorForm.tsx component
- [ ] ColorPicker widget

Day 3:
- [ ] Fits page (library/fits/page.tsx)
- [ ] Size Groups page (library/size-groups/page.tsx)
- [ ] Certifications page (library/certifications/page.tsx)

Day 4:
- [ ] Reusable Selectors:
  - ColorSelector.tsx (Collections form'da kullanılacak)
  - FitSelector.tsx
  - SizeGroupSelector.tsx
  - CertificationSelector.tsx
```

**Çıktılar:**

- ✅ 7 Library kategorisi yönetimi (Color, Fabric, Material, SizeGroup, Fit, Certification, Season)
- ✅ Platform Standards + Company Custom
- ✅ Reusable selector components (Collections form için)

**Detaylı Plan:** `LIBRARY_MANAGEMENT_PLAN.md`

---

### Priority 1: Core Business (Week 1-3)

#### 1.1 Collections Management (3-4 gün)

**ŞİMDİ Library selectors kullanabilir!** ✅

```tsx
// Collections Form artık çalışabilir:
import ColorSelector from "@/components/library/ColorSelector";
import FitSelector from "@/components/library/FitSelector";
import SizeGroupSelector from "@/components/library/SizeGroupSelector";

<CollectionForm>
  <ColorSelector value={colors} onChange={setColors} />
  <FitSelector value={fit} onChange={setFit} />
  <SizeGroupSelector value={sizeGroups} onChange={setSizeGroups} />
</CollectionForm>;
```

**Detaylı Plan:** `SECTION_4_IMPLEMENTATION_PLAN.md`

#### 1.2 Samples Management (5-6 gün)

#### 1.3 Orders Management (5-6 gün)

---

## 📅 Güncellenmiş Zaman Çizelgesi

| Hafta      | Özellik                | Süre        | Bağımlılık             |
| ---------- | ---------------------- | ----------- | ---------------------- |
| **Week 0** | **Library Management** | **3-4 gün** | **YOK (İlk önce bu!)** |
| Week 1-2   | Collections + Samples  | 8-10 gün    | ✅ Library hazır       |
| Week 3     | Orders                 | 5-6 gün     | ✅ Collections hazır   |
| Week 4-5   | Production + Tasks     | 8-10 gün    | ✅ Orders hazır        |
| Week 6-7   | Messages + Reviews     | 7-9 gün     | ✅ Samples hazır       |
| Week 8-9   | Analytics + Search     | 6-8 gün     | ✅ Tüm veriler var     |

**Toplam:** 9-10 hafta (önceki 8-9 hafta + 1 hafta Library)

---

## 🎯 İlk Adımlar (Hemen Başla!)

### 1. Library GraphQL Operations Oluştur

```bash
cd frontend/src/graphql
touch library.graphql
```

İçeriği ekle:

```graphql
query DashboardPlatformStandards($category: String) {
  platformStandards(category: $category) {
    id
    category
    code
    name
    description
    imageUrl
    data
    isPopular
  }
}

mutation DashboardCreateLibraryItem($input: CreateLibraryItemInput!) {
  createLibraryItem(input: $input) {
    id
    category
    name
  }
}

# ... (tam liste LIBRARY_MANAGEMENT_PLAN.md'de)
```

### 2. Codegen Çalıştır

```bash
cd frontend
npm run codegen
```

### 3. Library Pages Oluştur

```bash
mkdir -p src/app/\(protected\)/dashboard/library/colors/components
mkdir -p src/app/\(protected\)/dashboard/library/fits/components
mkdir -p src/app/\(protected\)/dashboard/library/size-groups/components
mkdir -p src/app/\(protected\)/dashboard/library/certifications/components

touch src/app/\(protected\)/dashboard/library/page.tsx
touch src/app/\(protected\)/dashboard/library/colors/page.tsx
touch src/app/\(protected\)/dashboard/library/fits/page.tsx
touch src/app/\(protected\)/dashboard/library/size-groups/page.tsx
touch src/app/\(protected\)/dashboard/library/certifications/page.tsx
```

### 4. Reusable Selectors Oluştur

```bash
mkdir -p src/components/library

touch src/components/library/ColorSelector.tsx
touch src/components/library/FitSelector.tsx
touch src/components/library/SizeGroupSelector.tsx
touch src/components/library/CertificationSelector.tsx
```

**Tam kod örnekleri:** `LIBRARY_MANAGEMENT_PLAN.md`

---

## 🔄 Collections Form Entegrasyonu (Library'den sonra)

Library hazır olduktan sonra Collections form'unda kullanım:

```tsx
// collections/components/CollectionForm.tsx
"use client";

import { useState } from "react";
import ColorSelector from "@/components/library/ColorSelector";
import FitSelector from "@/components/library/FitSelector";
import SizeGroupSelector from "@/components/library/SizeGroupSelector";
import CertificationSelector from "@/components/library/CertificationSelector";

export default function CollectionForm() {
  const [formData, setFormData] = useState({
    name: "",
    modelCode: "",
    season: "",
    colorIds: [], // Library'den seçilen renkler
    fitId: null, // Library'den seçilen kesim
    sizeGroupIds: [], // Library'den seçilen beden grupları
    certificationIds: [], // Library'den seçilen sertifikalar
  });

  return (
    <form>
      {/* Temel Bilgiler */}
      <Input
        label="Collection Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      {/* Library Selectors */}
      <FormField>
        <FormLabel>Colors</FormLabel>
        <ColorSelector
          value={formData.colorIds}
          onChange={(ids) => setFormData({ ...formData, colorIds: ids })}
          multiple={true}
        />
      </FormField>

      <FormField>
        <FormLabel>Fit Type</FormLabel>
        <FitSelector
          value={formData.fitId ? [formData.fitId] : []}
          onChange={(ids) => setFormData({ ...formData, fitId: ids[0] })}
          multiple={false}
        />
      </FormField>

      <FormField>
        <FormLabel>Size Groups</FormLabel>
        <SizeGroupSelector
          value={formData.sizeGroupIds}
          onChange={(ids) => setFormData({ ...formData, sizeGroupIds: ids })}
          multiple={true}
        />
      </FormField>

      <FormField>
        <FormLabel>Certifications</FormLabel>
        <CertificationSelector
          value={formData.certificationIds}
          onChange={(ids) =>
            setFormData({ ...formData, certificationIds: ids })
          }
          multiple={true}
        />
      </FormField>

      <Button type="submit">Create Collection</Button>
    </form>
  );
}
```

---

## 📊 Backend Yapısı (Zaten Hazır ✅)

### LibraryItem Model (Unified)

```prisma
model LibraryItem {
  id       Int            @id @default(autoincrement())
  scope    LibraryScope   @default(COMPANY_CUSTOM)
  category LibraryCategory

  // Universal Fields
  code        String?  @unique
  name        String
  description String?  @db.Text
  imageUrl    String?  @db.Text

  // Category-Specific Data (JSON)
  data        Json?    // COLOR: { hex, pantone, rgb, cmyk }
                       // FIT: { fitCategory, description }
                       // SIZE_GROUP: { sizes: ["XS", "S", "M"] }
                       // CERTIFICATION: { issuer, validUntil }

  // Company relation
  company     Company?   @relation(fields: [companyId], references: [id])
  companyId   Int?

  // Standard item reference
  standardItem   LibraryItem?  @relation("StandardItemExtension", fields: [standardItemId], references: [id])
  standardItemId Int?

  isActive    Boolean   @default(true)
  isPopular   Boolean   @default(false)

  createdBy   User?     @relation(fields: [createdById], references: [id])
  createdById Int?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum LibraryCategory {
  COLOR
  FABRIC
  MATERIAL
  SIZE_GROUP
  SEASON
  FIT
  CERTIFICATION
}

enum LibraryScope {
  PLATFORM_STANDARD  // Admin tanımlı, herkes görebilir
  COMPANY_CUSTOM     // Firma özel, sadece firma üyeleri
}
```

### GraphQL Queries (Hazır ✅)

```graphql
# Platform standartları (herkes görebilir)
query platformStandards($category: String) {
  platformStandards(category: $category) {
    id
    category
    name
    data
  }
}

# Firma özel library (sadece firma üyeleri)
query myCompanyLibrary($category: String) {
  myCompanyLibrary(category: $category) {
    id
    category
    name
    data
  }
}
```

---

## ✅ Başarı Kriterleri (Library)

Library Management tamamlandığında:

- [ ] 7 kategori için CRUD (Color, Fabric, Material, SizeGroup, Fit, Certification, Season)
- [ ] Platform Standards görünür (herkes)
- [ ] Company Custom görünür (sadece firma üyeleri)
- [ ] Reusable selector components çalışıyor
- [ ] ColorSelector çoklu seçim yapabiliyor
- [ ] FitSelector tekli seçim yapabiliyor
- [ ] SizeGroupSelector çoklu seçim yapabiliyor
- [ ] CertificationSelector çoklu seçim yapabiliyor
- [ ] Admin platform standartları oluşturabilir
- [ ] Üreticiler kendi library items ekleyebilir
- [ ] Permission checks aktif

**SONRA Collections'a geçilebilir!** ✅

---

## 🔗 İlgili Dokümanlar

1. **LIBRARY_MANAGEMENT_PLAN.md** ← Önce oku (tam detay)
2. **SECTION_4_IMPLEMENTATION_PLAN.md** ← Collections için (Library'den sonra)
3. **SECTION_4_QUICK_START.md** ← Hızlı başlangıç
4. **SECTION_4_VISUAL_SUMMARY.md** ← Görsel özet

---

## 🎯 ÖNEMLİ HATIRLATMALAR

### ⚠️ MUTLAKA LIBRARY ÖNCE!

```
❌ YANLIŞ SIRA:
Collections → Library yok → Form çalışmaz

✅ DOĞRU SIRA:
Library → Collections → Form Library'den seçim yapabiliyor
```

### 🔄 Geliştirme Akışı

```
1. Library GraphQL operations oluştur
   ↓
2. npm run codegen
   ↓
3. Library pages oluştur (Colors, Fits, etc.)
   ↓
4. Reusable selectors oluştur
   ↓
5. Test et (Platform standards + Company custom)
   ↓
6. ✅ Library hazır!
   ↓
7. Collections form'u geliştir (Library selectors kullan)
```

### 📦 Library Backend Status

- ✅ LibraryItem model (unified)
- ✅ 7 LibraryCategory enum
- ✅ 2 LibraryScope (PLATFORM_STANDARD, COMPANY_CUSTOM)
- ✅ libraryQuery.ts (5 queries)
- ✅ libraryMutation.ts (3 mutations)
- ✅ Permission checks (Admin/Company)
- ✅ JSON data field (flexible structure)

**Backend tamamen hazır - Frontend geliştirmeye başlayabilirsiniz!** 🚀

---

## 🏁 İlk Komutlar

```bash
# 1. Library GraphQL dosyası oluştur
cd frontend/src/graphql
touch library.graphql

# 2. İçeriği ekle (LIBRARY_MANAGEMENT_PLAN.md'den kopyala)
# vim library.graphql veya VS Code'da aç

# 3. Codegen çalıştır
cd ../..
npm run codegen

# 4. Library pages yapısını oluştur
mkdir -p src/app/\(protected\)/dashboard/library/{colors,fits,size-groups,certifications}/components

# 5. Components klasörü oluştur
mkdir -p src/components/library

# 6. İlk sayfayı oluştur
touch src/app/\(protected\)/dashboard/library/page.tsx

# 7. Backend'i başlat (eğer çalışmıyorsa)
cd ../../backend
npm run dev

# 8. Frontend'i başlat (başka terminal)
cd ../frontend
npm run dev

# 9. Tarayıcıda aç
# http://localhost:3000/dashboard/library
```

---

**Status:** Library Management geliştirmeye hazır (Backend ✅ %100)

**İlk Hedef:** Library Management (3-4 gün)

**İkinci Hedef:** Collections Management (Library'den sonra)

**Son Hedef:** Tam Section 4 tamamlanması (9-10 hafta)
