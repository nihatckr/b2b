# 🚀 Advanced Platform Features

## 📊 Gelişmiş Özellikler Özeti

Bu belgede, tekstil üretim platformuna eklenen gelişmiş özellikler açıklanmaktadır.

---

## 1. 🏷️ Standart Kategori Sistemi (Normalized Category Tree)

### Özellikler:
- **Platform Geneli Standartlar**: Admin tarafından tanımlanan global kategori standartları
- **Çok Dilli Destek**: Kategori isimleri 5+ dilde (TR, EN, ES, DE, ZH)
- **Hiyerarşik Yapı**: ROOT → MAIN → SUB → DETAIL seviyelerinde kategori ağacı
- **Firma Bazlı Özelleştirme**: Her firma standart kategorileri kendi ihtiyacına göre genişletebilir

### Modeller:
```prisma
enum CategoryLevel {
  ROOT              // Ana kategori (Tekstil, Giyim, Aksesuar)
  MAIN              // Ana grup (Üst Giyim, Alt Giyim, İç Giyim)
  SUB               // Alt grup (Gömlek, Pantolon, Elbise)
  DETAIL            // Detay (Uzun Kollu Gömlek, Kısa Kollu Gömlek)
}

StandardCategory {
  - Platform geneli standart
  - Çok dilli isimler (nameTr, nameEn, nameEs, etc.)
  - Unique code sistemi
  - Self-referencing tree structure
}

CompanyCategory {
  - Firma özel kategoriler
  - StandardCategory referansı (opsiyonel)
  - Kendi ağaç yapısı
  - İç kod ve sıralama
}
```

### Kullanım Senaryoları:
1. **Admin**: Platform geneli "Erkek Gömlek" standardı oluşturur
2. **Firma A (Defacto)**: Bu standardı kullanır, kendi "Casual Gömlek" alt kategorisini ekler
3. **Firma B (Koton)**: Aynı standardı kullanır, "Formal Gömlek" alt kategorisini ekler
4. **Çapraz Platform İşbirliği**: Her iki firma da "Erkek Gömlek" standardını paylaşır

---

## 2. 🤝 Firmalar Arası Ortaklık Sistemi (Company Partnerships)

### Özellikler:
- **7 Farklı Ortaklık Tipi**: Tedarikçi, Üretici, Distribütör, White Label, Co-Branding, Fason, Stratejik Partner
- **Durum Takibi**: Pending → Active → Suspended/Terminated
- **Performans Metrikleri**: Kalite skoru, zamanında teslimat oranı, toplam ciro
- **Sözleşme Yönetimi**: Contract dosyası, NDA, ödeme koşulları

### Modeller:
```prisma
enum PartnershipType {
  SUPPLIER          // Tedarikçi ilişkisi
  MANUFACTURER      // Üretici ortaklığı
  DISTRIBUTOR       // Distribütör
  WHITE_LABEL       // White label üretim
  CO_BRANDING       // Ortak marka
  SUBCONTRACTOR     // Fason
  STRATEGIC_PARTNER // Stratejik iş ortağı
}

CompanyPartnership {
  - İki taraflı firma ilişkisi
  - Finansal bilgiler (contractValue, currency, paymentTerms)
  - Performans metrikleri (qualityScore, onTimeDelivery)
  - Kategori eşleştirmeleri
}
```

### Kullanım Senaryoları:
1. **Üretici + Alıcı**: Zara ile yerel üretici arasında fason üretim anlaşması
2. **Üretici + Tedarikçi**: Tekstil firması ile kumaş tedarikçisi ortaklığı
3. **Marka + Marka**: Co-branding projesi (örn: Nike x Supreme)

---

## 3. 🔗 Markalar Arası Kategori Eşleştirme (Shared Category Mapping)

### Özellikler:
- **Çapraz Kategori Uyumu**: Farklı firmaların kategorilerini eşleştirme
- **Otomatik Benzerlik Skoru**: AI destekli kategori eşleştirme (0-100)
- **Fiyat Ayarlama**: Kategori bazında % fiyat ayarı
- **Çapraz Sipariş Desteği**: Eşleşmiş kategoriler arası sipariş

### Model:
```prisma
SharedCategoryMapping {
  - Partnership ilişkisi
  - Source company category
  - Target company category
  - Match score (otomatik hesaplama)
  - Price adjustment
  - Cross-order settings
}
```

### Kullanım Senaryoları:
1. **Aynı Ürün, Farklı İsim**:
   - Firma A: "Erkek Polo Yaka T-Shirt"
   - Firma B: "Men's Polo Shirt"
   - Mapping: %95 match score

2. **Fason Üretim**:
   - Alıcı Firma: "Premium Cotton Gömlek"
   - Üretici Firma: "Gömlek - Pamuklu - Grade A"
   - Mapping: allowCrossOrders = true, priceAdjustment = -15%

---

## 4. 📈 Admin Analiz ve Karşılaştırma Sistemi

### Özellikler:
- **Firma Karşılaştırma**: Çoklu firma performans kıyaslaması
- **Real-time Metrikler**: Günlük/haftalık/aylık metrik takibi
- **Raporlama**: PDF/Excel export
- **AI Insights**: Otomatik trend ve insight üretimi

### Modeller:
```prisma
enum ReportType {
  COMPANY_COMPARISON    // Firma karşılaştırma
  PERFORMANCE           // Performans
  FINANCIAL             // Finansal
  QUALITY               // Kalite
  MARKET_ANALYSIS       // Pazar analizi
  TREND_ANALYSIS        // Trend analizi
}

AdminReport {
  - Tarih aralığı
  - İlgili firmalar (JSON array)
  - Metrikler (totalOrders, revenue, etc.)
  - Karşılaştırma verileri
  - Sıralama ve benchmark
}

CompanyMetrics {
  - Real-time günlük metrikler
  - Sipariş/Üretim/Kalite metrikleri
  - Müşteri metrikleri (retention, satisfaction)
  - Platform kullanım istatistikleri
}
```

### Karşılaştırılabilir Metrikler:
1. **Operasyonel**:
   - Sipariş tamamlama oranı
   - Ortalama termin süresi
   - Zamanında teslimat oranı

2. **Finansal**:
   - Toplam ciro
   - Ortalama sipariş değeri
   - Kar marjı

3. **Kalite**:
   - Kalite skoru (1-10)
   - Hata oranı (%)
   - İade oranı (%)

4. **Müşteri**:
   - Müşteri memnuniyeti
   - Yeni müşteri sayısı
   - Müşteri elde tutma oranı

---

## 5. 🎯 Admin Görevleri

### Kategori Yönetimi:
```typescript
// 1. Platform geneli standart kategori oluştur
const standardCategory = await prisma.standardCategory.create({
  data: {
    code: "TEX-GAR-001",
    name: "Men's Shirt",
    nameTr: "Erkek Gömlek",
    nameEn: "Men's Shirt",
    nameEs: "Camisa de Hombre",
    level: "SUB",
    parentId: mainCategoryId,
    isPublic: true
  }
});

// 2. Firmaların bu standardı kullanmasını sağla
const companyCategory = await prisma.companyCategory.create({
  data: {
    name: "Casual Shirt",
    companyId: defactoId,
    standardCategoryId: standardCategory.id,
    type: "GLOBAL_STANDARD"
  }
});
```

### Firma Karşılaştırma:
```typescript
// 1. Son 30 günlük metrikleri al
const metrics = await prisma.companyMetrics.findMany({
  where: {
    companyId: { in: [zaraId, hAndMId, nikeId] },
    date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }
});

// 2. Karşılaştırma raporu oluştur
const report = await prisma.adminReport.create({
  data: {
    type: "COMPANY_COMPARISON",
    period: "MONTHLY",
    title: "Q4 2024 Performance Comparison",
    companies: JSON.stringify([zaraId, hAndMId, nikeId]),
    metrics: JSON.stringify(calculatedMetrics),
    comparisons: JSON.stringify(comparisons)
  }
});
```

### Ortaklık Onayı:
```typescript
// Pending ortaklıkları listele
const pendingPartnerships = await prisma.companyPartnership.findMany({
  where: { status: "PENDING" },
  include: { company: true, partner: true }
});

// Ortaklığı onayla
await prisma.companyPartnership.update({
  where: { id: partnershipId },
  data: {
    status: "ACTIVE",
    approvedById: adminUserId,
    startDate: new Date()
  }
});
```

---

## 6. 🔍 Kullanım Örnekleri

### Senaryo 1: Yeni Firma Onboarding
```typescript
// 1. Firma kayıt
const company = await prisma.company.create({
  data: {
    name: "New Fashion Brand",
    type: "BUYER",
    subscriptionPlan: "STARTER"
  }
});

// 2. Platform standartlarını kullan
const standardCategories = await prisma.standardCategory.findMany({
  where: { isPublic: true, level: "MAIN" }
});

// 3. Firma kategorilerini oluştur
await prisma.companyCategory.createMany({
  data: standardCategories.map(std => ({
    companyId: company.id,
    standardCategoryId: std.id,
    name: std.name,
    type: "GLOBAL_STANDARD"
  }))
});
```

### Senaryo 2: Ortaklık Kurulumu
```typescript
// 1. Ortaklık teklifi
const partnership = await prisma.companyPartnership.create({
  data: {
    companyId: buyerId,
    partnerId: manufacturerId,
    type: "MANUFACTURER",
    status: "PENDING",
    title: "Fason Üretim Anlaşması",
    contractValue: 500000,
    currency: "USD"
  }
});

// 2. Kategori eşleştirme
await prisma.sharedCategoryMapping.create({
  data: {
    partnershipId: partnership.id,
    sourceCategoryId: buyerShirtCategoryId,
    targetCategoryId: manufacturerShirtCategoryId,
    matchScore: 95,
    allowCrossOrders: true
  }
});
```

### Senaryo 3: Aylık Performans Raporu
```typescript
// 1. Tüm firmaların metriklerini hesapla
const companies = await prisma.company.findMany({
  where: { isActive: true }
});

for (const company of companies) {
  const orders = await prisma.order.findMany({
    where: {
      companyId: company.id,
      createdAt: { gte: startOfMonth }
    }
  });

  await prisma.companyMetrics.create({
    data: {
      companyId: company.id,
      date: new Date(),
      period: "MONTHLY",
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
      // ... diğer metrikler
    }
  });
}

// 2. Top 10 firma raporu
const topCompanies = await prisma.companyMetrics.findMany({
  where: { period: "MONTHLY", date: new Date() },
  orderBy: { totalRevenue: "desc" },
  take: 10
});
```

---

## 7. 📋 Database Migration

Yeni sistemin database'e uygulanması için:

```bash
# 1. Schema değişikliklerini kontrol et
npx prisma format

# 2. Migration oluştur
npx prisma migrate dev --name add_advanced_features

# 3. Seed data ekle (standardcategories, sample partnerships)
npx prisma db seed
```

---

## 8. 🎨 Frontend UI Önerileri

### Admin Dashboard:
1. **Category Management**:
   - Tree view ile kategori hiyerarşisi
   - Drag & drop ile sıralama
   - Çok dilli düzenleme formu

2. **Company Comparison**:
   - Multi-select ile firma seçimi
   - Chart.js ile performans grafikleri
   - Excel/PDF export butonu

3. **Partnership Management**:
   - Pending approvals listesi
   - Detaylı ortaklık görünümü
   - Kategori mapping arayüzü

### Company Dashboard:
1. **My Partnerships**:
   - Aktif ortaklıklar listesi
   - Performans kartları
   - Yeni ortaklık talebi formu

2. **Category Selection**:
   - Platform standartlarını görüntüle
   - Kendi kategorilerini özelleştir
   - Mapping önerileri

---

## 9. ✅ Yapılacaklar (Next Steps)

### Backend:
- [ ] GraphQL resolvers (StandardCategory, CompanyPartnership)
- [ ] Permission middleware (admin-only endpoints)
- [ ] Automatic metrics calculation (cron jobs)
- [ ] Category matching algorithm (AI-powered)

### Frontend:
- [ ] Admin category management UI
- [ ] Company comparison dashboard
- [ ] Partnership request/approval flow
- [ ] Category mapping interface

### Testing:
- [ ] Unit tests for new models
- [ ] Integration tests for partnerships
- [ ] Performance tests for metrics queries

---

## 🎉 Sonuç

Bu gelişmiş özellikler sayesinde platform:
- ✅ Sektör standardı kategori sistemi
- ✅ Firmalar arası güvenli iş birlikleri
- ✅ Admin tarafından detaylı analiz ve karşılaştırma
- ✅ Ölçeklenebilir ve genişletilebilir yapı

sağlamaktadır. 🚀
