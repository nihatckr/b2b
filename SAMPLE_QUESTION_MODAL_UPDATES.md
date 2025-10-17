# Numune ve Soru Modalı Güncellemeleri

## 🎯 Yapılan Değişiklikler

### 1. SampleRequestModal - Sadece Mevcut Ürün İçin

**Önceki Durum:**
- ❌ 3 seçenek: Standart, Revize, **Özel Tasarım (CUSTOM)**
- ❌ Yeni numune talebi karttan yapılabiliyordu

**Yeni Durum:**
- ✅ 2 seçenek: **Standart** ve **Revize** (sadece mevcut ürün için)
- ✅ Özel tasarım/yeni numune → **My Samples sayfasında** olacak
- ✅ Daha basit ve odaklanmış modal

---

### 2. QuestionModal - Yeni Özellik

**Özellikler:**
- ✅ Ürün hakkında soru sorma modalı
- ✅ Üretici bilgisi gösterimi
- ✅ Örnek sorular listesi
- ✅ Mesajlaşma geçmişi bilgilendirmesi

---

### 3. CustomerCollectionCard - Soru Sor Butonu

**Eklenen:**
- ✅ Yeni "Soru Sor" butonu (4. buton)
- ✅ QuestionModal entegrasyonu
- ✅ Toast bildirimi

---

## 📋 Detaylı Değişiklikler

### SampleRequestModal.tsx

#### Kaldırılan Seçenek
```typescript
// KALDIRILAN - Artık yok
<RadioGroupItem value="CUSTOM" id="custom" />
<Label htmlFor="custom">
  <div>Özel Tasarım Numune</div>
  <div>Kendi tasarımınız için numune</div>
</Label>
```

#### Güncellenen Interface
```typescript
// ÖNCE
export interface SampleRequestData {
  collectionId: number;
  sampleType: "STANDARD" | "REVISION" | "CUSTOM";  // ❌
  customerNote: string;
}

// SONRA
export interface SampleRequestData {
  collectionId: number;
  sampleType: "STANDARD" | "REVISION";  // ✅ Sadece 2 seçenek
  customerNote: string;
}
```

#### Yeni Radio Seçenekleri
```tsx
<RadioGroup value={sampleType} onValueChange={...}>
  {/* Standart Numune */}
  <div className="border rounded-lg p-3">
    <RadioGroupItem value="STANDARD" />
    <Label>
      <div>Standart Numune</div>
      <div className="text-xs">Bu ürünün aynen numunesi</div>
    </Label>
  </div>

  {/* Revize Numune */}
  <div className="border rounded-lg p-3">
    <RadioGroupItem value="REVISION" />
    <Label>
      <div>Revize Numune</div>
      <div className="text-xs">Bu üründe değişiklik yaparak numune</div>
    </Label>
  </div>
</RadioGroup>
```

#### Placeholder Metni
```typescript
// ÖNCE - 3 durum
placeholder={
  sampleType === "REVISION"
    ? "Yapmak istediğiniz değişiklikleri..."
    : sampleType === "CUSTOM"  // ❌ Kaldırıldı
    ? "Özel tasarımınız hakkında..."
    : "Numune ile ilgili özel isteklerinizi..."
}

// SONRA - 2 durum
placeholder={
  sampleType === "REVISION"
    ? "Yapmak istediğiniz değişiklikleri detaylı olarak açıklayın..."
    : "Numune ile ilgili özel isteklerinizi, termin beklentinizi..."
}
```

---

### QuestionModal.tsx - YENİ DOSYA

#### Props Interface
```typescript
interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
  collectionName: string;
  manufacturerName?: string;
  onSubmit?: (data: QuestionData) => Promise<void>;
}

export interface QuestionData {
  collectionId: number;
  question: string;
}
```

#### Modal Başlığı
```tsx
<DialogTitle>
  <MessageCircle className="h-5 w-5 text-blue-600" />
  Ürün Hakkında Soru Sor
</DialogTitle>

<DialogDescription>
  <span className="font-medium">{collectionName}</span> ürünü hakkında
  sorunuzu <span className="font-medium">{manufacturerName}</span>
  üreticisine iletin
</DialogDescription>
```

#### Soru Input Alanı
```tsx
<Textarea
  id="question"
  placeholder="Örnek: Bu ürün için farklı renk seçenekleri mevcut mu?
              Minimum sipariş miktarı nedir? Numune gönderebilir misiniz?"
  rows={8}
/>
```

#### Örnek Sorular Bölümü
```tsx
<div className="bg-blue-50 border rounded-lg p-3">
  <p className="font-medium">💡 Örnek Sorular:</p>
  <ul className="list-disc list-inside">
    <li>Bu model için farklı kumaş seçenekleri sunuyor musunuz?</li>
    <li>1000 adet için üretim süresi ne kadar olur?</li>
    <li>Özel etiket ve paketleme hizmeti veriyor musunuz?</li>
    <li>Bu üründen numune gönderebilir misiniz?</li>
    <li>Toptan alımlarda indirim oranınız nedir?</li>
  </ul>
</div>
```

#### Bilgilendirme Kutusu
```tsx
<div className="bg-gray-50 border rounded-lg p-3">
  <p className="font-medium">ℹ️ Bilgi</p>
  <p className="text-xs">
    Sorunuz doğrudan üreticiye iletilecektir. Üretici en kısa sürede
    size geri dönüş yapacaktır. Mesajlaşma geçmişinizi "Mesajlarım"
    bölümünden takip edebilirsiniz.
  </p>
</div>
```

---

### CustomerCollectionCard.tsx Güncellemeleri

#### Yeni Import
```typescript
import { MessageCircle } from "lucide-react";
import { QuestionModal, type QuestionData } from "./QuestionModal";
```

#### Yeni State
```typescript
const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
```

#### Yeni Handler
```typescript
const handleQuestionSubmit = async (data: QuestionData) => {
  console.log("Question submitted:", data);
  toast({
    title: "✅ Sorunuz İletildi",
    description: `${collection.company?.name || "Üretici"} size en kısa
                  sürede geri dönüş yapacaktır.`,
  });
};
```

#### Güncellenmiş Buton Düzeni
```tsx
<CardFooter className="flex flex-col gap-2 pt-3">
  {/* Primary Action - Full Width */}
  <Button onClick={() => setIsOrderModalOpen(true)} className="w-full">
    <ShoppingCart /> Sipariş Ver (Add to PO)
  </Button>

  {/* Secondary Actions Row 1 - Numune Butonları */}
  <div className="flex gap-2 w-full">
    <Button variant="outline" className="flex-1">
      <FileText /> Numune Talep Et
    </Button>
    <Button variant="outline" className="flex-1">
      <Edit3 /> Revize İle Numune
    </Button>
  </div>

  {/* Secondary Actions Row 2 - Soru Sor */}
  <Button
    onClick={() => setIsQuestionModalOpen(true)}
    variant="outline"
    className="w-full"
  >
    <MessageCircle /> Soru Sor
  </Button>
</CardFooter>
```

#### Modal Render
```tsx
<QuestionModal
  isOpen={isQuestionModalOpen}
  onClose={() => setIsQuestionModalOpen(false)}
  collectionId={collection.id}
  collectionName={collection.name}
  manufacturerName={collection.company?.name}
  onSubmit={handleQuestionSubmit}
/>
```

---

## 🎨 Kullanıcı Deneyimi

### Numune Talep Akışı (Güncellenmiş)

**Standart Numune:**
1. "Numune Talep Et" butonuna tıkla
2. Modal açılır → **2 seçenek** (Standart/Revize)
3. "Standart Numune" seç
4. Not: "Bu ürünün aynen numunesi"
5. "Talebi Gönder"
6. Toast: "✅ Numune Talebi Gönderildi"

**Revize Numune:**
1. "Revize İle Numune" butonuna tıkla
2. Modal açılır → Revize seçili
3. Değişiklik isteklerini yaz
4. "Talebi Gönder"
5. Toast: "✅ Revize Talebi Gönderildi"

### Soru Sorma Akışı (YENİ)

1. "Soru Sor" butonuna tıkla
2. Modal açılır
3. Ürün ve üretici bilgileri gösterilir
4. Soruyu yaz
5. Örnek sorular yardımcı olur
6. "Soruyu Gönder"
7. Toast: "✅ Sorunuz İletildi - [Üretici Adı] size en kısa sürede geri dönüş yapacaktır"

---

## 📊 Buton Düzeni Karşılaştırması

### Önceki Düzen
```
┌──────────────────────────────────┐
│ [Sipariş Ver (Add to PO)]       │  Primary
├──────────────────────────────────┤
│ [Numune Talep] [Revize Numune]  │  Secondary
└──────────────────────────────────┘
```

### Yeni Düzen
```
┌──────────────────────────────────┐
│ [Sipariş Ver (Add to PO)]       │  Primary
├──────────────────────────────────┤
│ [Numune Talep] [Revize Numune]  │  Secondary Row 1
├──────────────────────────────────┤
│ [      Soru Sor      ]          │  Secondary Row 2 (YENİ)
└──────────────────────────────────┘
```

---

## 🔄 Backend Entegrasyonu (TODO)

### Soru Sorma Mutation

```graphql
type Mutation {
  askQuestion(input: AskQuestionInput!): Question!
}

input AskQuestionInput {
  collectionId: Int!
  question: String!
}

type Question {
  id: Int!
  collectionId: Int!
  collection: Collection!
  customerId: Int!
  customer: User!
  manufacturerId: Int!
  manufacturer: User!
  question: String!
  answer: String
  status: QuestionStatus!
  createdAt: DateTime!
  answeredAt: DateTime
}

enum QuestionStatus {
  PENDING
  ANSWERED
  CLOSED
}
```

### Prisma Schema Önerisi

```prisma
model Question {
  id             Int            @id @default(autoincrement())
  collectionId   Int
  customerId     Int
  manufacturerId Int
  question       String         @db.Text
  answer         String?        @db.Text
  status         QuestionStatus @default(PENDING)
  createdAt      DateTime       @default(now())
  answeredAt     DateTime?
  updatedAt      DateTime       @updatedAt

  collection     Collection     @relation(fields: [collectionId], references: [id])
  customer       User           @relation("CustomerQuestions", fields: [customerId], references: [id])
  manufacturer   User           @relation("ManufacturerQuestions", fields: [manufacturerId], references: [id])
}

enum QuestionStatus {
  PENDING   // Müşteri sordu, cevap bekliyor
  ANSWERED  // Üretici cevapladı
  CLOSED    // Konuşma kapatıldı
}
```

---

## 📍 Yeni Numune Talebi - My Samples Sayfası

**Not:** Özel tasarım/yeni numune talebi artık kartlardan kaldırıldı.

### Planlanan Konum: My Samples Sayfası

**Önerilen Sayfa Yapısı:**
```
My Samples (Numunelerim)
├─ Mevcut Numuneler
│  ├─ Onay Bekleyenler
│  ├─ Onaylananlar
│  ├─ Gönderilmiş Numuneler
│  └─ Reddedilenler
│
└─ [+ Yeni Numune Talebi Oluştur]  ← YENİ BUTON
   Modal açılır:
   ├─ Üretici Seç (dropdown)
   ├─ Ürün Bilgileri
   │  ├─ Ürün Tipi
   │  ├─ Kumaş Bilgileri
   │  ├─ Renkler
   │  └─ Bedenler
   ├─ Teknik Detaylar
   │  ├─ Teknik Çizim Upload
   │  ├─ Referans Görseller
   │  └─ Detaylı Açıklama
   └─ [Talep Oluştur]
```

**Avantajları:**
- Yeni tasarım talepleri merkezi bir yerden yönetilir
- Daha detaylı form (kartlardan bağımsız)
- Tüm numune geçmişi tek sayfada
- Üretici seçimi yapılabilir

---

## ✅ Tamamlanan Özellikler

### SampleRequestModal
- [x] CUSTOM seçeneği kaldırıldı
- [x] Sadece STANDARD ve REVISION
- [x] Interface güncellendi
- [x] Placeholder metinleri düzeltildi
- [x] Type safety sağlandı

### QuestionModal
- [x] Yeni modal oluşturuldu
- [x] Örnek sorular eklendi
- [x] Üretici bilgisi gösterimi
- [x] Mesajlaşma bilgilendirmesi
- [x] Loading durumları
- [x] Type-safe interface

### CustomerCollectionCard
- [x] QuestionModal import
- [x] MessageCircle icon import
- [x] isQuestionModalOpen state
- [x] handleQuestionSubmit handler
- [x] "Soru Sor" butonu eklendi
- [x] QuestionModal render
- [x] Toast bildirimi

---

## 📝 Dosya Özeti

### Değiştirilen Dosyalar
1. ✅ `SampleRequestModal.tsx` - CUSTOM kaldırıldı, sadece mevcut ürün için
2. ✅ `CustomerCollectionCard.tsx` - Soru sor butonu eklendi

### Yeni Dosyalar
1. ✅ `QuestionModal.tsx` - Ürün hakkında soru sorma modalı

### Hiçbir Değişiklik Gerektirmeyen
- `AddToOrderModal.tsx` - Değişmedi
- `page.tsx` (collections) - Değişmedi

---

## 🎯 Sonuç

### Kullanıcı Akışı Basitleştirildi

**Mevcut Ürün İçin (Karttan):**
- ✅ Standart numune talep et
- ✅ Revize numune talep et
- ✅ Sipariş ver
- ✅ Soru sor

**Yeni Ürün İçin (My Samples Sayfasından):**
- ✅ Yeni numune talebi oluştur (özel tasarım)
- ✅ Tüm numuneleri yönet
- ✅ Geçmiş takibi

### İyileştirmeler
1. **Daha Az Karışıklık:** Kartlar sadece mevcut ürünler için
2. **Daha Odaklanmış:** Her modal tek amaca hizmet ediyor
3. **Daha İyi Organizasyon:** Yeni numuneler ayrı sayfada
4. **İletişim Kolaylığı:** Soru sor butonu ile direkt üreticiye ulaşım

**Tüm değişiklikler başarıyla tamamlandı!** 🎉
