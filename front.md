Frontend Analizi

1. Teknoloji & Mimari
   • Stack: Next.js (App Router) + React 18, TypeScript, Tailwind + shadcn/ui, TanStack Query, React Hook Form + Zod, dayjs, UploadThing/S3 SDK entegrasyonu.
   • Veri akışı: Server Components’ta liste/özet (SSR/SSG), Client Components’ta interaktif formlar ve tablo filtreleri.
   • Durum yönetimi: Lokal form state (RHF), global hafif UI state (Zustand veya Context) – filtreler, panel aç/kapa, çoklu seçim.
   • Rotalar (öneri)
   • /dashboard
   • /catalog (katalog)
   • /orders (liste) → /orders/[id] (detay)
   • /samples
   • /manufacturers
   • /qc/new, /revisions/new, /stages/update (modal/route segments)
   • /collections/new (4 adımlı sihirbaz)
   • UI bileşen kütüphanesi: Table, Tabs, Drawer/Sheet, Stepper, DatePicker, Select, FileDropzone, Progress, Badge, Alert, Skeleton.

2. Sayfa Bazlı UI Gereksinimleri

A) Koleksiyon/Ürün Sihirbazı (4 adım)
• Adım 1 Temel: modelCode, season, category, gender, fit (select).
• Adım 2 Varyant: çoklu renk seçimi, sizeRange text, ölçü tablosu upload (XLSX/PDF).
• Adım 3 Teknik: fabric composition (zod pattern), trims (tags), foto çoklu upload, tech pack PDF.
• Adım 4 Fiyat: MOQ (int), targetPrice (money), leadTimeDays (1–60), notes.
• İşlevler: Taslak kaydet, Yayınla/Kaydet, CSV import (drag&drop, validasyon raporu), ileri/geri adımda veriyi koru (localStorage/draft id).
• Validasyon: zorunlular, dosya tipi/boyutu, benzersiz modelCode (async check).

B) Katalog
• Filtreler: gender, fit, fabric, priceRange slider, leadTime chips, manufacturer, category chips; persisted query (URL param).
• Kartlar: sertifika etiketleri, fiyat/termin, “Add to PO” / “Numune Talep Et”.
• Liste: sonsuz kaydırma veya sayfalama, skeleton + boş durum.

C) Sipariş Takibi
• Tablolar: kolonlar (orderCode, product, manufacturer, progress, status, risk, revisedDate).
• Filtreler: marka, üretici, lokasyon, risk, termin aralığı, “sadece revize terminli”.
• Kart/Detay: üretim aşama progress bar, timeline (stages + revisions + QC + supplies), action butonları (QC Kaydı, Revize, Aşama Güncelle).
• UX: satır seçimi + bulk stage update için çekmece (drawer).

D) Numune Kutusu
• Sekmeler: tümü/yeni/aktif/onaylanan/tamamlanan; kargo durumu rozetleri.
• İşlemler: durum değişimi, kargo bilgisi, notlar (buyer/üretici görünür).

E) Revize Termin Bildir
• Form: order/model select (searchable), eski termin otomatik, yeni termin datepicker, reason select, min 120 char açıklama counter, aksiyon, atölye select, dosya upload zorunlu.
• Gönderim: optimistic UI + toast; hata alanı işaretleme.

F) QC Kaydı
• Form: order id, test type, result, defectRate %, inspector (free text + user select), date, açıklama/ek not, rapor/foto upload.
• Sonuç: FAIL ise uyarı/aksiyon öner banner.

G) Üretim Aşaması Güncelle
• Sol liste: arama + çoklu seçim checkbox, progress mini-bar.
• Form: stage, status, progress %, update date, workshops, kısa not, kanıt foto.
• Bulk: seçili N siparişte aynı güncelleme (conflict göstergesi).

H) Tedarik Girdileri
• Alanlar: type (“Kumaş Girişi”), supplier select, lot no, qty + unit, arrival date, test result, approver.
• UI: inline validation, PASS/FAIL rozet.

I) Görevler & SLA
• Bugünkü görevler: mini görev kartları; “tamamla”/“detay”.
• SLA Paneli: puan + ilerleme çubuğu, hedef rozet; Detay Rapor CTA.

3. UX Standartları
   • Yükleme durumları: table skeleton, button spinner, form “Kaydediliyor…”.
   • Hata durumları: form-level ve field-level; ağ hatası “Tekrar dene” butonu.
   • Boş durum: “Henüz kayıt yok – şimdi oluştur” CTA.
   • Erişilebilirlik: label/id, keyboard nav, aria-live toasts.
   • i18n: tr/en json sözlük yapısı (react-intl veya next-intl).
   • Performans: query caching (staleTime), prefetch on hover, image optimization, memoization (list sanallaştırma – @tanstack/react-virtual).
   • Güvenlik (FE): presigned upload kullan, PII masking, dosya linkleri zaman kısıtlı.
