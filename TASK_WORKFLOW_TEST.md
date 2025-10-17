# ✅ Görev İş Akışı Test Kontrol Listesi

## Sistem Mimarisi

```
1. Order/Sample Oluşturma
   ↓
2. Otomatik Görev Oluşturma (TaskHelper)
   ↓
3. Görev Listesinde Görünme
   ↓
4. Görev Detay Sayfasında Viewing
   ↓
5. Order/Sample Sayfasına Git (Go To Button)
   ↓
6. Durumu Güncelle (DELIVERED/COMPLETED/CANCELLED)
   ↓
7. Görev Otomatik Tamamlanma
   ↓
8. Görev Listesinden Kaybolma
```

## Test Adımları

### 1️⃣ Order Oluştur (Müşteri Rolü)

- [ ] Dashboard → Koleksiyonlar git
- [ ] Bir koleksiyon seç → "Sipariş Ver" tıkla
- [ ] Order oluştur
- [ ] Bilgilendirme: "Sipariş başarıyla oluşturuldu"

### 2️⃣ Görev Oluşturuldu Kontrol Et (Üretici Rolü)

- [ ] Admin/Üretici olarak switch yap
- [ ] Dashboard → Görevler git
- [ ] Yeni görev görülmeli: "Sipariş Detayları - Onay Bekleniyor"
- [ ] Görev listesinde Order #XXX olarak görülmeli

### 3️⃣ Görev Detay Sayfasına Git

- [ ] Görev listesinde görevin üstüne tıkla
- [ ] Görev detay sayfası açılmalı
- [ ] Order bilgisi görülmeli:
  - Order numarası (ORD-XXX)
  - Quantity (adet)
  - Status badge

### 4️⃣ "Görevi Aç" Butonu ile Order Sayfasına Git

- [ ] Görev detay sayfasında "Görevi Aç" butonu tıkla
- [ ] Order detay sayfasına yönlendirilmeli
- [ ] Order detayları görülmeli

### 5️⃣ Order Durumunu Güncelle

- [ ] Order detay sayfasında "Düzenle" butonu tıkla
- [ ] Durumu değiştir (örn: PENDING → DELIVERED)
- [ ] "Güncelleni" butonu tıkla
- [ ] Bilgilendirme: "Sipariş başarıyla güncellendi"

### 6️⃣ Görev Otomatik Tamamlandığını Kontrol Et

- [ ] Görevler sayfasına geri dön (Dashboard → Görevler)
- [ ] **Görev listesinde kaybolmalı** (COMPLETED status)
- [ ] Eğer görev hala görünüyorsa:
  - [ ] Sayfayı yenile (F5)
  - [ ] Sesi kontrol et (status === COMPLETED olmalı)

### 7️⃣ Özel Durumlar Test Et

- [ ] Durumu **CANCELLED** yapıp görev tamamlanıp tamamlanmadığını kontrol et
- [ ] Durumu **COMPLETED** yapıp görev tamamlanıp tamamlanmadığını kontrol et
- [ ] Durumu **IN_PRODUCTION** yapıp görev **tamamlanmaması** kontrol et

## Expected Behavior

### ✅ Doğru Davranış

```
Order created → Task created ✅
Task visible in list ✅
Task detail page opens ✅
Go To button → Order detail page ✅
Update order status → Task completes ✅
Task disappears from "TODO" list ✅
Task appears in "COMPLETED" when filtered ✅
```

### ❌ Hatalı Davranış (Eğer görülürse)

```
- Order created but no task created
- Task doesn't update after order status change
- Go To button breaks navigation
- Task still shows as TODO after order marked DELIVERED
- Database errors in server logs
```

## Mutation Calls

### updateOrderStatus

```graphql
mutation UpdateOrderStatus($id: Int!, $status: OrderStatus!) {
  updateOrderStatus(id: $id, status: $status) {
    id
    orderNumber
    status
  }
}
```

### Task Completion (Automatic)

```typescript
// Backend automatically calls when order status is:
// - DELIVERED
// - COMPLETED
// - CANCELLED

await taskHelper.completeRelatedTasks(undefined, orderId);
```

## Database Verification

Check task status after order update:

```sql
SELECT * FROM Task WHERE orderId = {orderId} AND status = 'COMPLETED';
```

## Backend Logs

Watch server logs for:

```
✅ "Order status updated"
✅ "Auto-completing related tasks for order {orderId}"
❌ Error messages about task completion
```

## Notes

- Task detail page butonları zaten implement edilmiş
- Backend task completion logic eklendi
- Frontend order detail page durumu güncellemesi zaten var
- E2E test tamamen manuel test yapılmalı

---

**Last Updated:** 2025-10-17
**Status:** ✅ Ready for Testing
