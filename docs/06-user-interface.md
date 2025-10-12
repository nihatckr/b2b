# Kullanıcı Arayüzü Rehberi

## 1. Genel Tasarım Prensipleri

### Basitlik ve Kullanım Kolaylığı
- **Minimal Interface**: Gereksiz öğeler olmadan
- **Açık Navigasyon**: 2-3 tık içinde her yere ulaşım
- **Responsive Design**: Mobil ve masaüstü uyumlu
- **Hızlı Yükleme**: 3 saniye altında sayfa yüklenmesi

### Renk Paleti
```css
Birincil: #2563eb (Mavi)
İkincil: #64748b (Gri) 
Başarı: #10b981 (Yeşil)
Uyarı: #f59e0b (Sarı)
Hata: #ef4444 (Kırmızı)
Arka Plan: #f8fafc (Açık Gri)
```

---

## 2. Layout Yapısı

### Ana Layout
```
┌─────────────────────────────────────┐
│           Header (Logo + Menu)      │
├─────────────────────────────────────┤
│ Sidebar │      Main Content         │
│         │                           │
│ - Menu  │  ┌─────────────────────┐  │
│ - Stats │  │                     │  │
│         │  │   Page Content      │  │
│         │  │                     │  │
│         │  └─────────────────────┘  │
├─────────┴───────────────────────────┤
│              Footer                 │
└─────────────────────────────────────┘
```

### Header Bileşenleri
- **Logo**: Sol üstte, ana sayfaya link
- **Ana Menü**: Rol bazlı menü öğeleri
- **Kullanıcı Menü**: Profil, ayarlar, çıkış
- **Bildirimler**: Badge ile sayı gösterimi

---

## 3. Üretici Interface

### Dashboard
```
┌─────────────────────────────────────┐
│  📊 Özet Kartları                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ 25 │ │ 12 │ │ 8  │ │ 95%│      │
│  │Ürün│ │PO  │ │Num │ │Kal │      │
│  └────┘ └────┘ └────┘ └────┘      │
├─────────────────────────────────────┤
│  📋 Son Aktiviteler                 │
│  • Numune talebi - ABC Mağaza      │
│  • PO onaylandı - XYZ Ltd          │
│  • Kalite testi tamamlandı         │
├─────────────────────────────────────┤
│  ⚠️ Dikkat Gereken Durumlar         │
│  • 2 numune cevap bekliyor (24h)    │
│  • 1 sipariş gecikme riski         │
└─────────────────────────────────────┘
```

### Ürün Yönetimi
- **Ürün Listesi**: Tablo formatında, arama ve filtreleme
- **Ürün Ekleme**: 4 adımlı sihirbaz (wizard)
- **Toplu İşlemler**: Çoklu seçim ve işlem
- **Hızlı Düzenleme**: Inline editing

### Ürün Kart Tasarımı
```
┌─────────────────────────┐
│  [    Ürün Görseli   ]  │
├─────────────────────────┤
│ THS-2024-001            │
│ Klasik Polo T-shirt     │
│ SS25 | Gömlek | Unisex  │
│                         │
│ MOQ: 100 | 15.50 USD    │
│ Termin: 15 gün          │
│                         │
│ [Düzenle] [Kopyala]     │
└─────────────────────────┘
```

---

## 4. Müşteri Interface

### Katalog Görünümü
```
Filter Bar:
[Kategori ▼] [Cinsiyet ▼] [Sezon ▼] [Fiyat Range] [🔍]

Ürün Grid:
┌────────┐ ┌────────┐ ┌────────┐
│[Resim] │ │[Resim] │ │[Resim] │
│Model   │ │Model   │ │Model   │
│Fiyat   │ │Fiyat   │ │Fiyat   │
│[PO]    │ │[PO]    │ │[PO]    │
│[Numune]│ │[Numune]│ │[Numune]│
└────────┘ └────────┘ └────────┘
```

### Ürün Detay Sayfası
```
┌─────────────────────────────────────┐
│ [Büyük Ürün Görseli]    │ Model:    │
│                         │ THS-2024  │
│ [Thumbnail Gallery]     │ Kategori: │
│                         │ Gömlek    │
│                         │           │
│                         │ Kumaş:    │
│                         │ %100 Cot. │
│                         │           │
│                         │ MOQ: 100  │
│                         │ Fiyat:$15 │
│                         │           │
│                         │ [Add PO]  │
│                         │ [Numune]  │
└─────────────────────────┴───────────┘
```

---

## 5. Form Tasarımları

### Numune Talep Formu
```
┌─────────────────────────────────────┐
│ 📋 Numune Talebi                    │
├─────────────────────────────────────┤
│ Ürün Bilgileri                      │
│ Model Kodu: [THS-2024-001    ]     │
│ Koleksiyon: [Bahar 2025      ]     │
│                                     │
│ Numune Detayları                    │  
│ Kumaş Renk: [Navy Blue ▼    ]     │
│ Beden:      [M ▼           ]      │
│                                     │
│ Teslimat                           │
│ Termin:     [7 gün          ]     │
│ Yöntem:     (●) Kargo (○) Showroom │
│                                     │
│ [📎 Dosya Ekle] [💬 Not Ekle]      │
│                                     │
│           [İptal] [Gönder]          │
└─────────────────────────────────────┘
```

### PO Oluşturma Formu
```
Adım 1/3: Ürün Seçimi
┌─────────────────────────────────────┐
│ Seçilen Ürünler:                    │
│ ✓ THS-2024-001 | Polo T-shirt      │
│   Miktar: [100] Renk: [White ▼]   │
│   Beden:  [S:10][M:40][L:40][XL:10]│
│                                     │
│ [+ Ürün Ekle]                      │
│                                     │
│ Toplam: 100 adet - 1,550 USD       │
│                                     │
│              [İleri →]              │
└─────────────────────────────────────┘
```

---

## 6. Durum Takip Interface

### Üretim Timeline
```
┌─────────────────────────────────────┐
│ 📦 PO-20241010120000               │
│ ABC Mağaza → XYZ Tekstil            │
├─────────────────────────────────────┤
│ ●══●══●══○──○──○──○ %60 Tamamlandı │
│ │  │  │                            │
│ ✓  ✓  🔄 Kesim (3/5 gün)           │
│ │  │                               │
│ ✓  Kumaş                          │
│ │                                  │
│ Planlama                           │
│                                     │
│ Son Güncelleme: 2 saat önce         │
│ Tahmini Teslim: 25 Ekim 2024       │
│                                     │
│ [📸 Fotoğraflar] [💬 Mesajlar]      │
└─────────────────────────────────────┘
```

### Kalite Kontrol Sonuçları
```
┌─────────────────────────────────────┐
│ ✅ Kalite Kontrol Raporu            │
├─────────────────────────────────────┤
│ Genel Sonuç: BAŞARILI (%2 hata)    │
│                                     │
│ Test Detayları:                     │
│ ✅ Kumaş Kalitesi     %0 hata      │
│ ✅ Ölçü Kontrolü      %1 hata      │
│ ✅ Renk Uyumu         %0 hata      │
│ ⚠️  Dikiş Kalitesi    %5 hata      │
│ ✅ Aksesuar Kontrolü  %0 hata      │
│ ✅ Genel Görünüm      %2 hata      │
│ ✅ Paketleme          %0 hata      │
│                                     │
│ Uzman: Ahmet Yılmaz                │
│ Tarih: 25 Ekim 2024                │
│                                     │
│ [📄 Detay Rapor] [📸 Fotoğraflar]  │
└─────────────────────────────────────┘
```

---

## 7. Responsive Design

### Mobil Görünüm (< 768px)
- **Hamburger Menü**: Sidebar'ı mobilde gizle
- **Kartlar**: Tek sütun halinde dikey dizilim  
- **Tablolar**: Yatay kaydırma veya kart görünümü
- **Formlar**: Tek sütun, büyük input alanları

### Tablet Görünüm (768px - 1024px)
- **2 Sütun Layout**: Ürün kartları için
- **Sidebar**: Daraltılmış mod
- **İkinci priorite bilgiler**: Gizlenebilir

---

## 8. Interaksiyon Tasarımı

### Loading States
```css
.loading-button {
    position: relative;
    opacity: 0.7;
    pointer-events: none;
}

.loading-button::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
```

### Toast Bildirimleri
- **Başarı**: Yeşil, checkmark icon, 3 saniye
- **Hata**: Kırmızı, X icon, 5 saniye
- **Uyarı**: Sarı, ! icon, 4 saniye
- **Bilgi**: Mavi, i icon, 3 saniye

### Modal Pencereler
- **Overlay**: Koyu arka plan (opacity: 0.5)
- **Merkez Yerleşim**: Viewport ortasında
- **Escape ile Kapatma**: ESC tuşu desteği
- **Maksimum Genişlik**: 90vw, max 600px

---

## 9. Erişilebilirlik

### Temel Gereksinimler
- **Keyboard Navigation**: Tab sırası mantıklı
- **Focus States**: Görsel focus göstergesi
- **Alt Text**: Tüm görseller için
- **ARIA Labels**: Form elementleri için
- **Color Contrast**: WCAG AA standardı (4.5:1)

### Screen Reader Desteği
```html
<button aria-label="Ürünü siparişe ekle" title="PO'ya ekle">
    <i class="icon-cart" aria-hidden="true"></i>
    Add to PO
</button>
```

---

## 10. Performans Optimizasyonu

### Lazy Loading
- **Görseller**: Viewport'a girince yükle
- **Tablolar**: Sanal kaydırma (virtual scrolling)
- **Modüller**: Route bazlı kod bölme

### Önbellekleme
- **API Responses**: 5 dakika cache
- **Görseller**: Browser cache headers
- **Static Assets**: CDN kullanımı

Bu UI rehberi, sistemin kullanıcı dostu, erişilebilir ve performanslı olmasını sağlayacak temel prensipleri içerir.