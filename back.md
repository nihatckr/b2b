Backend’de olması gereken ek Özellikler

1. Kimlik & Yetki
   • JWT + HttpOnly cookie, refresh endpoint.
   • RBAC + company scope: tüm listeler companyId filtrasyonu ile dönmeli.
   • Me/Session endpoint’i: kullanıcı, rol, şirket, izinler.

2. Listeleme & Filtreleme Sözleşmeleri
   • Tüm listeler: ?q=&filters={...}&sort=field:asc&cursor=&limit=20 şeması.
   • Filtre alanları (örnek):
   • /products: gender, fit, category[], manufacturerId, leadTimeMin/Max, priceMin/Max, certs[].
   • /orders: status[], risk, dateFrom/To, manufacturerId, buyerId, revisedOnly.
   • /samples: status, deliveryStatus.
   • Cevap standardı:
   {
   "items": [ ... ],
   "pageInfo": { "nextCursor": "abc", "total": 1245 }
   }
   (GraphQL ise Relay-style edges/pageInfo).

3. Ürün & Varyant API’leri
   • POST /products (draft/published flag)
   • PATCH /products/:id
   • POST /products/:id/variants (çoklu renk)
   • POST /products/import (CSV, async job id + durum sorgulama)
   • Benzersiz modelCode kontrolü: GET /products/unique?code=TSH-2024-001

4. Dosya Yükleme
   • Presigned upload: POST /uploads/sign → {url, fields, assetId}
   • Finalize: POST /uploads/finalize {assetId, kind, name, size, mime}
   • Tip/boyut validasyonu: server tarafında da; 10MB limit; virüs taraması (opsiyonel).
   • Private erişim: GET /assets/:id imzalı/geçici URL dönen proxy.

5. Sipariş & Üretim
   • POST /orders (Add to PO)
   • GET /orders/:id (detay: stages, revisions, qc, supplies, timeline sırasıyla)
   • POST /orders/:id/stages (tek/bulk destek: orderIds[])
   • Progress güncelleme kuralı: en güncel stage bazlı hesaplama – FE’ye dön.
   • İş akışı validasyonları: geçersiz state geçişlerinde 4xx + code (INVALID_TRANSITION).

6. Revize Termin
   • POST /orders/:id/revisions → zorunlu alanlar: newDue, reason, explanation(>=120), evidenceAssetId; opsiyonel actionTaken, workshopId.
   • (Opsiyonel) Onay süreci: PATCH /revisions/:id {status: APPROVED|REJECTED}.
   • Side-effect: orders.revisedDate güncelle (sadece APPROVED ise).

7. QC (Kalite Kontrol)
   • POST /orders/:id/qc → {testType, result, defectRatePct, inspectorId|inspectorName, testDate, notes, attachmentAssetId}
   • Kurallar: defectRatePct 0–100; testDate ≤ now.
   • Otomasyon: result=FAIL ise görev/event üret (bkz. Notifications).

8. Tedarik Girdileri
   • POST /orders/:id/supplies → {type, supplierId, lotNumber, quantity, unit, arrivalDate, testResult, approvedById}

9. Numune
   • POST /samples (buyer başlatır)
   • PATCH /samples/:id {status, deliveryStatus, notes}

10. Görevler & Bildirimler
    • GET /tasks?due=today
    • PATCH /tasks/:id {status, snoozeUntil}
    • Events/Webhooks/SSE (öneri): order.stage.updated, revision.submitted, qc.failed, sample.shipped.
    • FE, SSE/WebSocket ile canlı mini görev listesi güncelleyebilir.

11. SLA & Raporlar
    • GET /metrics/sla?period=month&manufacturerId=... → {delivery: %, quality: %, communication: %, revisionRate: %}
    • GET /reports/orders vs. (indirme linki varsa job-id + hazır olunca URL).

12. Hata Kodları & Mesaj Sözleşmesi
    • Tutarlı code alanları:
    • VALIDATION_ERROR, UNIQUE_CONSTRAINT, INVALID_TRANSITION, FORBIDDEN, NOT_FOUND, FILE_TYPE_NOT_ALLOWED, FILE_TOO_LARGE.
    • Field-level hatalar:
    { "message": "Validation failed", "errors": [{ "path": "targetPrice", "msg": ">= 0 olmalı" }] }
13. Performans/Cache
    • ETag/If-None-Match listeler için.
    • Stale-While-Revalidate (Next.js ile uyumlu).
    • Batch endpoint: /orders/stages/bulk tek çağrıda N siparişi güncelleme.

14. Güvenlik
    • Tüm GET/POST’lar company scope ile sınırlı.
    • Dosya URL’leri zaman kısıtlı.
    • Rate limit + idempotency key (özellikle upload/fatura/CSV import).
    • Audit trail (server tarafı; FE gösterecekse okunabilir endpoint).
