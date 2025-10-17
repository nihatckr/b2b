# 🧪 SEED DATABASE TEST SCENARIOS

Zenginleştirilmiş seed database'i ile TÜM kullanıcı rollerinin TÜM senaryolarını test edebilirsiniz.

---

## 📋 İçerik

1. [Test Hesapları](#test-hesapları)
2. [Sample (Numune) Status Testleri](#sample-status-testleri)
3. [Order (Sipariş) Status Testleri](#order-status-testleri)
4. [Feature Testleri](#feature-testleri)
5. [Permission Testleri](#permission-testleri)

---

## 🔑 Test Hesapları

### 1️⃣ PLATFORM ADMIN

```
📧 Email:    admin@platform.com
🔑 Password: myPassword42
🎯 Yetkiler: Platform tüm bölümlerine erişim
```

**Test Senaryoları:**

- [ ] Admin Dashboard'ını aç → Tüm KPI'ları görebilmeli
- [ ] Tüm şirketleri listele → Filter & Search test et
- [ ] Tüm kullanıcıları yönet → Role değişiklikleri
- [ ] Sistem ayarlarını düzenle
- [ ] Uluslararası şirketleri görüntüle

---

### 2️⃣ MANUFACTURER: DEFACTO

#### 🏢 Firma Sahibi

```
📧 Email:    ahmet@defacto.com
🔑 Password: random42
👤 Adı:      Ahmet Yılmaz
🎯 Yetkiler: Firma tüm verilerine erişim
```

**Test Senaryoları:**

- [ ] **Koleksiyonlar**

  - [ ] Yeni koleksiyon oluştur (Tüm alanları doldur)
  - [ ] Mevcut koleksiyonu düzenle
  - [ ] Koleksiyon yayınla / Yayını kaldır
  - [ ] Koleksiyon sil
  - [ ] Teknik detayları yükle (PDF, görseller)

- [ ] **Numuneler (Samples)**

  - [ ] 6 farklı status'taki numuneleri görüntüle
  - [ ] Müşteri sorularına yanıt ver
  - [ ] Numune durumunu güncelle

- [ ] **Siparişler**

  - [ ] 7 farklı status'taki siparişi görüntüle
  - [ ] Fiyat teklifine yanıt ver
  - [ ] Sipariş detaylarını incele

- [ ] **Dashboard**
  - [ ] Firma Dashboard'ındaki tüm grafikleri görüntüle
  - [ ] Activity log'u incele
  - [ ] Üretim istatistiklerini kontrol et

---

#### 👩‍💼 Koleksiyon Yöneticisi (Ayşe Demir)

```
📧 Email:    ayse@defacto.com
🔑 Password: random42
🎯 Yetkiler: Koleksiyon & Kategori yönetimi
```

**Test Senaryoları:**

- [ ] Koleksiyonlar - Oluştur
- [ ] Koleksiyonlar - Düzenle (kendi oluşturdukları)
- [ ] Kategoriler - Oluştur & Yönet
- [ ] Numuneleri - Görüntüle (Düzenle yok)
- [ ] Siparişleri - Görüntüle (Düzenle yok)

---

#### 🧪 Numune Takip Uzmanı (Mehmet Kaya)

```
📧 Email:    mehmet@defacto.com
🔑 Password: random42
🎯 Yetkiler: Numune durumu güncelleme & müşteri iletişimi
```

**Test Senaryoları:**

- [ ] Numuneleri - Durumu güncelle
- [ ] Müşteri sorularına - Yanıt ver
- [ ] Numune üretim geçmişini - İncele
- [ ] Revizyon taleplerini - Görüntüle
- [ ] Mesajları - Gönder/Al

**6 Farklı Status ile Test:**

- [ ] SMP-2025-00001: COMPLETED ✅
- [ ] SMP-2025-00002: IN_PRODUCTION 🔨
- [ ] SMP-2025-00003: IN_DESIGN 🎨
- [ ] SMP-2025-00005: PENDING_APPROVAL ⏳
- [ ] SMP-2025-REJECTED: REJECTED ❌
- [ ] SMP-2025-ON-HOLD: ON_HOLD ⏸️

---

#### 📋 Sipariş Yöneticisi (Zeynep Arslan)

```
📧 Email:    zeynep@defacto.com
🔑 Password: random42
🎯 Yetkiler: Sipariş yönetimi & fiyat teklifleri
```

**Test Senaryoları:**

- [ ] Siparişleri - Görüntüle (Tüm statuslar)
- [ ] Fiyat teklifini - Gönder
- [ ] Sipariş detaylarını - Müşteri ile tartış
- [ ] Mesajları - Gönder/Al
- [ ] Toplu siparişleri - Yönet

**7 Farklı Order Status ile Test:**

- [ ] ORD-2025-00001: IN_PRODUCTION 🔨
- [ ] ORD-2025-00002: QUOTE_SENT 📋
- [ ] ORD-2025-00003: CONFIRMED ✅
- [ ] ORD-2025-00004: PENDING ⏳
- [ ] ORD-2025-INDIV-001: PENDING ⏳
- [ ] ORD-2025-INTL-001: IN_PRODUCTION 🌍
- [ ] ORD-2025-00006: CANCELLED 🚫

---

#### 🏭 Üretim Takip Elemanı (Can Özdemir)

```
📧 Email:    can@defacto.com
🔑 Password: random42
🎯 Yetkiler: Production tracking & atölye yönetimi
```

**Test Senaryoları:**

- [ ] **Production Tracking**

  - [ ] In Progress sipariş - Aşama güncelle
  - [ ] Completed sipariş - Tüm aşama timeline'ı görüntüle
  - [ ] International sipariş - Progress takip et

- [ ] **Üretim Aşamaları (7 aşama)**

  - [ ] PLANNING aşaması
  - [ ] FABRIC aşaması (detay ekle)
  - [ ] CUTTING aşaması (fotoğraf yükle)
  - [ ] SEWING aşaması (yüksek detail)
  - [ ] QUALITY aşaması
  - [ ] PACKAGING aşaması
  - [ ] SHIPPING aşaması

- [ ] **Atölyeler**

  - [ ] Sewing Workshop ataması
  - [ ] Packaging Workshop ataması
  - [ ] Kapasite yönetimi

- [ ] **Revizyon Talepleri**
  - [ ] Pending revizyon talebini görüntüle
  - [ ] Revizyon detaylarını incele
  - [ ] Onay/Reddet

---

### 3️⃣ BUYER: LC WAIKIKI

#### 👔 Firma Sahibi (Fatma Şahin)

```
📧 Email:    fatma@lcwaikiki.com
🔑 Password: iLikeTurtles42
🎯 Yetkiler: Firma tüm verilerine erişim
```

**Test Senaryoları:**

- [ ] **Numune Talep**

  - [ ] Yeni numune talep et (5+ üretici seçeneği)
  - [ ] Existing numuneleri görüntüle
  - [ ] Numune statusunu takip et

- [ ] **Sipariş Oluştur**

  - [ ] Farklı koleksiyonlardan sipariş ver
  - [ ] Beden/Renk seçenekleri
  - [ ] Teslimat adresi belirle
  - [ ] Özel notlar ekle

- [ ] **Fiyat Karşılaştırması**

  - [ ] Quote'ları karşılaştır
  - [ ] Farklı üreticileri değerlendir

- [ ] **Dashboard**
  - [ ] Numune & Sipariş istatistikleri
  - [ ] Activity log

---

#### 💼 Satın Alma Müdürü (Hasan Demir)

```
📧 Email:    hasan@lcwaikiki.com
🔑 Password: iLikeTurtles42
🎯 Yetkiler: Numune & Sipariş yönetimi
```

**Test Senaryoları:**

- [ ] Numune talep et
- [ ] Numuneleri onayla/reddet
- [ ] Siparişler oluştur (İlk sefer bile)
- [ ] Siparişleri onayla
- [ ] Fiyat tekliflerini karşılaştır
- [ ] Müşteri desteği mesajları al

**Test Orderleri:**

- [ ] ORD-2025-00001 (In Production - Tracking visible)
- [ ] ORD-2025-00002 (Quote Sent - Approve/Reject)
- [ ] ORD-2025-00003 (Confirmed - Large batch)

---

#### 📊 Üretim Takip Uzmanı (Ali Kara)

```
📧 Email:    ali@lcwaikiki.com
🔑 Password: iLikeTurtles42
🎯 Yetkiler: Production tracking & revizyon istekleri
```

**Test Senaryoları:**

- [ ] **Production Timeline**

  - [ ] In Progress sipariş - 7 aşamayı takip et
  - [ ] Completed sipariş - Tüm aşama detaylarını gözle
  - [ ] International sipariş - Durumunu kontrol et

- [ ] **Revizyon Talepleri**

  - [ ] Revizyon talep et (İlişkili sipariş seç)
  - [ ] Revizyon talep detaylarını gir
  - [ ] Maliyet & Zaman etkisini belirle

- [ ] **Problem Raporlama**

  - [ ] Kalite sorununu bildir
  - [ ] Teslimat problemini raporla
  - [ ] Not ekle

- [ ] **Mesajlar**
  - [ ] Üreticiye soru sor
  - [ ] Revizyon hakkında tartış

---

#### ✅ Kalite Kontrol Uzmanı (Seda Yılmaz)

```
📧 Email:    seda@lcwaikiki.com
🔑 Password: iLikeTurtles42
🎯 Yetkiler: Quality kontrol & raporlama
```

**Test Senaryoları:**

- [ ] **Kalite Raporları**

  - [ ] PASSED rapor - Detayları gözle
  - [ ] CONDITIONAL_PASS rapor - Notları incele
  - [ ] Pending kalite kontrol

- [ ] **İnceleme Formu**

  - [ ] Fabric defect kontrolü
  - [ ] Sewing defect kontrolü
  - [ ] Measurement defect kontrolü
  - [ ] Finishing defect kontrolü
  - [ ] Quality score girişi (1-10)
  - [ ] Fotoğraf yükle

- [ ] **Yorum & Not**
  - [ ] Kalite hakkında yorum yap
  - [ ] Detaylı not ekle
  - [ ] Sorunları belirle

---

### 4️⃣ BİREYSEL MÜŞTERİ

```
📧 Email:    derya.kaya@email.com
🔑 Password: random42
👤 Adı:      Derya Kaya
🎯 Yetkiler: Numune/Sipariş talep & Soru/Yorum yapma
```

**Test Senaryoları:**

- [ ] **Numune Talep**

  - [ ] Yeni numune talep et (Herhangi bir üretici)
  - [ ] Tasarım notları ekle
  - [ ] Beden/Renk seçenekleri

- [ ] **Sipariş**

  - [ ] Küçük sipariş ver (50 adet)
  - [ ] Özel talepleri ekle
  - [ ] Teslimat adresini belirle

- [ ] **Soru-Cevap**

  - [ ] "Hasas cile uygun mu?" sorusu - Gözle & Beğen
  - [ ] Kendi sorusunu sor

- [ ] **Değerlendirme**

  - [ ] Review ekle (3 yıldız)
  - [ ] Yorum yazı
  - [ ] Positives & Negatives belirle

- [ ] **Favoriler**
  - [ ] Koleksiyonları beğenilere ekle
  - [ ] Beğenileri görüntüle

**Test ile:**

- [ ] SMP-2025-00005 (AI Generated - "Yapay zeka tarafından oluşturulmuş" görecek)
- [ ] Tipik individual customer journey

---

### 5️⃣ ULUSLARARASI MÜŞTERİ

```
📧 Email:    rana.khan@international.com
🔑 Password: random42
👤 Adı:      Rana Khan
🏠 Ülke:     Bangladesh
🎯 Senaryo: İhraç siparişi ile international testing
```

**Test Senaryoları:**

- [ ] **Büyük Sipariş**

  - [ ] 200 adet sipariş ver
  - [ ] Bangladesh'e teslimat
  - [ ] Özel gümrük notları

- [ ] **Production Tracking**

  - [ ] International order'ın progress'ini takip et
  - [ ] 45% tamamlanmış aşaması görüntüle
  - [ ] Timeline'ı incele

- [ ] **İletişim**

  - [ ] Gümrük prosedürü sorgusu
  - [ ] Teslimat tarihi tahmini
  - [ ] Cargo tracking

- [ ] **Favoriler**
  - [ ] Favorite collection'ları ekle (2)
  - [ ] Tercih ettiği koleksiyonları görüntüle

---

### 6️⃣ ALTERNATİF ÜRETICI

```
📧 Email:    mert@thirdparty.com
🔑 Password: random42
👤 Adı:      Mert Güneş
🏢 Şirketi:  Üçüncü Taraf Üretim Ltd.
🎯 Senaryo: Multi-manufacturer comparison
```

**Test Senaryoları:**

- [ ] Kendi şirketini yönet
- [ ] Rejected numune'yi görüntüle (Başka üreticiden)
- [ ] Kalite raporlarını incele
- [ ] Farklı üreticiler arasında karşılaştırma

---

## 🎨 Sample (Numune) Status Testleri

### Tüm 9 Status Type'ı Test Edin:

| #   | Status           | ID                | Açıklama                    | Test Noktaları                       |
| --- | ---------------- | ----------------- | --------------------------- | ------------------------------------ |
| 1   | COMPLETED        | SMP-2025-00001    | Tamamlandı, kargoya verildi | Timeline, Teslimat, Review yapabilir |
| 2   | IN_PRODUCTION    | SMP-2025-00002    | Üretim aşamasında           | Progress %, Revision talep           |
| 3   | IN_DESIGN        | SMP-2025-00003    | Tasarım aşamasında          | Tasarım notları, müşteri görüşü      |
| 4   | AI_DESIGN        | SMP-2025-00004    | AI tarafından oluşturulmuş  | AI prompt, AI sketch görüntüleme     |
| 5   | PENDING_APPROVAL | SMP-2025-00005    | Üretici onayı bekle         | Approval buttons, reject reason      |
| 6   | PATTERN_READY    | SMP-2025-00006    | Kalıp hazır                 | Üretim başlamaya hazır göstergesi    |
| 7   | QUALITY_CHECK    | SMP-2025-00007    | Kalite kontrolde            | QC raporu, score                     |
| 8   | REJECTED         | SMP-2025-REJECTED | Reddedildi                  | Reject reason, yeniden talep butonu  |
| 9   | ON_HOLD          | SMP-2025-ON-HOLD  | Beklemede                   | Hold reason, resume butonu           |

---

## 📦 Order (Sipariş) Status Testleri

### 8 Farklı Order Status Type'ı Test Edin:

| #   | Status        | ID                 | Açıklama                 | Test Noktaları                     |
| --- | ------------- | ------------------ | ------------------------ | ---------------------------------- |
| 1   | IN_PRODUCTION | ORD-2025-00001     | %65 tamamlandı           | 7 aşamalı timeline, Progress bar   |
| 2   | QUOTE_SENT    | ORD-2025-00002     | Fiyat teklifi gönderildi | Accept/Reject buttons              |
| 3   | CONFIRMED     | ORD-2025-00003     | Onaylandı, büyük sipariş | Timeline başladı                   |
| 4   | PENDING       | ORD-2025-00004     | Bekleme listesinde       | Accept/Review buttons              |
| 5   | DELIVERED     | ORD-2025-00005     | Teslimat yapıldı         | Review ekle butonu                 |
| 6   | PENDING       | ORD-2025-INDIV-001 | Bireysel müşteri         | Özel handling gösterilir           |
| 7   | IN_PRODUCTION | ORD-2025-INTL-001  | Uluslararası teslimat    | Bangladesh destegi, Cargo tracking |
| 8   | CANCELLED     | ORD-2025-00006     | İptal edildi             | Cancel reason, Archive butonu      |

---

## ✨ Feature Testleri

### 1. PRODUCTION TRACKING (7 AŞAMA)

- [ ] ORD-2025-00001 ile test et
  - [ ] Completed aşamaları gözle (Planning, Fabric, Cutting)
  - [ ] In Progress aşamasını görmek (Sewing - %65)
  - [ ] Not Yet Started aşamalarını (Quality, Packaging, Shipping)
  - [ ] Aşama timeline'ını kontrol et
  - [ ] Fotoğrafları indir

### 2. QUALITY CONTROL

- [ ] 2 farklı QC raporu değerlendir
- [ ] Quality score hesaplamasını görmek
- [ ] Defect types'ı kontrol et
- [ ] QC formu doldurup submit et

### 3. MESSAGES & COMMUNICATION

- [ ] 12+ direct message'i görmek
- [ ] Sohbet history'si
- [ ] Attachment'lar
- [ ] Message read/unread status

### 4. Q&A (QUESTION & ANSWER)

- [ ] 4 cevaplanmış soru
- [ ] 3 cevapsız soru
- [ ] 1 özel (private) soru
- [ ] Soru sorma formu
- [ ] Yorum ve rating sistemi

### 5. REVIEWS & RATINGS

- [ ] 8 farklı review'ı görmek
- [ ] 2, 3, 4, 5 yıldız rating'ler
- [ ] Onay bekleyen review'ler
- [ ] Review formu submit etme

### 6. NOTIFICATIONS

- [ ] 16+ notification'u almak
- [ ] Mark as read/unread
- [ ] Filter by type (Order, Sample, Production, Quality, System)
- [ ] Deep link'ler çalışıyor mu?

### 7. FAVORITES / LIKES

- [ ] Koleksiyonları beğenilere ekle
- [ ] Beğenileri kaldır
- [ ] Like counter update'i
- [ ] Favori koleksiyonları listeleme

---

## 🔐 Permission Testleri

### Role-Based Access Control

- [ ] Admin: Tüm bölümlere tam erişim
- [ ] Manufacturer Owner: Firmaya tam erişim
- [ ] Manufacturer Employee: Departman bazlı erişim
- [ ] Buyer Owner: Firma tam erişim
- [ ] Buyer Employee: Rol bazlı erişim
- [ ] Individual Customer: Kısıtlı erişim (Kendi siparişleri)

### Department Permissions

- [ ] Tasarım (Ayşe): Koleksiyon & Kategori
- [ ] Numune (Mehmet): Numune & Mesajlar
- [ ] Satış (Zeynep): Siparişler & Teklifler
- [ ] Üretim (Can): Production & Atölyeler
- [ ] Satın Alma (Hasan): Sample & Order oluşturma
- [ ] Üretim Takip (Ali): Timeline & Revizyon
- [ ] Kalite (Seda): QC & Raporlar

### Create/Edit/Delete Controls

- [ ] Kendi verilerini düzenleme ✅
- [ ] Başkasının verilerini düzenleme ❌
- [ ] Firma verilerini düzenleme (Owner) ✅
- [ ] Firma verilerini düzenleme (Employee) ❌
- [ ] Delete işlemleri kontrol

---

## 🚀 Çalıştırma

```bash
cd server
npm run seed
```

Seeding tamamlandıktan sonra:

```bash
npm run dev
```

Tarayıcıda aç: `http://localhost:3000`

---

## 📝 Notlar

- Tüm hesapların parolaları seeded database'de kaydedilidir
- Resimler Unsplash API'dan otomatik çekilmektedir (Fallback mevcuttur)
- Test verileri gerçekçi ve kullanışlıdır
- Multiple scenario testing mümkündür (farklı user'larla aynı verileri test etme)
- Seed script temiz database ile başlar (Önceki veri silinir)

---

## 🎯 QUICK TEST CHECKLIST

```
Hızlı Test Planı (15 dakika):

1. Admin (@platform.com) - 2 min
   ✓ Dashboard açılıyor
   ✓ Tüm şirketler görülüyor

2. Ahmet/Defacto (@defacto.com) - 3 min
   ✓ 10 koleksiyonu görmek
   ✓ 1 yeni koleksiyon oluşturmak
   ✓ 13 numuneden 6 statusu görmek

3. Fatma/LC Waikiki (@lcwaikiki.com) - 3 min
   ✓ 7 siparişin statuslarını görmek
   ✓ Production tracking açmak
   ✓ Mesajları görmek

4. Derya/Individual (@derya.kaya@email.com) - 3 min
   ✓ Numune talep et
   ✓ Soru sor
   ✓ Review ekle

5. Rana/International (@rana.khan@international.com) - 2 min
   ✓ Uluslararası sipariş görüntüle
   ✓ Production tracking'i izle
   ✓ Favorilere koleksiyon ekle

6. Rana/International (@rana.khan@international.com) - 2 min
   ✓ Kalite raporu görüntüle
   ✓ Scoring sistemi
```

---

**Başarılı Testler! 🎉**
