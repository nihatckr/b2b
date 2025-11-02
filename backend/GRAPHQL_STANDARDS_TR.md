# GraphQL Query & Mutation Standartları

> **Versiyon:** 2.0.0  
> **Son Güncelleme:** 1 Kasım 2025  
> **Amaç:** GraphQL resolver geliştirme için tutarlı hata yönetimi, doğrulama, temizleme ve loglama standartları

---

## 🇹🇷 DİL POLİTİKASI (Language Policy)

### Zorunlu Kurallar

| Öğe                      | Dil          | Örnek                                       |
| ------------------------ | ------------ | ------------------------------------------- |
| **Kod Açıklamaları**     | 🇹🇷 TÜRKÇE    | `// Kullanıcının sorularını listele`        |
| **Hata Mesajları**       | 🇹🇷 TÜRKÇE    | `throw new ValidationError("Soru gerekli")` |
| **Validation Mesajları** | 🇹🇷 TÜRKÇE    | `validateRequired(id, "Soru ID")`           |
| **Log Mesajları**        | 🇹🇷 TÜRKÇE    | `logInfo("Soru oluşturuldu", {...})`        |
| **Bildirim Metinleri**   | 🇹🇷 TÜRKÇE    | `title: "Yeni Soru"`                        |
| **Değişken İsimleri**    | 🇬🇧 İNGİLİZCE | `const questionId = ...`                    |
| **Fonksiyon İsimleri**   | 🇬🇧 İNGİLİZCE | `function createQuestion()`                 |
| **Timer İsimleri**       | 🇬🇧 İNGİLİZCE | `createTimer("createQuestion")`             |

### ✅ Doğru Örnekler

```typescript
/**
 * QUERY: questions
 *
 * Açıklama: Koleksiyon için soruları listeler
 * Güvenlik: Public (herkese açık)
 * Döner: Question dizisi
 */
builder.queryField("questions", (t) =>
  t.prismaField({
    type: ["Question"],
    args: {
      collectionId: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("questions");
      try {
        // Girdileri temizle
        const collectionId = sanitizeInt(args.collectionId)!;
        validateRequired(collectionId, "Koleksiyon ID");

        // Sorguyu çalıştır
        const questions = await ctx.prisma.question.findMany({
          ...query,
          where: { collectionId, isPublic: true },
          orderBy: { createdAt: "desc" },
        });

        // Başarıyı logla
        logInfo("Sorular listelendi", {
          collectionId,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
```

### ❌ Yanlış Örnekler

```typescript
// YANLIŞ: İngilizce açıklama
// Get questions for collection
const questions = await ctx.prisma.question.findMany({ ... });

// YANLIŞ: İngilizce hata mesajı
throw new ValidationError("Question is required");

// YANLIŞ: İngilizce validation mesajı
validateRequired(question, "Question");

// YANLIŞ: İngilizce log mesajı
logInfo("Questions listed", { ... });

// YANLIŞ: Türkçe değişken ismi
const soruId = sanitizeInt(input.id);
```

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Dosya Yapısı](#dosya-yapısı)
3. [Import Standartları](#import-standartları)
4. [Input Type Standartları](#input-type-standartları)
5. [Query Standartları](#query-standartları)
6. [Mutation Standartları](#mutation-standartları)
7. [Hata Yönetimi](#hata-yönetimi)
8. [Girdi Temizleme (Sanitization)](#girdi-temizleme)
9. [Doğrulama (Validation)](#doğrulama)
10. [Loglama](#loglama)
11. [Güvenlik & Yetkilendirme](#güvenlik--yetkilendirme)
12. [Kod Örnekleri](#kod-örnekleri)
13. [Kontrol Listesi](#kontrol-listesi)

---

## Genel Bakış

Bu doküman, ProtexFlow backend'inde GraphQL resolver'ları (query ve mutation) için kodlama standartlarını tanımlar.

### Bu Standartları Takip Etmek Neden Önemli?

- ✅ **Güvenlik**: XSS önleme, SQL injection koruması, rol-tabanlı erişim kontrolü
- ✅ **Güvenilirlik**: Kapsamlı hata yönetimi, girdi doğrulama
- ✅ **Gözlemlenebilirlik**: Yapılandırılmış loglama, performans metrikleri
- ✅ **Sürdürülebilirlik**: Tutarlı pattern'ler, açık dokümantasyon
- ✅ **Performans**: Optimize edilmiş query'ler, pagination limitleri
- ✅ **Kullanıcı Deneyimi**: Anlaşılır Türkçe hata mesajları

---

## Dosya Yapısı

### Query Dosyaları: `/src/graphql/queries/`

```text
entityQuery.ts
├── Header Dokümantasyonu (30-50 satır - TÜRKÇE)
├── Import'lar
├── Input Type'lar (4-6 adet)
├── Standard Query'ler (3-5 adet)
├── Analytics Query'ler (3-5 adet)
└── Arama/Filtreleme Query'leri (2-4 adet)
```

**Header Örneği:**

```typescript
/**
 * Question Queries - SORU-CEVAP YÖNETİM SİSTEMİ
 *
 * 🎯 Amaç: Müşteri soruları ve üretici cevapları
 *
 * 📋 Mevcut Query'ler:
 *
 * STANDART QUERY'LER:
 * - questions: Koleksiyon soruları (genel görünüm)
 * - question: Tekil soru
 * - myQuestions: Kullanıcının soruları
 * - questionsForManufacturer: Üreticinin cevaplaması gereken sorular
 *
 * ANALİTİK QUERY'LER:
 * - questionStats: Soru istatistikleri
 * - questionsByCollection: Koleksiyonlara göre dağılım
 * - questionsByStatus: Duruma göre dağılım
 * - unansweredQuestions: Cevaplanmamış sorular
 *
 * ARAMA & FİLTRELEME:
 * - searchQuestions: Soru/cevap içinde arama
 * - getQuestionsByDateRange: Tarih aralığına göre sorular
 * - getQuestionsByUser: Kullanıcıya göre sorular
 *
 * 🔒 Güvenlik:
 * - Public query'ler sadece public soruları gösterir
 * - Kullanıcılar kendi sorularını görür (private dahil)
 * - Üreticiler kendi ürünleri hakkındaki soruları görür
 * - Admin tüm soruları görür
 *
 * 💡 Özellikler:
 * - Public/private soru desteği
 * - Cevaplanan/cevaplanmamış filtreleme
 * - Gerçek zamanlı bildirimler
 * - Koleksiyon bazlı organizasyon
 */
```

### Mutation Dosyaları: `/src/graphql/mutations/`

```text
entityMutation.ts
├── Header Dokümantasyonu (30-40 satır - TÜRKÇE)
├── Import'lar
├── Sabitler (gerekirse)
├── Input Type'lar (5-10 adet)
├── Temel Mutation'lar (create, update, delete)
├── Toplu İşlemler (2-3 adet)
└── Admin İşlemleri (1-2 adet)
```

**Header Örneği:**

```typescript
/**
 * Question Mutations - SORU-CEVAP YÖNETİM SİSTEMİ
 *
 * 🎯 Amaç: Soru sorma, cevaplama ve yönetim
 *
 * 📋 Mevcut Mutation'lar:
 *
 * MÜŞTERİ İŞLEMLERİ:
 * - askQuestion: Soru sor
 * - updateQuestion: Soru güncelle (cevaptan önce)
 * - deleteQuestion: Soru sil (cevaptan önce)
 *
 * ÜRETİCİ İŞLEMLERİ:
 * - answerQuestion: Soru cevapla
 * - updateAnswer: Cevap güncelle
 * - bulkAnswerQuestions: Toplu soru cevaplama
 *
 * ADMİN İŞLEMLERİ:
 * - toggleQuestionVisibility: Görünürlük değiştir
 * - bulkDeleteQuestions: Toplu soru silme
 *
 * 🔒 Güvenlik:
 * - Müşteriler sadece kendi sorularını yönetebilir
 * - Üreticiler kendi ürünleri hakkındaki soruları cevaplayabilir
 * - Admin tüm soruları yönetebilir
 *
 * 💡 Özellikler:
 * - Public/private soru desteği
 * - Gerçek zamanlı bildirimler
 * - Validasyon (soru: 10-1000 karakter, cevap: 10-2000 karakter)
 * - Verimlilik için toplu işlemler
 */
```

---

## Import Standartları

### Tüm Resolver'lar İçin Gerekli Import'lar

```typescript
// Hata yönetimi
import {
  handleError,
  requireAuth,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/errors";

// Loglama
import { createTimer, logInfo } from "../../utils/logger";

// Temizleme (Sanitization)
import {
  sanitizeInt,
  sanitizeString,
  sanitizeBoolean,
  sanitizeFloat,
} from "../../utils/sanitize";

// Doğrulama (Validation)
import {
  validateRequired,
  validateStringLength,
  validateEnum,
  validateDateRange,
  validateRange,
} from "../../utils/validation";

// GraphQL builder
import builder from "../builder";

// Opsiyonel: Gerçek zamanlı bildirimler
import { publishNotification } from "../../utils/publishHelpers";
```

### Import Sırası

1. Utils (errors, logger, sanitize, validation)
2. GraphQL builder
3. Opsiyonel utilities (publishHelpers, vb.)

---

## Input Type Standartları

### İsimlendirme Kuralları

| Tip        | İsimlendirme                | Açıklama                           |
| ---------- | --------------------------- | ---------------------------------- |
| Filter     | `{Entity}FilterInput`       | Çoklu alan filtreleme              |
| Pagination | `{Entity}PaginationInput`   | skip/take parametreleri            |
| Search     | `{Entity}SearchInput`       | Tam metin arama + filtreler        |
| Date Range | `{Entity}DateRangeInput`    | Tarihsel filtreleme                |
| Create     | `Create{Entity}Input`       | Oluşturma için gerekli tüm alanlar |
| Update     | `Update{Entity}Input`       | Güncelleme için kısmi alanlar      |
| Bulk       | `Bulk{Action}{Entity}Input` | Toplu işlemler                     |

### Standart Input Type'lar

#### 1. Filter Input (Filtre Girişi)

```typescript
/**
 * Entity filtreleme input'u
 * Çoklu alan bazlı filtreleme için kullanılır
 */
const EntityFilterInput = builder.inputType("EntityFilterInput", {
  fields: (t) => ({
    // Birincil filtreler
    id: t.int(),
    status: t.string(),

    // Boolean filtreler
    isActive: t.boolean(),
    isPublic: t.boolean(),

    // İlişki filtreleri
    userId: t.int(),
    companyId: t.int(),

    // Sayısal aralık filtreleri
    minAmount: t.float(),
    maxAmount: t.float(),

    // Tarih aralığı filtreleri
    startDate: t.string(),
    endDate: t.string(),
  }),
});
```

#### 2. Pagination Input (Sayfalama Girişi)

```typescript
/**
 * Sayfalama input'u
 * skip: Kaç kayıt atlanacak
 * take: Kaç kayıt getirilecek (max: 100)
 */
const EntityPaginationInput = builder.inputType("EntityPaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});
```

#### 3. Search Input (Arama Girişi)

```typescript
/**
 * Tam metin arama input'u
 * query: Arama terimi (gerekli)
 * Ek filtreler opsiyonel
 */
const EntitySearchInput = builder.inputType("EntitySearchInput", {
  fields: (t) => ({
    query: t.string({ required: true }), // Arama terimi
    status: t.string(), // Opsiyonel filtre
    limit: t.int(), // Sonuç limiti
  }),
});
```

#### 4. Date Range Input (Tarih Aralığı Girişi)

```typescript
/**
 * Tarih aralığı filtreleme input'u
 * ISO 8601 formatında string tarihler
 */
const EntityDateRangeInput = builder.inputType("EntityDateRangeInput", {
  fields: (t) => ({
    startDate: t.string({ required: true }),
    endDate: t.string({ required: true }),
  }),
});
```

---

## Query Standartları

### Query Yapısı Şablonu

```typescript
/**
 * QUERY: queryName
 *
 * Açıklama: Bu query'nin ne yaptığı
 *
 * Güvenlik: Kimler erişebilir (public/user/admin/rol-bazlı)
 * Döner: Hangi veri döndürülür
 */
builder.queryField("queryName", (t) =>
  t.prismaField({
    type: ["Entity"], // veya tekil için "Entity"
    nullable: false, // null dönebiliyorsa true
    args: {
      // Argümanları tanımla
      filter: t.arg({ type: EntityFilterInput, required: false }),
      pagination: t.arg({ type: EntityPaginationInput, required: false }),
    },
    authScopes: { user: true }, // veya { public: true }, { admin: true }
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("queryName");
      try {
        // 1. KİMLİK DOĞRULAMA
        requireAuth(ctx.user?.id);

        // 2. GİRDİLERİ TEMİZLE (Sanitize)
        const id = sanitizeInt(args.id)!;
        const name = sanitizeString(args.name);

        // 3. GİRDİLERİ DOĞRULA (Validate)
        validateRequired(id, "Entity ID");
        if (name) validateStringLength(name, "Ad", 2, 100);

        // 4. WHERE KOŞULLARINI OLUŞTUR
        const where: any = { id };

        // Rol bazlı filtreleme
        if (ctx.user!.role !== "ADMIN") {
          where.userId = ctx.user!.id;
        }

        // Pagination ayarla (max 100)
        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        // 5. QUERY'Yİ ÇALIŞTIR
        const results = await ctx.prisma.entity.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        // 6. BAŞARIYI LOGLA
        logInfo("Entity'ler listelendi", {
          userId: ctx.user?.id,
          resultCount: results.length,
          metadata: timer.end(),
        });

        return results;
      } catch (error) {
        // 7. HATALARI YAKALA
        handleError(error);
        throw error;
      }
    },
  })
);
```

### Query Kategorileri

#### 1. Standart Query'ler (3-5 adet)

- `allEntities` - Tümünü listele (filtre ve pagination ile)
- `entity` - ID'ye göre tekil kayıt
- `myEntities` - Kullanıcının kendi kayıtları
- `entitiesForRole` - Role özel kayıtlar

#### 2. Analitik Query'ler (3-5 adet)

- `entityStats` - Kapsamlı istatistikler
- `entitiesByStatus` - Duruma göre gruplama
- `entitiesByCategory` - Kategoriye göre gruplama
- `entityTrends` - Zaman bazlı analizler
- `entityMetrics` - Performans metrikleri

#### 3. Arama & Filtreleme Query'leri (2-4 adet)

- `searchEntities` - Tam metin arama
- `getEntitiesByDateRange` - Tarih aralığı filtreleme
- `getEntitiesByUser` - Kullanıcı bazlı filtreleme
- `advancedEntitySearch` - Karmaşık çoklu alan araması

---

## Mutation Standartları

### Mutation Yapısı Şablonu

```typescript
/**
 * MUTATION: mutationName
 *
 * Açıklama: Bu mutation'ın ne yaptığı
 *
 * Akış:
 * 1. İlk adım
 * 2. İkinci adım
 * 3. Üçüncü adım
 *
 * İzinler: Kim çalıştırabilir
 * Bildirimler: Hangi bildirimler gönderilir
 * Yan Etkiler: Ek etkiler
 */
builder.mutationField("mutationName", (t) =>
  t.prismaField({
    type: "Entity",
    args: {
      input: t.arg({ type: MutationInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, ctx) => {
      const timer = createTimer("mutationName");
      try {
        // 1. KİMLİK DOĞRULAMA
        requireAuth(ctx.user?.id);

        // 2. GİRDİLERİ TEMİZLE
        const name = sanitizeString(input.name)!;
        const amount = sanitizeFloat(input.amount);
        const isActive = sanitizeBoolean(input.isActive) ?? true;

        // 3. GİRDİLERİ DOĞRULA
        validateRequired(name, "Ad");
        validateStringLength(name, "Ad", 2, 100);
        if (amount) validateRange(amount, "Miktar", 0, 1000000);

        // 4. YETKİ KONTROLÜ (gerekirse)
        const existingEntity = await ctx.prisma.entity.findUnique({
          where: { id: input.id },
        });

        if (!existingEntity) {
          throw new NotFoundError("Entity", input.id);
        }

        if (
          existingEntity.userId !== ctx.user?.id &&
          ctx.user?.role !== "ADMIN"
        ) {
          throw new ForbiddenError("Bu kaydı düzenleme yetkiniz yok");
        }

        // 5. İŞ MANTIĞINI ÇALIŞTIR
        const result = await ctx.prisma.entity.update({
          ...query,
          where: { id: input.id },
          data: { name, amount, isActive },
        });

        // 6. BİLDİRİMLER GÖNDER (gerekirse)
        if (result.userId) {
          const notif = await ctx.prisma.notification.create({
            data: {
              userId: result.userId,
              type: "INFO",
              title: "Entity Güncellendi",
              message: `${name} başarıyla güncellendi`,
              link: `/entities/${result.id}`,
            },
          });
          await publishNotification(notif);
        }

        // 7. BAŞARIYI LOGLA
        logInfo("Entity güncellendi", {
          entityId: result.id,
          userId: ctx.user?.id,
          metadata: timer.end(),
        });

        return result;
      } catch (error) {
        // 8. HATALARI YAKALA
        handleError(error);
        throw error;
      }
    },
  })
);
```

### Mutation Kategorileri

#### 1. Temel Mutation'lar (3-5 adet)

- `createEntity` - Yeni kayıt oluştur
- `updateEntity` - Mevcut kaydı güncelle
- `deleteEntity` - Kaydı sil
- `toggleEntityStatus` - Boolean alan değiştir

#### 2. Toplu İşlemler (2-3 adet)

- `bulkCreateEntities` - Çoklu oluşturma
- `bulkUpdateEntities` - Çoklu güncelleme
- `bulkDeleteEntities` - Çoklu silme

#### 3. Admin İşlemleri (1-2 adet)

- `adminUpdateEntity` - Sadece admin güncelleme
- `forceDeleteEntity` - Hard delete (sadece admin)

---

## Hata Yönetimi

### Mevcut Hata Tipleri

```typescript
// Kimlik doğrulama gerekli
throw new AuthenticationError("Kimlik doğrulama gerekli");

// Yetersiz izin
throw new ForbiddenError("Bu işlem için yetkiniz yok");

// Kayıt bulunamadı
throw new NotFoundError("Entity", entityId);

// Doğrulama başarısız
throw new ValidationError("Alan gerekli", "fieldName");

// Tekrarlanan kayıt
throw new DuplicateError("Entity", "email", "test@example.com");

// İş mantığı hatası
throw new BusinessLogicError("İşlem gerçekleştirilemez", "CUSTOM_CODE");
```

### Hata Yönetimi Pattern'i

```typescript
try {
  // Kodunuz burada
} catch (error) {
  handleError(error); // Loglar ve formatlar
  throw error; // GraphQL için yeniden fırlat
}
```

### Hata Yönetimi Kuralları

1. ✅ **Her zaman try-catch kullan** resolver'larda
2. ✅ **Her zaman handleError() çağır** yeniden fırlatmadan önce
3. ✅ **Spesifik hata tipleri kullan** (generic Error değil)
4. ✅ **Türkçe hata mesajları ekle** kullanıcıya yönelik hatalar için
5. ✅ **Hataları context ile logla** (userId, entityId, vb.)

### Hata Mesajı Örnekleri

```typescript
// ✅ DOĞRU: Açıklayıcı Türkçe mesaj
throw new ValidationError("Soru en az 10 karakter olmalıdır");
throw new ForbiddenError("Sadece kendi sorunuzu düzenleyebilirsiniz");
throw new NotFoundError("Soru", questionId);
throw new ValidationError("Koleksiyon ID gerekli");

// ❌ YANLIŞ: İngilizce veya belirsiz mesaj
throw new Error("Invalid");
throw new ValidationError("Question required");
throw new Error("Not found");
```

---

## Girdi Temizleme (Sanitization)

### Temizleme Fonksiyonları

```typescript
// String temizleme (HTML, SQL injection temizler)
const cleanString = sanitizeString(input.name);
// "test" → "test"
// "<script>alert('xss')</script>" → ""
// "test--drop table" → "testdrop table"

// Integer temizleme (geçerli integer sağlar)
const cleanId = sanitizeInt(input.id);
// "123" → 123
// "123.45" → 123
// "abc" → null
// null → null

// Float temizleme (geçerli float sağlar)
const cleanAmount = sanitizeFloat(input.amount);
// "123.45" → 123.45
// "123" → 123.0
// "abc" → null

// Boolean temizleme (truthy/falsy'yi boolean'a çevirir)
const cleanFlag = sanitizeBoolean(input.isActive);
// true → true
// "true" → true
// "1" → true
// "yes" → true
// false → false
// "false" → false
// "0" → false
```

### Temizleme Kuralları

1. ✅ **TÜM kullanıcı girişlerini temizle** doğrulamadan önce
2. ✅ **Veritabanı işlemlerinden önce** temizle
3. ✅ **Veri tipine uygun temizleyici kullan**
4. ✅ **null/undefined'ı zarif bir şekilde ele al**
5. ✅ **İç içe nesnelere de uygula** gerekirse

### Temizleme Pattern'i

```typescript
// DOĞRU: Önce temizle, sonra doğrula
const id = sanitizeInt(input.id)!;
const name = sanitizeString(input.name)!;
const amount = sanitizeFloat(input.amount);

validateRequired(id, "ID");
validateRequired(name, "Ad");
validateStringLength(name, "Ad", 2, 100);
if (amount) validateRange(amount, "Miktar", 0, 1000000);
```

---

## Doğrulama (Validation)

### Doğrulama Fonksiyonları

```typescript
// Gerekli alan kontrolü
validateRequired(value, "Soru");
// null → ValidationError: "Soru gerekli"
// "" → ValidationError: "Soru boş olamaz"
// "test" → ✓

// String uzunluk kontrolü
validateStringLength(value, "Ad", minLength, maxLength);
// "A" (min:2) → ValidationError: "Ad en az 2 karakter olmalıdır"
// "Test" (min:2, max:10) → ✓
// "VeryLongName" (max:10) → ValidationError: "Ad en fazla 10 karakter olabilir"

// Enum doğrulama
validateEnum(value, "Durum", ["ACTIVE", "INACTIVE", "PENDING"]);
// "ACTIVE" → ✓
// "INVALID" → ValidationError: "Durum geçersiz değer. İzin verilen: ACTIVE, INACTIVE, PENDING"

// Sayısal aralık kontrolü
validateRange(value, "Miktar", min, max);
// 5 (min:1, max:10) → ✓
// 15 (max:10) → ValidationError: "Miktar en fazla 10 olabilir (şu an: 15)"
// -5 (min:1) → ValidationError: "Miktar en az 1 olmalıdır (şu an: -5)"

// Tarih aralığı doğrulama
validateDateRange(startDate, endDate, "Tarih Aralığı");
// start < end → ✓
// start > end → ValidationError: "Tarih Aralığı: Başlangıç tarihi bitiş tarihinden önce olmalıdır"

// Email doğrulama
validateEmail(email, "E-posta");
// "test@example.com" → ✓
// "invalid" → ValidationError: "E-posta geçerli bir e-posta adresi olmalıdır"

// URL doğrulama
validateURL(url, "Website");
// "https://example.com" → ✓
// "invalid" → ValidationError: "Website geçerli bir URL olmalıdır"

// JSON doğrulama
validateJSON(jsonString, "Metadata");
// '{"key": "value"}' → ✓
// '{invalid}' → ValidationError: "Metadata geçerli bir JSON formatında olmalıdır"

// ID dizisi doğrulama
validateIdArray(ids, "Kategori ID'leri", maxLength);
// [1, 2, 3] → ✓
// [-1, 2] → ValidationError: "Kategori ID'leri içinde geçersiz ID değeri bulundu"
// [1..101] (max:100) → ValidationError: "Kategori ID'leri maksimum 100 öğe içerebilir"
```

### Doğrulama Kuralları

1. ✅ **Temizlemeden sonra doğrula**
2. ✅ **Tüm gerekli alanları doğrula**
3. ✅ **Veri tiplerini ve formatları doğrula**
4. ✅ **İş mantığı kurallarını doğrula** (örn: tarih aralıkları)
5. ✅ **Türkçe alan isimleri kullan** hata mesajlarında
6. ✅ **ValidationError fırlat** başarısızlıkta

### Doğrulama Pattern'i

```typescript
// Temizle
const question = sanitizeString(input.question)!;
const isPublic = sanitizeBoolean(input.isPublic) ?? true;

// Doğrula
validateRequired(question, "Soru");
validateStringLength(question, "Soru", 10, 1000);

// İş mantığında kullan
const result = await ctx.prisma.question.create({
  data: { question, isPublic },
});
```

---

## Loglama

### Loglama Fonksiyonları

```typescript
// Performans takibi için timer oluştur
const timer = createTimer("operationName");

// Başarılı işlemi logla
logInfo("İşlem tamamlandı", {
  operationName: "createEntity",
  userId: ctx.user?.id,
  entityId: result.id,
  metadata: timer.end(), // { duration: "123ms" } döner
});

// Uyarı logla
logWarning("Potansiyel sorun", { details });

// Hata logla (handleError içinde otomatik)
```

### Loglama Kuralları

1. ✅ **Resolver başında timer oluştur**
2. ✅ **Başarılı işlemleri detaylı logla**
3. ✅ **timer.end()'i metadata'ya ekle**
4. ✅ **Kullanıcı context'ini logla** (userId, role)
5. ✅ **Entity context'ini logla** (entityId, count)
6. ✅ **Açıklayıcı işlem isimleri kullan**

### Loglama Pattern'i

```typescript
const timer = createTimer("createQuestion");
try {
  // ... işlem mantığı ...

  logInfo("Soru oluşturuldu", {
    questionId: result.id,
    userId: ctx.user?.id,
    collectionId: input.collectionId,
    metadata: timer.end(),
  });

  return result;
} catch (error) {
  // Hata otomatik olarak handleError tarafından loglanır
  handleError(error);
  throw error;
}
```

### Log Mesajı Örnekleri

```typescript
// ✅ DOĞRU: Açıklayıcı Türkçe log mesajları
logInfo("Soru oluşturuldu", { ... });
logInfo("Sorular listelendi", { ... });
logInfo("Teklif gönderildi", { ... });
logInfo("Kazanan seçildi", { ... });
logInfo("Ödeme tamamlandı", { ... });

// ❌ YANLIŞ: İngilizce log mesajları
logInfo("Question created", { ... });
logInfo("Quote submitted", { ... });
```

---

## Güvenlik & Yetkilendirme

### Kimlik Doğrulama

```typescript
// Kullanıcı doğrulanmış mı kontrol et
requireAuth(ctx.user?.id);
// undefined → AuthenticationError: "Kimlik doğrulama gerekli"
// 123 → ✓
```

### Yetkilendirme Scope'ları

```typescript
// Herkese açık (auth gerekmez)
authScopes: {
  public: true;
}

// Herhangi bir doğrulanmış kullanıcı
authScopes: {
  user: true;
}

// Sadece admin
authScopes: {
  admin: true;
}

// Sadece şirket sahibi
authScopes: {
  companyOwner: true;
}
```

### Rol Bazlı Filtreleme

```typescript
// Kullanıcı rolüne göre filtrele
if (ctx.user!.role !== "ADMIN") {
  where.OR = [{ userId: ctx.user!.id }, { companyId: ctx.user!.companyId }];
}
```

### İzin Kontrolleri

```typescript
// Spesifik izin kontrolü
if (entity.userId !== ctx.user?.id && ctx.user?.role !== "ADMIN") {
  throw new ForbiddenError("Bu kaydı düzenleme yetkiniz yok");
}

// Sahiplik kontrolü
if (question.customerId !== ctx.user?.id && ctx.user?.role !== "ADMIN") {
  throw new ForbiddenError("Sadece kendi sorunuzu düzenleyebilirsiniz");
}

// Üretici kontrolü
if (quote.manufactureId !== ctx.user?.id && ctx.user?.role !== "ADMIN") {
  throw new ForbiddenError("Sadece kendi teklifinizi düzenleyebilirsiniz");
}
```

### Güvenlik Kuralları

1. ✅ **Her zaman kimlik doğrulama kontrol et** korunan endpoint'lerde
2. ✅ **Veriyi kullanıcı rolüne göre filtrele** query'lerde
3. ✅ **Sahipliği doğrula** güncelleme/silme işlemlerinden önce
4. ✅ **authScopes kullan** otomatik kontroller için
5. ✅ **En az yetki prensibini uygula**
6. ✅ **XSS/SQL injection önlemek için temizle**

---

## Kod Örnekleri

### Örnek 1: Basit Query

```typescript
/**
 * QUERY: questions
 *
 * Açıklama: Koleksiyon için soruları listeler
 * Güvenlik: Public (herkese açık)
 * Döner: Question dizisi
 */
builder.queryField("questions", (t) =>
  t.prismaField({
    type: ["Question"],
    args: {
      collectionId: t.arg.int({ required: true }),
      filter: t.arg({ type: QuestionFilterInput, required: false }),
      pagination: t.arg({ type: QuestionPaginationInput, required: false }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("questions");
      try {
        // Temizle
        const collectionId = sanitizeInt(args.collectionId)!;
        validateRequired(collectionId, "Koleksiyon ID");

        // Where koşullarını oluştur
        const where: any = {
          collectionId,
          isPublic: true,
        };

        // Filtreleri uygula
        if (
          args.filter?.isAnswered !== null &&
          args.filter?.isAnswered !== undefined
        ) {
          where.isAnswered = args.filter.isAnswered;
        }

        // Tarih filtresi
        if (args.filter?.startDate || args.filter?.endDate) {
          where.createdAt = {};
          if (args.filter.startDate) {
            where.createdAt.gte = new Date(args.filter.startDate);
          }
          if (args.filter.endDate) {
            where.createdAt.lte = new Date(args.filter.endDate);
          }

          // Tarih aralığını doğrula
          if (args.filter.startDate && args.filter.endDate) {
            validateDateRange(
              new Date(args.filter.startDate),
              new Date(args.filter.endDate),
              "Tarih aralığı"
            );
          }
        }

        // Pagination ayarla
        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        // Query'yi çalıştır
        const questions = await ctx.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        // Logla
        logInfo("Sorular listelendi", {
          collectionId,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
```

### Örnek 2: Create Mutation

```typescript
/**
 * MUTATION: askQuestion
 *
 * Açıklama: Müşterilerin koleksiyonlar hakkında soru sormasını sağlar
 *
 * Akış:
 * 1. Girdileri doğrula (soru uzunluğu: 10-1000 karakter)
 * 2. Koleksiyonu ve üreticiyi bul
 * 3. Soru kaydı oluştur
 * 4. Üreticiye gerçek zamanlı bildirim gönder
 *
 * İzinler: Herhangi bir doğrulanmış kullanıcı
 * Bildirim: Koleksiyon sahibine (üretici) gönderilir
 */
builder.mutationField("askQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      input: t.arg({ type: AskQuestionInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, ctx) => {
      const timer = createTimer("askQuestion");
      try {
        requireAuth(ctx.user?.id);

        // Temizle
        const collectionId = sanitizeInt(input.collectionId)!;
        const question = sanitizeString(input.question)!;
        const isPublic =
          input.isPublic !== undefined
            ? sanitizeBoolean(input.isPublic)!
            : true;

        // Doğrula
        validateRequired(collectionId, "Koleksiyon ID");
        validateRequired(question, "Soru");
        validateStringLength(question, "Soru", 10, 1000);

        // Koleksiyonu bul
        const collection = await ctx.prisma.collection.findUnique({
          where: { id: collectionId },
        });

        if (!collection) {
          throw new NotFoundError("Koleksiyon", collectionId);
        }

        // Soru oluştur
        const newQuestion = await ctx.prisma.question.create({
          ...query,
          data: {
            question,
            collectionId,
            customerId: ctx.user!.id,
            manufactureId: collection.authorId || 0,
            isPublic,
            isAnswered: false,
          },
        });

        // Bildirim gönder
        if (collection.authorId) {
          const notif = await ctx.prisma.notification.create({
            data: {
              userId: collection.authorId,
              type: "MESSAGE",
              title: "Yeni Soru",
              message: `Koleksiyonunuz hakkında yeni bir soru soruldu: ${question.substring(
                0,
                50
              )}...`,
              link: `/collections/${collectionId}/questions`,
              data: {
                questionId: newQuestion.id,
                collectionId,
                question: question.substring(0, 100),
              } as any,
            },
          });
          await publishNotification(notif);
        }

        // Logla
        logInfo("Soru soruldu", {
          questionId: newQuestion.id,
          collectionId,
          customerId: ctx.user!.id,
          metadata: timer.end(),
        });

        return newQuestion;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
```

### Örnek 3: Analytics Query

```typescript
/**
 * QUERY: questionStats
 *
 * Açıklama: Kapsamlı soru istatistiklerini döner
 * Güvenlik: Kullanıcı kendi istatistiklerini görür, admin tümünü görür
 * Döner: JSON istatistik objesi
 */
builder.queryField("questionStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: QuestionFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("questionStats");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {};

        // Rol bazlı filtreleme
        if (ctx.user!.role !== "ADMIN") {
          where.OR = [
            { customerId: ctx.user!.id },
            { manufactureId: ctx.user!.id },
          ];
        }

        // Filtreleri uygula
        if (args.filter?.collectionId) {
          const collectionId = sanitizeInt(args.filter.collectionId)!;
          where.collectionId = collectionId;
        }

        if (
          args.filter?.isAnswered !== null &&
          args.filter?.isAnswered !== undefined
        ) {
          where.isAnswered = args.filter.isAnswered;
        }

        if (args.filter?.startDate || args.filter?.endDate) {
          where.createdAt = {};
          if (args.filter.startDate) {
            where.createdAt.gte = new Date(args.filter.startDate);
          }
          if (args.filter.endDate) {
            where.createdAt.lte = new Date(args.filter.endDate);
          }

          // Tarih aralığını doğrula
          if (args.filter.startDate && args.filter.endDate) {
            validateDateRange(
              new Date(args.filter.startDate),
              new Date(args.filter.endDate),
              "Tarih aralığı"
            );
          }
        }

        // Paralel query'leri çalıştır
        const [total, answered, unanswered, publicQuestions, privateQuestions] =
          await Promise.all([
            ctx.prisma.question.count({ where }),
            ctx.prisma.question.count({
              where: { ...where, isAnswered: true },
            }),
            ctx.prisma.question.count({
              where: { ...where, isAnswered: false },
            }),
            ctx.prisma.question.count({ where: { ...where, isPublic: true } }),
            ctx.prisma.question.count({ where: { ...where, isPublic: false } }),
          ]);

        const stats = {
          total,
          answered,
          unanswered,
          answerRate: total > 0 ? ((answered / total) * 100).toFixed(2) : "0",
          publicQuestions,
          privateQuestions,
        };

        logInfo("Soru istatistikleri alındı", {
          userId: ctx.user!.id,
          stats,
          metadata: timer.end(),
        });

        return stats;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
```

### Örnek 4: Toplu İşlem (Bulk Operation)

```typescript
/**
 * MUTATION: bulkAnswerQuestions
 *
 * Açıklama: Üreticilerin birden fazla soruyu aynı anda cevaplamasını sağlar
 *
 * Akış:
 * 1. Tüm cevapları doğrula
 * 2. Tüm soruların var olduğunu kontrol et
 * 3. Üreticinin tüm koleksiyonlara sahip olduğunu doğrula
 * 4. Tüm soruları güncelle
 * 5. Tüm müşterilere bildirim gönder
 *
 * İzinler: Koleksiyon sahibi üretici veya ADMIN
 *
 * Özellikler:
 * - İşlemden önce tüm soruları doğrular
 * - Her müşteriye ayrı bildirim gönderir
 * - Başarılı cevaplanan soru sayısını döner
 */
builder.mutationField("bulkAnswerQuestions", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkAnswerQuestionsInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, { input }, ctx) => {
      const timer = createTimer("bulkAnswerQuestions");
      try {
        requireAuth(ctx.user?.id);

        const answers = input.answers || [];

        if (answers.length === 0) {
          throw new ValidationError("En az bir cevap gerekli");
        }

        // Tüm girdileri doğrula
        for (const item of answers) {
          const id = sanitizeInt(item.id)!;
          const answer = sanitizeString(item.answer)!;
          validateRequired(id, "Soru ID");
          validateRequired(answer, "Cevap");
          validateStringLength(answer, "Cevap", 10, 2000);
        }

        // Tüm soruları çek
        const questionIds = answers.map((a) => sanitizeInt(a.id)!);
        const questions = await ctx.prisma.question.findMany({
          where: { id: { in: questionIds } },
        });

        if (questions.length !== questionIds.length) {
          throw new ValidationError("Bir veya daha fazla soru bulunamadı");
        }

        // İzinleri doğrula
        for (const question of questions) {
          if (
            question.manufactureId !== ctx.user?.id &&
            ctx.user?.role !== "ADMIN"
          ) {
            throw new ForbiddenError(
              `Soru #${question.id} için cevaplama yetkiniz yok`
            );
          }
        }

        // Tüm soruları güncelle
        let answeredCount = 0;
        const notifications: any[] = [];

        for (const item of answers) {
          const id = sanitizeInt(item.id)!;
          const answer = sanitizeString(item.answer)!;
          const question = questions.find((q) => q.id === id);

          if (!question) continue;

          await ctx.prisma.question.update({
            where: { id },
            data: { answer, isAnswered: true },
          });

          answeredCount++;

          // Bildirim hazırla
          if (question.customerId) {
            notifications.push({
              userId: question.customerId,
              type: "MESSAGE",
              title: "Sorunuz Cevaplandı",
              message: `Sorduğunuz soru cevaplandı: ${answer.substring(
                0,
                50
              )}...`,
              link: `/collections/${question.collectionId}/questions`,
              data: {
                questionId: id,
                collectionId: question.collectionId,
              } as any,
            });
          }
        }

        // Tüm bildirimleri gönder
        if (notifications.length > 0) {
          await ctx.prisma.notification.createMany({
            data: notifications,
          });

          // Gerçek zamanlı bildirimleri gönder
          for (const notifData of notifications) {
            const notif = await ctx.prisma.notification.findFirst({
              where: {
                userId: notifData.userId,
                title: notifData.title,
              },
              orderBy: { createdAt: "desc" },
            });
            if (notif) await publishNotification(notif);
          }
        }

        logInfo("Sorular toplu cevaplandı", {
          answeredCount,
          manufactureId: ctx.user?.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          answeredCount,
          totalQuestions: answers.length,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
```

---

## Kontrol Listesi

### Commit Öncesi - Query Kontrol Listesi

- [ ] **Header Dokümantasyonu**: 30-50 satır Türkçe açıklama (amaç, query'ler, güvenlik)
- [ ] **Import'lar**: Tüm gerekli utils import edildi (errors, logger, sanitize, validation)
- [ ] **Input Type'lar**: 4-6 input type tanımlandı (Filter, Pagination, Search, DateRange)
- [ ] **Standart Query'ler**: 3-5 temel query implement edildi
- [ ] **Analitik Query'ler**: 3-5 analitik query implement edildi
- [ ] **Arama Query'leri**: 2-4 arama/filtreleme query'si implement edildi
- [ ] **Try-Catch**: Tüm query'ler try-catch ile sarıldı
- [ ] **Kimlik Doğrulama**: requireAuth() gerektiğinde çağrıldı
- [ ] **Temizleme**: Tüm girişler uygun fonksiyonlarla temizlendi
- [ ] **Doğrulama**: Tüm kritik alanlar doğrulandı
- [ ] **Rol Bazlı Filtreleme**: Where koşullarında uygulandı
- [ ] **Pagination**: Limitler zorunlu kılındı (max 100)
- [ ] **Timer**: Her query başında createTimer() oluşturuldu
- [ ] **Loglama**: Başarıda logInfo() metadata ile çağrıldı
- [ ] **Hata Yönetimi**: Catch bloklarında handleError() çağrıldı
- [ ] **Türkçe Mesajlar**: Tüm hata ve log mesajları Türkçe
- [ ] **TypeScript**: Derleme hatası yok

### Commit Öncesi - Mutation Kontrol Listesi

- [ ] **Header Dokümantasyonu**: 30-40 satır Türkçe açıklama (amaç, mutation'lar, izinler)
- [ ] **Import'lar**: Tüm gerekli utils import edildi
- [ ] **Input Type'lar**: 5-10 input type tüm işlemler için tanımlandı
- [ ] **Temel Mutation'lar**: Create, update, delete implement edildi
- [ ] **Toplu İşlemler**: 2-3 toplu işlem implement edildi (gerekirse)
- [ ] **Admin İşlemleri**: 1-2 sadece admin işlem implement edildi (gerekirse)
- [ ] **Try-Catch**: Tüm mutation'lar try-catch ile sarıldı
- [ ] **Kimlik Doğrulama**: requireAuth() başta çağrıldı
- [ ] **Temizleme**: Tüm girişler temizlendi
- [ ] **Doğrulama**: Tüm alanlar uygun kurallarla doğrulandı
- [ ] **Yetkilendirme**: Hassas işlemler için izin kontrolü
- [ ] **İş Mantığı**: Domain kuralları uygulandı
- [ ] **Bildirimler**: Gerçek zamanlı bildirimler gerektiğinde gönderildi
- [ ] **Timer**: Başta createTimer() oluşturuldu
- [ ] **Loglama**: Başarı detaylı loglandı
- [ ] **Hata Yönetimi**: Kapsamlı hata yönetimi
- [ ] **Türkçe Mesajlar**: Tüm hata, validation ve bildirim mesajları Türkçe
- [ ] **TypeScript**: Derleme hatası yok

### Performans Kontrol Listesi

- [ ] **Pagination Limitleri**: Max 100 öğe per query
- [ ] **Paralel Query'ler**: Bağımsız query'ler için Promise.all()
- [ ] **İndeksli Alanlar**: Where koşulları indeksli kolonları kullanıyor
- [ ] **Select Alanları**: Sadece gerekli alanlar çekiliyor (Prisma query via)
- [ ] **N+1 Önleme**: Doğru include/relation kullanımı

### Güvenlik Kontrol Listesi

- [ ] **XSS Önleme**: Tüm metin girişlerinde sanitizeString()
- [ ] **SQL Injection**: Prisma kullanımı (parametreli query'ler)
- [ ] **Kimlik Doğrulama**: Korunan endpoint'ler auth kontrolü yapıyor
- [ ] **Yetkilendirme**: Kullanıcılar sadece kendi verilerine erişiyor
- [ ] **Rol Bazlı Erişim**: Admin/owner/employee rolleri uygulanıyor
- [ ] **Girdi Doğrulama**: Ham kullanıcı girişi veritabanına ulaşmıyor
- [ ] **Rate Limiting**: Toplu işlemler makul limitlerde

---

## Hızlı Referans

### En Yaygın Pattern'ler

```typescript
// 1. Temel Query Pattern'i
const timer = createTimer("queryName");
try {
  requireAuth(ctx.user?.id);
  const id = sanitizeInt(args.id)!;
  validateRequired(id, "ID");
  const result = await ctx.prisma.entity.findUnique({ where: { id } });
  logInfo("Başarılı", { id, metadata: timer.end() });
  return result;
} catch (error) {
  handleError(error);
  throw error;
}

// 2. Temel Mutation Pattern'i
const timer = createTimer("mutationName");
try {
  requireAuth(ctx.user?.id);
  const name = sanitizeString(input.name)!;
  validateRequired(name, "Ad");
  validateStringLength(name, "Ad", 2, 100);
  const result = await ctx.prisma.entity.create({ data: { name } });
  logInfo("Oluşturuldu", { id: result.id, metadata: timer.end() });
  return result;
} catch (error) {
  handleError(error);
  throw error;
}

// 3. Pagination Pattern'i
const skip = sanitizeInt(args.pagination?.skip) || 0;
const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

// 4. Rol Bazlı Filtreleme Pattern'i
if (ctx.user!.role !== "ADMIN") {
  where.userId = ctx.user!.id;
}

// 5. Tarih Aralığı Doğrulama Pattern'i
if (args.filter?.startDate && args.filter?.endDate) {
  validateDateRange(
    new Date(args.filter.startDate),
    new Date(args.filter.endDate),
    "Tarih aralığı"
  );
}

// 6. Bildirim Gönderme Pattern'i
const notif = await ctx.prisma.notification.create({
  data: {
    userId: targetUserId,
    type: "INFO",
    title: "Başlık (Türkçe)",
    message: "Mesaj içeriği (Türkçe)",
    link: `/path/${entityId}`,
    data: { entityId, otherData } as any,
  },
});
await publishNotification(notif);
```

---

## Versiyon Geçmişi

- **v2.0.0** (1 Kasım 2025): Türkçe dil politikası eklendi

  - Tüm kod açıklamaları Türkçe
  - Tüm hata mesajları Türkçe
  - Tüm validation mesajları Türkçe
  - Tüm log mesajları Türkçe
  - Tüm bildirim metinleri Türkçe
  - Değişken/fonksiyon isimleri İngilizce (best practice)
  - Kapsamlı örnekler eklendi

- **v1.0.0** (1 Kasım 2025): İlk standart dokümantasyonu
  - Query standartları
  - Mutation standartları
  - Hata yönetimi pattern'leri
  - Temizleme kuralları
  - Doğrulama kılavuzları
  - Loglama standartları
  - Güvenlik best practice'leri

---

## İlgili Dokümanlar

- [Backend Development Guide](./BACKEND_DEVELOPMENT.md)
- [Hata Yönetimi Dokümantasyonu](./src/utils/errors.ts)
- [Doğrulama Utilities](./src/utils/validation.ts)
- [Temizleme Utilities](./src/utils/sanitize.ts)
- [Loglama Utilities](./src/utils/logger.ts)

---

**Not**: Bu yaşayan bir dokümandır. Yeni pattern'ler ortaya çıktıkça veya standartlar evrildiğinde güncelleyin.
