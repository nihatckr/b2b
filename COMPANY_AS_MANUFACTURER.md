# 🏭 Üretici = Company/Marka Yaklaşımı

## 🎯 Doğru Konsept

### Gerçek Hayat

```
🏭 Şirket/Marka (Company)
   ├── 👥 Çalışanlar (Users with MANUFACTURE role)
   ├── 📦 Koleksiyonlar (Collections)
   ├── 🧪 Numuneler (Samples - şirket üretir)
   ├── 📋 Siparişler (Orders - şirkete gelir)
   └── 🏗️ Atölyeler (Workshops - şirkete ait)
```

**Örnekler**:

- Company: "Defacto Tekstil A.Ş."
  - User: Ali (MANUFACTURE role, company çalışanı)
  - User: Ayşe (MANUFACTURE role, company çalışanı)
  - Collections: "2025 Yaz Koleksiyonu", "Kış Serisi"
  - Workshops: "Dikim Atölyesi 1", "Paketleme Birimi"

## ✅ Mevcut Database Yapısı (DOĞRU)

```prisma
model Company {
  id        Int      @id
  name      String
  email     String   @unique

  // Relations ✅ DOĞRU
  users              User[]         # Şirket çalışanları
  collections        Collection[]   # Şirketin ürünleri
  samples            Sample[]       # Şirkete gelen numune talepleri
  orders             Order[]        # Şirkete gelen siparişler
  productionTracking ProductionTracking[]
  workshops          Workshop[]     # (Yeni eklenecek)
}

model User {
  role       Role         # ADMIN / MANUFACTURE / CUSTOMER
  company    Company?     # MANUFACTURE ise company'ye bağlı
  companyId  Int?
}

model Collection {
  author     User?        # Collection'ı oluşturan kişi
  company    Company?     # ✅ Collection'ın ait olduğu şirket
  companyId  Int?
}
```

## 🔧 Yapılması Gerekenler

### 1. Business Logic Kuralları

**MANUFACTURE User için**:

- ✅ Company'ye bağlı olmalı (companyId zorunlu)
- ✅ Sadece kendi company'sinin collections'larını görebilir
- ✅ Sadece kendi company'sine gelen samples/orders'ları görebilir

**Collection için**:

- ✅ Company'ye bağlı olmalı
- ✅ MANUFACTURE user kendi company'si için oluşturur

**Sample/Order için**:

- ✅ manufactureId → Aslında company çalışanı
- ✅ companyId → Asıl önemli olan bu!

### 2. UI Değişiklikleri

**Gösterim Öncelikleri**:

```typescript
// Eski ❌
"Üretici: Ali Yılmaz";

// Yeni ✅
"Şirket: Defacto Tekstil";
"İlgili Kişi: Ali Yılmaz";
```

**Collection Card**:

```typescript
// Öncelik: Company
collection.company?.name; // "Defacto Tekstil"
collection.author?.name; // "Ali Y." (secondary)
```

**Sample/Order Listesi**:

```typescript
// Müşteri için:
"Şirket: {sample.company.name}";
"İlgili Kişi: {sample.manufacture.name}";

// Üretici için:
"Müşteri: {sample.customer.name}";
```

### 3. Validation Kuralları

**MANUFACTURE User**:

```typescript
// Kayıt sırasında
if (role === "MANUFACTURE" && !companyId) {
  throw new Error("Manufacturer must be associated with a company");
}
```

**Collection Creation**:

```typescript
// MANUFACTURE user için
if (userRole === "MANUFACTURE") {
  // Company zorunlu
  if (!user.companyId) {
    throw new Error("Manufacturer must have a company");
  }
  // Sadece kendi company'si için
  companyId = user.companyId;
}
```

## 📝 İş Akışı (Doğru Yaklaşım)

### Müşteri Perspektifi

```
1. Katalogda koleksiyonları görür
   → "Defacto Tekstil - 2025 Yaz Koleksiyonu"

2. Numune talep eder
   → Talep "Defacto Tekstil" şirketine gider
   → Ali Yılmaz (Defacto çalışanı) işlemi yönetir

3. Sipariş verir
   → Sipariş "Defacto Tekstil"e gider
   → Şirket fiyat teklifi gönderir
```

### Üretici (Şirket Çalışanı) Perspektifi

```
Ali (MANUFACTURE, Defacto Tekstil çalışanı):

1. Dashboard açar
   → "Defacto Tekstil" için tüm talepleri görür
   → Şirket arkadaşlarının oluşturduklarını da görür

2. Numune taleplerini görür
   → Kendi şirketine gelen talepler
   → Herhangi bir çalışan işleme alabilir

3. Koleksiyon oluşturur
   → "Defacto Tekstil" adına
   → Otomatik company'sine bağlanır
```

## 🔄 Güncellenecek Kısımlar

### Backend (Mevcut Kod Zaten İyi!)

```typescript
// Sample/Order queries - ✅ ZATEN VAR
if (userRole === "MANUFACTURE") {
  where.OR = [
    { manufactureId: userId }, // Kendisinin işlemleri
    { companyId: user.companyId }, // Şirketin işlemleri ✅
  ];
}

// Collection mutations - ✅ ZATEN VAR
if (userRole === "MANUFACTURE") {
  if (!user.companyId) {
    throw new Error("Manufacturer must be associated with a company");
  }
  companyId = user.companyId; // Zorunlu ✅
}
```

### Frontend (Güncellenecek)

**1. Collection Cards**:

```typescript
// Company'yi öne çıkar
<div>
  <h3>{collection.name}</h3>
  <p className="text-sm font-semibold text-primary">
    {collection.company?.name}
  </p>
  <p className="text-xs text-gray-500">İlgili: {collection.author?.name}</p>
</div>
```

**2. Sample/Order Listesi**:

```typescript
// Müşteri görünümü
<td>
  <div>
    <p className="font-semibold">{sample.company?.name}</p>
    <p className="text-xs text-gray-500">{sample.manufacture?.name}</p>
  </div>
</td>

// Üretici görünümü
<td>
  <div>
    <p className="font-semibold">{sample.customer?.name}</p>
    <p className="text-xs text-gray-500">{sample.customer?.email}</p>
  </div>
</td>
```

**3. Dashboard Stats**:

```typescript
// Üretici dashboard'da
"Defacto Tekstil Dashboard";
"Şirketinize gelen 15 numune talebi";
"Toplam 8 aktif sipariş";
```

## ✅ İyi Haberler

Mevcut kod yapısı **zaten company-centric**!

Sadece şunları yapmamız gerekiyor:

1. ✅ UI'da company vurgusu
2. ✅ Signup'ta MANUFACTURE için company seçimi zorunlu
3. ✅ Dashboard'larda company adı önce

## 🚀 Önerilen Düzeltmeler

1. **Signup Form**: MANUFACTURE seçilince company dropdown zorunlu
2. **Collections Page**: Company adını öne çıkar
3. **Samples/Orders**: Company adını belirgin göster
4. **Dashboard**: Company-centric istatistikler

**Bu düzeltmeleri yapalım mı?** 🎯
