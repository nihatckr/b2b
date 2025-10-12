# Tekstil Üretim Yönetim Sistemi - MVP

## 🎯 Proje Özeti

Üretici ve müşteri arasında tekstil siparişlerini yönetmek için minimal ve etkili bir platform.

## 🏗️ Temel Özellikler

### 👥 Kullanıcı Türleri
- **Üretici**: Ürün ekler, numune onaylar, üretim yönetir
- **Müşteri**: Katalog görür, numune/sipariş talep eder
- **Admin**: Sistem yönetimi

### 🔄 Ana Süreçler
1. **Ürün Kataloğu** → Üretici ürün ekler, müşteri görür
2. **Numune Süreci** → Talep → Onay → Üretim → Takip
3. **Sipariş Süreci** → PO Oluştur → Onay → Üretim → Teslim
4. **Üretim Takibi** → 7 Aşama canlı takip
5. **Kalite Kontrol** → 7 Test türü + Raporlama

### 📊 7 Üretim Aşaması
1. **Planlama** (5 gün)
2. **Kumaş** (2 gün) 
3. **Kesim** (5 gün)
4. **Dikim** (değişken)
5. **Kalite** (değişken)
6. **Paketleme** (değişken)
7. **Kargo** (değişken)

### ✅ 7 Kalite Test Türü
1. Kumaş Kalitesi
2. Ölçü Kontrolü
3. Renk Uyumu
4. Dikiş Kalitesi
5. Aksesuar Kontrolü
6. Genel Görünüm
7. Paketleme Kontrolü

## 🚀 MVP Hedefleri

- **Basit Interface** → Kullanıcı dostu, karmaşık değil
- **Hızlı İmplementasyon** → 2-3 ayda bitirilecek
- **Temel İhtiyaçlar** → Gereksiz özellik yok
- **Ölçeklenebilir** → İleride geliştirilebilir

## 📋 Dokümantasyon İçeriği

1. `01-manufacturer-flow.md` → Üretici iş akışı
2. `02-customer-flow.md` → Müşteri iş akışı  
3. `03-system-workflow.md` → Sistem süreçleri
4. `04-database-schema.md` → Veri yapıları
5. `05-api-endpoints.md` → API tasarımı
6. `06-user-interface.md` → UI/UX rehberi
7. `07-implementation-guide.md` → Geliştirme planı