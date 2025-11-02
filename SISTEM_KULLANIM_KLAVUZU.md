# ProtexFlow B2B Tekstil Platformu - Kapsamlı Kullanım Kılavuzu

## 📚 İçindekiler

1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Kullanıcı Rolleri ve Sorumluluklar](#kullanıcı-rolleri-ve-sorumluluklar)
3. [İş Akışı 1: Katalog Üzerinden Sipariş](#iş-akışı-1-katalog-üzerinden-sipariş)
4. [İş Akışı 2: Numune ile Sipariş](#iş-akışı-2-numune-ile-sipariş)
5. [İş Akışı 3: RFQ (Teklif Toplama) Sistemi](#iş-akışı-3-rfq-teklif-toplama-sistemi)
6. [Admin Paneli İşlemleri](#admin-paneli-i̇şlemleri)
7. [Bildirim Sistemi](#bildirim-sistemi)
8. [Önemli İpuçları](#önemli-i̇puçları)
9. [Özet Akış Şemaları](#özet-akış-şemaları)
10. [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## Sistem Genel Bakış

### ProtexFlow Nedir?

ProtexFlow, **tekstil üreticileri** ve **alıcı firmalar** (moda markaları, perakende zincirleri) arasında dijital bir köprü kuran B2B platformudur.

**Ana Amaç:**

- Sipariş süreçlerini hızlandırmak
- Üretim takibini şeffaflaştırmak
- İletişim maliyetlerini azaltmak
- Kalite kontrolünü dijitalleştirmek

**Temel Özellikler:**

- 📦 **Katalog Sistemi**: Hazır ürün koleksiyonları
- 🧵 **Numune Yönetimi**: Özel tasarım onayları
- 💬 **RFQ Sistemi**: Toplu teklif toplama
- 📊 **Üretim Takibi**: Gerçek zamanlı durum güncellemeleri
- 📸 **Fotoğraf Paylaşımı**: Üretim sürecinde görsel doğrulama
- 🔔 **Bildirim Sistemi**: Anlık durum değişikliği bildirimleri
- 💳 **Ödeme Takibi**: Proforma, avans, bakiye ödemeleri

---

## Kullanıcı Rolleri ve Sorumluluklar

### 1. 👔 ADMIN (Sistem Yöneticisi)

**Yetkiler:**

- Tüm şirketleri yönetme
- Tüm kullanıcıları yönetme
- Abonelik planlarını ayarlama
- Sistem genelinde raporlar görme
- Platform ayarlarını yapılandırma

**Tipik Kullanım:**

- Yeni şirket kaydı onaylama
- Abonelik limitlerini güncelleme
- Sistem sağlığını izleme
- Sorun giderme (bug fixes, data cleanup)

---

### 2. 🏭 MANUFACTURER (Üretici Firma)

#### 2A. Company Owner (Firma Sahibi)

**Yetkiler:**

- Firma profilini düzenleme
- Çalışanları yönetme (ekleme/çıkarma)
- Ürün koleksiyonları oluşturma
- Tüm siparişleri görme
- Finansal raporlar
- Abonelik yönetimi

**Tipik Kullanım:**

- Şirket katalogunu oluşturma
- Yeni çalışan ekleme
- Aylık gelir raporlarını inceleme
- Müşteri ilişkilerini yönetme

#### 2B. Company Employee (Üretim Çalışanı)

**Yetkiler:**

- Kendisine atanan siparişleri görme
- Üretim durumu güncelleme
- Üretim fotoğrafları yükleme
- Numune onaylarını takip etme
- Mesajlaşma

**Departmanlar:**

- **PURCHASING**: Hammadde temini
- **PRODUCTION**: Üretim yönetimi
- **QUALITY**: Kalite kontrol
- **DESIGN**: Tasarım ekibi
- **SALES**: Satış/İletişim
- **MANAGEMENT**: Yönetim

**Tipik Kullanım:**

- Günlük üretim durumu güncelleme
- Kumaş kesim fotoğrafları yükleme
- Numune revizyon talepleri
- Teslimat tarihlerini bildirme

---

### 3. 🛍️ BUYER (Alıcı Firma/Müşteri)

#### 3A. Company Owner (Marka Sahibi)

**Yetkiler:**

- Şirket profilini düzenleme
- Satın alma ekibi yönetme
- Tedarikçi değerlendirme
- Bütçe raporları
- Tüm siparişleri görme

**Tipik Kullanım:**

- Yeni tedarikçi bulma
- Sipariş bütçelerini onaylama
- Tedarikçi performans raporları
- Sezon koleksiyonlarını planlama

#### 3B. Company Employee (Satın Alma Uzmanı)

**Yetkiler:**

- Katalogları gezme
- Sipariş oluşturma
- Numune talep etme
- RFQ başlatma
- Tedarikçi ile mesajlaşma
- Revizyon talep etme

**Tipik Kullanım:**

- Üretici kataloglarını inceleme
- Fiyat teklifi alma
- Numune onaylama
- Sipariş takibi
- Teslimat koordinasyonu

---

## İş Akışı 1: Katalog Üzerinden Sipariş

> **Senaryo:** Alıcı firma, üreticinin hazır koleksiyonundan sipariş vermek istiyor.

### 🔹 Adım 1: Üretici Koleksiyon Oluşturur

**Kim:** Manufacturer Company Owner  
**Nerede:** `Dashboard → Koleksiyonlar → Yeni Koleksiyon`

**Form Alanları:**

```
- Koleksiyon Adı: "2025 Yaz Koleksiyonu"
- Açıklama: "Pamuklu tişört ve şort koleksiyonu"
- Sezon: SPRING_SUMMER
- Yıl: 2025
- Durum: PUBLISHED (yayınla)
- Etiketler: ["pamuk", "casual", "sürdürülebilir"]
- Görsel: Koleksiyon kapak fotoğrafı
```

**Sistem Akışı:**

1. Koleksiyon kaydedilir (CollectionStatus: DRAFT)
2. Ürünler eklenir (CollectionItem)
3. Fiyatlar belirlenir
4. Durum PUBLISHED yapılır
5. Alıcılar koleksiyonu görmeye başlar

---

### 🔹 Adım 2: Alıcı Koleksiyonu Keşfeder

**Kim:** Buyer (Company Employee - Satın Alma)  
**Nerede:** `Ana Sayfa → Koleksiyonları Gözat`

**Filtreler:**

- Kategori: "Tişört"
- Sezon: "Yaz"
- Fiyat Aralığı: 15-30 USD
- Üretici Lokasyonu: "İzmir, Türkiye"

**Görüntülenenler:**

- Ürün fotoğrafları
- Birim fiyatlar
- Minimum sipariş miktarı (MOQ)
- Üretim süresi
- Kumaş bilgileri
- Beden tablosu

---

### 🔹 Adım 3: Alıcı Sepete Ekler

**Kim:** Buyer  
**Aksiyon:** "Sepete Ekle" butonu

**Seçenekler:**

```
Ürün: "Pamuklu Basic Tişört - Lacivert"
Beden: S, M, L, XL
S: 200 adet
M: 500 adet
L: 400 adet
XL: 100 adet
Toplam: 1200 adet

Birim Fiyat: 18 USD
Ara Toplam: 21,600 USD
```

---

### 🔹 Adım 4: Sipariş Oluştur

**Kim:** Buyer  
**Nerede:** `Sepet → Siparişi Tamamla`

**Form Alanları:**

```
Teslimat Adresi: "İstanbul Deposu, Ümraniye"
Teslimat Tarihi: "2025-05-15"
Ödeme Tipi: PARTIAL (kısmi ödeme)
Avans Oranı: 30% (6,480 USD)
Bakiye: 70% (15,120 USD)
Özel Notlar: "Etiketler eklensin"
Öncelik: HIGH
```

**Sistem Akışı:**

1. Sipariş kaydedilir (OrderStatus: PENDING)
2. Üreticiye bildirim gönderilir
3. Alıcıya onay e-postası
4. Sipariş numarası oluşturulur: #ORD-2025-00123

---

### 🔹 Adım 5: Üretici Siparişi İnceler

**Kim:** Manufacturer Company Owner  
**Nerede:** `Dashboard → Siparişler → Bekleyen Siparişler`

**Görüntülenen Bilgiler:**

- Sipariş detayları (ürün, miktar, beden)
- Alıcı firma bilgileri
- Teslimat tarihi
- Fiyat bilgileri
- Özel talepler

**Aksiyon Seçenekleri:**

```
1. ONAYLA → Siparişi üretim sürecine al
2. REDDET → İptal et (stok yok, kapasite dolu vb.)
3. REVİZYON TALEP ET → Değişiklik öner (fiyat, tarih, miktar)
```

---

### 🔹 Adım 6: Sipariş Onayı

**Kim:** Manufacturer  
**Aksiyon:** "Siparişi Onayla" butonu

**Sistem Akışı:**

1. OrderStatus: PENDING → CONFIRMED
2. Alıcıya bildirim: "Siparişiniz onaylandı"
3. Proforma fatura oluşturulur
4. Üretim ekibine görev atanır

---

### 🔹 Adım 7: Ödeme İşlemi

**Kim:** Buyer (Finance Department)  
**Nerede:** `Siparişler → #ORD-2025-00123 → Ödemeler`

**Avans Ödemesi:**

```
Tutar: 6,480 USD
Ödeme Tipi: PROFORMA
Ödeme Yöntemi: BANK_TRANSFER
Banka Dekontu: [PDF yükle]
```

**Sistem Akışı:**

1. Payment kaydı oluşturulur (PaymentStatus: PENDING)
2. Üreticiye bildirim gönderilir
3. Üretici ödemeyi onaylar (PaymentStatus: PAID)
4. OrderStatus: CONFIRMED → IN_PRODUCTION

---

### 🔹 Adım 8: Üretim Başlar

**Kim:** Manufacturer Employee (Production Department)  
**Nerede:** `Üretim → Aktif Siparişler → #ORD-2025-00123`

**Üretim Aşamaları:**

#### 8.1 Kumaş Hazırlık

```
Durum: FABRIC_PREPARATION
Tarih: 2025-04-10
Fotoğraf: [Kumaş ruloları]
Not: "Pamuk kumaş depoya geldi"
```

#### 8.2 Kesim

```
Durum: CUTTING
Tarih: 2025-04-12
Fotoğraf: [Kesim masası]
Not: "S, M, L bedenleri kesildi"
```

#### 8.3 Dikim

```
Durum: SEWING
Tarih: 2025-04-15
Fotoğraf: [Dikim hattı]
Not: "Günlük 200 adet üretim"
```

#### 8.4 Kalite Kontrol

```
Durum: QUALITY_CONTROL
Tarih: 2025-04-20
Fotoğraf: [Kontrol masası]
Not: "Fire oranı %2 (24 adet)"
```

#### 8.5 Paketleme

```
Durum: PACKAGING
Tarih: 2025-04-22
Fotoğraf: [Paketlenmiş kartonlar]
Not: "24 koli hazır"
```

**Her Aşamada:**

- Durum güncellenir (ProductionTracking)
- Fotoğraf yüklenir (ProductionPhoto)
- Alıcıya otomatik bildirim gönderilir
- Dashboard'da ilerleme çubuğu güncellenir

---

### 🔹 Adım 9: Alıcı Üretimi İzler

**Kim:** Buyer  
**Nerede:** `Siparişlerim → #ORD-2025-00123 → Üretim Takibi`

**Görüntülenen Bilgiler:**

```
Sipariş İlerlemesi: %80 tamamlandı

[=============================>    ] 80%

Aşamalar:
✅ Kumaş Hazırlık (10.04.2025)
✅ Kesim (12.04.2025)
✅ Dikim (15.04.2025)
✅ Kalite Kontrol (20.04.2025)
🔄 Paketleme (devam ediyor)
⏳ Sevkiyat (bekleniyor)

Son Güncelleme: 2 saat önce
Tahmini Teslimat: 5 gün içinde
```

**Alıcı Yapabilir:**

- Üretim fotoğraflarını görüntüleme
- Üretici ile mesajlaşma
- Teslimat tarihini sorgulama
- Revizyon talep etme (acil durumlar için)

---

### 🔹 Adım 10: Teslimat

**Kim:** Manufacturer (Logistics)  
**Nerede:** `Siparişler → #ORD-2025-00123 → Teslimat`

**Form:**

```
Durum: READY_TO_SHIP → SHIPPED
Kargo Firması: "DHL Express"
Takip Numarası: "1234567890"
Sevk Tarihi: 2025-04-25
Tahmini Varış: 2025-04-28
```

**Sistem Akışı:**

1. OrderStatus: IN_PRODUCTION → SHIPPED
2. Alıcıya SMS + E-posta: "Siparişiniz yola çıktı"
3. Kargo takip linki gönderilir
4. Bakiye ödemesi hatırlatması

---

### 🔹 Adım 11: Bakiye Ödeme

**Kim:** Buyer  
**Nerede:** `Ödemeler → Bakiye Ödemesi`

**Form:**

```
Tutar: 15,120 USD
Ödeme Tipi: BALANCE
Ödeme Yöntemi: BANK_TRANSFER
Ödeme Tarihi: 2025-04-27
```

---

### 🔹 Adım 12: Teslimat Onayı

**Kim:** Buyer  
**Nerede:** `Siparişler → #ORD-2025-00123`

**Aksiyon:** "Teslimatı Onayla" butonu

**Sistem Akışı:**

1. OrderStatus: SHIPPED → DELIVERED
2. Üreticiye bildirim: "Teslimat onaylandı"
3. Payment kaydı güncellenir (BALANCE → PAID)
4. Sipariş tamamlanır (CompletedAt: 2025-04-28)

---

### 🔹 Adım 13: Değerlendirme (Opsiyonel)

**Kim:** Buyer  
**Nerede:** `Siparişler → Tamamlanan → #ORD-2025-00123`

**Form:**

```
Puan: 5/5 ⭐⭐⭐⭐⭐
Kalite: Mükemmel
Teslimat: Zamanında
İletişim: Hızlı ve net
Yorum: "Çok memnun kaldık, tekrar sipariş vereceğiz"
```

**Etki:**

- Üreticinin profil puanı güner
- Diğer alıcılar değerlendirmeleri görür
- Üretici itibar kazanır

---

### 🔹 Adım 14: Tekrar Sipariş (Re-order)

**Kim:** Buyer  
**Nerede:** `Siparişler → #ORD-2025-00123 → Tekrar Sipariş Ver`

**Avantajlar:**

- Önceki sipariş bilgileri otomatik doldurulur
- Hızlı sipariş oluşturma (1 tık)
- Geçmiş fiyat korunur
- Üretici tanıdık olduğu için hızlı onay

---

### 🔹 Adım 15: Raporlar ve Analizler

**Kim:** Both (Manufacturer Owner / Buyer Owner)  
**Nerede:** `Dashboard → Raporlar`

**Üretici Raporları:**

- Aylık gelir grafiği
- En çok satan ürünler
- Müşteri bazlı sipariş analizi
- Üretim verimliliği (ortalama tamamlanma süresi)
- Tedarikçi performansı

**Alıcı Raporları:**

- Aylık harcama grafiği
- Tedarikçi karşılaştırma
- Sipariş geçmişi
- Bütçe takibi
- Teslimat performansı (zamanında teslimat oranı)

---

## İş Akışı 2: Numune ile Sipariş

> **Senaryo:** Alıcı kendi tasarımını gönderiyor, üretici numune üretiyor, onay sonrası toplu üretim başlıyor.

### 🔹 Adım 1: Alıcı Numune Talebi Oluşturur

**Kim:** Buyer  
**Nerede:** `Numuneler → Yeni Numune Talebi`

**Form:**

```
Başlık: "Organik Pamuk Oversize Tişört"
Açıklama: "Yaka detayı özel, oversize kesim"
Kumaş: COTTON (Organik sertifikalı)
Beden: M (referans)
Miktar: 1 adet numune
Bütçe: 50 USD
Teknik Çizim: [PDF yükle]
Referans Fotoğraf: [JPG yükle]
Özel Notlar: "Yaka dikişi düz olmalı"
```

**Sistem Akışı:**

1. Sample kaydı oluşturulur (SampleStatus: PENDING)
2. Üreticiye bildirim gönderilir
3. Numune numarası: #SAMPLE-2025-00045

---

### 🔹 Adım 2: Üretici Numune Onayı

**Kim:** Manufacturer (Design Department)  
**Nerede:** `Numuneler → Bekleyen Talepler`

**Aksiyon Seçenekleri:**

```
1. ONAYLA → Numuneyi üretmeye başla
2. REDDET → "Stok yok" veya "Üretemiyoruz"
3. REVİZYON TALEP ET → "Yaka detayı için daha net çizim gerekli"
```

**Onay Sonrası:**

- SampleStatus: PENDING → APPROVED
- Alıcıya bildirim
- Tahmini teslim tarihi: 7 gün

---

### 🔹 Adım 3: Numune Üretimi

**Kim:** Manufacturer (Production)  
**Nerede:** `Numuneler → #SAMPLE-2025-00045`

**Durum Güncellemeleri:**

```
1. IN_PRODUCTION (Üretimde)
   - Tarih: 2025-04-05
   - Fotoğraf: [Kumaş kesim]

2. COMPLETED (Tamamlandı)
   - Tarih: 2025-04-08
   - Fotoğraf: [Bitmiş numune - ön/arka]
   - Not: "Yaka detayı talebe uygun yapıldı"
```

**Sistem Akışı:**

1. SampleStatus: APPROVED → IN_PRODUCTION → COMPLETED
2. Her adımda alıcıya bildirim
3. Fotoğraflar alıcının panelinde görünür

---

### 🔹 Adım 4: Alıcı Numuneyi İnceler

**Kim:** Buyer  
**Nerede:** `Numuneler → #SAMPLE-2025-00045`

**Görüntülenenler:**

- Numune fotoğrafları (ön, arka, detay)
- Üretim notları
- Kumaş bilgileri
- Beden ölçüleri

**Aksiyon Seçenekleri:**

```
1. ONAYLA → Toplu üretim için sipariş ver
2. REVİZYON TALEP ET → Değişiklik iste
   - Örnek: "Yaka 2cm daha geniş olmalı"
3. REDDET → İptal et
```

---

### 🔹 Adım 5: Revizyon Süreci (Opsiyonel)

**Kim:** Buyer  
**Aksiyon:** "Revizyon Talep Et"

**Form:**

```
Revizyon Nedeni: "Yaka genişliği"
Açıklama: "Yaka 2cm daha geniş olmalı, kumaş kalınlığı ideal"
Referans: [Yeni çizim yükle]
```

**Sistem Akışı:**

1. SampleStatus: COMPLETED → REVISION_REQUESTED
2. Üreticiye bildirim
3. Üretici yeni numune yapar
4. SampleStatus: REVISION_REQUESTED → IN_PRODUCTION → COMPLETED
5. Alıcı tekrar inceler

**Revizyon Limiti:** Genelde 2-3 revizyon hakkı

---

### 🔹 Adım 6: Numune Onayı ve Toplu Sipariş

**Kim:** Buyer  
**Aksiyon:** "Numuneyi Onayla ve Sipariş Ver"

**Form:**

```
SampleStatus: COMPLETED → APPROVED_FOR_PRODUCTION

Sipariş Detayları:
- Ürün: "Organik Pamuk Oversize Tişört"
- Bedenler:
  S: 300 adet
  M: 500 adet
  L: 400 adet
  XL: 200 adet
- Toplam: 1400 adet
- Birim Fiyat: 22 USD
- Toplam Tutar: 30,800 USD
- Teslimat: 2025-06-15
```

**Sistem Akışı:**

1. Order kaydı oluşturulur (LinkedSampleId: #SAMPLE-2025-00045)
2. Sipariş numune ile ilişkilendirilir
3. İş Akışı 1'in Adım 5'ten itibaren devam eder

---

## İş Akışı 3: RFQ (Teklif Toplama) Sistemi

> **Senaryo:** Alıcı birden fazla üreticiden fiyat teklifi toplamak istiyor.

### 🔹 Adım 1: Alıcı RFQ Oluşturur

**Kim:** Buyer  
**Nerede:** `RFQ → Yeni Teklif Talebi`

**Form:**

```
Başlık: "1000 Adet Basic T-Shirt Teklifi"
Açıklama: "Pamuklu, baskısız, 4 beden"
Kategori: CLOTHING
Miktar: 1000 adet
Bütçe: 15,000 - 20,000 USD
Son Teklif Tarihi: 2025-04-20
Teknik Şartname: [PDF yükle]
Referans Fotoğraf: [JPG yükle]

Hedef Üreticiler: (3 firma seç)
- ABC Tekstil (İzmir)
- XYZ Örme (Denizli)
- DEF Konfeksiyon (İstanbul)
```

**Sistem Akışı:**

1. RFQ kaydı oluşturulur (RFQStatus: OPEN)
2. 3 üreticiye bildirim gönderilir
3. RFQ numarası: #RFQ-2025-00012

---

### 🔹 Adım 2: Üreticiler Teklif Verir

**Kim:** Manufacturers (3 firma)  
**Nerede:** `RFQ → Gelen Talepler → #RFQ-2025-00012`

**ABC Tekstil Teklifi:**

```
Teklif Fiyatı: 17,500 USD (17.50 USD/adet)
Teslimat Süresi: 30 gün
Ödeme Şartları: 30% avans, 70% teslimat öncesi
Minimum Sipariş: 1000 adet (uygun)
Kumaş: %100 Pamuk
Sertifikalar: OEKO-TEX, GOTS
Not: "Aynı gün kargo ile numune gönderebiliriz"
```

**XYZ Örme Teklifi:**

```
Teklif Fiyatı: 16,800 USD (16.80 USD/adet)
Teslimat Süresi: 25 gün
Ödeme Şartları: 50% avans, 50% teslimat öncesi
Minimum Sipariş: 1000 adet
Kumaş: %95 Pamuk, %5 Elastan
Sertifikalar: OEKO-TEX
Not: "Hızlı üretim garantisi, gecikme halinde %10 indirim"
```

**DEF Konfeksiyon Teklifi:**

```
Teklif Fiyatı: 18,200 USD (18.20 USD/adet)
Teslimat Süresi: 35 gün
Ödeme Şartları: 20% avans, 80% teslimat öncesi
Minimum Sipariş: 1000 adet
Kumaş: %100 Organik Pamuk
Sertifikalar: OEKO-TEX, GOTS, Fair Trade
Not: "Sürdürülebilir üretim, karbon nötr"
```

**Sistem Akışı:**

1. Her teklif Quote kaydı olarak oluşturulur
2. Alıcıya bildirim: "3 teklif alındı"
3. QuoteStatus: PENDING (bekliyor)

---

### 🔹 Adım 3: Alıcı Teklifleri Karşılaştırır

**Kim:** Buyer  
**Nerede:** `RFQ → #RFQ-2025-00012 → Teklifler`

**Karşılaştırma Tablosu:**

```
| Üretici        | Fiyat     | Teslimat | Avans | Sertifika      | Puan |
|----------------|-----------|----------|-------|----------------|------|
| ABC Tekstil    | 17,500 USD| 30 gün   | 30%   | OEKO, GOTS     | 4.5⭐|
| XYZ Örme       | 16,800 USD| 25 gün   | 50%   | OEKO           | 4.7⭐|
| DEF Konfeksiyon| 18,200 USD| 35 gün   | 20%   | OEKO, GOTS, FT | 4.8⭐|
```

**Değerlendirme Kriterleri:**

- **Fiyat**: En düşük → XYZ Örme
- **Hız**: En hızlı → XYZ Örme (25 gün)
- **Kalite**: En çok sertifika → DEF Konfeksiyon
- **Ödeme**: En düşük avans → DEF (%20)
- **Güvenilirlik**: En yüksek puan → DEF (4.8⭐)

---

### 🔹 Adım 4: Teklif Seçimi

**Kim:** Buyer  
**Aksiyon:** "XYZ Örme" seçildi (fiyat/hız dengesi)

**Sistem Akışı:**

1. XYZ'nin teklifi → QuoteStatus: ACCEPTED
2. Diğer teklifler → QuoteStatus: REJECTED
3. RFQStatus: OPEN → CLOSED
4. XYZ'ye bildirim: "Teklifiniz kabul edildi"
5. Diğer firmalara: "Teklif reddedildi (teşekkürler)"

---

### 🔹 Adım 5: Siparişe Dönüştürme

**Kim:** Buyer  
**Aksiyon:** "Siparişe Dönüştür" butonu

**Otomatik Form Doldurma:**

```
Üretici: XYZ Örme
Ürün: Basic T-Shirt
Miktar: 1000 adet
Fiyat: 16,800 USD
Teslimat Süresi: 25 gün
Ödeme: 50% avans (8,400 USD)
```

**Sistem Akışı:**

1. Order kaydı oluşturulur (LinkedRFQId: #RFQ-2025-00012)
2. İş Akışı 1'in Adım 6'dan itibaren devam eder

---

### 🔹 Adım 6: Gelecek RFQ'lar için Tercih

**Kim:** Buyer  
**Nerede:** `Ayarlar → Tercih Edilen Tedarikçiler`

**Sistem Öğrenir:**

- XYZ Örme ile iyi deneyim → "Tercih Listesi"ne eklenir
- Gelecek RFQ'larda otomatik önerilir
- Direkt sipariş verme seçeneği
- Özel indirimler (sadakat programı)

---

## Admin Paneli İşlemleri

### 1. 🏢 Şirket Yönetimi

**Nerede:** `Admin → Şirketler`

**Yapılabilenler:**

- Yeni şirket kaydı (manuel onay)
- Şirket durumu değiştirme (ACTIVE, SUSPENDED, INACTIVE)
- Şirket tipini güncelleme (MANUFACTURER, BUYER)
- Abonelik planı atama
- Şirket bilgilerini düzenleme
- Şirket kullanıcılarını görme

**Örnek Senaryo:**

```
Durum: Yeni bir tekstil firması kayıt oldu
Admin Aksiyonu:
1. Firma belgelerini incele (vergi levhası, ticaret sicil)
2. PENDING → ACTIVE yap
3. Abonelik: BASIC_PLAN ata (50 sipariş/ay limiti)
4. E-posta gönder: "Hesabınız onaylandı"
```

---

### 2. 👤 Kullanıcı Yönetimi

**Nerede:** `Admin → Kullanıcılar`

**Yapılabilenler:**

- Kullanıcı arama (ad, e-posta, rol)
- Kullanıcı rolü değiştirme
- Hesap dondurma (ban)
- Şifre sıfırlama
- Kullanıcı aktivitelerini görme (son giriş, sipariş sayısı)

**Örnek Senaryo:**

```
Durum: Bir kullanıcı şifresini unuttu
Admin Aksiyonu:
1. Kullanıcıyı ara (e-posta ile)
2. "Şifre Sıfırlama Linki Gönder" butonu
3. Kullanıcı e-postasına link gider
4. Yeni şifre belirlenir
```

---

### 3. 📊 Abonelik Yönetimi

**Nerede:** `Admin → Abonelikler`

**Plan Türleri:**

```
FREE:
- 5 sipariş/ay
- 1 kullanıcı
- Temel özellikler

BASIC:
- 50 sipariş/ay
- 5 kullanıcı
- 100 ürün koleksiyonu
- Fiyat: 99 USD/ay

PROFESSIONAL:
- 200 sipariş/ay
- 20 kullanıcı
- 500 ürün koleksiyonu
- Öncelikli destek
- Fiyat: 299 USD/ay

ENTERPRISE:
- Sınırsız sipariş
- Sınırsız kullanıcı
- Özel fiyatlandırma
- 7/24 destek
- Fiyat: Özel teklif
```

**Admin Yapabilir:**

- Şirkete plan ataması
- Plan limitlerini güncelleme (özel durumlar için)
- Abonelik geçmişini görme
- Ödeme durumunu takip etme

---

### 4. 📈 Sistem Raporları

**Nerede:** `Admin → Raporlar`

**Mevcut Raporlar:**

```
Genel İstatistikler:
- Toplam kullanıcı sayısı: 1,234
- Aktif şirket sayısı: 156
- Bu ay oluşturulan sipariş: 487
- Toplam işlem hacmi: 2.4M USD

Üretici Performansı:
- En çok sipariş alan: ABC Tekstil (45 sipariş)
- Ortalama teslimat süresi: 28 gün
- Zamanında teslimat oranı: 87%

Alıcı İstatistikleri:
- En çok sipariş veren: XYZ Moda (32 sipariş)
- Ortalama sipariş değeri: 18,500 USD
- Tekrar sipariş oranı: 62%

Platform Sağlığı:
- Sistem uptime: 99.8%
- Ortalama yanıt süresi: 120ms
- Günlük aktif kullanıcı: 345
```

---

### 5. 🔔 Bildirim Yönetimi

**Nerede:** `Admin → Bildirimler`

**Admin Yapabilir:**

- Toplu bildirim gönderme (tüm kullanıcılara)
- Önemli duyurular (sistem bakımı, yeni özellik)
- Hatırlatmalar (ödeme, teslimat)
- Bildirim şablonları oluşturma

**Örnek Senaryo:**

```
Durum: Yeni özellik eklenecek (RFQ sistemi)
Admin Aksiyonu:
1. Bildirim Oluştur
2. Başlık: "Yeni Özellik: Teklif Toplama Sistemi"
3. İçerik: "Artık birden fazla üreticiden teklif alabilirsiniz"
4. Hedef: Tüm BUYER firmaları
5. Gönder
```

---

### 6. 🛠️ Sistem Ayarları

**Nerede:** `Admin → Ayarlar`

**Yapılabilenler:**

- E-posta şablonları düzenleme
- Varsayılan sipariş durumları
- Ödeme yöntemleri (BANK_TRANSFER, CREDIT_CARD, PAYPAL)
- Para birimleri (USD, EUR, TRY)
- Dil ayarları
- Bakım modu (sistem güncellemeleri için)

---

## Bildirim Sistemi

### Bildirim Türleri

#### 1. 📦 Sipariş Bildirimleri

**Alıcı Alır:**

- ✅ Sipariş onaylandı
- 🔄 Üretim aşaması güncellendi
- 📸 Yeni üretim fotoğrafı yüklendi
- 🚚 Sipariş sevk edildi
- ✅ Teslimat tamamlandı

**Üretici Alır:**

- 🆕 Yeni sipariş geldi
- 💰 Ödeme alındı
- ✅ Teslimat onaylandı (alıcı tarafından)

---

#### 2. 🧵 Numune Bildirimleri

**Alıcı Alır:**

- ✅ Numune talebi onaylandı
- 🔄 Numune üretimde
- ✅ Numune tamamlandı (fotoğraflarla)

**Üretici Alır:**

- 🆕 Yeni numune talebi
- 🔁 Revizyon talebi alındı
- ✅ Numune onaylandı (toplu üretim için)

---

#### 3. 💬 RFQ Bildirimleri

**Alıcı Alır:**

- 📩 Yeni teklif alındı
- ⏰ Son teklif tarihi yaklaşıyor
- ✅ Teklif kabul edildi (otomatik mesaj)

**Üretici Alır:**

- 🆕 Yeni teklif talebi
- ✅ Teklifiniz kabul edildi
- ❌ Teklifiniz reddedildi

---

#### 4. 💰 Ödeme Bildirimleri

**Alıcı Alır:**

- ⏰ Ödeme hatırlatması (avans, bakiye)
- ✅ Ödeme onaylandı

**Üretici Alır:**

- 💰 Yeni ödeme alındı (beklemede)
- ✅ Ödeme onaylandı (admin tarafından)

---

#### 5. 📢 Sistem Bildirimleri

**Herkese:**

- 🆕 Yeni özellik eklendi
- 🛠️ Sistem bakımı (2 saat önceden)
- 📊 Aylık rapor hazır
- 🎉 Özel kampanya (indirim, ücretsiz deneme)

---

### Bildirim Kanalları

```
1. 🌐 Platform İçi (In-App)
   - Dashboard'da bildirim zili
   - Okunmamış sayısı gösterilir
   - Tıklanınca ilgili sayfaya yönlendirir

2. 📧 E-posta
   - Önemli durumlar için (sipariş onayı, ödeme)
   - Günlük özet (isteğe bağlı)
   - E-posta ayarlarından kapatılabilir

3. 📱 SMS (Opsiyonel)
   - Çok acil durumlar (sevkiyat, ödeme)
   - Kullanıcı tercihine bağlı

4. 🔔 Web Push (Tarayıcı)
   - Gerçek zamanlı güncellemeler
   - Tarayıcı kapalıyken bile bildirim
```

---

## Önemli İpuçları

### Alıcılar İçin

#### 1. Tedarikçi Seçimi

```
✅ Yapılmalı:
- Firma profilini inceleyin (sertifikalar, fotoğraflar)
- Geçmiş müşteri yorumlarını okuyun
- İlk siparişte küçük miktar verin (test)
- Numune talep edin (kalite kontrolü)

❌ Yapılmamalı:
- En ucuz teklifi hemen kabul etmeyin
- Hiç yorum almamış firmalardan büyük sipariş
- Teslimat sürelerini göz ardı etmeyin
```

#### 2. Sipariş Yönetimi

```
✅ Yapılmalı:
- Teknik şartnameyi net yazın (kumaş, beden, baskı)
- Üretim fotoğraflarını düzenli takip edin
- Zamanında ödeme yapın (avans/bakiye)
- İyi iletişim kurun (WhatsApp, e-posta)

❌ Yapılmamalı:
- Son anda değişiklik talep etmeyin
- Üretim sürecine müdahale etmeyin
- Ödemeyi geciktirmeyin (güven sorunu)
```

#### 3. Kalite Kontrol

```
✅ Yapılmalı:
- Numune aşamasında detaylı kontrol
- Üretim fotoğraflarında dikkat edin
- Teslimat sonrası hemen kontrol edin
- Sorun varsa 24 saat içinde bildirin

❌ Yapılmamalı:
- "Gelsin bir bakarız" mantığı
- Numune onayını hızlı geçmeyin
- Teslimat sonrası uzun süre bekleyip şikayet
```

---

### Üreticiler İçin

#### 1. Profil Optimizasyonu

```
✅ Yapılmalı:
- Profesyonel fotoğraflar kullanın
- Sertifikaları yükleyin (OEKO-TEX, GOTS)
- Referans müşteriler ekleyin
- Katalog düzenli güncelleyin
- Üretim kapasitesini net belirtin

❌ Yapılmamalı:
- Amatör cep telefonu fotoğrafları
- Eksik bilgi (fiyat, MOQ, teslimat süresi)
- Eski koleksiyonlar (2020, 2021)
```

#### 2. Sipariş Yönetimi

```
✅ Yapılmalı:
- Hızlı yanıt verin (24 saat içinde)
- Gerçekçi teslimat tarihi verin
- Üretim sürecini fotoğraflayın
- Sorun olursa hemen bildirin
- Zamanında teslimat yapın

❌ Yapılmamalı:
- "Belki yaparız" gibi belirsiz cevaplar
- İmkansız teslimat sözleri (acele için)
- Sessiz kalıp gecikme
- Kaliteden ödün verme (hız için)
```

#### 3. Müşteri İlişkileri

```
✅ Yapılmalı:
- Proaktif iletişim (sorun öncesinde bilgilendirme)
- Revizyon isteklerini anlayışla karşılayın
- Tekrar sipariş için teşvik edin (indirim)
- İyi müşterilere özel fiyat verin

❌ Yapılmamalı:
- "Anlaşma yaptık, değişiklik yok" katılığı
- Müşteri sorularını geç cevaplama
- Sadece para odaklı yaklaşım
```

---

## Özet Akış Şemaları

### Basit Sipariş Akışı (Katalog)

```
Alıcı                           Üretici
  |                               |
  | 1. Ürün seç                  |
  |----------------------------->|
  |                              | 2. Onayla
  |<-----------------------------|
  | 3. Avans öde                 |
  |----------------------------->|
  |                              | 4. Üret
  |<-------- [Fotoğraflar] ------|
  | 5. Bakiye öde                |
  |----------------------------->|
  |                              | 6. Gönder
  |<-----------------------------|
  | 7. Onayla                    |
  |----------------------------->|
  ✅ Tamamlandı                  ✅
```

---

### Numune Akışı

```
Alıcı                           Üretici
  |                               |
  | 1. Numune iste (çizim)       |
  |----------------------------->|
  |                              | 2. Üret
  |<-------- [Fotoğraflar] ------|
  | 3. Revizyon talep et         |
  |----------------------------->|
  |                              | 4. Düzelt
  |<-------- [Yeni Fotoğraf] ----|
  | 5. Onayla + Toplu sipariş    |
  |----------------------------->|
  |      (Katalog akışına geç)   |
```

---

### RFQ Akışı

```
Alıcı                       Üretici 1, 2, 3
  |                               |
  | 1. RFQ oluştur (3 firma)     |
  |----------------------------->|
  |                              | 2. Teklif ver
  |<-----------------------------|
  | 3. Karşılaştır ve seç        |
  |----------------------------->|
  | 4. Siparişe dönüştür         |
  |      (Katalog akışına geç)   |
```

---

## Sık Sorulan Sorular

### Genel Sorular

**S: ProtexFlow'da kimler sipariş verebilir?**  
C: Sadece BUYER rolüne sahip firmalar. MANUFACTURER firmalar sipariş alamaz, veremez.

**S: Minimum sipariş miktarı var mı?**  
C: Üreticiye göre değişir. Genelde 100-1000 adet arası. Ürün sayfasında belirtilir (MOQ).

**S: Ödemeler nasıl yapılır?**  
C: BANK_TRANSFER (banka havalesi), CREDIT_CARD, PAYPAL desteklenir. Üretici tercihine göre.

**S: İade politikası nedir?**  
C: Üretici ile sipariş öncesinde anlaşılır. Genelde hatalı üretimde %100 iade, kalite sorunu %50 indirim.

---

### Alıcı Soruları

**S: İlk kez sipariş veriyorum, nasıl başlarım?**  
C:

1. Üreticileri inceleyin (filtreler: lokasyon, kategori, puan)
2. İlk siparişte numune isteyin (10-20 adet test)
3. Memnun kaldıysanız toplu sipariş verin
4. İyi iletişim kurun (WhatsApp, telefon)

**S: Numune ücretsiz mi?**  
C: Genelde ilk numune ücretli (kumaş + işçilik). Toplu sipariş verirseniz ücreti geri ödenebilir (üretici politikasına göre).

**S: Üretim süresi ne kadar?**  
C: Ürüne göre değişir:

- Basit tişört: 15-20 gün
- Kot pantolon: 25-30 gün
- Ceket/mont: 35-45 gün
- Özel tasarım: 40-60 gün

**S: Fiyat pazarlığı yapabilir miyim?**  
C: Evet, özellikle büyük siparişlerde (1000+ adet). Üretici ile mesajlaşarak özel fiyat talep edin.

---

### Üretici Soruları

**S: Hangi ürünleri satmalıyım?**  
C: En çok talep gören kategoriler:

- T-shirt (basic, baskılı)
- Kot pantolon/ceket
- Sweatshirt
- Spor giyim
- İş kıyafetleri

**S: Katalog nasıl oluşturuluyor?**  
C:

1. Dashboard → Koleksiyonlar → Yeni Koleksiyon
2. Sezon belirleyin (İlkbahar/Yaz, Sonbahar/Kış)
3. Ürünleri ekleyin (fotoğraf, fiyat, MOQ, beden)
4. Yayınlayın (PUBLISHED)

**S: Siparişi nasıl reddedebilirim?**  
C: Dashboard → Siparişler → Bekleyen → [Sipariş] → "Reddet" butonu. Neden belirtin (stok yok, kapasite dolu).

**S: Geç teslimat durumunda ne olur?**  
C: Alıcı ile anlaşmaya göre:

- %5-10 indirim (1-5 gün gecikme)
- %20 indirim (5-10 gün)
- İptal hakkı (10+ gün)

**S: Müşteri ödeme yapmadı, ne yapmalıyım?**  
C:

1. Hatırlatma gönderin (platform üzerinden)
2. 3 gün sonra admin'e bildirin
3. Admin müşteriyi uyarır
4. 7 gün ödeme yoksa sipariş iptal edilir

---

### Teknik Sorular

**S: Mobil uygulama var mı?**  
C: Şu an sadece web (masaüstü + mobil tarayıcı). iOS/Android uygulaması 2025 Q2'de gelecek.

**S: Hangi dosya formatları desteklenir?**  
C:

- Fotoğraf: JPG, PNG (max 5MB)
- Döküman: PDF (max 10MB)
- Teknik çizim: PDF, AI, SVG

**S: Bildirimler nasıl kapatılır?**  
C: Ayarlar → Bildirimler → E-posta/SMS seçeneklerini kapat. Platform içi bildirimleri tamamen kapatamazsınız (önemli güncellemeler için).

**S: Verilerim güvende mi?**  
C: Evet:

- SSL şifreleme (HTTPS)
- GDPR uyumlu
- İki faktörlü kimlik doğrulama (2FA)
- Düzenli yedekleme

---

### Ödeme Soruları

**S: Ödeme platformda mı yapılıyor?**  
C: Hayır, ProtexFlow sadece sipariş takip platformudur. Ödeme üretici ile doğrudan (banka havalesi, PayPal vb.).

**S: ProtexFlow komisyon alıyor mu?**  
C: Abonelik modeliyle çalışır, sipariş başına komisyon yok. Aylık/yıllık paketler (BASIC, PRO, ENTERPRISE).

**S: Hangi para birimleri desteklenir?**  
C: USD (varsayılan), EUR, TRY. Fiyatlar her üç birimde gösterilebilir.

---

## Destek ve İletişim

### Teknik Destek

**E-posta:** support@protexflow.com  
**Telefon:** +90 (212) 123 45 67  
**Çalışma Saatleri:** Pazartesi-Cuma, 09:00-18:00 (GMT+3)

**Acil Durumlar (24/7):**

- Sistem çökmesi
- Ödeme hataları
- Hesap güvenliği sorunları

---

### Eğitim Kaynakları

**Video Eğitimler:**

- youtube.com/protexflow
- Başlangıç rehberi (10 dk)
- Sipariş verme (15 dk)
- Üretim yönetimi (20 dk)

**Dökümanlar:**

- docs.protexflow.com
- API dokümantasyonu (geliştiriciler için)
- En iyi uygulamalar kılavuzu

---

### Topluluk

**Forum:** community.protexflow.com

- Kullanıcı deneyimleri
- İpuçları ve püf noktaları
- Özellik önerileri

**LinkedIn:** linkedin.com/company/protexflow
**Instagram:** @protexflow

---

## Sonuç

Bu kılavuz ProtexFlow platformunu eksiksiz kullanmanız için hazırlanmıştır. Herhangi bir sorunuz olursa lütfen destek ekibimizle iletişime geçin.

**Başarılı siparişler dileriz! 🎉**

---

**Doküman Versiyonu:** 2.0.0  
**Son Güncelleme:** 1 Kasım 2025  
**Hazırlayan:** ProtexFlow Ekibi
