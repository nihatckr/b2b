# Sistem İş Akışı ve Süreçler

## 1. Temel Sistem Akışı

### Numune Süreci
```
Müşteri Numune Talebi
↓ (24 saat)
Üretici İnceleme
├── Onay → Üretim Planı → Müşteri Onayı → Üretim
├── Red → Bildirim → Süreç Kapanır
└── Revize → Plan Güncelleme → Tekrar İnceleme

Üretim Süreci (7 Aşama)
Planlama → Kumaş → Kesim → Dikim → Kalite → Paketleme → Kargo
↓
Müşteri Değerlendirme
├── Onay → PO Oluşturabilir
├── Red → Süreç Kapanır
└── Revize → Yeni Numune Talebi
```

### Sipariş (PO) Süreci
```
Müşteri PO Oluşturma
↓ (48 saat)
Üretici İnceleme
├── Onay → Üretim Başlar
├── Red → Bildirim → Süreç Kapanır
└── Revize → Karşı Teklif → Müşteri Onayı

Üretim Süreci (7 Aşama)
↓
Kalite Kontrol
├── Başarılı → Teslimat
├── Başarısız → Revizyon
└── Koşullu → Müşteri Onayı

Teslimat → PO Tamamlandı
```

---

## 2. Durum Yönetimi

### Numune Durumları
- `REQUESTED` → Talep oluşturuldu
- `UNDER_REVIEW` → Üretici inceliyor
- `APPROVED` → Onaylandı, plan oluşturuldu
- `PLAN_APPROVED` → Müşteri planı onayladı
- `IN_PRODUCTION` → Üretim devam ediyor
- `QUALITY_CHECK` → Kalite kontrolde
- `SHIPPED` → Kargoya verildi
- `DELIVERED` → Teslim edildi
- `REJECTED` → Reddedildi

### PO Durumları
- `DRAFT` → Taslak oluşturuldu
- `SENT` → Üreticiye gönderildi
- `UNDER_REVIEW` → Üretici inceliyor
- `APPROVED` → Onaylandı
- `IN_PRODUCTION` → Üretimde
- `QUALITY_CHECK` → Kalite kontrolde
- `SHIPPED` → Kargoda
- `DELIVERED` → Teslim edildi
- `REJECTED` → Reddedildi
- `CANCELLED` → İptal edildi

### Üretim Aşama Durumları
- `WAITING` → Bekliyor
- `IN_PROGRESS` → Devam ediyor
- `COMPLETED` → Tamamlandı
- `DELAYED` → Gecikmiş
- `BLOCKED` → Engellenmiş

---

## 3. Mesajlaşma Sistemi Akışı

### Müşteri-Üretici İletişim Modeli
```
Müşteri                    Sistem                    Üretici
   │                         │                         │
   ├── Mesaj Gönder ────────→│                         │
   │                         ├── Bildirim ───────────→│
   │                         │                         │
   │                    ←────┤ ←── Yanıt ──────────────┤
   ├── Bildirim Al           │                         │
   │                         │                         │
```

### Mesaj Türleri ve Akışları
```
Ürün Sorgulama:
Müşteri → "Bu ürünün farklı renk seçeneği var mı?"
        → Üretici: Ürün sahibi
        → Yanıt bekleniyor

Numune Takibi:
Müşteri → "Numune ne zaman hazır?"
        → Üretici: İlgili numune sahibi
        → + Numune durumu otomatik eklenir

Sipariş İletişimi:
Müşteri → "Sipariş durumu nedir?"
        → Üretici: Sipariş sahibi
        → + Mevcut üretim aşaması bilgisi eklenir

Acil İletişim:
Müşteri/Üretici → "Acil durum mesajı"
                → Öncelik: Yüksek
                → Email/SMS bildirimi tetikle
```

### Mesaj Bağlamları (Context)
- **Genel Sohbet**: Bağlam yok, serbest iletişim
- **Ürün Odaklı**: Belirli bir Collection ile ilişkili
- **Numune Odaklı**: Belirli bir Sample ile ilişkili
- **Sipariş Odaklı**: Belirli bir Order ile ilişkili

---

## 4. Otomatik Süreçler

## 5. Sistem Bildirimleri ve Mesajlaşma Entegrasyonu

### Otomatik Mesaj Tetikleyicileri
```
Aşama Tamamlandığında:
└── Sistem → Müşteriye bildirim gönder
└── "Planlama aşaması tamamlandı, kumaş aşamasına geçildi"

Kalite Test Sonucunda:
├── Başarılı → "Kalite testi başarıyla geçildi"
├── Başarısız → "Kalite testinde sorun tespit edildi, revizyon gerekli"
└── Koşullu → "Kalite testi koşullu geçti, onayınızı bekliyoruz"

Revizyon Durumunda:
└── "Üretimde gecikme yaşandı, yeni termin: [tarih]"

PO Durumu Değişiminde:
├── Onay → "Siparişiniz onaylandı, üretim başlayacak"
├── Red → "Sipariş reddedildi, nedeni: [sebep]"
└── Revize → "Karşı teklif gönderildi, değerlendirmenizi bekliyoruz"
```

### Mesaj Thread Yönetimi
```
Ana Mesaj (Ürün Sorgusu)
├── Üretici Yanıtı
├── Müşteri Karşı Yanıtı
├── Üretici Detay Açıklama
└── Müşteri Onayı/Talebi

Numune Thread Örneği:
├── "Numune talebi oluşturuldu"
├── "Plan hazırlandı, onayınızı bekliyoruz"
├── "Plan onaylandı, üretim başladı"
├── "Kalite kontrolden geçti"
└── "Kargoya verildi, takip no: [xxx]"
```

### Mesaj Bildirim Sistemi
- **Anlık Bildirim**: Web/Mobile push notification
- **Email Bildirimi**: 15 dakika sonra okunmadıysa
- **SMS Bildirimi**: Acil mesajlar için (opsiyonel)
- **Dashboard Bildirimi**: Okunmamış mesaj sayısı

### Zaman Bazlı Tetikleyiciler
- **24 Saat**: Numune talep cevabı bekleniyor
- **48 Saat**: PO cevabı bekleniyor
- **Aşama Süreleri**: Her aşama için belirlenen süre dolduğunda uyarı

### Durum Değişim Tetikleyicileri
- Numune onaylandığında → Plan oluşturma bildirimi
- PO onaylandığında → Üretim başlangıç bildirimi
- Aşama tamamlandığında → Sonraki aşama başlangıç
- Kalite kontrolü bittiğinde → Sonuç bildirimi
- Gecikme olduğunda → Revizyon kaydı ve bildirim

### Bildirim Sistemi
- **E-posta**: Önemli durum değişiklikleri
- **Dashboard**: Anlık güncellemeler
- **SMS** (opsiyonel): Kritik durumlar

---

## 4. Kalite Kontrol Algoritması

### Test Değerlendirme
```
Her Test Türü için:
- Başarılı: Hata yok
- Koşullu: %0-10 arası hata
- Başarısız: %10+ hata

Genel Sonuç:
- Tüm testler başarılı → BAŞARILI
- 1+ test başarısız → BAŞARISIZ  
- Sadece koşullu testler var → KOŞULLU GEÇTİ
```

### Koşullu Geçti İşlemi
1. Müşteriye bildirim gönderilir
2. Test detayları paylaşılır
3. 48 saat içinde müşteri kararı beklenir
4. Onay → Üretim devam
5. Red → Revizyon süreci başlar

---

## 5. Revizyon ve Gecikme Yönetimi

### Gecikme Tespiti
- Manuel: Üretici bildirir
- Otomatik: Planlanan süre aşıldığında

### Revizyon Süreci
1. **Problem Tespiti**: Manuel veya otomatik
2. **Revizyon Kaydı**: Neden, açıklama, aksiyon
3. **Tarih Güncellemesi**: Tüm aşamalar yeniden hesaplanır
4. **Müşteri Bildirimi**: Otomatik bildirim gönderilir
5. **Takip**: Yeni tarihlere göre süreç devam eder

---

## 6. Veri Senkronizasyonu

### Otomatik Güncellemeler
- Aşama durumu değiştiğinde tüm ilgili kayıtlar güncellenir
- Revizyon olduğunda tarih hesaplamaları yeniden yapılır
- Kalite sonucu geldiğinde durum otomatik değişir

### Veri Tutarlılığı
- Her işlem log kaydı tutar
- Durum değişiklikleri audit trail'e kaydedilir
- Kritik işlemler transaction içinde yapılır

---

## 7. İş Kuralları

### Numune Kuralları
- Bir müşteri günde maksimum 5 numune talebi yapabilir
- Aynı ürün için 30 gün içinde tekrar numune talep edilemez
- Acil numune için %20 ek ücret uygulanır

### PO Kuralları
- MOQ altında sipariş kabul edilmez
- Onaylanmamış numune için PO oluşturulamaz
- Üretim başladıktan sonra iptal edilemez

### Üretim Kuralları
- Önceki aşama bitmeden sonrakine geçilemez
- Kalite başarısız olursa üretim durur
- Revizyon sonrası tüm tarihleri yeniden hesaplar

---

## 8. Performans Metrikleri

### Sistem KPI'ları
- Numune onay süresi: < 24 saat
- PO onay süresi: < 48 saat  
- Üretim termin tutma: > %90
- Kalite geçiş oranı: > %95

### Süreç Metrikleri
- Ortalama numune süresi: 7-10 gün
- Ortalama üretim süresi: 15-25 gün
- Revizyon oranı: < %10
- Zamanında teslimat: > %85

---

## 9. Hata Yönetimi

### Hata Türleri
- **Sistem Hataları**: Teknik arızalar
- **İş Süreci Hataları**: Kural ihlalleri
- **Kullanıcı Hataları**: Yanlış veri girişi

### Hata Çözüm Süreci
1. **Hata Tespiti**: Otomatik veya manuel
2. **Log Kaydı**: Detaylı hata bilgisi
3. **Bildirim**: İlgili kullanıcılara
4. **Çözüm**: Otomatik veya manuel müdahale
5. **Takip**: Çözüm sonrası kontrol

---

## 10. Güvenlik ve Yetkilendirme

### Basit Rol Yapısı
- **Üretici**: Kendi ürün ve siparişleri
- **Müşteri**: Kendi talep ve siparişleri
- **Admin**: Tüm sistem erişimi

### Veri Güvenliği
- Kullanıcılar sadece kendi verilerine erişebilir
- Kritik işlemler loglanır
- Şifreler encrypt edilir
- API rate limiting uygulanır