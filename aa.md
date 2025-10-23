2. Müşteri Teklifi İnceler
   Kim yapar: Müşteri (CUSTOMER)
   Nerede: /dashboard/orders/[id]
   3 seçenek var:

A) TEKLİFİ KABUL EDER ✅
Teklifi Kabul Et butonuna basar
Notification (Üreticiye): "✅ Teklif Kabul Edildi - [Müşteri] teklifinizi kabul etti!"
Sipariş durumu: QUOTED → CONFIRMED (Onaylandı)
Sıradaki adım: Üretim başlayabilir
B) KARŞI TEKLİF GÖNDERIR 💬
Farklı fiyat veya süre önerir
Notification (Üreticiye): "💬 Karşı Teklif Aldınız - [Müşteri] yeni teklif gönderdi"
Sipariş durumu: QUOTED → CUSTOMER_NEGOTIATING (Müzakere)
Sıradaki adım: Üretici karşı teklifi kabul/red eder
C) TEKLİFİ REDDeder ❌
Teklifi Reddet butonuna basar
Notification (Üreticiye): "❌ Teklif Reddedildi - [Müşteri] teklifinizi reddetti"
Sipariş durumu: QUOTED → REJECTED (Reddedildi)
Süreç biter 3. Üretim Süreci (Teklif kabul edildiyse)
Kim yapar: Üretici
Sipariş durumu: CONFIRMED → IN_PRODUCTION → COMPLETED

3.1. Üretim Başlat
Üretim Başlat butonuna basar
Notification (Müşteriye): "🏭 Üretim Başladı - Siparişiniz üretime alındı!"
Durum: CONFIRMED → IN_PRODUCTION
3.2. Üretim Tamamla
Üretim bittiğinde Üretim Tamamlandı butonuna basar
Notification (Müşteriye): "✅ Üretim Tamamlandı - Siparişiniz hazır, kargoya verilecek"
Durum: IN_PRODUCTION → COMPLETED
3.3. Kargoya Ver
Kargo takip numarası girer
Notification (Müşteriye): "📦 Kargoya Verildi - Takip No: [XXX]"
Durum: COMPLETED → SHIPPED
3.4. Teslim Edildi
Kargo teslim olduğunda
Durum: SHIPPED → DELIVERED
🎯 ŞİMDİ YAPMANIZ GEREKEN:
Test Senaryosu:
Üretici hesabına giriş yapın

Notifications'ı kontrol edin

"🆕 Yeni Sipariş Talebi Aldınız" görmelisiniz
Orders sayfasına gidin

/dashboard/orders
Yeni siparişi göreceksiniz (PENDING_QUOTE durumunda)
Sipariş detayına tıklayın

Order Details sayfası açılır
Teklif girin:

Birim Fiyat: örn. $12.50
Üretim Süresi: örn. 30 gün
Not: "Kaliteli pamuklu kumaş kullanılacaktır"
"Teklif Gönder" butonuna basın

Müşteriye notification gitmeli
Sipariş durumu QUOTED olmalı
Müşteri hesabına geçin

Notification geldi mi kontrol edin
Teklifi inceleyin
Kabul/Red/Karşı Teklif seçeneklerinden birini seçin
🔍 Kontrol Edilmesi Gerekenler:
Backend'de:

✅ Notification mesajları (düzelttik)
⏳ Teklif gönderme mutation'ı çalışıyor mu?
⏳ Status güncellemeleri doğru mu?
Frontend'de:

⏳ Order detail sayfası hazır mı?
⏳ "Teklif Gönder" formu var mı?
⏳ "Teklifi Kabul Et" butonu var mı?
⏳ Müzakere (negotiation) paneli var mı?
Hangi aşamayı test etmek istersiniz? Yoksa eksik olan UI bileşenlerini mi kontrol edelim? 🚀

Mükemmel! Şimdi yeni akış hazır:

✅ Yeni Sipariş Onay Akışı

1. Üretim Planı Gerekliliği
   ❌ Üretici artık direkt "Kabul Et" yapamaz
   ✅ Önce 7 aşamalı üretim planı oluşturmalı
   ✅ Plan oluşturulduktan sonra müşteriye gider
2. 7 Aşamalı Üretim Planı
3. Yeni Butonlar
   Üretici için: "Üretim Planı Oluştur" (yeşil buton)
   Her aşama için gün sayısı ve not eklenebilir
   Toplam süre otomatik hesaplanır
4. Sonraki Adımlar (Backend gerekli)
   Backend'de şunları eklemeliyiz:

GraphQL Mutation: createProductionPlanWithQuote

Üretim planını kaydeder
Order'a production tracking oluşturur
7 aşamayı ProductionStageUpdate olarak kaydeder
Müşteriye bildirim gönderir
Order Status: PRODUCTION_PLAN_SENT

CUSTOMER_QUOTE_SENT → PRODUCTION_PLAN_SENT
Müşteri planı onaylarsa → CONFIRMED
Müşteri Onay UI:

Müşteri üretim planını görür
"Planı Onayla" ya da "Revizyon İste" butonları
Frontend UI hazır! Backend mutation'ı ekleyelim mi?
