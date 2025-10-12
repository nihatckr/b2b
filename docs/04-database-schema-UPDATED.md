# 🗄️ Database Schema - Güncel Durum (Ekim 2025)

## ✅ Teknoloji Yığını

- **Veritabanı**: MySQL 8.0+
- **ORM**: Prisma 6.17.1
- **Schema Boyutu**: 435 satır
- **Aktif Model Sayısı**: 11 model
- **Migration Sayısı**: 7 tamamlanmış migration
- **Output Path**: `../src/data/generated/prisma`
- **Bağlantı**: Prisma connection pooling

## 🚀 Gerçek Model Yapısı (11 Model) - %100 DOĞRU

### 1. User Model (Ana Kullanıcı Sistemi) - ✅ GÜNCEL HAL (Ekim 2025)

```prisma
model User {
  id              Int          @id @default(autoincrement())
  email           String       @unique
  password        String
  name            String?
  role            Role         @default(CUSTOMER)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // ✅ YENİ PROFILE FIELDS - Ekim 2025 Migration
  username        String?      // Kullanıcı adı
  firstName       String?      // Ad
  lastName        String?      // Soyad
  phone           String?      // Telefon numarası
  profilePicture  String?      // Profil resmi URL
  businessLicense String?      // İş ruhsatı URL (üreticiler için)
  taxNumber       String?      // Vergi numarası
  isActive        Boolean      @default(true) // Hesap aktiflik durumu

  categories      Category[]
  collections     Collection[]

  // Customer relations
  customerSamples   Sample[]   @relation("CustomerSamples")
  customerOrders    Order[]    @relation("CustomerOrders")
  customerQuestions Question[] @relation("CustomerQuestions")
  customerReviews   Review[]   @relation("CustomerReviews")

  // Manufacture relations
  manufactureSamples      Sample[]           @relation("ManufactureSamples")
  manufactureOrders       Order[]            @relation("ManufactureOrders")
  manufactureQuestions    Question[]         @relation("ManufactureQuestions")

  // Mesajlaşma ilişkileri
  sentMessages            Message[]          @relation("SentMessages")
  receivedMessages        Message[]          @relation("ReceivedMessages")

  // Production tracking ilişkileri
  productionStageUpdates  ProductionStageUpdate[] @relation("ProductionStageUpdates")
  productionRevisions     ProductionRevision[]    @relation("ProductionRevisions")

  // Workshop relations
  workshops               Workshop[]
}
```

#### 🚨 EKSIK FIELDS (Dokümantasyonda var, kodda yok):

- `username: String @unique`
- `firstName: String?`
- `lastName: String?`
- `phone: String?`
- `profilePicture: String?`
- `businessLicense: String?`
- `taxNumber: String?`
- `isActive: Boolean @default(true)`

````

### 2. Category Model (Kategori Sistemi) - ✅ GERÇEKTEKİ HALİ

```prisma
model Category {
  id               Int          @id @default(autoincrement())
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  name             String       @unique
  description      String?
  parentCategoryId Int?         // Alt kategoriler için
  parentCategory   Category?    @relation("CategoryTree", fields: [parentCategoryId], references: [id])
  subcategories    Category[]   @relation("CategoryTree")
  user             User         @relation(fields: [userId], references: [id])
  userId           Int
  collections      Collection[]
}
````

#### ➕ EK ÖZELLIKLER (Dokümantasyonda yok, kodda var):

- Hierarchical category support (parent/child)
- User ownership (userId foreign key)

````

### 3. Collection Model (Koleksiyon Sistemi) - ✅ GÜNCEL HAL (Ekim 2025)

```prisma
model Collection {
  id                      Int           @id @default(autoincrement())
  createdAt               DateTime      @default(now())
  updatedAt               DateTime      @updatedAt
  name                    String
  description             String?
  images                  Json?         // JSON array of image URLs

  // SEO ve Meta bilgiler
  slug                    String        @unique   // URL-friendly version
  tags                    Json?         // Arama için etiketler
  isActive                Boolean       @default(true)
  isFeatured              Boolean       @default(false)
  viewCount               Int           @default(0)

  // ✅ YENİ BUSINESS FIELDS - Ekim 2025 Migration
  season                  String?       // Sezon bilgisi (İlkbahar, Yaz, vb.)
  year                    Int?          // Koleksiyon yılı
  priceRange              String?       // Fiyat aralığı bilgisi

  // İlişkiler
  category                Category      @relation(fields: [categoryId], references: [id])
  categoryId              Int
  user                    User          @relation(fields: [userId], references: [id])
  userId                  Int
  samples                 Sample[]
  orders                  Order[]
  messages                Message[]     @relation("CollectionMessages")
  productionTracking      ProductionTracking[] @relation("ProductionTrackingCollection")
}
````

#### 🚨 EKSIK FIELDS (Dokümantasyonda var, kodda yok):

- `season: String?`
- `year: Int?`
- `priceRange: String?`

#### ➕ EK ÖZELLIKLER (Dokümantasyonda yok, kodda var):

- SEO: slug, tags, viewCount, isFeatured
- Extended relations: orders, messages, productionTracking

````

### 4. Sample Model (Numune Sistemi)

```prisma
model Sample {
  id                   Int            @id @default(autoincrement())
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  sampleNumber         String         @unique
  sampleType           String?        // "Yaka", "Kol", vs.
  status               SampleStatus   @default(REQUESTED)
  images               Json?          // JSON array of image URLs
  customerNote         String?        // Müşteri istekleri
  manufacturerResponse String?        // Üretici geri bildirimi
  estimatedDays        Int?           // Üretici: "X günde hazırlarım"
  actualCompletionDate DateTime?      // Gerçek tamamlanma tarihi

  // Fiyatlandırma bilgileri
  unitPrice            Float?         // Birim fiyat
  minimumQuantity      Int?           // Minimum sipariş adedi

  // SEO ve filtreleme
  tags                 Json?          // Arama etiketleri
  isApproved           Boolean        @default(false) // Müşteri onayı

  // Teslimat bilgileri
  deliveryMethod       DeliveryMethod @default(CARGO)

  // İlişkiler
  collection           Collection     @relation(fields: [collectionId], references: [id])
  collectionId         Int
  customer             User           @relation("CustomerSamples", fields: [customerId], references: [id])
  customerId           Int
  manufacture          User           @relation("ManufactureSamples", fields: [manufactureId], references: [id])
  manufactureId        Int
  productionTracking   ProductionTracking[]
  messages             Message[]      @relation("SampleMessages")

  @@map("samples")
}
````

### 5. Order Model (Sipariş Sistemi) - ✅ GÜNCEL HAL (Ekim 2025)

```prisma
model Order {
  id                     Int              @id @default(autoincrement())
  createdAt              DateTime         @default(now())
  updatedAt              DateTime         @updatedAt
  orderNumber            String           @unique
  quantity               Int              // Sipariş adedi
  unitPrice              Float            // Birim fiyat
  totalPrice             Float            // Toplam fiyat
  status                 OrderStatus      @default(PENDING)
  customerNote           String?          // Müşteri notu
  manufacturerNote       String?          // Üretici notu
  productionDays         Int?             // Üretim süresi
  estimatedProductionDate DateTime?       // Tahmini üretim tarihi
  actualProductionStart   DateTime?       // Gerçek üretim başlangıcı
  actualProductionEnd     DateTime?       // Gerçek üretim bitişi
  shippingDate           DateTime?        // Kargo tarihi
  deliveryAddress        String?          // Teslimat adresi
  cargoTrackingNumber    String?          // Kargo takip no

  // ✅ YENİ PAYMENT FIELDS - Ekim 2025 Migration
  advancePayment         Float?           // Avans ödemesi
  remainingBalance       Float?           // Kalan bakiye
  estimatedDelivery      DateTime?        // Tahmini teslimat
  actualDelivery         DateTime?        // Gerçek teslimat

  // İlişkiler
  customer               User             @relation("CustomerOrders", fields: [customerId], references: [id])
  customerId             Int
  manufacturer           User             @relation("ManufactureOrders", fields: [manufacturerId], references: [id])
  manufacturerId         Int
  productionTracking     ProductionTracking[]
  questions              Question[]
  messages               Message[]        @relation("OrderMessages")

  @@map("orders")
}
```

### 6. Question Model (Soru-Cevap Sistemi)

```prisma
model Question {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  question    String
  answer      String?
  isAnswered  Boolean   @default(false)

  // İlişkiler
  order       Order     @relation(fields: [orderId], references: [id])
  orderId     Int

  @@map("questions")
}
```

### 7. Review Model (Değerlendirme Sistemi)

```prisma
model Review {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  rating    Int      // 1-5 arası
  comment   String?

  // İlişkiler - Bu kısım güncellenecek

  @@map("reviews")
}
```

### 8. Message Model (Mesajlaşma Sistemi) ✅ YENİ

```prisma
model Message {
  id              Int         @id @default(autoincrement())
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  content         String
  type            MessageType @default(TEXT)
  attachmentUrl   String?
  isRead          Boolean     @default(false)
  readAt          DateTime?

  // İlişkiler
  sender          User        @relation("SentMessages", fields: [senderId], references: [id])
  senderId        Int
  receiver        User        @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId      Int

  // Bağlantılı kayıtlar
  sample          Sample?     @relation("SampleMessages", fields: [sampleId], references: [id])
  sampleId        Int?
  order           Order?      @relation("OrderMessages", fields: [orderId], references: [id])
  orderId         Int?

  @@map("messages")
}
```

### 9. ProductionTracking Model (Üretim Takip) ✅ YENİ

```prisma
model ProductionTracking {
  id                  Int                @id @default(autoincrement())
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Bağlantılı kayıt
  sample              Sample?            @relation(fields: [sampleId], references: [id])
  sampleId            Int?
  order               Order?             @relation(fields: [orderId], references: [id])
  orderId             Int?

  // Planlanan süreler
  estimatedStartDate  DateTime?
  estimatedEndDate    DateTime?
  planningDays        Int                @default(0)
  fabricDays          Int                @default(0)
  cuttingDays         Int                @default(0)
  sewingDays          Int                @default(0)
  qualityDays         Int                @default(0)
  packagingDays       Int                @default(0)
  shippingDays        Int                @default(0)

  // Mevcut durum
  currentStage        ProductionStage    @default(PLANNING)
  overallStatus       ProductionStatus   @default(IN_PROGRESS)

  // Atölye atamaları
  sewingWorkshop      Workshop?          @relation("SewingWorkshop", fields: [sewingWorkshopId], references: [id])
  sewingWorkshopId    Int?
  packagingWorkshop   Workshop?          @relation("PackagingWorkshop", fields: [packagingWorkshopId], references: [id])
  packagingWorkshopId Int?

  // İlişkiler
  revisions           ProductionRevision[]
  stageUpdates        ProductionStageUpdate[]
  qualityControls     QualityControl[]

  @@map("production_tracking")
}
```

### 10. Workshop Model (Atölye Sistemi) ✅ YENİ

```prisma
model Workshop {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  type        WorkshopType
  capacity    Int?     // Günlük kapasite
  location    String?
  isActive    Boolean  @default(true)

  // İlişkiler
  owner       User     @relation(fields: [ownerId], references: [id])
  ownerId     Int

  sewingProductions    ProductionTracking[] @relation("SewingWorkshop")
  packagingProductions ProductionTracking[] @relation("PackagingWorkshop")

  @@map("workshops")
}
```

### 11. ProductionStageUpdate Model (Aşama Güncellemeleri) ✅ YENİ

```prisma
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

  @@map("production_stage_updates")
}
```

### 12. ProductionRevision Model (Üretim Revizyonları) ✅ YENİ

```prisma
model ProductionRevision {
  id            Int                @id @default(autoincrement())
  createdAt     DateTime           @default(now())

  production    ProductionTracking @relation(fields: [productionId], references: [id])
  productionId  Int

  reason        String
  description   String?
  extraDays     Int                @default(0)
  extraCost     Float              @default(0)
  isApproved    Boolean            @default(false)

  requestedBy   User               @relation(fields: [requestedById], references: [id])
  requestedById Int

  @@map("production_revisions")
}
```

### 13. QualityControl Model (Kalite Kontrol) ✅ YENİ

```prisma
model QualityControl {
  id            Int                @id @default(autoincrement())
  createdAt     DateTime           @default(now())

  production    ProductionTracking @relation(fields: [productionId], references: [id])
  productionId  Int

  inspector     User               @relation(fields: [inspectorId], references: [id])
  inspectorId   Int

  checkDate     DateTime           @default(now())
  result        QualityResult      @default(PENDING)
  score         Int?               // 1-100 arası
  notes         String?
  photos        String?            // JSON: defect photos

  // Hata kategorileri
  fabricDefects    Boolean         @default(false)
  sewingDefects    Boolean         @default(false)
  measureDefects   Boolean         @default(false)
  finishingDefects Boolean         @default(false)

  @@map("quality_controls")
}
```

## 🔄 Enum Tanımları (8 Enum)

### Production & Manufacturing Enums

```prisma
enum ProductionStage {
  PLANNING
  FABRIC
  CUTTING
  SEWING
  QUALITY
  PACKAGING
  SHIPPING
}

enum ProductionStatus {
  IN_PROGRESS
  WAITING
  BLOCKED
  COMPLETED
  CANCELLED
}

enum StageStatus {
  NOT_STARTED
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  REQUIRES_REVISION
}

enum QualityResult {
  PENDING
  PASSED
  FAILED
  CONDITIONAL_PASS
}

enum WorkshopType {
  SEWING
  PACKAGING
  QUALITY_CONTROL
  GENERAL
}
```

### Business & Order Enums

```prisma
enum SampleStatus {
  REQUESTED
  RECEIVED
  IN_DESIGN
  PATTERN_READY
  IN_PRODUCTION
  QUALITY_CHECK
  COMPLETED
  REJECTED
  SHIPPED
}

enum OrderStatus {
  PENDING
  REVIEWED
  QUOTE_SENT
  CONFIRMED
  REJECTED
  IN_PRODUCTION
  PRODUCTION_COMPLETE
  QUALITY_CHECK
  SHIPPED
  DELIVERED
  CANCELLED
}

enum DeliveryMethod {
  CARGO
  PICKUP
  COURIER
}
```

### Communication Enums

```prisma
enum MessageType {
  TEXT
  IMAGE
  DOCUMENT
  VOICE_NOTE
}
```

## 🔗 Temel İlişkiler

### User → Multiple Relations

- **1:1**: Manufacturer/Customer profiles
- **1:N**: Collections, Samples (as customer & manufacturer), Orders, Messages
- **1:N**: ProductionStageUpdates, ProductionRevisions, Workshops, QualityControls

### Production Tracking Flow

```
Sample/Order → ProductionTracking → ProductionStageUpdate
                    ↓
              ProductionRevision + QualityControl
```

### Messaging System

```
User → Message ← User (bidirectional)
     ↓
Sample/Order (context-based messaging)
```

### Workshop Assignment

```
User → Workshop → ProductionTracking (sewing/packaging assignments)
```

## 📊 Database Metrics (Ekim 2025)

- **Total Tables**: 11 models
- **Total Enums**: 8 enums
- **Schema Lines**: 433 satır
- **Relations**: 25+ aktif ilişki
- **Completed Migrations**: 7
- **Generated Client**: `/src/data/generated/prisma`

## 🚀 Son Güncellemeler

1. ✅ **SampleProduction & OrderProduction modelleri kaldırıldı**
2. ✅ **ProductionTracking modeli ile birleştirildi**
3. ✅ **Mesajlaşma sistemi eklendi (Message model)**
4. ✅ **Kalite kontrol sistemi eklendi (QualityControl)**
5. ✅ **Atölye yönetim sistemi eklendi (Workshop)**
6. ✅ **Revizyon takip sistemi eklendi (ProductionRevision)**
7. ✅ **Modüler GraphQL yapısına uygun schema organizasyonu**

Bu schema **aktif olarak kullanımda** ve tüm GraphQL API'ları bu yapı üzerine kurulu.
