# 🛒 Müşteri İş Akışı - Güncel Sistem (Ekim 2025)

## 🚀 Müşteri Dashboard Özeti

### ✅ Aktif Özellikler

- **Ürün Katalog Görüntüleme**: Collection & Category sistemi
- **Mesajlaşma Sistemi**: Üretici ile direkt iletişim
- **Numune Takibi**: Sample status tracking
- **Sipariş Takibi**: Order progress monitoring
- **Üretim Görüntüleme**: Production stage visibility
- **Kalite Raporu**: Quality control results

### 📊 Sistem Durumu

- **Authentication**: JWT Bearer Token sistemi
- **API Access**: GraphQL endpoints aktif
- **Real-time**: Message system operasyonel
- **Database**: 11 model ready for CRUD

---

## 1. 🔐 Kullanıcı Kaydı ve Giriş

### Signup Process (✅ AKTIF)

```graphql
mutation Signup(
  $name: String
  $email: String!
  $password: String!
  $role: Role
) {
  signup(
    name: $name
    email: $email
    password: $password
    role: $role # CUSTOMER (default)
  ) {
    token
    user {
      id
      email
      username
      firstName
      lastName
      isActive
    }
  }
}
```

### Login Process (✅ AKTIF)

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
      username
      firstName
      lastName
      isActive
    }
  }
}
```

### Customer Profile Extension

- **Business Info**: Company details, tax number
- **Contact Info**: Phone, address details
- **Preferences**: Communication preferences
- **History**: Order and sample history

---

## 2. 📦 Ürün Katalog Sistemi

### Category Browsing (✅ AKTIF)

```graphql
query Categories {
  categories {
    id
    name
    description
    isActive
    collections {
      id
      name
      description
      images
      season
      year
      priceRange
      manufacturer {
        id
        username
        firstName
        lastName
      }
    }
  }
}
```

### Product Discovery Workflow

1. **Category Selection**: Ana kategori seçimi
2. **Collection Browsing**: Koleksiyon görüntüleme
3. **Product Details**: Ürün detay incelemesi
4. **Manufacturer Info**: Üretici profil görüntüleme
5. **Action Selection**: Numune/Sipariş kararı

### Collection Card İçeriği (Database Ready)

- **Images**: JSON array format görseller
- **Name & Description**: Ürün bilgileri
- **Season/Year**: Sezon bilgisi
- **Price Range**: Fiyat aralığı
- **Manufacturer**: Üretici bilgileri
- **Category**: Kategori bağlantısı

---

## 3. 🧪 Numune Talep Sistemi

### Sample Request Process (Database Ready)

```prisma
model Sample {
  sampleNumber         String         @unique
  sampleType           String?        // "Yaka", "Kol", vs.
  status               SampleStatus   @default(REQUESTED)
  customerNote         String?        // Müşteri istekleri
  manufacturerResponse String?        // Üretici geri bildirimi
  estimatedDays        Int?           // Üretici tahmini
  unitPrice            Float?         // Birim fiyat
  minimumQuantity      Int?           // MOQ
  isApproved           Boolean        @default(false)
  deliveryMethod       DeliveryMethod @default(CARGO)

  // Relations
  collection           Collection
  customer             User           @relation("CustomerSamples")
  manufacture          User           @relation("ManufactureSamples")
  productionTracking   ProductionTracking[]
  messages             Message[]      @relation("SampleMessages")
}
```

### Sample Status Flow

```
REQUESTED → RECEIVED → IN_DESIGN → PATTERN_READY →
IN_PRODUCTION → QUALITY_CHECK → COMPLETED → SHIPPED
```

### Sample Request İçeriği

- **Collection Selection**: Hangi koleksiyondan
- **Sample Type**: Özel tip belirtme
- **Customer Note**: Özel talepler
- **Delivery Info**: Teslimat tercihleri
- **Urgency Level**: Normal/Acil

### Sample Tracking Features

- **Status Updates**: Aşama güncellemeleri
- **Production Tracking**: Üretim süreç takibi
- **Quality Results**: Kalite test sonuçları
- **Message Thread**: Context-based mesajlaşma
- **Approval System**: Numune onay süreci

---

## 4. 🛍️ Sipariş (Order) Sistemi

### Order Creation Process (Database Ready)

```prisma
model Order {
  orderNumber            String           @unique
  status                 OrderStatus      @default(PENDING)
  totalAmount            Float?
  advancePayment         Float?
  remainingBalance       Float?
  estimatedDelivery      DateTime?
  actualDelivery         DateTime?

  customer               User             @relation("CustomerOrders")
  manufacturer           User             @relation("ManufactureOrders")
  productionTracking     ProductionTracking[]
  questions              Question[]
  messages               Message[]        @relation("OrderMessages")
}
```

### Order Status Flow

```
PENDING → REVIEWED → QUOTE_SENT → CONFIRMED →
IN_PRODUCTION → PRODUCTION_COMPLETE →
QUALITY_CHECK → SHIPPED → DELIVERED
```

### Order Request İçeriği

- **Product Selection**: Koleksiyon/ürün seçimi
- **Quantity**: Sipariş miktarı (MOQ kontrolü)
- **Target Price**: Fiyat teklifi
- **Delivery Date**: Hedef teslimat tarihi
- **Special Requirements**: Özel talepler
- **Terms & Conditions**: Ticari şartlar

### Order Tracking Features

- **Status Dashboard**: Güncel sipariş durumu
- **Production Visibility**: Üretim aşama takibi
- **Quality Reports**: Kalite test sonuçları
- **Communication**: Order-based mesajlaşma
- **Document Management**: Belgeler ve sözleşmeler

---

## 5. 💬 Mesajlaşma Sistemi (✅ AKTIF)

### Context-Based Messaging

```graphql
# Mesaj gönderme
mutation SendMessage(
  $receiverId: Int!        # Üretici ID
  $content: String!
  $type: MessageType
  $sampleId: Int          # Numune bağlantısı
  $orderId: Int           # Sipariş bağlantısı
  $attachmentUrl: String  # Dosya eki
) {
  sendMessage(/* args */) {
    id
    content
    type
    isRead
    createdAt
    receiver {
      username
      firstName
      lastName
    }
    sample {
      sampleNumber
      status
    }
    order {
      orderNumber
      status
    }
  }
}

# Mesaj geçmişi
query MyMessages($conversationWith: Int) {
  myMessages(conversationWith: $conversationWith) {
    id
    content
    type
    isRead
    readAt
    createdAt
    sender { username }
    receiver { username }
    sample {
      sampleNumber
      status
    }
    order {
      orderNumber
      status
    }
  }
}

# Okunmamış mesaj sayısı
query UnreadMessageCount {
  unreadMessageCount
}

# Mesaj okundu işaretleme
mutation MarkMessageAsRead($messageId: Int!) {
  markMessageAsRead(messageId: $messageId) {
    id
    isRead
    readAt
  }
}
```

### Müşteri Mesajlaşma Senaryoları

#### 1. Genel Ürün Sorguları

- Koleksiyon detayları hakkında sorular
- Fiyat ve MOQ bilgileri
- Renk ve beden seçenekleri
- Teknik özellikler

#### 2. Numune İletişimi

- Numune talep detayları
- Özel tasarım istekleri
- Numune süreci takibi
- Kalite ve revizyon görüşmeleri

#### 3. Sipariş İletişimi

- Sipariş detay müzakereleri
- Fiyat ve termin görüşmeleri
- Değişiklik talepleri
- Teslimat koordinasyonu

#### 4. Üretim Takibi

- Aşama güncellemeleri isteme
- Süreç hakkında sorular
- Kalite endişeleri paylaşma
- Teslimat planlaması

### Mesaj Türleri (4 Tip)

- **TEXT**: Standart metin mesajları
- **IMAGE**: Referans görseller, örnekler
- **DOCUMENT**: Teknik şartnameler, sözleşmeler
- **VOICE_NOTE**: Ses kayıtları (gelecek özellik)

---

## 6. 📊 Üretim Takip Görüntüleme

### Production Tracking Visibility (✅ AKTIF)

```graphql
query ProductionTrackings(
  $sampleId: Int
  $orderId: Int
  $status: ProductionStatus
) {
  productionTrackings(sampleId: $sampleId, orderId: $orderId, status: $status) {
    id
    currentStage
    overallStatus
    estimatedStartDate
    estimatedEndDate

    sample {
      sampleNumber
      status
    }

    order {
      orderNumber
      status
    }

    stageUpdates {
      stage
      status
      actualStartDate
      actualEndDate
      notes
      photos
      isRevision
      extraDays
      createdAt
    }

    qualityControls {
      result
      score
      notes
      checkDate
      fabricDefects
      sewingDefects
      measureDefects
      finishingDefects
    }

    revisions {
      reason
      description
      extraDays
      extraCost
      isApproved
      createdAt
    }
  }
}
```

### Production Stage Visibility

1. **PLANNING** (5 gün): Kaynak planlama durumu
2. **FABRIC** (2 gün): Kumaş tedarik süreci
3. **CUTTING** (5 gün): Kesim aşaması
4. **SEWING** (değişken): Dikim süreçleri
5. **QUALITY** (değişken): Kalite kontrolleri
6. **PACKAGING** (değişken): Paketleme
7. **SHIPPING** (değişken): Sevkiyat hazırlığı

### Customer Dashboard Features

- **Progress Bar**: Görsel ilerleme göstergesi
- **Timeline View**: Zaman çizelgesi görünümü
- **Stage Details**: Aşama detay bilgileri
- **Photo Updates**: Süreç fotoğrafları
- **Delay Notifications**: Gecikme bildirimleri

---

## 7. 🔍 Kalite Raporu Görüntüleme

### Quality Control Results

```graphql
# Production tracking içinde kalite sonuçları
qualityControls {
  id
  result          # PENDING, PASSED, FAILED, CONDITIONAL_PASS
  score           # 1-100 puan
  notes           # Detaylı açıklama
  photos          # Hata fotoğrafları (JSON)
  checkDate       # Test tarihi

  # Hata kategorileri
  fabricDefects    # Kumaş hataları
  sewingDefects    # Dikiş hataları
  measureDefects   # Ölçü hataları
  finishingDefects # Finishing hataları

  inspector {
    username
    firstName
    lastName
  }
}
```

### Quality Report Features

- **Overall Score**: Genel kalite puanı
- **Defect Categories**: Hata kategori analizi
- **Photo Evidence**: Görsel kanıtlar
- **Inspector Notes**: Uzman yorumları
- **Pass/Fail Status**: Net sonuç
- **Action Items**: Gerekli aksiyonlar

---

## 8. 🔔 Bildirim Sistemi (Gelecek Özellik)

### Planned Notifications

- **Order Status Updates**: Sipariş durum değişiklikleri
- **Production Milestones**: Üretim kilometre taşları
- **Quality Results**: Kalite test sonuçları
- **Message Alerts**: Yeni mesaj bildirimleri
- **Delay Warnings**: Gecikme uyarıları
- **Delivery Notifications**: Teslimat bildirimleri

### Notification Channels

- **In-app Notifications**: Dashboard bildirimleri
- **Email Alerts**: E-posta bildirimleri
- **SMS Notifications**: Kritik uyarılar
- **Push Notifications**: Mobil bildirimler

---

## 9. 📱 Müşteri Self-Service Features

### Account Management

- **Profile Updates**: Profil bilgisi güncelleme
- **Password Change**: Şifre değiştirme
- **Communication Preferences**: İletişim tercihleri
- **Notification Settings**: Bildirim ayarları

### History & Reports

- **Order History**: Geçmiş siparişler
- **Sample History**: Numune geçmişi
- **Message Archive**: Mesaj arşivi
- **Quality Reports**: Kalite rapor arşivi

### Document Management

- **Contract Storage**: Sözleşme depolama
- **Invoice Access**: Fatura erişimi
- **Technical Specs**: Teknik şartname arşivi
- **Quality Certificates**: Kalite sertifikaları

---

## 🎯 Müşteri Öncelikleri (Sonraki Adımlar)

### Kısa Vadeli (1-2 Hafta)

1. **Sample CRUD API**: Numune yönetimi completion
2. **Order CRUD API**: Sipariş yönetimi completion
3. **File Upload**: Döküman ve görsel yükleme
4. **Advanced Search**: Gelişmiş ürün arama

### Orta Vadeli (1-2 Ay)

1. **Frontend Customer Portal**: React.js müşteri paneli
2. **Mobile Optimization**: Responsive tasarım
3. **Real-time Updates**: Live status updates
4. **Advanced Filtering**: Gelişmiş filtreleme

### Uzun Vadeli (2+ Ay)

1. **Mobile App**: Native/PWA uygulaması
2. **AI Recommendations**: Akıllı ürün önerileri
3. **Automated Ordering**: Otomatik sipariş sistemi
4. **Analytics Dashboard**: Müşteri analitiği

---

## 📊 Müşteri API Endpoints Summary

### ✅ Aktif API'lar

- **Authentication**: signup, login
- **Messaging**: sendMessage, myMessages, unreadMessageCount, markMessageAsRead
- **Categories**: categories (ürün keşfi için)
- **Production**: productionTrackings (takip için)

### ⏳ Geliştirme Aşamasında

- **Samples**: Sample CRUD operations
- **Orders**: Order CRUD operations
- **Collections**: Product catalog API
- **File Upload**: Media management

### 🔮 Planlanan Özellikler

- **Real-time Subscriptions**: Live updates
- **Advanced Search**: Product discovery
- **Recommendation Engine**: AI-powered suggestions
- **Analytics API**: Usage insights

Bu dokümantasyon **mevcut aktif sistem** üzerinden müşteri deneyimini tanımlamakta ve tüm API'lar test edilebilir durumdadır. 🚀
