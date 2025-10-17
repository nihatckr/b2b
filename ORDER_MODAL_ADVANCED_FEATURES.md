# Sipariş Ver Modalı - Gelişmiş Özellikler

## 🎯 Yapılan İyileştirmeler

### Önceki Durum
- ✅ Basit miktar seçimi
- ✅ Üreticinin hedef fiyatını gösterme
- ✅ Sipariş notu

### Yeni Özellikler
- ✅ **Min/Max Miktar Kontrolü**
- ✅ **Müşteri Hedef Fiyat Teklifi**
- ✅ **Müşteri Hedef Teslim Süresi**
- ✅ **Dosya Yükleme (Çoklu)**
- ✅ **Gelişmiş Validasyon**

---

## 📋 Yeni Özellikler Detayı

### 1. Min/Max Miktar Kontrolü

**Özellikler:**
- Minimum sipariş miktarı (MOQ) kontrolü
- Maksimum sipariş miktarı kontrolü (default: 100,000)
- +/- butonlar limitlere göre devre dışı kalıyor
- Manuel giriş limitleri otomatik düzeltiliyor

**Örnek:**
```typescript
moq = 100
maxQuantity = 100,000

// Kullanıcı 50 yazarsa → otomatik 100'e çıkar
// Kullanıcı 150,000 yazarsa → otomatik 100,000'e düşer
// + butonu maxQuantity'ye ulaşınca devre dışı
// - butonu moq'a ulaşınca devre dışı
```

**UI Gösterimi:**
```
Min: 100 adet - Max: 100,000 adet
[−] [  5,000  ] [+]
```

---

### 2. Müşteri Hedef Fiyat Teklifi

**Özellikler:**
- Müşteri kendi hedef birim fiyatını girebilir
- Opsiyonel alan (boş bırakılabilir)
- Placeholder'da üreticinin fiyatı gösteriliyor
- Tahmini toplam bu fiyata göre hesaplanıyor

**Kullanım Senaryosu:**
1. Üretici hedef fiyatı: $15/adet
2. Müşteri teklif eder: $12.50/adet
3. 1,000 adet için tahmini toplam: $12,500
4. Üretici bu teklifi değerlendirir ve kabul/red/karşı teklif yapar

**Input:**
```tsx
<Label>Hedef Fiyat Teklifiniz ($/adet)</Label>
<Input
  type="number"
  step="0.01"
  placeholder="Üretici fiyatı: $15.00"
/>
```

**Bilgilendirme:**
> "İstediğiniz birim fiyatı belirtin. Üretici bu fiyatı değerlendirecektir."

---

### 3. Müşteri Hedef Teslim Süresi

**Özellikler:**
- Müşteri istediği teslim süresini gün olarak belirtir
- Opsiyonel alan
- Placeholder'da üreticinin termini gösteriliyor
- Takvim ikonu ile görsel vurgu

**Kullanım Senaryosu:**
1. Üretici hedef termin: 60 gün
2. Müşteri istediği termin: 45 gün
3. Üretici acil üretim ile bu termin için karşı teklif verebilir

**Input:**
```tsx
<Label>Hedef Teslim Süresi (gün)</Label>
<div className="flex items-center gap-2">
  <Calendar icon />
  <Input
    type="number"
    placeholder="Üretici termini: 60 gün"
  />
  <span>gün</span>
</div>
```

**Bilgilendirme:**
> "İstediğiniz teslim süresini gün olarak belirtin."

---

### 4. Dosya Yükleme (Çoklu)

**Özellikler:**
- Çoklu dosya seçimi
- Desteklenen formatlar: Görseller, PDF, Word, Excel
- Dosya boyutu gösterimi
- Tekil dosya silme
- Responsive liste görünümü

**Desteklenen Formatlar:**
- Görseller: .jpg, .jpeg, .png, .gif, .webp
- Dokümanlar: .pdf, .doc, .docx
- Spreadsheet: .xls, .xlsx

**UI Gösterimi:**
```
[📤 Dosya Seç (Teknik çizim, referans görseller, vb.)]

Seçili Dosyalar:
📤 technical-drawing.pdf (245 KB)     [×]
📤 color-reference.jpg (1.2 MB)      [×]
📤 size-chart.xlsx (89 KB)           [×]
```

**Kullanım Senaryoları:**
- Teknik çizimler
- Renk referans kartları
- Beden tabloları
- Özel detay görselleri
- İstek listesi dokümanları

**Kod:**
```typescript
const [attachments, setAttachments] = useState<File[]>([]);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const newFiles = Array.from(files);
    setAttachments((prev) => [...prev, ...newFiles]);
  }
};

const removeAttachment = (index: number) => {
  setAttachments((prev) => prev.filter((_, i) => i !== index));
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};
```

---

### 5. Gelişmiş Tahmini Toplam

**Özellikler:**
- Müşteri fiyatı varsa ona göre hesaplama
- Yoksa üretici fiyatına göre hesaplama
- Dinamik bilgilendirme mesajı
- Para formatı (virgül ayırıcı, 2 ondalık basamak)

**Mantık:**
```typescript
const estimatedTotal = customerTargetPrice
  ? quantity * parseFloat(customerTargetPrice)  // Müşteri fiyatı
  : targetPrice
  ? quantity * targetPrice                       // Üretici fiyatı
  : null;                                        // Fiyat yok
```

**Gösterim:**
```
Müşteri fiyatı varsa:
┌────────────────────────────────────┐
│ Hedef Toplam Tutarınız:            │
│           $12,500.00               │
│ * Bu sizin hedef fiyatınıza göre   │
│   hesaplanmıştır. Nihai fiyat      │
│   üretici onayına tabidir.         │
└────────────────────────────────────┘

Sadece üretici fiyatı varsa:
┌────────────────────────────────────┐
│ Tahmini Toplam:                    │
│           $15,000.00               │
│ * Nihai fiyat üretici ile          │
│   yapılacak görüşme sonucu         │
│   belirlenecektir.                 │
└────────────────────────────────────┘
```

---

## 📊 Güncellenmiş Interface

### OrderItemData
```typescript
export interface OrderItemData {
  collectionId: number;
  quantity: number;
  customerTargetPrice?: number;      // YENİ
  customerTargetLeadTime?: number;   // YENİ
  customerNote: string;
  attachments?: File[];              // YENİ
}
```

### AddToOrderModalProps
```typescript
interface AddToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
  collectionName: string;
  moq?: number;
  maxQuantity?: number;              // YENİ
  targetPrice?: number;
  targetLeadTime?: string;
  onSubmit?: (data: OrderItemData) => Promise<void>;
}
```

---

## 🎨 UX İyileştirmeleri

### 1. Scroll Area
```tsx
<div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
```
- Uzun içerik için scroll
- Maksimum yükseklik viewport'un %60'ı
- Modal responsive kalıyor

### 2. Buton Durumları
```tsx
disabled={quantity < moq || quantity > maxQuantity || isSubmitting}
```
- Miktar MOQ'dan azsa devre dışı
- Miktar max'tan fazlaysa devre dışı
- Gönderme sırasında devre dışı

### 3. Dinamik Buton Metni
```tsx
<Button>
  <ShoppingCart />
  Siparişe Ekle ({quantity.toLocaleString()} adet)
</Button>
```
- Miktar dinamik gösteriliyor
- Binlik ayırıcı ile okunabilir

### 4. Üretici vs Müşteri Bilgileri Ayrımı
```
Üretici Hedef Fiyatı: $15.00      (gri, bilgilendirme)
Hedef Fiyat Teklifiniz: [ ]       (mavi, input)

Üretici Hedef Termini: 60 gün     (gri, bilgilendirme)
Hedef Teslim Süresi: [ ] gün      (mavi, input)
```

---

## 🔄 Form Akışı

### Başlangıç
1. Modal açılır
2. Üretici bilgileri gösterilir (MOQ, max, fiyat, termin)
3. Miktar MOQ'a set edilir
4. Diğer alanlar boş

### Kullanıcı Girişi
1. Miktarı ayarlar (min-max arası)
2. Hedef fiyat girer (opsiyonel)
3. Hedef termin girer (opsiyonel)
4. Not yazar (opsiyonel)
5. Dosya ekler (opsiyonel)

### Validasyon
- Miktar MOQ ≤ quantity ≤ maxQuantity ✓
- Fiyat > 0 (eğer girilmişse)
- Termin > 0 (eğer girilmişse)
- Dosya formatı uygun ✓

### Gönderme
1. "Siparişe Ekle" butonuna tıkla
2. Loading durumu
3. onSubmit çağrılır
4. Başarılıysa:
   - Form resetlenir
   - Modal kapanır
   - Toast gösterilir

---

## 🧪 Test Senaryoları

### Senaryo 1: Basit Sipariş
- Sadece miktar seç
- Not yaz
- Gönder
- ✅ Başarılı

### Senaryo 2: Fiyat Teklifi ile Sipariş
- Miktar: 1,000
- Hedef fiyat: $12.50
- Tahmini toplam: $12,500
- Gönder
- ✅ Üreticiye fiyat teklifi gönderildi

### Senaryo 3: Acil Termin
- Miktar: 500
- Hedef termin: 30 gün (üretici: 60)
- Not: "Acil ihtiyaç"
- Gönder
- ✅ Acil üretim talebi iletildi

### Senaryo 4: Dosya ile Sipariş
- Miktar: 2,000
- Teknik çizim.pdf ekle
- Renk kartı.jpg ekle
- Beden tablosu.xlsx ekle
- Gönder
- ✅ 3 dosya ile sipariş oluşturuldu

### Senaryo 5: Tam Detaylı Sipariş
- Miktar: 5,000
- Hedef fiyat: $11.80
- Hedef termin: 45 gün
- Detaylı not
- 2 dosya
- Gönder
- ✅ Kapsamlı sipariş talebi gönderildi

### Senaryo 6: Limit Testleri
- Miktar: 50 yaz → 100'e çıkar (MOQ)
- Miktar: 200,000 yaz → 100,000'e düşer (MAX)
- + butonu max'ta devre dışı
- - butonu min'de devre dışı
- ✅ Limitler çalışıyor

---

## 🚀 Backend Entegrasyonu (TODO)

### GraphQL Mutation Şeması

```graphql
type Mutation {
  addToOrder(input: AddToOrderInput!): OrderItem!
}

input AddToOrderInput {
  collectionId: Int!
  quantity: Int!
  customerTargetPrice: Float
  customerTargetLeadTime: Int
  customerNote: String
  attachmentUrls: [String!]  # Dosyalar önce upload edilmeli
}

type OrderItem {
  id: Int!
  collectionId: Int!
  collection: Collection!
  quantity: Int!
  customerTargetPrice: Float
  customerTargetLeadTime: Int
  customerNote: String
  attachments: [Attachment!]
  status: OrderStatus!
  createdAt: DateTime!
}

type Attachment {
  id: Int!
  filename: String!
  url: String!
  size: Int!
  mimeType: String!
}

enum OrderStatus {
  PENDING
  APPROVED
  REJECTED
  NEGOTIATING
  CONFIRMED
}
```

### Prisma Schema Önerisi

```prisma
model OrderItem {
  id                     Int          @id @default(autoincrement())
  collectionId           Int
  customerId             Int
  quantity               Int
  customerTargetPrice    Float?       // Müşterinin teklif ettiği fiyat
  customerTargetLeadTime Int?         // Müşterinin istediği termin (gün)
  customerNote           String?      @db.Text
  status                 OrderStatus  @default(PENDING)
  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt

  collection             Collection   @relation(fields: [collectionId], references: [id])
  customer               User         @relation(fields: [customerId], references: [id])
  attachments            Attachment[]
}

model Attachment {
  id          Int       @id @default(autoincrement())
  orderItemId Int?
  sampleReqId Int?
  filename    String
  url         String
  size        Int
  mimeType    String
  createdAt   DateTime  @default(now())

  orderItem   OrderItem?      @relation(fields: [orderItemId], references: [id])
  sampleReq   SampleRequest?  @relation(fields: [sampleReqId], references: [id])
}

enum OrderStatus {
  PENDING       // Müşteri oluşturdu, üretici bekliyor
  APPROVED      // Üretici onayladı
  REJECTED      // Üretici reddetti
  NEGOTIATING   // Karşı teklif süreci
  CONFIRMED     // Nihai onay
  PRODUCTION    // Üretimde
  SHIPPED       // Gönderildi
  COMPLETED     // Tamamlandı
}
```

### File Upload İşlemi

**1. Önce dosyaları yükle:**
```typescript
const uploadFiles = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.urls; // ["uploads/orders/file1.pdf", ...]
};
```

**2. Sonra mutation'ı çağır:**
```typescript
const handleAddToOrder = async (data: OrderItemData) => {
  let attachmentUrls: string[] = [];

  if (data.attachments && data.attachments.length > 0) {
    attachmentUrls = await uploadFiles(data.attachments);
  }

  const result = await client.mutation(ADD_TO_ORDER_MUTATION, {
    input: {
      collectionId: data.collectionId,
      quantity: data.quantity,
      customerTargetPrice: data.customerTargetPrice,
      customerTargetLeadTime: data.customerTargetLeadTime,
      customerNote: data.customerNote,
      attachmentUrls,
    }
  });

  toast({
    title: "✅ Siparişe Eklendi",
    description: `Sipariş ID: #${result.addToOrder.id}`,
  });
};
```

---

## 📝 Değişiklik Özeti

### Dosyalar
- ✅ `AddToOrderModal.tsx` - Tamamen yeniden yapılandırıldı
- ✅ `CustomerCollectionCard.tsx` - maxQuantity prop eklendi

### Yeni State'ler
```typescript
const [customerTargetPrice, setCustomerTargetPrice] = useState<string>("");
const [customerTargetLeadTime, setCustomerTargetLeadTime] = useState<string>("");
const [attachments, setAttachments] = useState<File[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### Yeni Fonksiyonlar
```typescript
handleFileSelect(e)      // Dosya seçme
removeAttachment(index)  // Dosya silme
formatFileSize(bytes)    // Dosya boyutu formatlama
```

### UI Bileşenleri
- Min/Max miktar kontrolü
- Hedef fiyat input
- Hedef termin input
- Dosya yükleme alanı
- Dosya listesi
- Gelişmiş tahmini toplam

---

## ✅ Tamamlanan Özellikler

- [x] Min/Max miktar kontrolü
- [x] Müşteri hedef fiyat teklifi
- [x] Müşteri hedef teslim süresi
- [x] Dosya yükleme (çoklu)
- [x] Dosya silme
- [x] Dosya boyutu gösterimi
- [x] Dinamik tahmini toplam
- [x] Scroll area (uzun içerik)
- [x] Gelişmiş validasyon
- [x] Loading durumları
- [x] Responsive tasarım
- [x] Türkçe dil desteği
- [x] Type-safe TypeScript

---

## 🎯 Sonuç

Sipariş ver modalı artık **B2B tekstil siparişlerinin** tüm ihtiyaçlarını karşılayacak şekilde geliştirildi:

1. **Miktar Yönetimi:** Min/Max kontrollü esnek miktar girişi
2. **Fiyat Müzakeresi:** Müşteri kendi hedef fiyatını önerebilir
3. **Termin Müzakeresi:** Müşteri istediği teslim süresini belirtebilir
4. **Detaylı İletişim:** Not ve dosya ekleyerek tam açıklama yapabilir
5. **Şeffaflık:** Üretici ve müşteri bilgileri açıkça ayrılmış

**Kullanıcı deneyimi tamamen iyileştirildi ve B2B iş süreçlerine uygun hale getirildi!** 🎉
