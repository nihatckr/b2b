# 🏭 Üretici İş Akışı - Güncel Sistem (Ekim 2025)

## 🚀 Üretici Dashboard Özeti

### ✅ Aktif Özellikler

- **Koleksiyon Yönetimi**: Ürün katalog sistemi (GraphQL ready)
- **Mesajlaşma Sistemi**: Context-based müşteri iletişimi
- **Üretim Takibi**: 7-aşamalı tracking system
- **Kalite Kontrol**: Automated quality assurance
- **Atölye Yönetimi**: Workshop assignment system
- **Revizyon Yönetimi**: Cost & timeline impact tracking

### 📊 Sistem Durumu

- **Backend**: %100 hazır (GraphQL API)
- **Database**: 11 model, 8 enum aktif
- **Authentication**: JWT Bearer Token
- **Real-time**: Subscription altyapısı hazır

---

## 1. 📦 Koleksiyon/Ürün Yönetimi

### Mevcut API Endpoints

```graphql
# Koleksiyon oluşturma (Gelecek API)
mutation CreateCollection($input: CreateCollectionInput!) {
  createCollection(input: $input) {
    id
    name
    description
    images
    season
    year
    priceRange
    category {
      id
      name
    }
  }
}

# Kategori listesi (Aktif)
query Categories {
  categories {
    id
    name
    description
    isActive
    collections {
      id
      name
    }
  }
}
```

### Koleksiyon Modeli (Aktif)

- **Category ID**: Kategori bağlantısı
- **Manufacturer ID**: Üretici sahipliği
- **Images**: JSON array format
- **Season/Year**: Sezon bilgileri
- **Price Range**: Fiyat aralığı
- **Active Status**: Aktiflik durumu

---

## 2. 💬 Mesajlaşma Sistemi (✅ AKTIF)

### Context-Based Messaging

```graphql
# Mesaj gönderme
mutation SendMessage(
  $receiverId: Int!
  $content: String!
  $type: MessageType
  $sampleId: Int # Numune ile ilişkili
  $orderId: Int # Sipariş ile ilişkili
) {
  sendMessage(
    receiverId: $receiverId
    content: $content
    type: $type
    sampleId: $sampleId
    orderId: $orderId
  ) {
    id
    content
    type
    isRead
    sample {
      sampleNumber
    }
    order {
      orderNumber
    }
  }
}

# Mesaj listesi
query MyMessages($conversationWith: Int) {
  myMessages(conversationWith: $conversationWith) {
    id
    content
    type
    isRead
    readAt
    sender {
      username
    }
    receiver {
      username
    }
    sample {
      sampleNumber
    }
    order {
      orderNumber
    }
  }
}

# Okunmamış mesaj sayısı
query UnreadMessageCount {
  unreadMessageCount
}
```

### Mesaj Türleri (4 Tip)

- **TEXT**: Standart metin mesajları
- **IMAGE**: Ürün/süreç fotoğrafları
- **DOCUMENT**: PDF, teknik dosyalar
- **VOICE_NOTE**: Ses kayıtları

### Üretici Mesajlaşma Workflow'u

1. **Gelen Mesajları Görme**: `myMessages` query ile
2. **Context Anlama**: Sample/Order bağlantısını kontrol
3. **Yanıtlama**: `sendMessage` mutation ile
4. **Okundu İşaretleme**: `markMessageAsRead` mutation ile

---

## 3. 🏭 Üretim Takip Sistemi (✅ AKTIF)

### 7-Aşamalı Production Tracking

```graphql
# Üretim aşama güncelleme
mutation UpdateProductionStage(
  $productionId: Int!
  $stage: ProductionStage!
  $status: StageStatus!
  $notes: String
  $photos: String
  $actualStartDate: DateTime
  $actualEndDate: DateTime
  $isRevision: Boolean
  $extraDays: Int
) {
  updateProductionStage(/* args */) {
    id
    stage
    status
    notes
    isRevision
    production {
      currentStage
      overallStatus
    }
  }
}

# Üretim takip listesi
query ProductionTrackings($status: ProductionStatus) {
  productionTrackings(status: $status) {
    id
    currentStage
    overallStatus
    estimatedStartDate
    estimatedEndDate
    sample { sampleNumber }
    order { orderNumber }
    stageUpdates {
      stage
      status
      actualStartDate
      actualEndDate
      notes
    }
  }
}
```

### Üretim Aşamaları (7 Stage)

1. **PLANNING** (5 gün): Kaynak planlama, malzeme listesi
2. **FABRIC** (2 gün): Kumaş tedarik, kalite kontrol
3. **CUTTING** (5 gün): Kesim planı ve uygulama
4. **SEWING** (değişken): Dikim süreçleri
5. **QUALITY** (değişken): Kalite kontrol testleri
6. **PACKAGING** (değişken): Paketleme işlemleri
7. **SHIPPING** (değişken): Sevkiyat hazırlığı

### Stage Status Options (5 Durum)

- **NOT_STARTED**: Henüz başlanmadı
- **IN_PROGRESS**: Devam ediyor
- **ON_HOLD**: Beklemede
- **COMPLETED**: Tamamlandı
- **REQUIRES_REVISION**: Revizyon gerekiyor

### Overall Production Status (5 Durum)

- **IN_PROGRESS**: Aktif üretim
- **WAITING**: Beklemede
- **BLOCKED**: Engellenmiş
- **COMPLETED**: Tamamlandı
- **CANCELLED**: İptal edildi

---

## 4. 🔍 Kalite Kontrol Sistemi (✅ AKTIF)

### QualityControl Model

```prisma
model QualityControl {
  id            Int                @id @default(autoincrement())
  production    ProductionTracking @relation(fields: [productionId], references: [id])
  inspector     User               @relation(fields: [inspectorId], references: [id])

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
}

enum QualityResult {
  PENDING
  PASSED
  FAILED
  CONDITIONAL_PASS
}
```

### Kalite Kontrol Süreci

1. **Inspector Assignment**: Kalite uzmanı atama
2. **Check Categories**: 4 ana hata kategorisi kontrolü
3. **Score Assignment**: 1-100 puan sistemi
4. **Photo Documentation**: Hata fotoğrafları
5. **Result Decision**: PASSED/FAILED/CONDITIONAL_PASS
6. **Report Generation**: Detaylı kalite raporu

---

## 5. 🏗️ Atölye Yönetimi (✅ AKTIF)

### Workshop Model

```prisma
model Workshop {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  type        WorkshopType
  capacity    Int?     // Günlük kapasite
  location    String?
  isActive    Boolean  @default(true)

  owner       User     @relation(fields: [ownerId], references: [id])

  sewingProductions    ProductionTracking[] @relation("SewingWorkshop")
  packagingProductions ProductionTracking[] @relation("PackagingWorkshop")
}

enum WorkshopType {
  SEWING
  PACKAGING
  QUALITY_CONTROL
  GENERAL
}
```

### Atölye Assignment Workflow

1. **Workshop Creation**: Atölye kaydı ve kapasite tanımlama
2. **Production Assignment**: Üretim aşamalarına atölye atama
3. **Capacity Management**: Günlük kapasite takibi
4. **Performance Tracking**: Atölye performans metrikleri

---

## 6. 🔄 Revizyon Yönetimi (✅ AKTIF)

### ProductionRevision Model

```prisma
model ProductionRevision {
  id            Int                @id @default(autoincrement())
  production    ProductionTracking @relation(fields: [productionId], references: [id])

  reason        String
  description   String?
  extraDays     Int                @default(0)
  extraCost     Float              @default(0)
  isApproved    Boolean            @default(false)

  requestedBy   User               @relation(fields: [requestedById], references: [id])
}
```

### Revizyon Süreci

1. **Revision Request**: Revizyon talebinin oluşturulması
2. **Impact Analysis**: Süre ve maliyet etkisi hesaplama
3. **Approval Process**: Revizyon onay workflow'u
4. **Timeline Update**: Tüm tarihlerin yeniden hesaplanması
5. **Customer Notification**: Müşteriye otomatik bilgilendirme

### Revizyon Nedenleri

- **Kumaş Gecikmesi**: Tedarik zinciri problemi
- **Kapasite Sorunu**: Atölye yoğunluğu
- **Kalite Problemi**: Test başarısızlığı
- **Lojistik Gecikme**: Sevkiyat sorunları
- **Customer Request**: Müşteri değişiklik talebi

---

## 7. 📋 Numune Yönetimi (Database Ready)

### Sample Model (Aktif)

```prisma
model Sample {
  id                   Int            @id @default(autoincrement())
  sampleNumber         String         @unique
  sampleType           String?        // "Yaka", "Kol", vs.
  status               SampleStatus   @default(REQUESTED)
  images               Json?          // JSON array of image URLs
  customerNote         String?
  manufacturerResponse String?
  estimatedDays        Int?
  actualCompletionDate DateTime?

  unitPrice            Float?
  minimumQuantity      Int?
  tags                 Json?
  isApproved           Boolean        @default(false)
  deliveryMethod       DeliveryMethod @default(CARGO)

  collection           Collection     @relation(fields: [collectionId], references: [id])
  customer             User           @relation("CustomerSamples", fields: [customerId], references: [id])
  manufacture          User           @relation("ManufactureSamples", fields: [manufactureId], references: [id])
  productionTracking   ProductionTracking[]
  messages             Message[]      @relation("SampleMessages")
}

enum SampleStatus {
  REQUESTED        // Müşteri numune talep etti
  RECEIVED         // Üretici talebi aldı
  IN_DESIGN        // Tasarım aşamasında
  PATTERN_READY    // Kalıp hazır
  IN_PRODUCTION    // Üretimde
  QUALITY_CHECK    // Kalite kontrolde
  COMPLETED        // Tamamlandı
  REJECTED         // Reddedildi
  SHIPPED          // Kargo verildi
}
```

### Numune Workflow

1. **Request Receipt**: Müşteri talebini alma (REQUESTED → RECEIVED)
2. **Quick Response**: 24-48 saat içinde onay/red
3. **Production Planning**: Üretim süreci planlama
4. **Status Updates**: Aşama güncellemeleri
5. **Quality Control**: Kalite testleri
6. **Customer Approval**: Müşteri onayı
7. **Shipping**: Kargo ve teslimat

---

## 8. 📦 Sipariş (Order) Yönetimi (Database Ready)

### Order Model (Aktif)

```prisma
model Order {
  id                     Int              @id @default(autoincrement())
  orderNumber            String           @unique
  status                 OrderStatus      @default(PENDING)
  totalAmount            Float?
  advancePayment         Float?
  remainingBalance       Float?
  estimatedDelivery      DateTime?
  actualDelivery         DateTime?

  customer               User             @relation("CustomerOrders", fields: [customerId], references: [id])
  manufacturer           User             @relation("ManufactureOrders", fields: [manufacturerId], references: [id])
  productionTracking     ProductionTracking[]
  questions              Question[]
  messages               Message[]        @relation("OrderMessages")
}

enum OrderStatus {
  PENDING              // Bekleyen
  REVIEWED             // İncelendi
  QUOTE_SENT           // Fiyat teklifi gönderildi
  CONFIRMED            // Onaylandı
  REJECTED             // Reddedildi
  IN_PRODUCTION        // Üretimde
  PRODUCTION_COMPLETE  // Üretim tamamlandı
  QUALITY_CHECK        // Kalite kontrolde
  SHIPPED              // Kargo verildi
  DELIVERED            // Teslim edildi
  CANCELLED            // İptal edildi
}
```

### Order Workflow

1. **Order Review**: 48 saat içinde inceleme (PENDING → REVIEWED)
2. **Quote Generation**: Fiyat teklifi hazırlama (REVIEWED → QUOTE_SENT)
3. **Negotiation**: Müşteri ile müzakere süreci
4. **Confirmation**: Onay sonrası üretim (CONFIRMED → IN_PRODUCTION)
5. **Production Tracking**: 7-aşamalı üretim takibi
6. **Quality Check**: Son kalite kontrolü
7. **Shipping & Delivery**: Kargo ve teslimat

---

## 9. 🔔 Otomatik Bildirimler (Gelecek Özellik)

### Planlanan Notification System

- **Stage Completion**: Aşama tamamlanma bildirimleri
- **Quality Results**: Test sonuç bildirimleri
- **Revision Alerts**: Gecikme ve revizyon uyarıları
- **Order Updates**: Sipariş durum değişiklikleri
- **Message Alerts**: Yeni mesaj bildirimleri

### Implementation Plan

- **Real-time Subscriptions**: GraphQL subscription sistemi
- **Email Integration**: SMTP tabanlı email sistemi
- **In-app Notifications**: Dashboard bildirimleri
- **Mobile Push**: PWA notification sistemi

---

## 🎯 Üretici Öncelikleri (Sonraki Adımlar)

### Kısa Vadeli (1-2 Hafta)

1. **Collection CRUD API**: Koleksiyon yönetimi
2. **Sample CRUD API**: Numune yönetimi
3. **Order CRUD API**: Sipariş yönetimi
4. **File Upload**: Resim ve döküman sistemi

### Orta Vadeli (1-2 Ay)

1. **Frontend Development**: React.js tabanlı üretici paneli
2. **Real-time Updates**: Subscription sistemi
3. **Advanced Reporting**: Üretim raporları
4. **Mobile Optimization**: Responsive tasarım

### Uzun Vadeli (2+ Ay)

1. **AI Integration**: Tahmine dayalı planlama
2. **API Integrations**: ERP/CRM entegrasyonları
3. **Advanced Analytics**: Performans metrikleri
4. **Scalability**: Performans optimizasyonu

---

## 📊 Mevcut Sistem Durumu

### ✅ Hazır Olan Sistemler

- **GraphQL API**: 5 mutation, 7 query aktif
- **Database Schema**: 11 model tam operasyonel
- **Authentication**: JWT Bearer Token sistemi
- **Messaging**: Context-based mesajlaşma
- **Production Tracking**: 7-aşamalı takip
- **Quality Control**: Kalite yönetim sistemi
- **Workshop Management**: Atölye sistemi

### ⏳ Geliştirme Aşamasında

- **Collection Management API**: Koleksiyon CRUD
- **Sample Management API**: Numune CRUD
- **Order Management API**: Sipariş CRUD
- **File Upload System**: Medya yönetimi
- **Frontend Interface**: Kullanıcı arayüzü

Bu dokümantasyon mevcut **aktif sistem durumunu** yansıtmaktadır ve tüm API endpoints test edilebilir durumdadır. 🚀
