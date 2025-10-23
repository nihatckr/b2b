# Admin StandardCategory Yönetimi

## 📋 Genel Bakış

Platform genelinde kullanılan standart kategori yönetim sistemi. Admin kullanıcıları standart kategorileri oluşturabilir, düzenleyebilir ve silebilir. Şirketler bu standart kategorileri baz alarak kendi kategori sistemlerini oluştururlar.

## 🏗️ Mimari

```
StandardCategory (Platform)
├── ROOT (Ana Kategori)
│   ├── MAIN (Ana Grup)
│   │   ├── SUB (Alt Grup)
│   │   │   └── DETAIL (Detay)
```

## 📁 Dosya Yapısı

```
frontend/src/
├── app/(protected)/dashboard/admin/categories/
│   └── page.tsx                    # Ana kategori yönetim sayfası
├── components/admin/categories/
│   ├── CategoryStats.tsx           # İstatistik kartları
│   ├── CategoryForm.tsx            # Oluşturma/düzenleme formu
│   └── CategoryTreeView.tsx        # Hiyerarşik ağaç görünümü
├── lib/
│   └── category-utils.tsx          # Utility fonksiyonları
└── graphql/admin/
    └── standardCategories.graphql  # GraphQL operations

backend/src/graphql/
├── types/index.ts                  # StandardCategory type
├── queries/
│   └── standardCategoryQuery.ts    # Admin queries
└── mutations/
    └── standardCategoryMutation.ts # Admin mutations
```

## 🎯 Özellikler

### ✅ Tamamlanan

1. **CRUD Operations**

   - ✅ Kategori oluşturma (Create)
   - ✅ Kategori listeleme (Read)
   - ✅ Kategori güncelleme (Update)
   - ✅ Kategori silme (Delete)

2. **Görünümler**

   - ✅ Liste görünümü (Table)
   - ✅ Ağaç görünümü (Hierarchical Tree)
   - ✅ İstatistikler (Stats Cards)

3. **Filtreleme & Arama**

   - ✅ Metin arama (kod, ad, açıklama)
   - ✅ Seviye filtresi (ROOT, MAIN, SUB, DETAIL)
   - ✅ Durum filtresi (Aktif/Pasif)

4. **Özel Özellikler**

   - ✅ Hiyerarşik yapı (4 seviye)
   - ✅ Kod sistemi (TEX-001, GAR-001-001)
   - ✅ Otomatik kod önerisi
   - ✅ İkon seçici (70+ icon, visual picker)
   - ✅ Aktif/Pasif toggle
   - ✅ Alt kategori kontrolü (silme önleme)
   - ✅ **Zod Validation** (real-time validation with react-hook-form)
   - ✅ Duplicate code check (Zod refinement)
   - ✅ Circular parent prevention (Zod refinement)
   - ✅ Max depth validation (Zod refinement)
   - ✅ JSON field validation (keywords)
   - ✅ i18n desteği (frontend'de çeviri)
   - ✅ Pagination
   - ✅ Optimistic UI updates

5. **Validation Architecture**
   - ✅ **Frontend**: Zod schema + react-hook-form (real-time, onChange)
   - ✅ **Backend**: JSON validation + business rules (mutations)
   - ✅ **Type Safety**: Zod inference → TypeScript types
   - ✅ **Consistency**: Same pattern as auth, profile, company features

## 🔧 Kullanım

### Backend Test (GraphQL Playground)

```bash
cd backend && npm run dev
# http://localhost:4001/graphql
```

**Kategori Oluşturma:**

```graphql
mutation {
  createStandardCategory(
    input: {
      code: "TEX-001"
      name: "Tekstil"
      description: "Tekstil ürünleri"
      level: "ROOT"
      order: 1
      isActive: true
      isPublic: true
    }
  ) {
    id
    code
    name
  }
}
```

**Kategorileri Listeleme:**

```graphql
query {
  adminStandardCategories(level: "ROOT", isActive: true) {
    id
    code
    name
    level
    subCategories {
      id
      code
      name
    }
  }
}
```

### Frontend Kullanımı

1. **Admin olarak giriş yapın:**

   - Email: `admin@protexflow.com`
   - Password: `Admin123!`

2. **Kategori Yönetim Sayfasına Gidin:**

   - URL: `/dashboard/admin/categories`

3. **Kategori Oluşturun:**

   - "Yeni Kategori" butonuna tıklayın
   - Form alanlarını doldurun
   - Seviye seçin (ROOT, MAIN, SUB, DETAIL)
   - "Oluştur" butonuna tıklayın

4. **Ağaç Görünümünü Kullanın:**
   - "Ağaç Görünümü" tab'ına geçin
   - Kategorileri hiyerarşik olarak görün
   - Expand/collapse ile alt kategorileri görüntüleyin

## 📊 Veri Modeli

```typescript
StandardCategory {
  id: Int
  code: String (unique)         // "TEX-001", "GAR-001-001"
  name: String                  // "Tekstil", "Giyim"
  description: String?          // Açıklama
  level: CategoryLevel          // ROOT, MAIN, SUB, DETAIL
  order: Int                    // Sıralama
  icon: String?                 // Icon kodu
  image: String?                // Görsel URL
  isActive: Boolean             // Aktif/Pasif
  isPublic: Boolean             // Herkese açık/Özel
  keywords: JSON?               // Arama keywords
  tags: String?                 // Etiketler
  parentCategory: StandardCategory?
  subCategories: StandardCategory[]
  createdBy: User?
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🎨 Kategori Seviyeleri

| Seviye | Açıklama     | Örnek                | Renk    |
| ------ | ------------ | -------------------- | ------- |
| ROOT   | Ana Kategori | Tekstil, Giyim       | Mor     |
| MAIN   | Ana Grup     | Üst Giyim, Alt Giyim | Mavi    |
| SUB    | Alt Grup     | Gömlek, Pantolon     | Yeşil   |
| DETAIL | Detay        | Uzun Kollu Gömlek    | Turuncu |

## 🔐 İzinler

- **Admin**: Tüm işlemler (CRUD)
- **Company Owner**: Sadece okuma (standardCategories query)
- **Company Employee**: Sadece okuma (standardCategories query)
- **Customer**: Sadece okuma (standardCategories query)

## 🚀 Geliştirme Notları

### Kod Sistemi Kuralları

1. **ROOT seviye**: `CAT-001`, `CAT-002`, ...
2. **MAIN seviye**: `{PARENT_CODE}-MAN-001`
3. **SUB seviye**: `{PARENT_CODE}-SUB-001`
4. **DETAIL seviye**: `{PARENT_CODE}-DET-001`

Örnek:

```
CAT-001 (Tekstil)
  ├── CAT-001-MAN-001 (Giyim)
  │   ├── CAT-001-MAN-001-SUB-001 (Üst Giyim)
  │   │   └── CAT-001-MAN-001-SUB-001-DET-001 (Gömlek)
```

### Utility Functions

```typescript
// category-utils.tsx'de mevcut:
getCategoryLevelBadge(level); // Badge bilgileri
formatCategoryPath(category); // Breadcrumb path
buildCategoryTree(categories); // Hiyerarşik ağaç
validateCategoryForm(data); // Form validasyonu
suggestCategoryCode(parent, level, count); // Otomatik kod
```

### Reusable Hooks

```typescript
// useRelayIds - Global ID decode/encode
const { decodeGlobalId } = useRelayIds();
const numericId = decodeGlobalId(category.id);

// useOptimisticMutation - Mutation pattern
const { execute, loading } = useOptimisticMutation({
  mutation: createMutation,
  successMessage: "Success!",
  refetchQueries: [{ refetch: refetchCategories }],
});
```

## 🐛 Bilinen Limitasyonlar

1. **Silme Kısıtlaması**: Alt kategorisi olan kategoriler silinemez
2. **Kod Değişikliği**: Kategori oluşturulduktan sonra kod değiştirilemez
3. **Seviye Değişikliği**: Kategori oluşturulduktan sonra seviye değiştirilemez
4. **Max Derinlik**: 4 seviye (ROOT > MAIN > SUB > DETAIL)

## ✅ Validation (Form Doğrulama)

### Zod Schema Architecture

**Dosya**: `frontend/src/lib/zod-schema.ts`

```typescript
import { createCategorySchema, CategoryLevelEnum } from "@/lib/zod-schema";

// CategorySchema (Base validation)
export const CategorySchema = z.object({
  code: z.string().min(3, "En az 3 karakter").max(50),
  name: z.string().min(2, "En az 2 karakter").max(100),
  description: z.string().optional(),
  level: CategoryLevelEnum,
  parentId: z.number().optional(),
  order: z.number().min(0).max(9999),
  icon: z.string().optional(),
  tags: z.string().optional(),
  keywords: z.string().optional(), // JSON string
  isActive: z.boolean(),
  isPublic: z.boolean(),
});

// createCategorySchema (With refinements)
const categorySchema = createCategorySchema({
  existingCategories: parentCategories, // For duplicate check
  currentCategoryId: initialData?.id, // For edit mode
});
```

### Validation Rules

**1. Real-time Validation** (onChange mode):

```typescript
// CategoryForm.tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<CategoryFormData>({
  resolver: zodResolver(categorySchema),
  mode: "onChange", // Instant validation
});
```

**2. Duplicate Code Check**:

```typescript
// Zod refinement checks existing categories
.refine(
  (data) => !isDuplicateCode(data.code, existingCategories, currentCategoryId),
  { message: "Bu kod zaten kullanılıyor", path: ["code"] }
)
```

**3. Circular Parent Prevention**:

```typescript
// Prevents parent → child → parent loops
.refine(
  (data) => !isCircularParent(data.parentId, currentCategoryId, existingCategories),
  { message: "Döngüsel bağımlılık tespit edildi", path: ["parentId"] }
)
```

**4. Max Depth Validation**:

```typescript
// Enforces 4-level hierarchy
.refine(
  (data) => !exceedsMaxDepth(data.parentId, data.level, existingCategories),
  { message: "Maksimum seviye aşıldı", path: ["level"] }
)
```

**5. JSON Keywords Validation**:

```typescript
// Frontend: Validate before submit
let cleanKeywords: string | undefined = undefined;
if (formData.keywords?.trim()) {
  try {
    JSON.parse(formData.keywords);
    cleanKeywords = formData.keywords;
  } catch (e) {
    cleanKeywords = undefined; // Skip invalid JSON
  }
}

// Backend: Handle empty strings
if (input.keywords) {
  const trimmed = input.keywords.trim();
  if (trimmed === "") {
    updateData.keywords = null; // Empty → null
  } else {
    updateData.keywords = JSON.parse(trimmed);
  }
}
```

### Type Safety

```typescript
// Auto-generated types from Zod schema
import type { CategoryInput, CategoryLevel } from "@/lib/zod-schema";

type CategoryInput = z.infer<typeof CategorySchema>;
type CategoryLevel = z.infer<typeof CategoryLevelEnum>;
```

### Validation Consistency

✅ **Same pattern as**:

- Authentication forms (`src/lib/zod-schema.ts` → `loginSchema`, `registerSchema`)
- Profile forms (`updateProfileSchema`)
- Company forms (`companySchema`)

✅ **Benefits**:

- Real-time error feedback
- Type-safe form data
- Centralized validation logic
- Consistent error messages
- No manual validation code

## 📝 Validation (Previous Manual System - DEPRECATED)

### Temel Validations

1. **Kod (Code)**

   - ✅ Zorunlu alan
   - ✅ 3-20 karakter arası
   - ✅ Sadece büyük harf, rakam ve tire (-)
   - ✅ **Real-time duplicate check** (500ms debounce)
   - ❌ Hata: "Bu kod zaten kullanılıyor"

2. **İsim (Name)**

   - ✅ Zorunlu alan
   - ✅ 2-100 karakter arası

3. **Açıklama (Description)**

   - ⚪ Opsiyonel
   - ✅ Maksimum 500 karakter

4. **Seviye (Level)**

   - ✅ Zorunlu alan
   - ✅ ROOT, MAIN, SUB, DETAIL

5. **Parent Kategori**
   - ✅ **Circular relationship check**
   - ✅ **Max depth validation**
   - ❌ Hata: "Döngüsel ilişki hatası"
   - ❌ Hata: "Maksimum derinlik aşıldı"

### Advanced Validations

#### 1. Duplicate Code Check

```typescript
// Real-time validation (500ms debounce)
isDuplicateCode(code, existingCategories, currentCategoryId);
// Returns: true if duplicate found
```

**Senaryo:**

- Kullanıcı "TEX-001" yazıyor
- 500ms sonra kontrol ediliyor
- Eğer başka kategori "TEX-001" kullanıyorsa → Hata gösteriliyor

#### 2. Circular Parent Check

```typescript
// Prevents: A → B → C → A (circular)
isCircularParent(categoryId, parentId, allCategories);
// Returns: true if circular detected
```

**Senaryo:**

- Kategori A'yı düzenlerken
- Parent olarak kendi alt kategorisi B'yi seçmeye çalışırsa
- Hata: "Döngüsel ilişki hatası"

#### 3. Max Depth Validation

```typescript
// Depth limits by level:
// ROOT: 0, MAIN: 1, SUB: 2, DETAIL: 3
exceedsMaxDepth(parentId, level, allCategories);
// Returns: true if exceeds limit
```

**Senaryo:**

- DETAIL level kategori oluşturulurken
- Maksimum 3 derinlik kontrol ediliyor

### Validation Mesajları

| Alan     | Hata Mesajı                                         |
| -------- | --------------------------------------------------- |
| Code     | "Kategori kodu gereklidir"                          |
| Code     | "Bu kod zaten kullanılıyor" (duplicate)             |
| Code     | "Kod sadece büyük harf, rakam ve tire içermelidir"  |
| Name     | "Kategori adı gereklidir"                           |
| ParentId | "Döngüsel ilişki hatası: Bu kategori kendi alt ..." |
| ParentId | "Maksimum derinlik aşıldı"                          |
| Keywords | "Geçersiz JSON formatı"                             |

## �📈 Gelecek Geliştirmeler

- [ ] Drag & drop ile sıralama
- [ ] Bulk import/export (CSV/Excel)
- [ ] Kategori görseli upload
- [ ] Multi-language support (i18n keys)
- [ ] Kategori kullanım istatistikleri
- [ ] Kategori merge/split işlemleri
- [ ] Audit log (değişiklik geçmişi)

## 🧪 Test Senaryoları

### Manuel Test Adımları

1. **Kategori Oluşturma**

   - [ ] ROOT kategori oluştur
   - [ ] MAIN kategori oluştur (parent seç)
   - [ ] SUB kategori oluştur (parent seç)
   - [ ] DETAIL kategori oluştur (parent seç)
   - [ ] Kod otomatik oluşturuldu mu?

2. **Kategori Düzenleme**

   - [ ] Kategori adını değiştir
   - [ ] Açıklama ekle/güncelle
   - [ ] Sıralama değiştir
   - [ ] Tags ekle
   - [ ] İkon değiştir (icon picker)

3. **Kategori Silme**

   - [ ] Alt kategorisi olmayan kategoriyi sil
   - [ ] Alt kategorisi olan kategoriyi silmeye çalış (hata vermeli)

4. **Validation Tests**

   - [ ] Duplicate kod girmeyi dene (hata vermeli)
   - [ ] Kendi alt kategorisini parent yapmayı dene (hata vermeli)
   - [ ] Maksimum derinliği aş (hata vermeli)
   - [ ] Real-time validation çalışıyor mu? (500ms debounce)

5. **Filtreleme**

   - [ ] Metin arama yap
   - [ ] Seviye filtresi uygula
   - [ ] Durum filtresi uygula

6. **Ağaç Görünümü**
   - [ ] Kategorileri hiyerarşik görüntüle
   - [ ] Expand/collapse çalışıyor mu?
   - [ ] 4 seviye derinlik görüntüleniyor mu?

## 📞 Destek

Sorularınız için:

- GitHub Issues: [nihatckr/fullstack](https://github.com/nihatckr/fullstack)
- Email: admin@protexflow.com

---

**Son Güncelleme**: 20 Ekim 2025
**Versiyon**: 1.0.0
**Durum**: ✅ Tamamlandı
