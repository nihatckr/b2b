# 🔄 Revize ve Teklif Sistemi - Tam Dokümantasyon

**Tarih:** 19 Ekim 2025
**Versiyon:** 2.0.0
**Durum:** ✅ Production Ready

---

## 📋 İçindekiler

1. [Sistem Özeti](#sistem-özeti)
2. [3 Ana Sipariş Senaryosu](#3-ana-sipariş-senaryosu)
3. [Status Akış Diyagramları](#status-akış-diyagramları)
4. [GraphQL Mutation Örnekleri](#graphql-mutation-örnekleri)
5. [Task Otomasyonu](#task-otomasyonu)
6. [Veritabanı Yapısı](#veritabanı-yapısı)
7. [Frontend Entegrasyonu](#frontend-entegrasyonu)
8. [Test Senaryoları](#test-senaryoları)

---

## 🎯 Sistem Özeti

### Temel Kavramlar

Tekstil B2B platformunda **3 farklı sipariş/numune süreci** vardır:

1. **Direkt Sipariş** - Müşteri üreticinin teklifini direkt kabul eder
2. **Revize Teklif** - Müşteri ve üretici arasında karşı teklif gidip gelir
3. **Çoklu Revize** - Birden fazla tur teklif-karşı teklif yapılır

### Revize Nedir?

**Revize SAYILMAYAN Değişiklikler:**

- ✅ `quantity` (Ürün adedi) - Opsiyonel parametre
- ✅ `targetPrice` (Hedef fiyat) - Sadece öneri
- ✅ `targetDeliveryDays` (Hedef süre) - Sadece öneri
- ✅ `note` (Ek not) - Opsiyonel bilgi

**Revize SAYILAN Değişiklikler:**

- 🔄 `counterOfferPrice` - Müşterinin karşı teklif fiyatı
- 🔄 `counterOfferDays` - Müşterinin karşı teklif süresi
- 🔄 `unitPrice` - Üreticinin nihai fiyat teklifi
- 🔄 `productionDays` - Üreticinin nihai süre teklifi

### Sistemdeki Tüm Statuslar

#### Sample (Numune) Statusları - 28 Adet

```typescript
enum SampleStatus {
  // İlk Aşamalar
  AI_DESIGN                      // AI ile oluşturulmuş tasarım
  PENDING                        // Yeni talep, üretici incelemesi bekleniyor

  // İnceleme ve Teklif
  REVIEWED                       // Üretici inceliyor
  QUOTE_SENT                     // Üretici teklif gönderdi
  CUSTOMER_QUOTE_SENT            // 🔄 Müşteri karşı teklif gönderdi
  MANUFACTURER_REVIEWING_QUOTE   // 🔄 Üretici müşteri teklifini inceliyor

  // Onay/Red
  CONFIRMED                      // ✅ Onaylandı, üretim başlayabilir
  REJECTED                       // ❌ Genel red
  REJECTED_BY_CUSTOMER           // ❌ Müşteri reddetti
  REJECTED_BY_MANUFACTURER       // ❌ Üretici reddetti

  // Üretim
  IN_PRODUCTION                  // Üretimde
  PRODUCTION_COMPLETE            // Üretim tamamlandı

  // Kalite ve Teslimat
  QUALITY_CHECK                  // Kalite kontrolde
  SHIPPED                        // Kargoya verildi
  DELIVERED                      // Teslim edildi

  // Diğer
  ON_HOLD                        // Askıya alındı
  CANCELLED                      // İptal edildi

  // ... (diğer statuslar)
}
```

#### Order (Sipariş) Statusları - 15 Adet

```typescript
enum OrderStatus {
  PENDING                        // Sipariş beklemede
  REVIEWED                       // Üretici inceliyor
  QUOTE_SENT                     // Üretici teklif gönderdi
  CUSTOMER_QUOTE_SENT            // 🔄 Müşteri karşı teklif gönderdi
  MANUFACTURER_REVIEWING_QUOTE   // 🔄 Üretici müşteri teklifini inceliyor
  CONFIRMED                      // ✅ Onaylandı
  REJECTED                       // ❌ Reddedildi
  REJECTED_BY_CUSTOMER           // ❌ Müşteri reddetti
  REJECTED_BY_MANUFACTURER       // ❌ Üretici reddetti
  IN_PRODUCTION                  // Üretimde
  PRODUCTION_COMPLETE            // Üretim tamamlandı
  QUALITY_CHECK                  // Kalite kontrolde
  SHIPPED                        // Kargoya verildi
  DELIVERED                      // Teslim edildi
  CANCELLED                      // İptal edildi
}
```

---

## 📊 3 Ana Sipariş Senaryosu

### 1️⃣ SENARYO 1: Direkt Sipariş (Revize Olmadan)

**Özet:** Müşteri üreticinin ürününü görür, sipariş oluşturur, üretici teklif gönderir, müşteri direkt kabul eder.

#### Adım Adım Akış

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MÜŞTERİ: Sipariş Oluşturur                              │
└─────────────────────────────────────────────────────────────┘

mutation {
  createOrder(
    productId: 123              # Üreticinin ürünü
    quantity: 1000              # Adet (revize DEĞİL ✅)
    targetPrice: 45.50          # Hedef fiyat (sadece öneri ✅)
    targetDeliveryDays: 30      # Hedef süre (sadece öneri ✅)
    note: "Acil ihtiyaç var"    # Opsiyonel not ✅
  ) {
    id
    orderNumber
    status  # → PENDING
  }
}

Oluşan Tasklar:
✅ Müşteri: "⏳ Siparişiniz İletildi" (MEDIUM, 5 gün)
✅ Üretici: "🔔 Yeni Sipariş Alındı" (HIGH, 3 gün)

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│ 2. ÜRETİCİ: Siparişi İnceler                               │
└─────────────────────────────────────────────────────────────┘

mutation {
  updateOrder(
    id: 1
    status: "REVIEWED"
  ) {
    id
    status  # → REVIEWED
  }
}

Eski Tasklar: PENDING statusundaki 2 task → COMPLETED ✅
Yeni Task:
✅ Üretici: "💰 Fiyat ve Süre Teklifi Hazırlayın" (HIGH, 2 gün)

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│ 3. ÜRETİCİ: Teklif Gönderir (Kendi Fiyat ve Süresini)      │
└─────────────────────────────────────────────────────────────┘

mutation {
  updateOrder(
    id: 1
    status: "QUOTE_SENT"
    unitPrice: 47.00            # Üreticinin fiyatı
    productionDays: 35          # Üreticinin süresi
    manufacturerNote: "35 günde teslim edebiliriz"
  ) {
    id
    status  # → QUOTE_SENT
    unitPrice
    productionDays
  }
}

Eski Task: REVIEWED statusundaki task → COMPLETED ✅
Yeni Tasklar:
✅ Müşteri: "📋 Teklif Onayı Bekliyor" (HIGH, 3 gün)
   - Actions: [approve, counter-offer, reject]
✅ Üretici: "⏳ Müşteri Cevabı Bekleniyor" (MEDIUM, 5 gün)

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│ 4. MÜŞTERİ: Teklifi Direkt Onaylar (REVİZE YOK!)           │
└─────────────────────────────────────────────────────────────┘

mutation {
  updateOrder(
    id: 1
    status: "CONFIRMED"
  ) {
    id
    status  # → CONFIRMED
  }
}

Eski Tasklar: QUOTE_SENT statusundaki 2 task → COMPLETED ✅
Yeni Tasklar:
✅ Üretici: "🎉 Sipariş Onaylandı - Üretime Başlayın" (HIGH, 1 gün)
✅ Müşteri: "✅ Siparişiniz Onaylandı" (MEDIUM, 7 gün)

🎊 ÜRETİM BAŞLADI! 🏭
Sipariş: 1000 adet, 47 TL/adet, 35 gün
```

---

### 2️⃣ SENARYO 2: Revize Teklif (1 Tur Müzakere)

**Özet:** Müşteri üreticinin teklifini beğenmedi, karşı teklif gönderiyor. Üretici kabul ediyor.

#### Adım Adım Akış

```
┌─────────────────────────────────────────────────────────────┐
│ 1-3. Aynı (Sipariş Oluşturma → İnceleme → Üretici Teklifi) │
└─────────────────────────────────────────────────────────────┘

[... PENDING → REVIEWED → QUOTE_SENT ...]
Üretici Teklifi: 47 TL, 35 gün

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│ 4. MÜŞTERİ: Karşı Teklif Gönderiyor 🔄                      │
└─────────────────────────────────────────────────────────────┘

mutation {
  updateOrder(
    id: 1
    status: "CUSTOMER_QUOTE_SENT"     # 🔄 Revize başladı!
    counterOfferPrice: 46.00          # Müşterinin istediği fiyat
    counterOfferDays: 32              # Müşterinin istediği süre
    customerNote: "Bu fiyat bizim için uygun olur"
  ) {
    id
    status  # → CUSTOMER_QUOTE_SENT
    counterOfferPrice
    counterOfferDays
  }
}

Eski Tasklar: QUOTE_SENT statusundaki 2 task → COMPLETED ✅
Yeni Tasklar:
✅ Üretici: "💬 Müşteri Karşı Teklif Gönderdi" (HIGH, 2 gün)
   - Müşteri Teklifi: 46 TL, 32 gün
✅ Müşteri: "⏳ Karşı Teklifiniz İletildi" (MEDIUM, 4 gün)

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│ 5. ÜRETİCİ: Müşteri Teklifini İnceliyor                    │
└─────────────────────────────────────────────────────────────┘

mutation {
  updateOrder(
    id: 1
    status: "MANUFACTURER_REVIEWING_QUOTE"
  ) {
    id
    status  # → MANUFACTURER_REVIEWING_QUOTE
  }
}

Eski Tasklar: CUSTOMER_QUOTE_SENT statusundaki 2 task → COMPLETED ✅
Yeni Task:
✅ Üretici: "🔍 Müşteri Teklifini İnceleyin" (HIGH, 2 gün)

─────────────────────────────────────────────────────────────

┌────────────────────────────────────────────────────────────────┐
│ 6. ÜRETİCİ: 3 SEÇENEK ARASINDA SEÇİM YAPIYOR               │
└────────────────────────────────────────────────────────────────┘

┌─ SEÇENEK A: KABUL ✅ ──────────────────────────────────────┐
│                                                              │
│ mutation {                                                   │
│   updateOrder(                                               │
│     id: 1                                                    │
│     status: "CONFIRMED"                                      │
│     unitPrice: 46.00      # Müşteri teklifini kabul etti    │
│     productionDays: 32                                       │
│   )                                                          │
│ }                                                            │
│                                                              │
│ Sonuç: ✅ ÜRETİM BAŞLADI!                                   │
│ Anlaşma: 1000 adet, 46 TL/adet, 32 gün                      │
│                                                              │
│ Tasklar:                                                     │
│ ✅ Üretici: "🎉 Sipariş Onaylandı - Üretime Başlayın"       │
│ ✅ Müşteri: "✅ Siparişiniz Onaylandı"                       │
└──────────────────────────────────────────────────────────────┘

┌─ SEÇENEK B: REDDET ❌ ─────────────────────────────────────┐
│                                                              │
│ mutation {                                                   │
│   updateOrder(                                               │
│     id: 1                                                    │
│     status: "REJECTED_BY_MANUFACTURER"                       │
│     rejectionReason: "Bu fiyattan yapamıyoruz"              │
│   )                                                          │
│ }                                                            │
│                                                              │
│ Sonuç: ❌ SİPARİŞ İPTAL!                                    │
│                                                              │
│ Tasklar:                                                     │
│ ✅ Müşteri: "❌ Üretici Siparişi Reddetti"                   │
│ ✅ Üretici: "❌ Sipariş Reddedildi" (bildirim)               │
└──────────────────────────────────────────────────────────────┘

┌─ SEÇENEK C: YENİ REVİZE TEKLİF 🔄 ─────────────────────────┐
│                                                              │
│ mutation {                                                   │
│   updateOrder(                                               │
│     id: 1                                                    │
│     status: "QUOTE_SENT"   # Tekrar teklif safhasına dönüyor│
│     unitPrice: 46.50       # Orta yol fiyat                 │
│     productionDays: 33                                       │
│     manufacturerNote: "46.50 TL ile yapabiliriz"            │
│   )                                                          │
│ }                                                            │
│                                                              │
│ Sonuç: 🔄 TEKRAR MÜŞTERİYE GİDİYOR (Ping-Pong devam)       │
│                                                              │
│ Tasklar:                                                     │
│ ✅ Müşteri: "📋 Teklif Onayı Bekliyor" (yeni teklif)        │
│ ✅ Üretici: "⏳ Müşteri Cevabı Bekleniyor"                   │
│                                                              │
│ → Müşteri tekrar karar verecek (SENARYO 3'e bakın)         │
└──────────────────────────────────────────────────────────────┘
```

---

### 3️⃣ SENARYO 3: Çoklu Revize (Ping-Pong Müzakere)

**Özet:** Müşteri ve üretici birden fazla tur teklif-karşı teklif yapıyor, sonunda anlaşıyorlar.

#### Tam Akış Diyagramı

```
┌──────────────────────────────────────────────────────────────┐
│                    🔄 ÇOKLU REVİZE AKIŞI                     │
└──────────────────────────────────────────────────────────────┘

TUR 1: İlk Teklif ve Karşı Teklif
═══════════════════════════════════

Üretici Teklifi:
  Status: QUOTE_SENT
  Teklif: 50 TL/adet, 40 gün
  ↓
  Tasks:
  ✅ Müşteri: "📋 Teklif Onayı Bekliyor"
  ✅ Üretici: "⏳ Müşteri Cevabı Bekleniyor"

Müşteri Karşı Teklifi:
  Status: CUSTOMER_QUOTE_SENT
  Karşı Teklif: 45 TL/adet, 35 gün
  ↓
  Tasks:
  ✅ Üretici: "💬 Müşteri Karşı Teklif Gönderdi" (45 TL, 35 gün)
  ✅ Müşteri: "⏳ Karşı Teklifiniz İletildi"

Üretici İnceleme:
  Status: MANUFACTURER_REVIEWING_QUOTE
  ↓
  Task:
  ✅ Üretici: "🔍 Müşteri Teklifini İnceleyin"

Üretici Yeni Teklif: (Kabul etmedi, yeni teklif gönderiyor)
  Status: QUOTE_SENT
  Yeni Teklif: 48 TL/adet, 38 gün
  ↓
  Tasks:
  ✅ Müşteri: "📋 Teklif Onayı Bekliyor" (48 TL, 38 gün)
  ✅ Üretici: "⏳ Müşteri Cevabı Bekleniyor"

─────────────────────────────────────────────────────────────

TUR 2: İkinci Karşı Teklif
═══════════════════════════

Müşteri Yeni Karşı Teklifi:
  Status: CUSTOMER_QUOTE_SENT
  Yeni Karşı Teklif: 46 TL/adet, 36 gün
  ↓
  Tasks:
  ✅ Üretici: "💬 Müşteri Karşı Teklif Gönderdi" (46 TL, 36 gün)
  ✅ Müşteri: "⏳ Karşı Teklifiniz İletildi"

Üretici İnceleme:
  Status: MANUFACTURER_REVIEWING_QUOTE
  ↓
  Task:
  ✅ Üretici: "🔍 Müşteri Teklifini İnceleyin"

Üretici KABUL: ✅
  Status: CONFIRMED
  Anlaşma: 46 TL/adet, 36 gün
  ↓
  Tasks:
  ✅ Üretici: "🎉 Sipariş Onaylandı - Üretime Başlayın"
  ✅ Müşteri: "✅ Siparişiniz Onaylandı"

🎊 ÜRETİM BAŞLADI! 🏭
Nihai Anlaşma: 1000 adet × 46 TL = 46,000 TL, 36 gün

─────────────────────────────────────────────────────────────

Status Geçiş Özeti:
PENDING → REVIEWED → QUOTE_SENT (50 TL)
  → CUSTOMER_QUOTE_SENT (45 TL)
  → MANUFACTURER_REVIEWING_QUOTE
  → QUOTE_SENT (48 TL) 🔄
  → CUSTOMER_QUOTE_SENT (46 TL) 🔄
  → MANUFACTURER_REVIEWING_QUOTE
  → CONFIRMED ✅

Toplam: 9 status değişimi, 18+ task oluşturuldu ve tamamlandı
```

---

## 🗺️ Status Akış Diyagramları

### Genel Akış Haritası

```
┌──────────────────────────────────────────────────────────────┐
│                   NORMAL AKIŞ (Revize Yok)                   │
└──────────────────────────────────────────────────────────────┘

    PENDING
       ↓
    REVIEWED
       ↓
   QUOTE_SENT ────────→ CONFIRMED ─────→ IN_PRODUCTION
                           ✅              ↓
                                    PRODUCTION_COMPLETE
                                           ↓
                                     QUALITY_CHECK
                                           ↓
                                        SHIPPED
                                           ↓
                                       DELIVERED


┌──────────────────────────────────────────────────────────────┐
│              REVİZE AKIŞI (Karşı Teklif Var)                 │
└──────────────────────────────────────────────────────────────┘

    PENDING
       ↓
    REVIEWED
       ↓
   QUOTE_SENT
       ↓
 CUSTOMER_QUOTE_SENT ←──────────┐
       ↓                         │
MANUFACTURER_REVIEWING_QUOTE     │
       ↓                         │
       ├─→ CONFIRMED ✅          │
       ├─→ REJECTED_BY_MANUFACTURER ❌
       └─→ QUOTE_SENT (yeni teklif) ──┘
           (Ping-Pong devam eder 🔄)


┌──────────────────────────────────────────────────────────────┐
│                 TÜM OLASI DURUMLAR                           │
└──────────────────────────────────────────────────────────────┘

                    PENDING
                      ↓
                   REVIEWED
                      ↓
                  QUOTE_SENT ←──────────────────┐
                      ↓                         │
         ┌────────────┴────────────┐            │
         ↓                         ↓            │
    CONFIRMED ✅         CUSTOMER_QUOTE_SENT    │
         ↓                         ↓            │
   IN_PRODUCTION      MANUFACTURER_REVIEWING_   │
         ↓                   QUOTE              │
         ↓                    ↓                 │
         ↓         ┌──────────┼──────────┐      │
         ↓         ↓          ↓          ↓      │
         ↓    CONFIRMED  QUOTE_SENT  REJECTED   │
         ↓         ✅         │      BY_MFR ❌   │
         ↓                   └────────┘         │
         ↓                                      │
         ↓                                      │
         ↓  REJECTED_BY_CUSTOMER ❌             │
         ↓              ↓                       │
         ↓          CANCELLED                   │
         ↓                                      │
   PRODUCTION_COMPLETE                          │
         ↓                                      │
    QUALITY_CHECK                               │
         ↓                                      │
      SHIPPED                                   │
         ↓                                      │
     DELIVERED                                  │
```

---

## 💻 GraphQL Mutation Örnekleri

### 1. Sipariş Oluşturma (createOrder)

```graphql
mutation CreateOrder {
  createOrder(
    # Zorunlu alanlar
    productId: 123
    quantity: 1000
    manufacturerId: 18

    # Opsiyonel - Sadece öneri (revize sayılmaz)
    targetPrice: 45.50
    targetDeliveryDays: 30
    note: "Acil ihtiyaç, mümkünse erken teslim"

    # Collection bilgisi
    collectionId: 5
  ) {
    id
    orderNumber
    status
    quantity
    targetPrice
    targetDeliveryDays
    customer {
      id
      name
    }
    manufacturer {
      id
      name
    }
  }
}
```

**Response:**

```json
{
  "data": {
    "createOrder": {
      "id": 1,
      "orderNumber": "ORD-2025-001",
      "status": "PENDING",
      "quantity": 1000,
      "targetPrice": 45.5,
      "targetDeliveryDays": 30,
      "customer": {
        "id": 25,
        "name": "LC Waikiki"
      },
      "manufacturer": {
        "id": 18,
        "name": "Defacto Tekstil"
      }
    }
  }
}
```

---

### 2. Sipariş Durumu Güncelleme (updateOrder)

#### A. İnceleme Aşaması

```graphql
mutation ReviewOrder {
  updateOrder(id: 1, status: "REVIEWED") {
    id
    status
  }
}
```

#### B. Üretici Teklif Gönderme

```graphql
mutation SendQuote {
  updateOrder(
    id: 1
    status: "QUOTE_SENT"
    unitPrice: 47.00
    productionDays: 35
    manufacturerNote: "35 gün içinde üretip teslim edebiliriz"
  ) {
    id
    status
    unitPrice
    productionDays
    manufacturerNote
  }
}
```

#### C. Müşteri Karşı Teklif Gönderme (REVİZE!)

```graphql
mutation SendCounterOffer {
  updateOrder(
    id: 1
    status: "CUSTOMER_QUOTE_SENT"
    counterOfferPrice: 46.00
    counterOfferDays: 32
    customerNote: "Bu fiyat ve süre bizim için uygun olur"
  ) {
    id
    status
    counterOfferPrice
    counterOfferDays
    customerNote
  }
}
```

#### D. Üretici İnceleme

```graphql
mutation ReviewCounterOffer {
  updateOrder(id: 1, status: "MANUFACTURER_REVIEWING_QUOTE") {
    id
    status
    counterOfferPrice
    counterOfferDays
  }
}
```

#### E. Üretici Kabul

```graphql
mutation AcceptCounterOffer {
  updateOrder(
    id: 1
    status: "CONFIRMED"
    unitPrice: 46.00 # Müşteri teklifini kabul etti
    productionDays: 32
  ) {
    id
    status
    unitPrice
    productionDays
  }
}
```

#### F. Üretici Red

```graphql
mutation RejectOrder {
  updateOrder(
    id: 1
    status: "REJECTED_BY_MANUFACTURER"
    rejectionReason: "Bu fiyattan maalesef yapamıyoruz"
  ) {
    id
    status
    rejectionReason
  }
}
```

#### G. Üretici Yeni Teklif (Ping-Pong)

```graphql
mutation SendNewQuote {
  updateOrder(
    id: 1
    status: "QUOTE_SENT"
    unitPrice: 46.50 # Orta yol teklif
    productionDays: 33
    manufacturerNote: "46.50 TL ile yapabiliriz"
  ) {
    id
    status
    unitPrice
    productionDays
  }
}
```

---

### 3. Numune Oluşturma (createSample)

```graphql
mutation CreateSample {
  createSample(
    name: "Yaz Elbisesi Numunesi"
    description: "Hafif pamuklu kumaş"
    manufacturerId: 18
    collectionId: 5
    customerNote: "Acil ihtiyaç"

    # Opsiyonel - AI tasarım
    aiGenerated: false
  ) {
    id
    sampleNumber
    status # → PENDING (veya AI_DESIGN)
    name
    customer {
      id
      name
    }
    manufacturer {
      id
      name
    }
  }
}
```

---

### 4. Numune Durumu Güncelleme (updateSample)

**Tüm akış Order ile aynı, sadece mutation adı farklı:**

```graphql
# İnceleme
mutation {
  updateSample(id: 1, status: "REVIEWED")
}

# Teklif
mutation {
  updateSample(id: 1, status: "QUOTE_SENT", unitPrice: 25.00, productionDays: 5)
}

# Karşı Teklif
mutation {
  updateSample(
    id: 1
    status: "CUSTOMER_QUOTE_SENT"
    counterOfferPrice: 23.00
    counterOfferDays: 4
  )
}

# İnceleme
mutation {
  updateSample(id: 1, status: "MANUFACTURER_REVIEWING_QUOTE")
}

# Kabul
mutation {
  updateSample(id: 1, status: "CONFIRMED", unitPrice: 23.00, productionDays: 4)
}
```

---

## ⚙️ Task Otomasyonu

### DynamicTaskHelper Sistem Mimarisi

```typescript
┌─────────────────────────────────────────────────────────────┐
│                    DynamicTaskHelper                         │
│                   (Central Task Engine)                      │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  SAMPLE  │   │  ORDER   │   │PRODUCTION│
    │ 28 Status│   │ 15 Status│   │ 7 Stages │
    └──────────┘   └──────────┘   └──────────┘
```

### Her Status için Task Tanımları

#### PENDING Status

```typescript
PENDING: {
  manufacturerTask: {
    title: "🔔 Yeni Sipariş Alındı",
    description: "Müşteriden yeni sipariş geldi. İncelemelisiniz.",
    type: "REVIEW_QUOTE",
    priority: "HIGH",
    dueDays: 3,
    targetStatus: "REVIEWED"
  },
  customerTask: {
    title: "⏳ Siparişiniz İletildi",
    description: "Siparişiniz üreticiye iletildi. Teklif bekleniyor.",
    type: "STATUS_CHANGE",
    priority: "MEDIUM",
    dueDays: 5
  }
}
```

#### CUSTOMER_QUOTE_SENT Status (Revize!)

```typescript
CUSTOMER_QUOTE_SENT: {
  manufacturerTask: {
    title: "💬 Müşteri Karşı Teklif Gönderdi",
    description: "Müşteriden karşı teklif geldi. İnceleyip yanıt vermelisiniz.",
    type: "REVIEW_QUOTE",
    priority: "HIGH",              // Yüksek öncelik!
    dueDays: 2,                    // 2 gün içinde yanıt
    targetStatus: "CONFIRMED"
  },
  customerTask: {
    title: "⏳ Karşı Teklifiniz İletildi",
    description: "Karşı teklifiniz üreticiye iletildi. Yanıt bekleniyor.",
    type: "STATUS_CHANGE",
    priority: "MEDIUM",
    dueDays: 4
  }
}
```

#### MANUFACTURER_REVIEWING_QUOTE Status

```typescript
MANUFACTURER_REVIEWING_QUOTE: {
  manufacturerTask: {
    title: "🔍 Müşteri Teklifini İnceleyin",
    description: "Müşterinin karşı teklifini inceleyip yanıt vermelisiniz.",
    type: "REVIEW_QUOTE",
    priority: "HIGH",
    dueDays: 2,
    targetStatus: "CONFIRMED"
  }
  // customerTask YOK - Sadece üretici çalışıyor
}
```

#### CONFIRMED Status

```typescript
CONFIRMED: {
  manufacturerTask: {
    title: "🎉 Sipariş Onaylandı - Üretime Başlayın",
    description: "Sipariş onaylandı. Üretim planlaması yapmalısınız.",
    type: "PRODUCTION_STAGE",
    priority: "HIGH",
    dueDays: 1,                    // 1 gün içinde başla!
    targetStatus: "IN_PRODUCTION",
    actionData: {
      requiresProductionPlan: true
    }
  },
  customerTask: {
    title: "✅ Siparişiniz Onaylandı",
    description: "Sipariş onaylandı. Üretim başlayacak.",
    type: "NOTIFICATION",
    priority: "MEDIUM",
    dueDays: 7
  }
}
```

#### REJECTED_BY_MANUFACTURER Status

```typescript
REJECTED_BY_MANUFACTURER: {
  customerTask: {
    title: "❌ Üretici Siparişi Reddetti",
    description: "Üretici bu siparişi kabul edemeyeceğini bildirdi.",
    type: "NOTIFICATION",
    priority: "MEDIUM",
    dueDays: 3
  }
  // manufacturerTask yok - sadece müşteri bilgilendiriliyor
}
```

### Task Oluşturma Süreci

```typescript
// 1️⃣ Mutation çağrılır (örn: updateOrder)
updateOrder(id: 1, status: "CUSTOMER_QUOTE_SENT", ...)

// 2️⃣ DynamicTaskHelper devreye girer
const dynamicTaskHelper = new DynamicTaskHelper(prisma);

// 3️⃣ Eski taskları tamamla
await dynamicTaskHelper.completeOldTasks("order", 1, "QUOTE_SENT");
// → QUOTE_SENT için oluşturulmuş tüm tasklar COMPLETED olur

// 4️⃣ Yeni tasklar oluştur
await dynamicTaskHelper.createTasksForOrderStatus(
  updatedOrder,
  "CUSTOMER_QUOTE_SENT",
  customerId,
  manufacturerId
);

// 5️⃣ Haritaya bakıyor
const taskConfig = ORDER_STATUS_TASK_MAP["CUSTOMER_QUOTE_SENT"];

// 6️⃣ İki task oluşturuluyor
await prisma.task.create({
  data: {
    title: "💬 Müşteri Karşı Teklif Gönderdi",
    userId: manufacturerId,      // Üreticiye atandı
    orderId: 1,
    priority: "HIGH",
    dueDate: calculateDueDate(2),  // 2 gün sonra
    status: "PENDING"
  }
});

await prisma.task.create({
  data: {
    title: "⏳ Karşı Teklifiniz İletildi",
    userId: customerId,          // Müşteriye atandı
    orderId: 1,
    priority: "MEDIUM",
    dueDate: calculateDueDate(4),  // 4 gün sonra
    status: "PENDING"
  }
});
```

---

## 🗄️ Veritabanı Yapısı

### Order Tablosu

```prisma
model Order {
  id                  Int       @id @default(autoincrement())
  orderNumber         String    @unique

  // İlişkiler
  customerId          Int
  customer            User      @relation("CustomerOrders", ...)
  manufactureId       Int
  manufacturer        User      @relation("ManufacturerOrders", ...)

  // Temel bilgiler
  quantity            Int
  status              OrderStatus  @default(PENDING)

  // Fiyat ve süre
  unitPrice           Float?         // Üreticinin nihai fiyatı
  productionDays      Int?           // Üreticinin nihai süresi
  targetPrice         Float?         // Müşterinin hedef fiyatı (öneri)
  targetDeliveryDays  Int?           // Müşterinin hedef süresi (öneri)

  // Revize (Karşı teklif)
  counterOfferPrice   Float?         // Müşterinin karşı teklif fiyatı
  counterOfferDays    Int?           // Müşterinin karşı teklif süresi

  // Notlar
  note                String?        // Müşteri notu
  customerNote        String?        // Müşteri karşı teklif notu
  manufacturerNote    String?        // Üretici not/açıklama
  rejectionReason     String?        // Red nedeni

  // Tasklar
  tasks               Task[]

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

### Sample Tablosu

```prisma
model Sample {
  id                  Int       @id @default(autoincrement())
  sampleNumber        String    @unique

  // İlişkiler
  customerId          Int
  customer            User      @relation("CustomerSamples", ...)
  manufactureId       Int
  manufacturer        User      @relation("ManufacturerSamples", ...)

  // Temel bilgiler
  name                String
  description         String?
  status              SampleStatus  @default(PENDING)

  // Fiyat ve süre (Sample için aynı mantık)
  unitPrice           Float?
  productionDays      Int?
  counterOfferPrice   Float?
  counterOfferDays    Int?

  // Notlar
  customerNote        String?
  manufacturerNote    String?
  rejectionReason     String?

  // AI
  aiGenerated         Boolean   @default(false)

  // Tasklar
  tasks               Task[]

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

### Task Tablosu

```prisma
model Task {
  id              Int         @id @default(autoincrement())

  // Kime atandı
  userId          Int
  user            User        @relation(...)

  // Hangi entity ile ilgili
  sampleId        Int?
  sample          Sample?     @relation(...)
  orderId         Int?
  order           Order?      @relation(...)
  productionId    Int?
  production      ProductionTracking? @relation(...)

  // Task detayları
  title           String
  description     String?
  type            TaskType
  priority        TaskPriority  @default(MEDIUM)
  status          TaskStatus    @default(PENDING)

  // Zaman
  dueDate         DateTime?
  completedAt     DateTime?

  // Metadata (JSON)
  actionData      Json?         // { action: "approve", redirectUrl: "/orders/1" }

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

---

## 🎨 Frontend Entegrasyonu

### React Component Örneği: Revize Teklif Formu

```typescript
import { useState } from "react";
import { useMutation } from "urql";

const UPDATE_ORDER_MUTATION = `
  mutation UpdateOrder(
    $id: Int!
    $status: String!
    $counterOfferPrice: Float
    $counterOfferDays: Int
    $customerNote: String
  ) {
    updateOrder(
      id: $id
      status: $status
      counterOfferPrice: $counterOfferPrice
      counterOfferDays: $counterOfferDays
      customerNote: $customerNote
    ) {
      id
      status
      counterOfferPrice
      counterOfferDays
    }
  }
`;

export function CounterOfferForm({ order }) {
  const [price, setPrice] = useState(order.unitPrice || 0);
  const [days, setDays] = useState(order.productionDays || 0);
  const [note, setNote] = useState("");

  const [, updateOrder] = useMutation(UPDATE_ORDER_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await updateOrder({
      id: order.id,
      status: "CUSTOMER_QUOTE_SENT",
      counterOfferPrice: price,
      counterOfferDays: days,
      customerNote: note,
    });

    if (result.data) {
      toast.success("Karşı teklifiniz gönderildi!");
      // Tasklar otomatik oluşturuldu ✅
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Önerilen Fiyat</label>
        <p className="text-gray-600">
          Üretici Teklifi: {order.unitPrice} TL/adet
        </p>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          className="input"
        />
      </div>

      <div>
        <label>Önerilen Süre</label>
        <p className="text-gray-600">
          Üretici Teklifi: {order.productionDays} gün
        </p>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="input"
        />
      </div>

      <div>
        <label>Not (Opsiyonel)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Teklifinizle ilgili açıklama..."
          className="textarea"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          🔄 Karşı Teklif Gönder
        </button>
        <button
          type="button"
          onClick={() => handleAccept()}
          className="btn-success"
        >
          ✅ Teklifi Kabul Et
        </button>
        <button
          type="button"
          onClick={() => handleReject()}
          className="btn-danger"
        >
          ❌ Reddet
        </button>
      </div>
    </form>
  );
}
```

### Üretici Karar Verme Komponenti

```typescript
export function ManufacturerDecision({ order }) {
  const [, updateOrder] = useMutation(UPDATE_ORDER_MUTATION);

  const handleAccept = async () => {
    await updateOrder({
      id: order.id,
      status: "CONFIRMED",
      unitPrice: order.counterOfferPrice, // Müşteri teklifini kabul
      productionDays: order.counterOfferDays,
    });

    toast.success("Sipariş onaylandı! Üretime başlayabilirsiniz.");
    // Task: "🎉 Sipariş Onaylandı - Üretime Başlayın" oluşturuldu
  };

  const handleReject = async () => {
    const reason = prompt("Red nedeni:");

    await updateOrder({
      id: order.id,
      status: "REJECTED_BY_MANUFACTURER",
      rejectionReason: reason,
    });

    toast.error("Sipariş reddedildi.");
    // Task: Müşteri: "❌ Üretici Siparişi Reddetti" oluşturuldu
  };

  const handleNewOffer = async () => {
    const newPrice = prompt("Yeni fiyat teklifi:", order.counterOfferPrice);
    const newDays = prompt("Yeni süre teklifi:", order.counterOfferDays);

    await updateOrder({
      id: order.id,
      status: "QUOTE_SENT", // Tekrar teklif safhasına
      unitPrice: parseFloat(newPrice),
      productionDays: parseInt(newDays),
      manufacturerNote: "Revize teklifimiz",
    });

    toast.info("Yeni teklifiniz müşteriye gönderildi.");
    // Ping-pong devam ediyor 🔄
  };

  return (
    <div className="decision-panel">
      <h3>Müşteri Karşı Teklifi</h3>
      <div className="offer-comparison">
        <div>
          <strong>Sizin Teklifiniz:</strong>
          <p>
            {order.unitPrice} TL, {order.productionDays} gün
          </p>
        </div>
        <div>
          <strong>Müşteri Teklifi:</strong>
          <p>
            {order.counterOfferPrice} TL, {order.counterOfferDays} gün
          </p>
        </div>
      </div>

      <p className="customer-note">{order.customerNote}</p>

      <div className="actions">
        <button onClick={handleAccept} className="btn-success">
          ✅ Kabul Et
        </button>
        <button onClick={handleNewOffer} className="btn-warning">
          🔄 Yeni Teklif Gönder
        </button>
        <button onClick={handleReject} className="btn-danger">
          ❌ Reddet
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Test Senaryoları

### Test 1: Direkt Sipariş (Happy Path)

```graphql
# 1. Sipariş oluştur
mutation { createOrder(productId: 123, quantity: 1000, ...) }
# Beklenen: Status = PENDING, 2 task oluşturuldu

# 2. Görevleri kontrol et
query { tasks(where: { orderId: { equals: 1 } }) { id, title, userId } }
# Beklenen: 2 task (customer + manufacturer)

# 3. Üretici inceler
mutation { updateOrder(id: 1, status: "REVIEWED") }
# Beklenen: Eski 2 task COMPLETED, 1 yeni manufacturer task

# 4. Üretici teklif gönderir
mutation {
  updateOrder(
    id: 1
    status: "QUOTE_SENT"
    unitPrice: 47
    productionDays: 35
  )
}
# Beklenen: Eski task COMPLETED, 2 yeni task (customer + manufacturer)

# 5. Müşteri kabul eder
mutation { updateOrder(id: 1, status: "CONFIRMED") }
# Beklenen: Status = CONFIRMED, 2 yeni task (üretim başlıyor)

# 6. Tüm taskları kontrol et
query {
  tasks(where: { orderId: { equals: 1 } }) {
    id
    title
    status
    createdAt
  }
}
# Beklenen: 7 task (3 safha × 2 + 1), 5'i COMPLETED, 2'si PENDING
```

### Test 2: Revize Teklif (1 Tur)

```graphql
# 1-4. Aynı (sipariş → inceleme → teklif)

# 5. Müşteri karşı teklif gönderir
mutation {
  updateOrder(
    id: 1
    status: "CUSTOMER_QUOTE_SENT"
    counterOfferPrice: 46
    counterOfferDays: 32
    customerNote: "Bu fiyat uygun"
  )
}
# Beklenen: 2 yeni task oluştu, eski tasklar COMPLETED

# 6. Üretici inceler
mutation {
  updateOrder(id: 1, status: "MANUFACTURER_REVIEWING_QUOTE")
}
# Beklenen: 1 manufacturer task

# 7. Üretici kabul eder
mutation {
  updateOrder(id: 1, status: "CONFIRMED", unitPrice: 46, productionDays: 32)
}
# Beklenen: Status = CONFIRMED, üretim taskları oluştu

# 8. Siparişi kontrol et
query {
  order(where: { id: 1 }) {
    unitPrice # 46 olmalı
    productionDays # 32 olmalı
    counterOfferPrice
    counterOfferDays
  }
}
```

### Test 3: Çoklu Revize (Ping-Pong)

```graphql
# 1-4. Aynı (QUOTE_SENT: 50 TL, 40 gün)

# 5. Müşteri karşı teklif (45 TL, 35 gün)
mutation {
  updateOrder(id: 1, status: "CUSTOMER_QUOTE_SENT", ...)
}

# 6. Üretici inceler ve YENİ TEKLİF gönderir
mutation {
  updateOrder(
    id: 1
    status: "QUOTE_SENT"  # Geri dönüyor!
    unitPrice: 48
    productionDays: 38
  )
}

# 7. Müşteri tekrar karşı teklif (46 TL, 36 gün)
mutation {
  updateOrder(id: 1, status: "CUSTOMER_QUOTE_SENT", ...)
}

# 8. Üretici inceler ve KABUL eder
mutation {
  updateOrder(
    id: 1
    status: "CONFIRMED"
    unitPrice: 46
    productionDays: 36
  )
}

# 9. Tüm status geçişlerini kontrol et
query {
  order(where: { id: 1 }) {
    id
    orderNumber
    status        # CONFIRMED
    unitPrice     # 46
    productionDays # 36
  }
}

# 10. Task sayısını kontrol et
query {
  tasks(where: { orderId: { equals: 1 } }) {
    id
    title
    status
  }
}
# Beklenen: ~12-15 task (birçok status değişimi oldu)
```

### Test 4: Red Senaryosu

```graphql
# 1-5. Aynı (müşteri karşı teklif gönderdi)

# 6. Üretici REDDET
mutation {
  updateOrder(
    id: 1
    status: "REJECTED_BY_MANUFACTURER"
    rejectionReason: "Bu fiyattan yapamıyoruz"
  )
}

# 7. Kontrol et
query {
  order(where: { id: 1 }) {
    status # REJECTED_BY_MANUFACTURER
    rejectionReason # "Bu fiyattan yapamıyoruz"
  }

  tasks(where: { orderId: { equals: 1 }, status: { equals: "PENDING" } }) {
    title # Müşteri: "❌ Üretici Siparişi Reddetti"
  }
}
```

---

## 📈 Performans ve Optimizasyon

### Task Sayısı Tahmini

```typescript
Normal Sipariş (Revize Yok):
  PENDING → REVIEWED → QUOTE_SENT → CONFIRMED
  4 safha × ortalama 1.5 task = 6 task

Tek Tur Revize:
  + CUSTOMER_QUOTE_SENT (2 task)
  + MANUFACTURER_REVIEWING_QUOTE (1 task)
  = 6 + 3 = 9 task

Çok Tur Revize (3 tur):
  Her tur: +3 task (CUSTOMER_QUOTE_SENT + inceleme)
  = 6 + (3 × 3) = 15 task

Maksimum (5 tur revize):
  = 6 + (5 × 3) = 21 task
```

### Database İndeksler

```sql
-- Task tablosu için kritik indeksler
CREATE INDEX idx_tasks_user_status ON Task(userId, status);
CREATE INDEX idx_tasks_order_status ON Task(orderId, status);
CREATE INDEX idx_tasks_sample_status ON Task(sampleId, status);
CREATE INDEX idx_tasks_due_date ON Task(dueDate) WHERE status = 'PENDING';

-- Order tablosu için
CREATE INDEX idx_orders_status ON Order(status);
CREATE INDEX idx_orders_manufacturer_status ON Order(manufactureId, status);
CREATE INDEX idx_orders_customer_status ON Order(customerId, status);

-- Sample tablosu için
CREATE INDEX idx_samples_status ON Sample(status);
CREATE INDEX idx_samples_manufacturer_status ON Sample(manufactureId, status);
```

---

## ✅ Sistem Kontrol Listesi

### Backend Hazırlık

- [x] Prisma Schema: SampleStatus ve OrderStatus enumları tanımlı
- [x] DynamicTaskHelper: 50 status için task mapping
- [x] createSample mutation: manufacturerId zorunlu
- [x] updateSample mutation: Task automation entegre
- [x] createOrder mutation: Task automation entegre
- [x] updateOrder mutation: Task automation entegre
- [x] completeOldTasks: Eski taskları otomatik tamamlama
- [x] TypeScript compilation: 0 hata

### Frontend Gereksinimi

- [ ] Sipariş oluşturma formu (targetPrice, targetDays opsiyonel)
- [ ] Karşı teklif formu (counterOfferPrice, counterOfferDays)
- [ ] Üretici karar paneli (Kabul/Red/Yeni Teklif)
- [ ] Task listesi görüntüleme
- [ ] Task detay sayfası
- [ ] Status timeline (sipariş akış grafiği)
- [ ] Bildirimler (task oluşturulduğunda)

### Test Gereksinimleri

- [ ] Unit test: DynamicTaskHelper
- [ ] Integration test: createOrder → updateOrder flow
- [ ] Integration test: Revize akışı (ping-pong)
- [ ] E2E test: Tam sipariş süreci
- [ ] Performance test: 100 sipariş × 10 revize

---

## 🎓 Özet

### ✅ Sistem Yetenekleri

1. **Direkt Sipariş**

   - Müşteri → Sipariş oluştur
   - Üretici → Teklif gönder
   - Müşteri → Kabul et
   - ✅ Üretim başla

2. **Revize Teklif**

   - Müşteri → Karşı teklif gönder
   - Üretici → İncele
   - Üretici → Kabul/Red/Yeni Teklif

3. **Çoklu Revize**

   - Sınırsız tur müzakere
   - Her status değişiminde otomatik task
   - Eski tasklar otomatik tamamlanır

4. **Sample İçin Aynı**
   - Tüm akış Sample için de geçerli
   - Aynı statuslar, aynı tasklar

### 📊 Kapsam

| Metric                | Değer                                                                 |
| --------------------- | --------------------------------------------------------------------- |
| **Toplam Status**     | 50 (28 Sample + 15 Order + 7 Production)                              |
| **Revize Statusları** | 4 (CUSTOMER*QUOTE_SENT, MANUFACTURER_REVIEWING_QUOTE, REJECTED_BY*\*) |
| **Task Çeşidi**       | 100+ (her status için 1-2 task)                                       |
| **Desteklenen Tur**   | Sınırsız (ping-pong)                                                  |
| **Otomatik Task**     | %100 (tüm status değişimlerinde)                                      |

### 🚀 Production Durumu

```
✅ Database Schema      → Ready
✅ DynamicTaskHelper    → Ready (815 lines)
✅ Backend Mutations    → Ready
✅ Task Automation      → Ready
✅ Documentation        → Complete
⏳ Frontend UI          → TODO
⏳ Testing              → TODO
```

---

**Hazırlayan:** AI Development Team
**Tarih:** 19 Ekim 2025
**Versiyon:** 2.0.0
**Durum:** ✅ Production Ready (Backend)

---

## 📞 Destek

Sorularınız için:

- Backend: `backend/src/graphql/mutations/`
- Task Helper: `backend/src/utils/dynamicTaskHelper.ts`
- Schema: `backend/prisma/schema.prisma`
- Dökümanlar: Bu dosya + `COMPLETE_WORKFLOW_INTEGRATION.md`
