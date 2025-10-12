# Veritabanı Şema Tasarımı

## ✅ Teknoloji Yığını (GÜNCEL - EKIM 2025)

- **Veritabanı**: MySQL 8.0+
- **ORM**: Prisma 6.17.1
- **Schema Boyutu**: 433 satır, 11 aktif model
- **Migration Sayısı**: 7 tamamlanmış migration
- **Output Path**: `../src/data/generated/prisma`
- **Bağlantı**: Prisma connection pooling

## 🔥 GÜNCEL Prisma Schema Yapısı (11 Model)

### 1. User - Kullanıcı Bilgileri

```prisma
model User {
  id          Int          @id @default(autoincrement())
  email       String       @unique
  password    String
  name        String?
  role        Role         @default(CUSTOMER)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // İlişkiler
  categories  Category[]
  collections Collection[]

  // Müşteri ilişkileri
  customerSamples   Sample[]   @relation("CustomerSamples")
  customerOrders    Order[]    @relation("CustomerOrders")
  customerQuestions Question[] @relation("CustomerQuestions")
  customerReviews   Review[]   @relation("CustomerReviews")

  // Üretici ilişkileri
  manufactureSamples      Sample[]           @relation("ManufactureSamples")
  manufactureOrders       Order[]            @relation("ManufactureOrders")
  manufactureQuestions    Question[]         @relation("ManufactureQuestions")
  sampleProductionUpdates SampleProduction[]
  orderProductionUpdates  OrderProduction[]  @relation("OrderProductionUpdates")

  // Mesajlaşma ilişkileri
  sentMessages            Message[]          @relation("SentMessages")
  receivedMessages        Message[]          @relation("ReceivedMessages")
}

enum Role {
  ADMIN
  MANUFACTURE
  CUSTOMER
}
```

### 2. Collection - Ürün Koleksiyonu

```prisma
model Collection {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  name        String
  description String?
  price       Float
  sku         String    @unique
  stock       Int       @default(0)
  images      String?   // JSON string: ["url1","url2"]
  isActive    Boolean   @default(true)

  // İlişkiler
  category    Category? @relation(fields: [categoryId], references: [id])
  categoryId  Int?
  author      User?     @relation(fields: [authorId], references: [id]) // Üretici
  authorId    Int?

  samples              Sample[]   @relation("SampleCollection")
  revisedSamples       Sample[]   @relation("OriginalCollection")
  orders               Order[]
  questions            Question[]
  reviews              Review[]
  messages             Message[]  @relation("CollectionMessages")
}

model Category {
  id               Int          @id @default(autoincrement())
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  name             String       @unique
  description      String?

  author           User?        @relation(fields: [authorId], references: [id])
  authorId         Int?
  collections      Collection[]
  subCategories    Category[]   @relation("CategoryToSubCategories")
  parentCategory   Category?    @relation("CategoryToSubCategories", fields: [parentCategoryId], references: [id])
  parentCategoryId Int?
}
```

---

## 2. Numune Yönetimi

### 3. Sample - Gelişmiş Numune Yönetimi

````prisma
model Sample {
  id                   Int          @id @default(autoincrement())
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt
  sampleNumber         String       @unique // Numune takip numarası
  sampleType           SampleType   @default(STANDARD)
  status               SampleStatus @default(REQUESTED)

  // Temel numune talep bilgileri
  collectionName       String?      // Koleksiyon adı (özel talepler için)
  fabric               String?      // Kumaş türü
  fabricColor          String?      // Kumaş rengi
  category             CollectionCategory?
  gender               Gender?
  accessories          String?      // JSON: ["düğme","fermuar"]
  sizeOrPattern        String?      // Beden/kalıp bilgisi
  sizeChartUrl         String?      // Ölçü tablosu PDF

  // Teslimat bilgileri
  leadTimeDays         Int?         // Hedef termin (gün)
  deliveryMethod       DeliveryMethod @default(CARGO)
  deliveryAddress      String?      // Teslimat adresi

  // Özel/Kritik talepler için
  priorityReason       String?      // Öncelik nedeni (kritik geç revize için)
  revisionDate         DateTime?    // Revizyon tarihi (otomatik)
  revisionCount        Int          @default(0) // Revizyon adedi
  contactEmail         String?      // İletişim e-postası

  // Mevcut alanlar
  customerNote         String?
  manufacturerResponse String?
  customDesignImages   String?      // JSON: referans görseller
  revisionRequests     String?      // JSON: [{field, oldValue, newValue, note}]
  originalCollectionId Int?

  // Üretim süreci
  productionDays          Int?
  estimatedProductionDate DateTime?
  actualProductionDate    DateTime?
  shippingDate            DateTime?
  cargoTrackingNumber     String?

  // İlişkiler
  collection           Collection?        @relation("SampleCollection", fields: [collectionId], references: [id])
  collectionId         Int?
  originalCollection   Collection?        @relation("OriginalCollection", fields: [originalCollectionId], references: [id])
  customer             User               @relation("CustomerSamples", fields: [customerId], references: [id])
  customerId           Int
  manufacture          User               @relation("ManufactureSamples", fields: [manufactureId], references: [id])
  manufactureId        Int
  productionTracking   ProductionTracking[]
}

enum SampleType {
  STANDARD         // Mevcut koleksiyon için standart numune
  CUSTOM           // Müşteri özel tasarım numunesi
  CRITICAL_URGENT  // Kritik geç revize numunesi
}

enum DeliveryMethod {
  CARGO           // Kargo teslimat
  SHOWROOM        // Showroom teslimat
}

enum SampleStatus {
  REQUESTED           // Müşteri tarafından talep edildi
  REVIEWED            // Üretici tarafından inceleniyor
  QUOTE_SENT          // Üretici süre teklifi gönderdi
  APPROVED            // Müşteri teklifi onayladı
  REJECTED            // Reddedildi
  IN_PRODUCTION       // Üretim aşamasında
  PRODUCTION_COMPLETE // Üretim tamamlandı
  SHIPPED             // Kargoya verildi
  DELIVERED           // Teslim edildi
}

### 5. ProductionTracking - 7 Aşamalı Üretim Takibi
```prisma
model ProductionTracking {
  id                Int                @id @default(autoincrement())
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  // Hangi siparişin takibi
  order             Order              @relation(fields: [orderId], references: [id])
  orderId           Int
  collection        Collection         @relation(fields: [collectionId], references: [id])
  collectionId      Int

  // Başlangıç tarihi
  startDate         DateTime

  // 7 Aşama bilgileri
  planningDays      Int                @default(0)
  fabricDays        Int                @default(0)
  cuttingDays       Int                @default(0)
  sewingDays        Int                @default(0)
  qualityDays       Int                @default(0)
  packagingDays     Int                @default(0)
  shippingDays      Int                @default(0)

  // Mevcut durum
  currentStage      ProductionStage    @default(PLANNING)
  overallStatus     ProductionStatus   @default(IN_PROGRESS)

  // Atölye atamaları
  sewingWorkshop    Workshop?          @relation("SewingWorkshop", fields: [sewingWorkshopId], references: [id])
  sewingWorkshopId  Int?
  packagingWorkshop Workshop?          @relation("PackagingWorkshop", fields: [packagingWorkshopId], references: [id])
  packagingWorkshopId Int?

  // Revizyon bilgileri
  revisions         ProductionRevision[]
  stageUpdates      ProductionStageUpdate[]
  qualityControls   QualityControl[]
}

model Workshop {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  type        WorkshopType
  capacity    Int?     // Günlük kapasite
  location    String?
  isActive    Boolean  @default(true)

  // İlişkiler
  sewingProductions    ProductionTracking[] @relation("SewingWorkshop")
  packagingProductions ProductionTracking[] @relation("PackagingWorkshop")
}

model ProductionStageUpdate {
  id               Int                @id @default(autoincrement())
  createdAt        DateTime           @default(now())

  production       ProductionTracking @relation(fields: [productionId], references: [id])
  productionId     Int

  stage            ProductionStage
  status           StageStatus        @default(IN_PROGRESS)
  actualStartDate  DateTime?
  actualEndDate    DateTime?
  notes            String?
  photos           String?            // JSON: ["url1","url2"]

  // Revizyon durumu
  isRevision       Boolean            @default(false)
  extraDays        Int                @default(0)

  updatedBy        User               @relation(fields: [updatedById], references: [id])
  updatedById      Int
}

model ProductionRevision {
  id                Int                @id @default(autoincrement())
  createdAt         DateTime           @default(now())

  production        ProductionTracking @relation(fields: [productionId], references: [id])
  productionId      Int

  oldDeadline       DateTime
  newDeadline       DateTime
  revisionReason    RevisionReason
  description       String?
  actionTaken       String?            // Alınan aksiyon
  responsibleDept   ResponsibleDept
  proofDocument     String?            // PDF/JPG/PNG kanıt dosyası

  createdBy         User               @relation(fields: [createdById], references: [id])
  createdById       Int
}

enum ProductionStage {
  PLANNING     // Planlama
  FABRIC       // Kumaş
  CUTTING      // Kesim
  SEWING       // Dikim
  QUALITY      // Kalite
  PACKAGING    // Paketleme
  SHIPPING     // Kargo
}

enum ProductionStatus {
  NOT_STARTED  // Başlamadı
  IN_PROGRESS  // Devam ediyor
  COMPLETED    // Tamamlandı
  DELAYED      // Gecikme var
  CANCELLED    // İptal edildi
}

enum StageStatus {
  WAITING      // Bekliyor
  IN_PROGRESS  // Devam ediyor
  COMPLETED    // Tamamlandı
  DELAYED      // Gecikme
}

enum WorkshopType {
  SEWING      // Dikim atölyesi
  PACKAGING   // Paketleme atölyesi
}

enum RevisionReason {
  FABRIC_DELAY        // Kumaş Gecikme
  CAPACITY_ISSUE      // Kapasite Sorunu
  QUALITY_PROBLEM     // Kalite Problemi
  LOGISTICS_DELAY     // Lojistik Gecikme
  OTHER              // Diğer
}

enum ResponsibleDept {
  SEWING_WORKSHOP    // Dikim Atölyesi
  FABRIC_WORKSHOP    // Kumaş Atölyesi
  FABRIC_SUPPLY      // Kumaş Tedarik
  QUALITY_CONTROL    // Kalite Kontrol
  LOGISTICS          // Lojistik Departmanı
}

### 6. QualityControl - Kalite Kontrol Sistemi
```prisma
model QualityControl {
  id                Int                @id @default(autoincrement())
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  production        ProductionTracking @relation(fields: [productionId], references: [id])
  productionId      Int

  // Test bilgileri
  testType          QualityTestType
  errorRate         Float              // %5 gibi
  testResult        TestResult
  inspector         String             // Kalite uzmanı adı
  testDate          DateTime
  notes             String?
  testReport        String?            // PDF/JPG/PNG test raporu
}

enum QualityTestType {
  FABRIC_QUALITY     // Kumaş Kalitesi
  SIZE_CHECK         // Ölçü Kontrolü
  COLOR_MATCH        // Renk Uyumu
  SEWING_QUALITY     // Dikiş Kalitesi
  ACCESSORY_CHECK    // Aksesuar Kontrolü
  GENERAL_APPEARANCE // Genel Görünüm
  PACKAGING_CHECK    // Paketleme Kontrolü
}

enum TestResult {
  PASSED            // Başarılı
  FAILED            // Başarısız
  CONDITIONAL_PASS  // Koşullu Geçti
}
````

### 7. ProductMessage - Ürün Mesajlaşma Sistemi

```prisma
model ProductMessage {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Mesaj içeriği
  message     String
  attachments String?  // JSON: ["url1","url2"] - resim, PDF dosyalar
  isRead      Boolean  @default(false)

  // Mesajlaşma konusu
  messageType MessageType

  // Hangi ürün/sipariş hakkında
  collection     Collection? @relation(fields: [collectionId], references: [id])
  collectionId   Int?
  sample         Sample?     @relation(fields: [sampleId], references: [id])
  sampleId       Int?
  order          Order?      @relation(fields: [orderId], references: [id])
  orderId        Int?

  // Kimden kime
  sender         User        @relation("SentMessages", fields: [senderId], references: [id])
  senderId       Int
  receiver       User        @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId     Int

  // Thread yönetimi (yanıtlama)
  parentMessage  ProductMessage? @relation("MessageReplies", fields: [parentMessageId], references: [id])
  parentMessageId Int?
  replies        ProductMessage[] @relation("MessageReplies")
}

enum MessageType {
  GENERAL_INQUIRY     // Genel ürün sorgusu
  SAMPLE_QUESTION     // Numune hakkında soru
  ORDER_QUESTION      // Sipariş hakkında soru
  PRODUCTION_UPDATE   // Üretim güncellemesi
  QUALITY_CONCERN     // Kalite endişesi
  DELIVERY_INQUIRY    // Teslimat sorgusu
  PRICE_NEGOTIATION   // Fiyat müzakeresi
  REVISION_REQUEST    // Revizyon talebi
  URGENT_MESSAGE      // Acil mesaj
}
```

### User Model Güncelleme

```prisma
// User modeline eklenecek ilişkiler
model User {
  // ... mevcut alanlar

  // Mesajlaşma ilişkileri
  sentMessages     ProductMessage[] @relation("SentMessages")
  receivedMessages ProductMessage[] @relation("ReceivedMessages")
}

// Collection, Sample, Order modellerine eklenecek
// Collection modeline:
messages         ProductMessage[]

// Sample modeline:
messages         ProductMessage[]

// Order modeline:
messages         ProductMessage[]
```

````

---

## 3. Sipariş Yönetimi

### 4. Order - PO (Purchase Order) Sistemi
```prisma
model Order {
  id                     Int              @id @default(autoincrement())
  createdAt              DateTime         @default(now())
  updatedAt              DateTime         @updatedAt

  // PO Temel Bilgileri
  poNumber               String           @unique // PO-12687361789319
  orderNumber            String           @unique
  quantity               Int
  unitPrice              Float            // Birim fiyat teklifi
  totalPrice             Float            // Toplam fiyat
  currency               Currency         @default(USD)
  status                 OrderStatus      @default(PENDING)

  // Ticari Şartlar
  incoterm               Incoterm?        // EXW, FOB, CIF, etc.
  deliveryAddress        String?          // Müşteri adresi
  leadTimeProposal       Int?             // Hedef termin önerisi (gün)
  customerNote           String?
  manufacturerResponse   String?
  attachments            String?          // JSON: ["pdf","xlsx"] dosya URL'leri

  // Üretim süreci bilgileri
  productionDays         Int?
  estimatedProductionDate DateTime?
  actualProductionStart  DateTime?
  actualProductionEnd    DateTime?
  shippingDate          DateTime?
  cargoTrackingNumber   String?

  // İlişkiler
  collection            Collection         @relation(fields: [collectionId], references: [id])
  collectionId          Int
  customer              User               @relation("CustomerOrders", fields: [customerId], references: [id])
  customerId            Int
  manufacture           User               @relation("ManufactureOrders", fields: [manufactureId], references: [id])
  manufactureId         Int
  productionHistory     OrderProduction[]
  productionTracking    ProductionTracking[]
}

enum Currency {
  USD  // Amerikan Doları
  EUR  // Euro
  TRY  // Türk Lirası
  GBP  // İngiliz Sterlini
}

enum Incoterm {
  EXW  // Ex Works
  FCA  // Free Carrier
  CPT  // Carriage Paid To
  CIP  // Carriage Insurance Paid
  DAP  // Delivered at Place
  DPU  // Delivered at Place Unloaded
  DDP  // Delivered Duty Paid
  FAS  // Free Alongside Ship
  CFR  // Cost and Freight
  CIF  // Cost Insurance Freight
  FOB  // Free on Board
}

enum OrderStatus {
  PENDING             // Sipariş beklemede
  REVIEWED            // Üretici tarafından inceleniyor
  QUOTE_SENT          // Üretici süre ve fiyat teklifi gönderdi
  CONFIRMED           // Müşteri siparişi onayladı
  REJECTED            // Sipariş reddedildi
  IN_PRODUCTION       // Üretim aşamasında
  PRODUCTION_COMPLETE // Üretim tamamlandı
  QUALITY_CHECK       // Kalite kontrolü yapılıyor
  SHIPPED             // Kargoya verildi
  DELIVERED           // Müşteriye teslim edildi
    CANCELLED           // İptal edildi
}
````

---

## 6. Mesajlaşma Sistemi

### Message - Müşteri-Üretici Mesajlaşma

```prisma
model Message {
  id               Int          @id @default(autoincrement())
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  content          String       @db.Text
  isRead           Boolean      @default(false)
  messageType      MessageType  @default(TEXT)

  // Mesaj hangi konuyla ilgili (opsiyonel)
  relatedSampleId  Int?
  relatedOrderId   Int?
  relatedCollectionId Int?

  // Gönderen ve alan
  sender           User         @relation("SentMessages", fields: [senderId], references: [id])
  senderId         Int
  receiver         User         @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId       Int

  // İlişkiler
  relatedSample    Sample?      @relation("SampleMessages", fields: [relatedSampleId], references: [id])
  relatedOrder     Order?       @relation("OrderMessages", fields: [relatedOrderId], references: [id])
  relatedCollection Collection? @relation("CollectionMessages", fields: [relatedCollectionId], references: [id])
}

// Message türleri
enum MessageType {
  TEXT             // Düz metin mesajı
  IMAGE            // Görsel mesajı
  DOCUMENT         // Belge eki
  SYSTEM           // Sistem mesajı (otomatik bildirimler)
}
```

Bu mesajlaşma sistemi şu özellikleri sağlar:

- **İki yönlü mesajlaşma**: Müşteri ↔ Üretici
- **Konuya özel mesajlaşma**: Belirli ürün, numune veya sipariş hakkında
- **Mesaj türleri**: Metin, görsel, belge ve sistem bildirimleri
- **Okundu işareti**: Mesajların okunup okunmadığı takibi
- **İlişkisel bağlantılar**: Mesajların hangi ürün/numune/sipariş ile ilgili olduğu

---

}

````

### po_line_items (Sipariş Kalemleri)
```sql
CREATE TABLE po_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),

    -- Ürün Detayları (denormalized)
    model_code VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    size VARCHAR(10) NOT NULL,

    -- Miktar ve Fiyat
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL, -- quantity * unit_price

    created_at TIMESTAMP DEFAULT NOW()
);
````

---

## 4. Üretim Takibi

### production_tracking (Üretim Takibi)

```sql
CREATE TABLE production_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES purchase_orders(id),
    sample_id UUID REFERENCES samples(id),
    manufacturer_id UUID NOT NULL REFERENCES users(id),

    -- Tarihler
    start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_end_date DATE,

    -- Durum
    overall_status ENUM('planning', 'in_progress', 'completed', 'delayed', 'cancelled') DEFAULT 'planning',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### production_stages (Üretim Aşamaları)

```sql
CREATE TABLE production_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id UUID NOT NULL REFERENCES production_tracking(id) ON DELETE CASCADE,

    -- Aşama Bilgileri
    stage_name ENUM('planning', 'fabric', 'cutting', 'sewing', 'quality', 'packaging', 'shipping') NOT NULL,
    stage_order INTEGER NOT NULL, -- 1-7

    -- Tarihler
    planned_start_date DATE NOT NULL,
    actual_start_date DATE,
    planned_duration_days INTEGER NOT NULL,
    actual_duration_days INTEGER,

    -- Durum
    status ENUM('waiting', 'in_progress', 'completed', 'delayed', 'blocked') DEFAULT 'waiting',

    -- Atölye Bilgileri
    assigned_workshop VARCHAR(100),

    -- Dosyalar ve Notlar
    notes TEXT,
    photos JSON, -- Fotoğraf yolları

    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Kalite Kontrol

### quality_control (Kalite Kontrol)

```sql
CREATE TABLE quality_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id UUID NOT NULL REFERENCES production_tracking(id),

    -- Test Bilgileri
    inspector_name VARCHAR(100) NOT NULL,
    inspection_date DATE NOT NULL,

    -- Sonuçlar
    overall_result ENUM('passed', 'failed', 'conditional_pass') NOT NULL,
    overall_error_rate DECIMAL(5,2) NOT NULL, -- %2.45

    -- Dosyalar
    report_files JSON, -- PDF, JPG, PNG yolları
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);
```

### quality_tests (Kalite Testleri)

```sql
CREATE TABLE quality_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_id UUID NOT NULL REFERENCES quality_control(id) ON DELETE CASCADE,

    -- Test Türü
    test_type ENUM('fabric_quality', 'measurement_check', 'color_matching',
                   'sewing_quality', 'accessory_check', 'general_appearance',
                   'packaging_check') NOT NULL,

    -- Sonuç
    result ENUM('passed', 'failed', 'conditional_pass') NOT NULL,
    error_rate DECIMAL(5,2) NOT NULL, -- %1.20
    notes TEXT,

    -- Kanıt Dosyaları
    evidence_photos JSON,

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Revizyon Yönetimi

### revisions (Revizyonlar)

```sql
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id UUID NOT NULL REFERENCES production_tracking(id),

    -- Tarih Bilgileri
    revision_date TIMESTAMP DEFAULT NOW(),
    old_delivery_date DATE NOT NULL,
    new_delivery_date DATE NOT NULL,

    -- Revizyon Detayları
    revision_reason ENUM('fabric_delay', 'capacity_issue', 'quality_problem',
                        'logistics_delay', 'customer_request', 'other') NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT NOT NULL,

    responsible_department ENUM('sewing_workshop', 'fabric_workshop', 'fabric_supply',
                               'quality_control', 'logistics') NOT NULL,

    -- Müşteri Bildirimi
    customer_notified BOOLEAN DEFAULT FALSE,
    notification_date TIMESTAMP,

    -- Kanıt Dosyaları
    evidence_files JSON,

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. İndeksler ve Optimizasyon

### Önemli İndeksler

```sql
-- Performans için kritik indeksler
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_samples_customer ON samples(customer_id);
CREATE INDEX idx_samples_manufacturer ON samples(manufacturer_id);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_po_customer ON purchase_orders(customer_id);
CREATE INDEX idx_po_manufacturer ON purchase_orders(manufacturer_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_production_po ON production_tracking(po_id);
CREATE INDEX idx_production_sample ON production_tracking(sample_id);
CREATE INDEX idx_stages_production ON production_stages(production_id);
```

### Kompozit İndeksler

```sql
CREATE INDEX idx_products_search ON products(manufacturer_id, status, category);
CREATE INDEX idx_samples_tracking ON samples(customer_id, status, created_at);
CREATE INDEX idx_po_tracking ON purchase_orders(customer_id, status, po_date);
```

---

## 8. Veri Validasyon Kuralları

### Constraint'ler

```sql
-- MOQ kontrolü
ALTER TABLE products ADD CONSTRAINT chk_moq CHECK (moq > 0);

-- Fiyat kontrolü
ALTER TABLE products ADD CONSTRAINT chk_price CHECK (unit_price > 0);

-- Termin kontrolü
ALTER TABLE products ADD CONSTRAINT chk_lead_time CHECK (lead_time_days > 0);

-- Hata oranı kontrolü
ALTER TABLE quality_control ADD CONSTRAINT chk_error_rate
CHECK (overall_error_rate >= 0 AND overall_error_rate <= 100);
```

### Trigger'lar

```sql
-- PO numarası otomatik oluşturma
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.po_number IS NULL THEN
        NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_po_number
BEFORE INSERT ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION generate_po_number();
```

Bu minimal şema, sistem gereksinimlerini karşılayacak ve performans sorunlarına neden olmayacak şekilde tasarlanmıştır.
