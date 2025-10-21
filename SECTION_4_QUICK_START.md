# Section 4: Quick Start Guide

## 🎯 Ne Yapacağız?

Backend'de **36 hazır GraphQL modülü** var, ama frontend'de sadece **10 modül** kullanılıyor (%27 kapsam).

**Eksik olanlar**: Collections, Samples, Orders, Production, Tasks, Messages, Library, Reviews, Questions, Analytics, Workshops, Advanced Search

**Hedef**: Backend'deki TÜM özellikleri frontend'e entegre etmek (gerçek zamanlı güncellemeler + CRUD + izin kontrolü).

---

## 📊 Backend-Frontend Gap Analizi

### ✅ Var Olanlar (10 modül - %27)

```
frontend/src/graphql/
├── admin/
│   ├── categories.graphql        ✅ Admin panel
│   ├── companies.graphql          ✅ Admin panel
│   ├── standardCategories.graphql ✅ Admin panel
│   └── users.graphql              ✅ Admin panel
├── auth.graphql                   ✅ Giriş/Çıkış
├── dashboard.graphql              ✅ Temel istatistikler
└── settings.graphql               ✅ Kullanıcı ayarları
```

### ❌ Eksikler (26 modül - %73)

#### � Priority 0: PREREQUISITE (İLK ÖNCE!)

**Library Management** - Collections'ın bağımlı olduğu temel veri

**Neden önce:** Collections form'unda şu alanlar Library'den seçilecek:

- Colors (Renk paleti seçimi)
- Fit (Kesim tipi seçimi)
- Size Groups (Beden grupları seçimi)
- Certifications (Sertifikalar seçimi)
- Fabric Composition (Kumaş seçimi - opsiyonel)

**Süre:** 3-4 gün
**Detay:** `LIBRARY_MANAGEMENT_PLAN.md`

---

#### �🔴 Priority 1: Core Business (Tekstil İş Akışı)

1. **Collections** - Koleksiyon yönetimi (sezon, yıl, model kodu)
2. **Samples** - Numune yönetimi (28 durum, gerçek zamanlı takip)
3. **Orders** - Sipariş yönetimi (15 durum, çoklu ürün)

#### 🟠 Priority 2: Production & Quality (Üretim Takibi)

4. **Production Tracking** - 7 aşamalı üretim süreci (Kanban board)
5. **Tasks** - Dinamik görev sistemi (durum değişikliklerinde otomatik görev)
6. **Workshops** - Atölye yönetimi

#### 🟡 Priority 3: Communication (İletişim)

7. **Messages** - Gerçek zamanlı mesajlaşma (WebSocket)
8. **Reviews** - Numune değerlendirmeleri
9. **Questions** - Soru-cevap sistemi
10. **Notifications** (Detaylı) - Bildirim merkezi (şu an sadece temel var)

#### 🟢 Priority 4: Support Systems (Destek Sistemleri)

11. **Library** - Renk/Kumaş/Beden kütüphaneleri
12. **Analytics** - Satış/Üretim analitiği
13. **Advanced Search** - Global arama + filtreler

---

## 🚀 İlk Özelliği Geliştirme: Library Management (ÖNCE!)

### ⚠️ NEDEN LIBRARY ÖNCE?

Collections form'unda kullanıcılar şu özellikleri **Library'den seçecek**:

```typescript
// Collection Form'da Library'ye bağımlı alanlar:
- colors: string[]          → LibraryColor'dan çoklu seçim
- fit: string              → LibraryFit'ten tekli seçim
- sizeGroups: string[]     → LibrarySizeGroup'tan çoklu seçim
- certifications: string[] → LibraryCertification'dan çoklu seçim
- fabricComposition: string → LibraryFabric'ten seçim (opsiyonel)
```

**Library olmadan Collections form'u çalışmaz!**

---

### Library Implementation (3-4 gün)

#### Adım 1: GraphQL Operations Oluştur

```bash
cd frontend/src/graphql
touch library.graphql
```

**İçerik** (library.graphql):

```graphql
# Platform Standards (Herkes görebilir)
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

# Company Custom Library (Firma üyeleri)
query DashboardMyCompanyLibrary($category: String) {
  myCompanyLibrary(category: $category) {
    id
    category
    code
    name
    description
    imageUrl
    data
    internalCode
    notes
    isActive
  }
}

# Create Library Item
mutation DashboardCreateLibraryItem($input: CreateLibraryItemInput!) {
  createLibraryItem(input: $input) {
    id
    category
    name
    code
  }
}

# Update Library Item
mutation DashboardUpdateLibraryItem(
  $id: Int!
  $input: UpdateLibraryItemInput!
) {
  updateLibraryItem(id: $id, input: $input) {
    id
    category
    name
  }
}

# Delete Library Item
mutation DashboardDeleteLibraryItem($id: Int!) {
  deleteLibraryItem(id: $id)
}
```

#### Adım 2: Codegen Çalıştır

```bash
cd frontend && npm run codegen
```

#### Adım 3: Library Dashboard Oluştur

```bash
mkdir -p src/app/\(protected\)/dashboard/library/colors/components
touch src/app/\(protected\)/dashboard/library/page.tsx
touch src/app/\(protected\)/dashboard/library/colors/page.tsx
```

**Detaylı kod örnekleri:** `LIBRARY_MANAGEMENT_PLAN.md` dosyasında

---

## 🚀 İkinci Özellik: Collections (Library'den sonra)

### Adım 1: GraphQL Operations Oluştur

```bash
cd frontend/src/graphql
touch collections.graphql
```

**İçerik** (collections.graphql):

```graphql
# Query: Tüm koleksiyonları getir
query DashboardCollections($skip: Int, $take: Int, $search: String) {
  collections(skip: $skip, take: $take, search: $search) {
    id
    name
    modelCode
    description
    season
    year
    targetMarket
    isFeatured
    imageUrls
    manufacturer {
      id
      name
    }
    samples {
      id
      name
      status
    }
    createdAt
  }
}

# Query: Tek bir koleksiyon detayı
query DashboardCollectionDetail($id: Int!) {
  collection(id: $id) {
    id
    name
    modelCode
    description
    season
    year
    targetMarket
    priceRange
    isFeatured
    isActive
    imageUrls
    manufacturer {
      id
      name
      email
    }
    samples {
      id
      name
      sampleNumber
      status
      imageUrls
      createdAt
    }
    createdAt
    updatedAt
  }
}

# Mutation: Yeni koleksiyon oluştur
mutation DashboardCreateCollection(
  $name: String!
  $modelCode: String!
  $description: String
  $season: String
  $year: Int
  $targetMarket: String
  $priceRange: String
  $isFeatured: Boolean
) {
  createCollection(
    name: $name
    modelCode: $modelCode
    description: $description
    season: $season
    year: $year
    targetMarket: $targetMarket
    priceRange: $priceRange
    isFeatured: $isFeatured
  ) {
    id
    name
    modelCode
  }
}

# Mutation: Koleksiyonu güncelle
mutation DashboardUpdateCollection(
  $id: Int!
  $name: String
  $modelCode: String
  $description: String
  $season: String
  $year: Int
  $isActive: Boolean
  $imageUrls: [String!]
) {
  updateCollection(
    id: $id
    name: $name
    modelCode: $modelCode
    description: $description
    season: $season
    year: $year
    isActive: $isActive
    imageUrls: $imageUrls
  ) {
    id
    name
    modelCode
  }
}

# Mutation: Koleksiyonu sil
mutation DashboardDeleteCollection($id: Int!) {
  deleteCollection(id: $id) {
    id
    name
  }
}
```

### Adım 2: TypeScript Tipleri Oluştur

```bash
cd frontend
npm run codegen
```

**Sonuç**: `src/__generated__/graphql.ts` dosyasında otomatik tipler oluşturuldu:

- `DashboardCollectionsDocument`
- `DashboardCollectionDetailDocument`
- `DashboardCreateCollectionDocument`
- `DashboardUpdateCollectionDocument`
- `DashboardDeleteCollectionDocument`

### Adım 3: Sayfa Yapısını Oluştur

```bash
cd src/app/\(protected\)/dashboard
mkdir -p collections/[id]/components
touch collections/page.tsx
touch collections/[id]/page.tsx
```

### Adım 4: Collections List Page (collections/page.tsx)

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "urql";
import { DashboardCollectionsDocument } from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function CollectionsPage() {
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const take = 12;

  const [{ data, fetching, error }] = useQuery({
    query: DashboardCollectionsDocument,
    variables: { skip, take, search: search || undefined },
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Collections</h1>
        <Button asChild>
          <Link href="/dashboard/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections by name or model code..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {fetching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Error: {error.message}
        </div>
      )}

      {/* Collections Grid */}
      {data?.collections && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/dashboard/collections/${collection.id}`}
              className="group"
            >
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Collection Image */}
                <div className="aspect-video bg-muted relative">
                  {collection.imageUrls?.[0] ? (
                    <img
                      src={collection.imageUrls[0]}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {collection.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Collection Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg group-hover:text-primary">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {collection.modelCode}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {collection.season} {collection.year}
                    </span>
                    <span className="text-muted-foreground">
                      {collection.samples?.length || 0} samples
                    </span>
                  </div>
                  {collection.manufacturer && (
                    <p className="text-xs text-muted-foreground mt-2">
                      by {collection.manufacturer.name}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.collections && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={skip === 0}
            onClick={() => setSkip(Math.max(0, skip - take))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={data.collections.length < take}
            onClick={() => setSkip(skip + take)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Adım 5: Collection Detail Page (collections/[id]/page.tsx)

```tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "urql";
import {
  DashboardCollectionDetailDocument,
  DashboardDeleteCollectionDocument,
} from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = Number(params.id);

  const [{ data, fetching, error }] = useQuery({
    query: DashboardCollectionDetailDocument,
    variables: { id: collectionId },
  });

  const [deleteResult, deleteCollection] = useMutation(
    DashboardDeleteCollectionDocument
  );

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    const result = await deleteCollection({ id: collectionId });
    if (!result.error) {
      // Redirect to collections list
      window.location.href = "/dashboard/collections";
    }
  };

  if (fetching) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || !data?.collection) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Collection not found
        </div>
      </div>
    );
  }

  const collection = data.collection;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          <p className="text-muted-foreground">{collection.modelCode}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/collections/${collectionId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteResult.fetching}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Collection Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Images */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          {collection.imageUrls && collection.imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {collection.imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${collection.name} ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              No images
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Season</span>
              <p className="font-medium">{collection.season || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Year</span>
              <p className="font-medium">{collection.year || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Target Market
              </span>
              <p className="font-medium">{collection.targetMarket || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Price Range</span>
              <p className="font-medium">{collection.priceRange || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="mt-1">
                <Badge variant={collection.isActive ? "default" : "secondary"}>
                  {collection.isActive ? "Active" : "Inactive"}
                </Badge>
                {collection.isFeatured && (
                  <Badge variant="outline" className="ml-2">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            {collection.manufacturer && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Manufacturer
                </span>
                <p className="font-medium">{collection.manufacturer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {collection.manufacturer.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {collection.description && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground">{collection.description}</p>
        </div>
      )}

      {/* Samples */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Samples ({collection.samples?.length || 0})
          </h2>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/samples/new?collectionId=${collectionId}`}>
              Add Sample
            </Link>
          </Button>
        </div>

        {collection.samples && collection.samples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.samples.map((sample) => (
              <Link
                key={sample.id}
                href={`/dashboard/samples/${sample.id}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {sample.imageUrls?.[0] && (
                  <img
                    src={sample.imageUrls[0]}
                    alt={sample.name}
                    className="w-full aspect-video object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold">{sample.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {sample.sampleNumber}
                </p>
                <Badge className="mt-2">{sample.status}</Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No samples yet. Add your first sample to get started.
          </div>
        )}
      </div>
    </div>
  );
}
```

### Adım 6: Test Et

```bash
# 1. Backend'i başlat (eğer çalışmıyorsa)
cd backend
npm run dev

# 2. Frontend'i başlat
cd frontend
npm run dev

# 3. Tarayıcıda aç
# http://localhost:3000/dashboard/collections
```

---

## 🔄 Diğer Özellikler İçin Aynı Süreci Tekrarla

### Samples (Numuneler)

```bash
touch frontend/src/graphql/samples.graphql
npm run codegen
mkdir -p frontend/src/app/\(protected\)/dashboard/samples/[id]
touch frontend/src/app/\(protected\)/dashboard/samples/page.tsx
```

**Ek Özellikler**:

- ✅ 28 durum (DESIGN_REQUESTED → DELIVERED)
- ✅ Gerçek zamanlı abonelikler (WebSocket)
- ✅ Dinamik görev sistemi entegrasyonu

### Orders (Siparişler)

```bash
touch frontend/src/graphql/orders.graphql
npm run codegen
mkdir -p frontend/src/app/\(protected\)/dashboard/orders/[id]
```

**Ek Özellikler**:

- ✅ Çoklu ürün desteği
- ✅ 15 sipariş durumu
- ✅ Fatura oluşturma

---

## ⚠️ Önemli Hatırlatmalar

### 1. ID Türü Kontrolü

```typescript
// ❌ YANLIŞ: Tüm ID'ler için aynı yöntem
const id = decodeGlobalId(item.id);

// ✅ DOĞRU: Backend'e bak, ID türünü kontrol et
// Relay Global ID (User, Company, Sample, Collection)
const id = decodeGlobalId(user.id);

// Numeric ID (StandardCategory, LibraryItem)
const id = Number(category.id);
```

### 2. Cache Yönetimi

```typescript
// ❌ YANLIŞ: Cache'e güven
refetchQueries: [{ refetch: refetchItems }];

// ✅ DOĞRU: Her zaman network-only
refetchQueries: [{ refetch: refetchItems, requestPolicy: "network-only" }];
```

### 3. JSON Alan Validasyonu

```typescript
// ❌ YANLIŞ: Boş string gönder
keywords: formData.keywords || undefined;

// ✅ DOĞRU: Validate et
let cleanKeywords: string | undefined = undefined;
if (formData.keywords && formData.keywords.trim() !== "") {
  try {
    JSON.parse(formData.keywords);
    cleanKeywords = formData.keywords;
  } catch (e) {
    cleanKeywords = undefined;
  }
}
```

### 4. Schema Değişikliklerinden Sonra

```bash
# ❌ YANLIŞ: Sadece frontend codegen
npm run codegen

# ✅ DOĞRU: Backend + Frontend sırayla
cd backend && npx prisma generate && npx prisma migrate dev
cd ../frontend && npm run codegen
```

---

## 📊 İlerleme Takibi

### Priority 1: Core Business (1-3 Hafta)

- [ ] Collections (3-4 gün)
- [ ] Samples (5-6 gün)
- [ ] Orders (5-6 gün)

### Priority 2: Production (4-5 Hafta)

- [ ] Production Tracking (4-5 gün)
- [ ] Tasks (4-5 gün)
- [ ] Workshops (2-3 gün)

### Priority 3: Communication (6-7 Hafta)

- [ ] Messages (4-5 gün)
- [ ] Reviews & Questions (3-4 gün)
- [ ] Notifications (2-3 gün)

### Priority 4: Support (8-9 Hafta)

- [ ] Library (3-4 gün)
- [ ] Analytics (4-5 gün)
- [ ] Advanced Search (2-3 gün)

---

## 🎯 Başarı Kriterleri

Her özellik için:

- ✅ Backend'deki tüm query/mutation'lar erişilebilir
- ✅ Gerçek zamanlı güncellemeler çalışıyor
- ✅ CRUD işlemleri tamamlandı
- ✅ İzin kontrolleri aktif
- ✅ Hata yönetimi kullanıcı dostu
- ✅ Yükleme durumları gösteriliyor
- ✅ Cache invalidation doğru çalışıyor
- ✅ Mobil responsive

---

## 🚀 Hemen Başla

```bash
# 1. Collections için GraphQL dosyası oluştur
cd frontend/src/graphql
touch collections.graphql

# 2. Yukarıdaki GraphQL operasyonlarını yapıştır

# 3. TypeScript tiplerini oluştur
cd ../..
npm run codegen

# 4. Sayfa dosyalarını oluştur
mkdir -p src/app/\(protected\)/dashboard/collections/[id]
touch src/app/\(protected\)/dashboard/collections/page.tsx
touch src/app/\(protected\)/dashboard/collections/[id]/page.tsx

# 5. Yukarıdaki component kodlarını yapıştır

# 6. Test et
npm run dev
# http://localhost:3000/dashboard/collections
```

---

**Toplam Süre**: 8-9 hafta (tam zamanlı geliştirici)

**Mevcut Durum**: Section 1-3 Tamamlandı, Section 4 Geliştirmeye Hazır

**Hedef**: Backend-frontend %100 eşlik, tam gerçek zamanlı yetenekler
