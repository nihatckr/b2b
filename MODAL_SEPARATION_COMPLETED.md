# Numune Modal Ayrımı - İki Farklı Modal

## 🎯 Yapılan Değişiklikler

### Önceki Durum
- ❌ İki buton var ama ikisi de aynı modalı açıyordu
- ❌ Radio butonla seçim yapılıyordu
- ❌ Revize için koleksiyon bilgileri gösterilmiyordu

### Yeni Durum
- ✅ **2 Farklı Modal:**
  1. **SampleRequestModal** → Sadece standart numune (not alanı)
  2. **RevisionSampleModal** → Koleksiyon bilgileri + değişiklik yapma
- ✅ Basitleştirilmiş iş akışı
- ✅ Daha iyi kullanıcı deneyimi

---

## 📋 Modal Detayları

### 1. SampleRequestModal (Basitleştirildi)

**Ne Zaman Açılır:**
- "Numune Talep Et" butonuna tıklandığında

**Özellikler:**
- ✅ Sadece standart numune talebi
- ✅ Radio button seçeneği **kaldırıldı**
- ✅ Tek amaç: Aynen numune talep etmek
- ✅ Basit not alanı

**UI:**
```
┌─────────────────────────────────────────────┐
│ 📄 Standart Numune Talebi                  │
├─────────────────────────────────────────────┤
│ [Koleksiyon Adı] ürününün aynen           │
│ numunesini talep edin                      │
├─────────────────────────────────────────────┤
│ ℹ️ Standart Numune Talebi                  │
│ Bu ürünün aynen numunesini talep          │
│ ediyorsunuz. Ürün özellikleri             │
│ değiştirilmeyecektir.                     │
├─────────────────────────────────────────────┤
│ Talep Notunuz: *                          │
│ [Numune ile ilgili özel isteklerinizi,   │
│  termin beklentinizi, numune adetini...]  │
├─────────────────────────────────────────────┤
│ 💡 Bilgi                                   │
│ Numune talebiniz üreticiye iletilecektir │
├─────────────────────────────────────────────┤
│              [İptal] [Talebi Gönder]      │
└─────────────────────────────────────────────┘
```

**Kaldırılan:**
- ❌ Radio Group (Standart/Revize seçimi)
- ❌ Edit3 icon import
- ❌ RadioGroup, RadioGroupItem imports
- ❌ sampleType state

**Interface:**
```typescript
export interface SampleRequestData {
  collectionId: number;
  sampleType: "STANDARD" | "REVISION";  // Artık sadece STANDARD gönderiliyor
  customerNote: string;
}
```

---

### 2. RevisionSampleModal (YENİ DOSYA)

**Ne Zaman Açılır:**
- "Revize İle Numune" butonuna tıklandığında

**Özellikler:**
- ✅ Mevcut koleksiyon bilgileri gösterilir
- ✅ Tüm alanlar düzenlenebilir
- ✅ Değişiklik takibi (hangi alanlar değişti)
- ✅ Revize açıklaması (zorunlu)

**Düzenlenebilir Alanlar:**
1. **Sezon** - Örn: İlkbahar/Yaz 2025
2. **Cinsiyet** - Örn: Unisex, Kadın, Erkek
3. **Kesim/Kalıp** - Örn: Slim Fit, Regular, Oversize
4. **Kumaş Bileşimi** - Örn: %100 Pamuk, %95 Pamuk %5 Elastan
5. **Renkler** - Örn: Lacivert, Beyaz, Gri Melanj
6. **Hedef Fiyat** - $ cinsinden
7. **MOQ** - Adet cinsinden

**UI:**
```
┌───────────────────────────────────────────────────┐
│ ✏️ Revize İle Numune Talebi                      │
├───────────────────────────────────────────────────┤
│ [Koleksiyon Adı] (Model: ABC123) ürününde       │
│ yapmak istediğiniz değişiklikleri belirtin      │
├───────────────────────────────────────────────────┤
│ 📋 Mevcut Ürün Bilgileri:                        │
│ Sezon: [İlkbahar/Yaz 2024]                       │
│ Cinsiyet: [Unisex]                               │
│ Kesim: [Regular Fit]                             │
├───────────────────────────────────────────────────┤
│ ✏️ Değişiklik Yapmak İstediğiniz Alanlar:       │
│                                                   │
│ Sezon:    [İlkbahar/Yaz 2025        ]           │
│ Cinsiyet: [Kadın                     ]           │
│                                                   │
│ Kesim:    [Slim Fit                  ]           │
│                                                   │
│ Kumaş:    [%95 Pamuk %5 Elastan      ]           │
│           [                           ]           │
│                                                   │
│ Renkler:  [Lacivert, Beyaz, Pudra    ]           │
│                                                   │
│ Hedef Fiyat: [$12.50]  MOQ: [500]               │
├───────────────────────────────────────────────────┤
│ Revize Açıklaması: *                             │
│ [Yapmak istediğiniz değişiklikleri              │
│  detaylı olarak açıklayın. Örneğin: Cep        │
│  detayları, düğme tipi, dikiş türü...]         │
├───────────────────────────────────────────────────┤
│ ⚠️ Değiştirilen Alanlar:                         │
│ • Sezon: İlkbahar/Yaz 2024 → İlkbahar/Yaz 2025 │
│ • Cinsiyet: Unisex → Kadın                       │
│ • Kesim: Regular Fit → Slim Fit                  │
│ • Kumaş değiştirildi                             │
│ • Renkler değiştirildi                           │
│ • MOQ değiştirildi                               │
├───────────────────────────────────────────────────┤
│ 💡 Bilgi                                          │
│ Revize talebiniz üreticiye iletilecektir.       │
│ Üretici değişiklikleri değerlendirerek numune   │
│ üretim süresi ve fiyat bilgisi ile size geri    │
│ dönüş yapacaktır.                                │
├───────────────────────────────────────────────────┤
│         [İptal] [Revize Talebi Gönder]          │
└───────────────────────────────────────────────────┘
```

**Interface:**
```typescript
interface Collection {
  id: number;
  name: string;
  modelCode: string;
  season?: string;
  gender?: string;
  fit?: string;
  fabricComposition?: string;
  colors?: string;
  targetPrice?: number;
  moq?: number;
}

export interface RevisionSampleData {
  collectionId: number;
  revisions: {
    season?: string;
    gender?: string;
    fit?: string;
    fabricComposition?: string;
    colors?: string;
    targetPrice?: string;
    moq?: string;
  };
  revisionNote: string;
}
```

**Değişiklik Takibi:**
```typescript
const hasChanges =
  season !== (collection.season || "") ||
  gender !== (collection.gender || "") ||
  fit !== (collection.fit || "") ||
  fabricComposition !== (collection.fabricComposition || "") ||
  colors !== (collection.colors || "") ||
  targetPrice !== (collection.targetPrice?.toString() || "") ||
  moq !== (collection.moq?.toString() || "");
```

**Sadece Değişen Alanlar Gönderiliyor:**
```typescript
revisions: {
  season: season !== collection.season ? season : undefined,
  gender: gender !== collection.gender ? gender : undefined,
  fit: fit !== collection.fit ? fit : undefined,
  // ... diğer alanlar
}
```

---

## 🔄 Kullanıcı Akışı Karşılaştırması

### Önceki Akış (Tek Modal)
```
[Numune Talep Et] butonuna tıkla
  ↓
Modal açılır
  ↓
Radio button ile seç:
  • Standart Numune
  • Revize Numune      ← Sadece seçenek, bilgi yok
  ↓
Not yaz
  ↓
Gönder
```

### Yeni Akış (İki Ayrı Modal)

**Standart Numune:**
```
[Numune Talep Et] butonuna tıkla
  ↓
SampleRequestModal açılır
  ↓
Bilgilendirme: "Bu ürünün aynen numunesi"
  ↓
Not yaz (termin, adet, özel istekler)
  ↓
Gönder
✅ Basit ve hızlı
```

**Revize Numune:**
```
[Revize İle Numune] butonuna tıkla
  ↓
RevisionSampleModal açılır
  ↓
Mevcut ürün bilgileri gösterilir:
  • Sezon: İlkbahar/Yaz 2024
  • Cinsiyet: Unisex
  • Kesim: Regular Fit
  • Kumaş: %100 Pamuk
  • vb.
  ↓
Değiştirmek istediğin alanları düzenle
  ↓
Değişiklikler otomatik gösterilir:
  ⚠️ Cinsiyet: Unisex → Kadın
  ⚠️ Kesim: Regular → Slim Fit
  ↓
Revize açıklaması yaz (detaylar)
  ↓
Gönder
✅ Detaylı ve profesyonel
```

---

## 📊 Kod Değişiklikleri

### SampleRequestModal.tsx

#### Kaldırılan Kod
```typescript
// State
const [sampleType, setSampleType] = useState<"STANDARD" | "REVISION">(...);

// Radio Group UI
<RadioGroup value={sampleType} onValueChange={...}>
  <RadioGroupItem value="STANDARD" />
  <RadioGroupItem value="REVISION" />
</RadioGroup>

// Imports
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit3, ... } from "lucide-react";
```

#### Eklenen Kod
```typescript
// Bilgilendirme kutusu
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
  <p className="font-medium">📦 Standart Numune Talebi</p>
  <p className="text-xs">
    Bu ürünün aynen numunesini talep ediyorsunuz.
  </p>
</div>
```

#### Güncellenmiş Başlık
```typescript
// ÖNCE
<DialogTitle>
  {type === "revision" ? "Revize İle Numune" : "Numune Talebi"}
</DialogTitle>

// SONRA
<DialogTitle>
  <FileText /> Standart Numune Talebi
</DialogTitle>
```

---

### RevisionSampleModal.tsx (YENİ DOSYA)

**Temel Özellikler:**

1. **State Management:**
```typescript
const [season, setSeason] = useState(collection.season || "");
const [gender, setGender] = useState(collection.gender || "");
const [fit, setFit] = useState(collection.fit || "");
const [fabricComposition, setFabricComposition] = useState(collection.fabricComposition || "");
const [colors, setColors] = useState(collection.colors || "");
const [targetPrice, setTargetPrice] = useState(collection.targetPrice?.toString() || "");
const [moq, setMoq] = useState(collection.moq?.toString() || "");
const [revisionNote, setRevisionNote] = useState("");
```

2. **Mevcut Bilgileri Gösterme:**
```typescript
<div className="bg-gray-50 border rounded-lg p-4">
  <p className="font-medium">📋 Mevcut Ürün Bilgileri:</p>
  {collection.season && <Badge>{collection.season}</Badge>}
  {collection.gender && <Badge>{collection.gender}</Badge>}
  {collection.fit && <span>{collection.fit}</span>}
</div>
```

3. **Düzenlenebilir Alanlar:**
```typescript
<Input
  id="season"
  placeholder="Örn: İlkbahar/Yaz 2025"
  value={season}
  onChange={(e) => setSeason(e.target.value)}
/>
```

4. **Değişiklik Özeti:**
```typescript
{hasChanges && (
  <div className="bg-yellow-50 border">
    <p>⚠️ Değiştirilen Alanlar:</p>
    <ul>
      {season !== collection.season &&
        <li>Sezon: {collection.season} → {season}</li>}
      {gender !== collection.gender &&
        <li>Cinsiyet: {collection.gender} → {gender}</li>}
    </ul>
  </div>
)}
```

---

### CustomerCollectionCard.tsx

#### Değişiklikler

1. **Import Eklendi:**
```typescript
import { RevisionSampleModal, type RevisionSampleData } from "./RevisionSampleModal";
```

2. **Collection Interface Güncellendi:**
```typescript
interface Collection {
  // ... mevcut alanlar
  colors?: string;  // YENİ
}
```

3. **Handler Güncellendi:**
```typescript
// ÖNCE
const handleRevisionRequest = async (data: SampleRequestData) => {
  // ...
};

// SONRA
const handleRevisionRequest = async (data: RevisionSampleData) => {
  // ...
};
```

4. **Modal Değiştirildi:**
```typescript
// ÖNCE
<SampleRequestModal
  isOpen={isRevisionModalOpen}
  onClose={...}
  collectionId={collection.id}
  collectionName={collection.name}
  type="revision"
  onSubmit={handleRevisionRequest}
/>

// SONRA
<RevisionSampleModal
  isOpen={isRevisionModalOpen}
  onClose={...}
  collection={collection}  // Tüm koleksiyon bilgisi
  onSubmit={handleRevisionRequest}
/>
```

---

## 🎨 UX İyileştirmeleri

### 1. Netlik
- ✅ Her buton ne yapacağı belli
- ✅ Modal açıldığında kullanıcı ne yapacağını biliyor
- ✅ Karışıklık yok

### 2. Hız
- ✅ Standart numune: Hızlı not yaz, gönder
- ✅ Revize: Detaylı düzenleme yap

### 3. Görsellik
- ✅ Mevcut bilgiler Badge ile vurgulanıyor
- ✅ Değişiklikler otomatik listeleniyoy
- ✅ Renk kodları (mavi=bilgi, sarı=uyarı)

### 4. Validasyon
- ✅ Her iki modalda da not zorunlu
- ✅ Revize'de değişiklik yoksa bile not gerekli
- ✅ Sadece değişen alanlar backend'e gönderiliyor

---

## 🚀 Backend Entegrasyonu (TODO)

### Standart Numune Mutation

```graphql
mutation CreateSampleRequest($input: CreateSampleRequestInput!) {
  createSampleRequest(input: $input) {
    id
    collectionId
    sampleType  # "STANDARD"
    customerNote
    status
    createdAt
  }
}
```

### Revize Numune Mutation

```graphql
mutation CreateRevisionRequest($input: CreateRevisionRequestInput!) {
  createRevisionRequest(input: $input) {
    id
    collectionId
    originalValues {
      season
      gender
      fit
      fabricComposition
      colors
      targetPrice
      moq
    }
    requestedChanges {
      season
      gender
      fit
      fabricComposition
      colors
      targetPrice
      moq
    }
    revisionNote
    status
    createdAt
  }
}

input CreateRevisionRequestInput {
  collectionId: Int!
  revisions: RevisionFieldsInput!
  revisionNote: String!
}

input RevisionFieldsInput {
  season: String
  gender: String
  fit: String
  fabricComposition: String
  colors: String
  targetPrice: String
  moq: String
}
```

### Prisma Schema Önerisi

```prisma
model SampleRequest {
  id           Int      @id @default(autoincrement())
  collectionId Int
  customerId   Int
  sampleType   String   // "STANDARD"
  customerNote String   @db.Text
  status       String   @default("PENDING")
  createdAt    DateTime @default(now())

  collection   Collection @relation(fields: [collectionId], references: [id])
  customer     User       @relation(fields: [customerId], references: [id])
}

model RevisionRequest {
  id                Int      @id @default(autoincrement())
  collectionId      Int
  customerId        Int

  // Orijinal değerler (referans)
  originalSeason    String?
  originalGender    String?
  originalFit       String?
  originalFabric    String?  @db.Text
  originalColors    String?
  originalPrice     Float?
  originalMoq       Int?

  // İstenen değişiklikler
  requestedSeason   String?
  requestedGender   String?
  requestedFit      String?
  requestedFabric   String?  @db.Text
  requestedColors   String?
  requestedPrice    Float?
  requestedMoq      Int?

  revisionNote      String   @db.Text
  status            String   @default("PENDING")
  createdAt         DateTime @default(now())

  collection        Collection @relation(fields: [collectionId], references: [id])
  customer          User       @relation(fields: [customerId], references: [id])
}
```

---

## ✅ Tamamlanan Özellikler

### SampleRequestModal
- [x] Radio group kaldırıldı
- [x] Sadece standart numune için
- [x] Basit bilgilendirme kutusu
- [x] Tek amaçlı modal
- [x] Gereksiz importlar temizlendi

### RevisionSampleModal
- [x] Yeni dosya oluşturuldu
- [x] Collection bilgileri gösteriliyor
- [x] Tüm alanlar düzenlenebilir
- [x] Değişiklik takibi
- [x] Değişiklik özeti
- [x] Revize açıklaması (zorunlu)
- [x] Sadece değişen alanlar gönderiliyor

### CustomerCollectionCard
- [x] RevisionSampleModal import
- [x] colors field eklendi
- [x] Handler güncellendi
- [x] Doğru modal çağrılıyor

---

## 📝 Dosya Özeti

### Değiştirilen Dosyalar
1. ✅ `SampleRequestModal.tsx` - Basitleştirildi, radio group kaldırıldı
2. ✅ `CustomerCollectionCard.tsx` - RevisionSampleModal entegrasyonu

### Yeni Dosyalar
1. ✅ `RevisionSampleModal.tsx` - Koleksiyon bilgileri ile revize modalı

### Hiçbir Değişiklik Gerektirmeyen
- `AddToOrderModal.tsx` - Değişmedi
- `QuestionModal.tsx` - Değişmedi

---

## 🎯 Sonuç

### Kullanıcı Açısından
1. **Numune Talep Et** → Hızlı ve basit (3 tıklama)
2. **Revize İle Numune** → Detaylı ve profesyonel (form doldur)

### Geliştirici Açısından
1. **Ayrı Sorumluluklar:** Her modal tek bir işe odaklanıyor
2. **Tip Güvenliği:** Farklı interface'ler
3. **Bakım Kolaylığı:** Kod tekrarı yok, her modal bağımsız

### İş Akışı Açısından
1. **Standart:** Müşteri sadece not yazıyor → Üretici numune gönderiyor
2. **Revize:** Müşteri değişiklik belirtiyor → Üretici değerlendiriyor → Karşı teklif veya onay

**Tüm özellikler başarıyla tamamlandı!** 🎉
