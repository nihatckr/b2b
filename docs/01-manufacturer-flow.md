# Üretici İş Akışı

## 1. Koleksiyon/Ürün Oluşturma

### Adım 1: Ürün Tanımlama
- **Model Kodu**: THS-2024-00
- **Sezon**: SS25, FW25, SS26, FW26
- **Klasman**: Gömlek, Pantolon, Triko
- **Cinsiyet**: Kadın, Erkek, Kız Çocuk, Erkek Çocuk
- **Fit**: Regular, Slim, Relaxed

### Adım 2: Ürün Detayları
- **Renkler**: Beyaz, siyah, yeşil (çoklu seçim)
- **Beden Aralığı**: S-XL, 6-16
- **Ölçü Tablosu**: XLSX, PDF yükleme

### Adım 3: Teknik Özellikler
- **Kumaş Kompozisyonu**: %100 Cotton
- **Aksesuar/Trim**: Düğme, fermuar, etiket
- **Fotoğraflar**: Ürün görselleri
- **Tech Pack**: PDF teknik dosya

### Adım 4: Sipariş Bilgileri
- **MOQ**: Minimum sipariş adedi
- **Hedef Fiyat**: USD cinsinden
- **Hedef Termin**: Gün sayısı
- **Notlar**: Ek açıklamalar

---

## 2. Numune Talep Yönetimi

### Gelen Numune Talepleri
- **Talep Listesi**: Müşteri, tarih, ürün
- **Hızlı Onay/Red**: 24 saat içinde
- **Plan Oluşturma**: Üretim süreci planlama
- **Müşteri Onayı**: Plan gönderme ve bekleme

---

## 3. Üretim Süreç Yönetimi

### Başlangıç Kurulumu
- **Başlangıç Tarihi**: Manuel belirleme
- **Aşama Süreleri**: Her aşama için gün sayısı
- **Otomatik Hesaplama**: Toplam teslim tarihi

### 7 Üretim Aşaması Yönetimi

| Aşama | Varsayılan | İşlemler |
|-------|------------|----------|
| **Planlama** | 5 gün | Kaynak planlama, malzeme listesi |
| **Kumaş** | 2 gün | Tedarik, kalite kontrol |
| **Kesim** | 5 gün | Atölye seçimi, kesim planı |
| **Dikim** | - | Atölye seçimi, üretim takibi |
| **Kalite** | - | Test yapma, rapor oluşturma |
| **Paketleme** | - | Atölye seçimi, son kontrol |
| **Kargo** | - | Sevkiyat hazırlık |

### Her Aşamada Yapılacaklar
- **Durum Güncelleme**: Tamamlandı/Devam/Gecikme
- **Fotoğraf Ekleme**: İsteğe bağlı süreç fotoğrafları
- **Not Ekleme**: Aşama hakkında açıklama
- **Atölye Seçimi**: Dikim ve paketleme için
- **Gecikme Yönetimi**: Ek gün ekleme + tüm tarihleri güncelleme

---

## 4. Kalite Kontrol Sistemi

### 7 Test Türü Gerçekleştirme
1. **Kumaş Kalitesi**: Yapı ve dayanıklılık
2. **Ölçü Kontrolü**: Beden standartları
3. **Renk Uyumu**: Renk tutarlılığı
4. **Dikiş Kalitesi**: İşçilik kontrolü
5. **Aksesuar Kontrolü**: Düğme, fermuar vb.
6. **Genel Görünüm**: Estetik değerlendirme
7. **Paketleme Kontrolü**: Son sunum

### Test Sonucu Girişi
- **Hata Oranı**: % olarak (örn: %5)
- **Test Sonucu**: Başarılı / Başarısız / Koşullu Geçti
- **Kalite Uzmanı**: Test yapan kişi adı
- **Test Tarihi**: Kontrolün yapıldığı tarih
- **Notlar**: Detaylı açıklama
- **Test Raporu**: PDF, JPG, PNG dosya ekleme

---

## 5. Revizyon ve Gecikme Yönetimi

### Revizyon Kaydı Oluşturma
- **Eski Termin**: Önceki planlanan tarih
- **Yeni Termin**: Güncellenmiş tarih
- **Revize Nedeni**: 
  - Kumaş Gecikmesi
  - Kapasite Sorunu
  - Kalite Problemi
  - Lojistik Gecikme
  - Diğer

---

## 6. Müşteri Mesajlaşma Sistemi

### Mesaj Yönetimi Dashboard'u
- **Gelen Mesajlar**: Tüm müşterilerden gelen mesajlar
- **Okunmamış Sayısı**: Her müşteri için okunmamış mesaj sayısı
- **Konuya Göre Filtreleme**: Ürün, numune, sipariş bazında
- **Öncelik Sıralaması**: Acil mesajlar üstte
- **Yanıt Zamanı Takibi**: Ne kadar sürede yanıtlandığı

### Mesaj Türleri ve Yönetim
- **Genel Ürün Sorguları**: Katalogdaki ürünler hakkında sorular
- **Numune Soruları**: Numune süreciyle ilgili iletişim
- **Sipariş Soruları**: PO ve üretim süreciyle ilgili mesajlar
- **Üretim Güncellemeleri**: Aşama ilerlemeleri hakkında bilgi paylaşımı
- **Kalite Endişeleri**: Test sonuçları ve kalite sorunları
- **Teslimat Sorguları**: Kargo ve teslim durumu
- **Fiyat Müzakereleri**: Ticari görüşmeler
- **Revizyon Talepleri**: Değişiklik istekleri
- **Acil Mesajlar**: Öncelikli iletişim

### Üretici Mesajlaşma İşlevleri
- **Gelen Mesajları Görüntüleme**: Müşterilerden gelen tüm mesajlar
- **Hızlı Yanıtlama**: Önceden hazır şablonlar ile
- **Dosya Paylaşımı**: PDF, resim, teknik dökümanlar
- **Mesaj Thread Takibi**: Konuşma geçmişi ve yanıtlar
- **Acil Mesaj Bildirimleri**: Email/SMS entegrasyonu
- **Ürün Bazlı Gruplama**: Hangi ürün için mesaj geldiği
- **Okundu İşaretleme**: Mesaj durumu takibi

### Otomatik Mesaj Tetikleyicileri
- **Aşama Tamamlanında**: "Planlama aşaması tamamlandı" bildirimi
- **Kalite Test Sonucu**: Test başarılı/başarısız durumunda
- **Revizyon Durumunda**: Gecikme olduğunda otomatik bilgilendirme
- **Teslimat Öncesi**: Kargo hazırlığı tamamlandığında
- **PO Onayı Sonrası**: Siparişin onaylandığı bilgisi
- **Açıklama**: Detaylı durum açıklaması
- **Alınan Aksiyon**: Çözüm adımları
- **Sorumlu Atölye**: Hangi departman sorumlu
- **Kanıt Dosyası**: Destekleyici belgeler

### Otomatik Sistem Güncellemesi
- Tüm aşama tarihleri yeniden hesaplanır
- Müşteriye otomatik bildirim gönderilir
- Dashboard'da güncel durum gösterilir

---

## 6. Sipariş (PO) Yönetimi

### Gelen PO'ları İnceleme
- **48 Saat İçinde**: Onay/Red/Revize
- **Fiyat Müzakeresi**: Karşı teklif gönderme
- **Termin Müzakeresi**: Süre ayarlaması
- **Onay Sonrası**: Üretim süreci başlatma

### PO Onay Kriterleri
- MOQ kontrolü
- Kapasite durumu
- Hammadde mevcudiyeti
- Fiyat uygunluğu

---

## 7. Ürün Mesajlaşma Sistemi

### Mesaj Türleri ve Yönetim
- **Genel Ürün Sorguları**: Katalogdaki ürünler hakkında sorular
- **Numune Soruları**: Numune süreciyle ilgili iletişim
- **Sipariş Soruları**: PO ve üretim süreciyle ilgili mesajlar
- **Üretim Güncellemeleri**: Aşama ilerlemeleri hakkında bilgi paylaşımı
- **Kalite Endişeleri**: Test sonuçları ve kalite sorunları
- **Teslimat Sorguları**: Kargo ve teslim durumu
- **Fiyat Müzakereleri**: Ticari görüşmeler
- **Revizyon Talepleri**: Değişiklik istekleri
- **Acil Mesajlar**: Öncelikli iletişim

### Üretici Mesajlaşma İşlevleri
- **Gelen Mesajları Görüntüleme**: Müşterilerden gelen tüm mesajlar
- **Hızlı Yanıtlama**: Önceden hazır şablonlar ile
- **Dosya Paylaşımı**: PDF, resim, teknik dökümanlar
- **Mesaj Thread Takibi**: Konuşma geçmişi ve yanıtlar
- **Acil Mesaj Bildirimleri**: Email/SMS entegrasyonu
- **Ürün Bazlı Gruplama**: Hangi ürün için mesaj geldiği
- **Okundu İşaretleme**: Mesaj durumu takibi

### Otomatik Mesaj Tetikleyicileri
- **Aşama Tamamlanında**: "Planlama aşaması tamamlandı" bildirimi
- **Kalite Test Sonucu**: Test başarılı/başarısız durumunda
- **Revizyon Durumunda**: Gecikme olduğunda otomatik bilgilendirme
- **Teslimat Öncesi**: Kargo hazırlığı tamamlandığında
- **PO Onayı Sonrası**: Siparişin onaylandığı bilgisi