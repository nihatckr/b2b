# 🏭 ÜRETİCİ DASHBOARD PLANI

**Tarih:** 13 Ekim 2025, 25:10  
**Durum:** Sidebar Updated ✅ - Pages TODO

---

## ✅ Sidebar Yapısı (Güncellendi)

### Main Navigation

```
📊 Dashboard              /dashboard
🏢 Company Settings       /dashboard/company
👥 Employee Management    /dashboard/employees
📁 Categories             /dashboard/categories
📦 Collections            /dashboard/collections
🎨 Samples                /dashboard/samples
📋 Orders                 /dashboard/orders
```

### Library Management

```
📚 Library
   ├─ 🎨 Color Management     /dashboard/library/colors
   ├─ 🧵 Fabric Management    /dashboard/library/fabrics
   └─ 📏 Size Management      /dashboard/library/sizes
```

### Production

```
🏭 Production
   ├─ 📅 Production Schedule   /dashboard/production/schedule
   ├─ ⚙️  Active Production    /dashboard/production/active
   └─ ✅ Quality Control       /dashboard/quality
```

---

## 📋 Sayfa Gereksinimleri

### 1. Company Settings ✅ (Mevcut)

```
Path: /dashboard/company
Features:
- Company bilgileri görüntüle/düzenle
- Logo, adres, telefon, website
- Company type (manufacturer/buyer)
```

### 2. Employee Management ⏳

```
Path: /dashboard/employees
Features:
- Çalışan listesi
- Yeni çalışan davet et
- Rol/permission düzenle
- Department, Job Title
- Aktif/pasif durumu
```

### 3. Category Management ✅ (Mevcut)

```
Path: /dashboard/categories
Features:
- Kategori ağacı (Erkek Giyim > Tişört)
- CRUD operations
- Sub-category support
```

### 4. Collection Management ✅ (Mevcut - Geliştirilecek)

```
Path: /dashboard/collections
Features:
✅ Collection liste
✅ CRUD operations
⏳ 4-step form (modelCode, season, etc.)
⏳ Library integration (color/fabric/size picker)
⏳ Production schedule input
```

### 5. Sample Management ✅ (Mevcut)

```
Path: /dashboard/samples
Features:
- Sample requests (gelen talepler)
- Sample production tracking
- Status updates
- Revision requests
```

### 6. Orders ✅ (Mevcut)

```
Path: /dashboard/orders
Features:
- Order list
- Quote gönderme
- Production başlatma
- Tracking
```

### 7. Color Management ⏳ (YENİ)

```
Path: /dashboard/library/colors
Features:
- Renk paleti listesi
- CRUD operations
- Pantone kod girişi
- HEX code picker
- Renk örneği görseli
```

### 8. Fabric Management ⏳ (YENİ)

```
Path: /dashboard/library/fabrics
Features:
- Kumaş kütüphanesi listesi
- CRUD operations
- Kompozisyon, ağırlık, en
- Tedarikçi bilgileri
- Fiyat, lead time
```

### 9. Size Management ⏳ (YENİ)

```
Path: /dashboard/library/sizes
Features:
- Beden grubu listesi
- CRUD operations
- Kategori bazlı (erkek/kadın/çocuk)
- Beden array editörü
```

### 10. Production Schedule ⏳ (YENİ)

```
Path: /dashboard/production/schedule
Features:
- Tüm collection'ların production schedule'ı
- Calendar view
- Timeline görünümü
- Kapasite planlaması
```

---

## 🎯 Öncelik Sırası

### PHASE 1: Library Pages (Kritik)

```
1. /dashboard/library/colors     [YENİ]
2. /dashboard/library/fabrics    [YENİ]
3. /dashboard/library/sizes      [YENİ]

Bunlar olmadan collection oluşturulamaz!
```

### PHASE 2: Collection Form Upgrade

```
4. /dashboard/collections        [UPGRADE]
   - 4-step wizard
   - Library pickers
   - File uploads
```

### PHASE 3: Employee Management

```
5. /dashboard/employees          [YENİ]
   - User list
   - Invite system
   - Permission management
```

### PHASE 4: Production Features

```
6. /dashboard/production/schedule  [YENİ]
7. /dashboard/production/active    [YENİ]
```

---

## 📊 Sayfa Durumu

### Mevcut Sayfalar ✅

```
✅ /dashboard                    (Dashboard)
✅ /dashboard/company            (Company settings)
✅ /dashboard/categories         (CRUD)
✅ /dashboard/collections        (Basit CRUD)
✅ /dashboard/samples            (Management)
✅ /dashboard/orders             (Management)
✅ /dashboard/quality            (Quality control)
```

### Eksik Sayfalar ⏳

```
⏳ /dashboard/employees          (User management)
⏳ /dashboard/library/colors     (Color CRUD)
⏳ /dashboard/library/fabrics    (Fabric CRUD)
⏳ /dashboard/library/sizes      (Size CRUD)
⏳ /dashboard/production/schedule (Schedule view)
⏳ /dashboard/production/active   (Active production)
```

### Upgrade Gerekli 🔄

```
🔄 /dashboard/collections
   - Basit → 4-step wizard
   - Library integration
```

---

## 🚀 İlk Adım: Library Pages

### Color Management Page

```tsx
/dashboard/library/colors

UI:
┌─────────────────────────────────────┐
│ 🎨 Renk Yönetimi        [+ Yeni]   │
├─────────────────────────────────────┤
│ Search: [____________]  Filter: [▼]│
├─────────────────────────────────────┤
│ ┌─────┬──────────┬─────────┬──────┐│
│ │ 🟦  │ Beyaz    │ PANTONE │ [✏️] ││
│ │     │          │ 11-0601 │      ││
│ ├─────┼──────────┼─────────┼──────┤│
│ │ ⬛  │ Siyah    │ PANTONE │ [✏️] ││
│ │     │          │ 19-0303 │      ││
│ └─────┴──────────┴─────────┴──────┘│
└─────────────────────────────────────┘
```

### Fabric Management Page

```tsx
/dashboard/library/fabrics

UI:
┌─────────────────────────────────────┐
│ 🧵 Kumaş Yönetimi       [+ Yeni]   │
├─────────────────────────────────────┤
│ ┌──────────────────────────────────┐│
│ │ Premium Cotton (FAB-001)         ││
│ │ %100 Pamuk • 180 gr/m2 • 180 cm  ││
│ │ Tedarikçi: Bossa Tekstil         ││
│ │ Fiyat: $5.50/m • Lead: 15 gün    ││
│ │ [Detay] [Düzenle]                ││
│ ├──────────────────────────────────┤│
│ │ Stretch Denim (FAB-002)          ││
│ │ 98% Cotton 2% Elastan • 320 gr/m2││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Size Management Page

```tsx
/dashboard/library/sizes

UI:
┌─────────────────────────────────────┐
│ 📏 Beden Yönetimi       [+ Yeni]   │
├─────────────────────────────────────┤
│ Erkek:                              │
│ ┌──────────────────────────────────┐│
│ │ Erkek Standart                   ││
│ │ [XS] [S] [M] [L] [XL] [XXL]      ││
│ │ [Düzenle]                        ││
│ └──────────────────────────────────┘│
│                                     │
│ Kadın:                              │
│ ┌──────────────────────────────────┐│
│ │ Kadın Plus Size                  ││
│ │ [L] [XL] [XXL] [3XL]             ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 💡 Kullanım Akışı

### Üretici İlk Kullanım

```
1. Login → Dashboard
2. Sidebar → Library Management
3. Color Management → 8 renk ekle
4. Fabric Management → 5 kumaş ekle
5. Size Management → 6 beden grubu ekle
6. ✅ Kütüphane hazır!
7. Collections → Yeni koleksiyon ekle
   └─ Kütüphaneden seç! (hızlı)
```

---

## 📊 Durum

```
Sidebar:           ✅ UPDATED
Backend API:       ✅ READY
GraphQL Types:     ✅ READY
Seed Data:         ✅ READY

Pages (Mevcut):    7/13
Pages (Eksik):     6/13

NEXT STEP: Library pages oluştur
```

---

**Sonraki Adım:** Library management sayfalarını oluştur (colors, fabrics, sizes)

_Plan Complete: 13 Ekim 2025, 25:10_
