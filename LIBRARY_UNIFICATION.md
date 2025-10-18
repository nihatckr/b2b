# 🔄 Library System Unification - Complete

## ✅ TAMAMLANAN DEĞİŞİKLİKLER

### 📊 Birleştirme Özeti

**Önceki Durum:** 10 ayrı library model
- ❌ StandardColor
- ❌ StandardFabric
- ❌ StandardMaterial
- ❌ Color
- ❌ Fabric
- ❌ Material
- ❌ SizeGroup
- ❌ SeasonItem
- ❌ FitItem
- ❌ Certification

**Yeni Durum:** 1 unified model
- ✅ **LibraryItem** (tüm library tiplerini kapsar)

**Kazanç:**
- 🎯 10 model → 1 model = **-9 model**
- 🚀 %90 azalma
- 📦 Daha basit schema
- 🔧 Kolay bakım
- 🌱 Esnek genişleme

---

## 🏗️ YENİ MİMARİ

### LibraryCategory Enum

```prisma
enum LibraryCategory {
  COLOR         // Renk paleti
  FABRIC        // Kumaş kütüphanesi
  MATERIAL      // Aksesuar/Malzemeler
  SIZE_GROUP    // Beden grupları
  SEASON        // Sezon yönetimi
  FIT           // Kesim tipleri
  CERTIFICATION // Sertifikalar
}
```

### LibraryScope Enum

```prisma
enum LibraryScope {
  PLATFORM_STANDARD  // Admin tanımlı global standart
  COMPANY_CUSTOM     // Firma özel
}
```

### Unified LibraryItem Model

```prisma
model LibraryItem {
  id       Int            @id @default(autoincrement())
  scope    LibraryScope   @default(COMPANY_CUSTOM)
  category LibraryCategory

  // Universal Fields
  code        String?  @unique
  name        String
  nameTr      String?
  nameEn      String?
  nameEs      String?
  nameDe      String?
  nameZh      String?

  description String?  @db.Text
  imageUrl    String?  @db.Text

  // Category-Specific Data (JSON - Flexible structure)
  data        Json?

  // Common Metadata
  tags        Json?
  internalCode String?
  notes       String?  @db.Text

  // Status
  isActive    Boolean  @default(true)
  isPopular   Boolean  @default(false)

  // Relations
  company        Company?      @relation("CompanyLibraryItems")
  standardItem   LibraryItem?  @relation("StandardReference")
  companyItems   LibraryItem[] @relation("StandardReference")
  collections    Collection[]  @relation("CollectionCertifications")
  createdBy      User?         @relation("LibraryItemCreator")

  @@unique([companyId, category, name])
  @@map("library_items")
}
```

---

## 💾 DATA FIELD STRUCTURE

### 1. COLOR (Renk Paleti)

```json
{
  "pantone": "PANTONE 18-3838",
  "hex": "#FFFFFF",
  "rgb": "rgb(255,255,255)",
  "cmyk": "cmyk(0,0,0,0)",
  "ral": "RAL 9016",
  "ncs": "NCS S 0500-N",
  "category": "NEUTRAL",
  "season": "ALL"
}
```

### 2. FABRIC (Kumaş)

```json
{
  "composition": "%100 Cotton",
  "weight": 180,
  "width": 150,
  "fiberType": "COTTON",
  "construction": "Plain Weave",
  "texture": "Smooth",
  "finish": "Raw",
  "usage": "Shirts",
  "season": "ALL",
  "certifications": ["GOTS", "OEKO-TEX"],
  "supplier": "ABC Fabrics",
  "supplierCode": "SUP-001",
  "price": 15.50,
  "currency": "USD",
  "minOrder": 100,
  "leadTime": 15
}
```

### 3. MATERIAL (Aksesuar)

```json
{
  "materialType": "Metal",
  "size": "15mm",
  "color": "Gold",
  "brand": "YKK",
  "subCategory": "BUTTON",
  "finish": "Matte",
  "supplier": "XYZ Accessories",
  "price": 0.50,
  "minOrder": 1000
}
```

### 4. SIZE_GROUP (Beden Grubu)

```json
{
  "sizes": ["XS", "S", "M", "L", "XL"],
  "sizeCategory": "MEN"
}
```

### 5. SEASON (Sezon)

```json
{
  "year": 2025,
  "type": "SS",
  "fullName": "Spring/Summer 2025",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30"
}
```

### 6. FIT (Kesim)

```json
{
  "fitCategory": "UPPER"
}
```

### 7. CERTIFICATION (Sertifika)

```json
{
  "certCategory": "FIBER",
  "issuer": "GOTS International",
  "validFrom": "2024-01-01",
  "validUntil": "2025-12-31",
  "certificateNumber": "GOTS-2024-001",
  "certificateFile": "/uploads/certs/gots.pdf"
}
```

---

## 📝 KULLANIM ÖRNEKLERİ

### 1. Platform Standard Color Oluştur (Admin)

```typescript
const whiteColor = await prisma.libraryItem.create({
  data: {
    scope: "PLATFORM_STANDARD",
    category: "COLOR",
    code: "PAN-11-0601",
    name: "Bright White",
    nameTr: "Parlak Beyaz",
    nameEn: "Bright White",
    nameEs: "Blanco Brillante",
    data: {
      pantone: "PANTONE 11-0601 TPX",
      hex: "#FFFFFF",
      rgb: "rgb(255, 255, 255)",
      cmyk: "cmyk(0, 0, 0, 0)",
      ral: "RAL 9016",
      category: "NEUTRAL",
      season: "ALL"
    },
    tags: ["white", "beyaz", "basic", "neutral"],
    isActive: true,
    isPopular: true,
    createdById: adminUserId
  }
});
```

### 2. Firma Özel Kumaş Ekle (Company Custom)

```typescript
const customFabric = await prisma.libraryItem.create({
  data: {
    scope: "COMPANY_CUSTOM",
    category: "FABRIC",
    companyId: defactoId,
    code: "FAB-DEF-001",
    name: "Defacto Premium Cotton",
    nameTr: "Defacto Premium Pamuk",
    data: {
      composition: "%100 Organic Cotton",
      weight: 200,
      width: 160,
      fiberType: "COTTON",
      construction: "Twill",
      texture: "Soft",
      supplier: "Turkish Cotton Co.",
      supplierCode: "TCC-2024-001",
      price: 18.75,
      currency: "USD",
      minOrder: 500,
      leadTime: 20,
      certifications: ["GOTS", "OEKO-TEX", "BCI"]
    },
    tags: ["cotton", "premium", "organic", "sustainable"],
    internalCode: "DEF-FAB-001",
    isActive: true
  }
});
```

### 3. Standart Referans ile Firma Rengi

```typescript
// Platform standardını kullan
const companyWhite = await prisma.libraryItem.create({
  data: {
    scope: "COMPANY_CUSTOM",
    category: "COLOR",
    companyId: kotanId,
    standardItemId: whiteColor.id, // Platform standardına referans
    name: "Koton Beyaz",
    data: {
      hex: "#FEFEFE", // Firma kendi hex'ini override edebilir
      internalNote: "Firma içi renk kodu"
    },
    internalCode: "KTN-CLR-001"
  }
});
```

### 4. Aksesuar Oluştur

```typescript
const button = await prisma.libraryItem.create({
  data: {
    scope: "COMPANY_CUSTOM",
    category: "MATERIAL",
    companyId: zaraId,
    code: "MAT-BUT-GOLD-15",
    name: "Gold Metal Button 15mm",
    nameTr: "Altın Metal Düğme 15mm",
    imageUrl: "https://example.com/button.jpg",
    data: {
      materialType: "Metal",
      size: "15mm",
      color: "Gold",
      brand: "YKK",
      subCategory: "SNAP",
      finish: "Glossy",
      supplier: "XYZ Accessories",
      price: 0.75,
      currency: "EUR",
      minOrder: 2000
    },
    tags: ["button", "metal", "gold", "snap"]
  }
});
```

### 5. Sertifika ile Collection İlişkilendirme

```typescript
// Önce sertifika oluştur
const gotsCert = await prisma.libraryItem.create({
  data: {
    scope: "COMPANY_CUSTOM",
    category: "CERTIFICATION",
    companyId: hAndMId,
    code: "CERT-GOTS-2024",
    name: "GOTS Organic Textile Standard",
    nameTr: "GOTS Organik Tekstil Standardı",
    data: {
      certCategory: "FIBER",
      issuer: "GOTS International",
      validFrom: "2024-01-01",
      validUntil: "2025-12-31",
      certificateNumber: "GOTS-2024-H&M-001",
      certificateFile: "/uploads/certs/gots_hm_2024.pdf"
    }
  }
});

// Collection'a ekle
await prisma.collection.update({
  where: { id: collectionId },
  data: {
    certifications: {
      connect: { id: gotsCert.id }
    }
  }
});
```

### 6. Query Örnekleri

```typescript
// Tüm renkleri getir
const colors = await prisma.libraryItem.findMany({
  where: {
    category: "COLOR",
    isActive: true
  },
  orderBy: { name: "asc" }
});

// Firma özel kumaşları getir
const companyFabrics = await prisma.libraryItem.findMany({
  where: {
    companyId: defactoId,
    category: "FABRIC",
    scope: "COMPANY_CUSTOM"
  },
  include: {
    standardItem: true // Eğer standart referansı varsa
  }
});

// Platform standart aksesuarları getir
const standardMaterials = await prisma.libraryItem.findMany({
  where: {
    scope: "PLATFORM_STANDARD",
    category: "MATERIAL",
    isActive: true,
    isPopular: true
  }
});

// JSON içinde arama (örn: YKK marka aksesuarlar)
const ykkMaterials = await prisma.libraryItem.findMany({
  where: {
    category: "MATERIAL",
    data: {
      path: ["brand"],
      equals: "YKK"
    }
  }
});

// Fiyat aralığında kumaş ara
const affordableFabrics = await prisma.libraryItem.findMany({
  where: {
    category: "FABRIC",
    data: {
      path: ["price"],
      lte: 20.00
    }
  }
});
```

---

## 🔄 MİGRATION PLANI

### Adım 1: Database Migration

```bash
cd backend
npx prisma migrate dev --name unify_library_system
```

### Adım 2: Data Migration Script (Opsiyonel)

Eğer mevcut data varsa:

```typescript
// migrate-library-data.ts
async function migrateLibraryData() {
  // 1. Eski Color modelinden LibraryItem'a
  const oldColors = await prisma.color.findMany();
  for (const color of oldColors) {
    await prisma.libraryItem.create({
      data: {
        scope: "COMPANY_CUSTOM",
        category: "COLOR",
        companyId: color.companyId,
        name: color.name,
        code: color.code,
        data: {
          hex: color.hexCode,
          pantone: color.code
        },
        imageUrl: color.imageUrl,
        isActive: color.isActive
      }
    });
  }

  // 2. Fabric, Material, vb. için aynı işlemi tekrarla
  // ...
}
```

### Adım 3: Seed Data Güncelleme

```bash
npx prisma db seed
```

---

## 🎨 FRONTEND ÖNERİLERİ

### Library Management UI

```typescript
// Kategori bazlı tab sistemi
<Tabs>
  <Tab label="Renkler" category="COLOR" />
  <Tab label="Kumaşlar" category="FABRIC" />
  <Tab label="Aksesuarlar" category="MATERIAL" />
  <Tab label="Bedenler" category="SIZE_GROUP" />
  <Tab label="Sezonlar" category="SEASON" />
  <Tab label="Kesimler" category="FIT" />
  <Tab label="Sertifikalar" category="CERTIFICATION" />
</Tabs>

// Dynamic form based on category
<LibraryItemForm
  category={selectedCategory}
  scope="COMPANY_CUSTOM"
  onSubmit={handleSubmit}
/>
```

### GraphQL Resolver Örneği

```typescript
// Get library items by category
Query.libraryItems = async (_, { category, scope, companyId }) => {
  return prisma.libraryItem.findMany({
    where: {
      category,
      scope,
      companyId,
      isActive: true
    },
    orderBy: { name: "asc" }
  });
};

// Create library item
Mutation.createLibraryItem = async (_, { input }) => {
  return prisma.libraryItem.create({
    data: {
      ...input,
      data: input.data // JSON field
    }
  });
};
```

---

## ✅ AVANTAJLAR

### 1. **Basitlik**
- ✅ 10 model yerine 1 model
- ✅ Tek bir CRUD işlemi seti
- ✅ Daha az kod tekrarı

### 2. **Esneklik**
- ✅ Yeni kategori eklemek kolay (sadece enum'a ekle)
- ✅ JSON data field ile sınırsız özellik
- ✅ Standart + Custom mix kullanımı

### 3. **Performans**
- ✅ Tek tablo query'leri daha hızlı
- ✅ Unified indexing
- ✅ Daha az join

### 4. **Bakım**
- ✅ Tek migration yönetimi
- ✅ Tek API endpoint
- ✅ Unified permission logic

### 5. **Ölçeklenebilirlik**
- ✅ Yeni library tipi = sadece enum değeri
- ✅ Platform standart + firma özel aynı tabloda
- ✅ Multi-tenant ready

---

## ⚠️ DİKKAT EDİLMESİ GEREKENLER

### 1. **JSON Field Type Safety**
```typescript
// TypeScript type definitions kullan
interface ColorData {
  hex: string;
  pantone?: string;
  rgb?: string;
  category?: "NEUTRAL" | "WARM" | "COOL";
}

interface FabricData {
  composition: string;
  weight?: number;
  price?: number;
  supplier?: string;
}

// Zod schema ile validation
const colorDataSchema = z.object({
  hex: z.string().regex(/^#[0-9A-F]{6}$/),
  pantone: z.string().optional(),
  // ...
});
```

### 2. **Query Performance**
```typescript
// JSON path query için index ekle
// Sık kullanılan JSON field'lar için:
await prisma.$executeRaw`
  CREATE INDEX idx_library_data_price
  ON library_items ((data->>'price'));
`;
```

### 3. **Data Validation**
```typescript
// Category'ye göre validation
function validateLibraryData(category: LibraryCategory, data: any) {
  switch(category) {
    case "COLOR":
      return colorDataSchema.parse(data);
    case "FABRIC":
      return fabricDataSchema.parse(data);
    // ...
  }
}
```

---

## 🚀 SONRAKI ADIMLAR

- [x] ✅ Schema güncelleme tamamlandı
- [x] ✅ Prisma Client generate edildi
- [ ] ⏳ Migration çalıştırılacak
- [ ] ⏳ Seed data güncellenecek
- [ ] ⏳ GraphQL resolvers yazılacak
- [ ] ⏳ Frontend UI implement edilecek
- [ ] ⏳ Data migration script (eğer mevcut data varsa)

---

## 📚 KAYNAKLAR

- Prisma JSON Fields: https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json-fields
- Prisma Relations: https://www.prisma.io/docs/concepts/components/prisma-schema/relations
- TypeScript Type Safety: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html

---

**✨ Sonuç: 10 model → 1 model = %90 basitleşme!** 🎉
