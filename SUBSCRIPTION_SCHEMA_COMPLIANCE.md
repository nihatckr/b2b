# Subscription System - Schema Compliance Report

**Tarih**: 2025-01-19  
**Durum**: ✅ Tamamlandı - Tüm subscription'lar schema ile %100 uyumlu

---

## 🎯 Yapılan Değişiklikler

### 1. Message Subscriptions - Schema Uyumluluk Sorunu Çözüldü

**Problem**:

- `messageSubscriptions.ts` dosyasında `productId` alanı kullanılıyordu
- Prisma schema'da `productId` alanı yok, `orderId` ve `sampleId` alanları ayrı ayrı var

**Çözüm**:

```typescript
// ❌ ESKİ (Schema'da olmayan alan)
const MessageEvent = builder.objectRef<{
  productId: number;
}>("MessageEvent");

// ✅ YENİ (Schema ile uyumlu)
const MessageEvent = builder.objectRef<{
  type: string;
  orderId: number | null;
  sampleId: number | null;
  receiverId: number | null; // nullable yapıldı
}>("MessageEvent");
```

### 2. PubSub Type Definitions Güncellendi

**Değişiklikler**:

- `MessagePayload` interface'i schema ile tam uyumlu hale getirildi
- `productId` → `orderId` ve `sampleId` olarak ayrıldı
- `type` alanı eklendi ("order", "sample", "general")

```typescript
// backend/src/utils/pubsub.ts
export interface MessagePayload {
  id: number;
  content: string;
  type: string; // ✅ YENİ
  orderId: number | null; // ✅ YENİ
  sampleId: number | null; // ✅ YENİ
  senderId: number;
  receiverId: number | null; // ✅ nullable yapıldı
  isRead: boolean;
  createdAt: Date;
}
```

### 3. Publish Helpers Güncellendi

**Değişiklikler**:

- `publishNewMessage(contextId, payload)` - contextId artık orderId veya sampleId olabilir
- `publishMessageRead(contextId, payload)` - aynı şekilde güncellendi
- Tüm helper fonksiyonları schema-compliant

```typescript
// backend/src/utils/publishHelpers.ts
export async function publishNewMessage(
  contextId: number, // ✅ productId → contextId (order veya sample ID)
  payload: MessagePayload
) {
  pubsub.publish("message:new", contextId, payload);
}
```

### 4. Message Mutations - Real-time Subscriptions Eklendi

**Yeni Özellikler**:

- `sendMessage` mutation'ına pubsub publish çağrıları eklendi
- `markMessageAsRead` mutation'ına pubsub publish çağrısı eklendi
- Her mesaj gönderildiğinde 2 kanal üzerinden yayın yapılıyor:
  1. Context channel (order veya sample ID ile)
  2. User channel (receiverId ile)

```typescript
// backend/src/graphql/mutations/messageMutation.ts

// sendMessage mutation'ından sonra:
const messagePayload = {
  id: message.id,
  content: message.content,
  type: message.type,
  orderId: message.orderId,
  sampleId: message.sampleId,
  senderId: message.senderId,
  receiverId: message.receiverId,
  isRead: message.isRead,
  createdAt: message.createdAt,
};

// Context channel'a yayınla (order veya sample)
const contextId = orderId || sampleId;
if (contextId) {
  await publishNewMessage(contextId, messagePayload);
}

// User channel'a yayınla
if (receiverId) {
  await publishUserMessage(receiverId, messagePayload);
}
```

### 5. Subscription Arguments Güncellendi

**Yeni Yapı**:

```graphql
# ❌ ESKİ
subscription {
  newMessage(productId: 123) { ... }
}

# ✅ YENİ
subscription {
  newMessage(orderId: 123) { ... }
  # VEYA
  newMessage(sampleId: 456) { ... }
}
```

---

## ✅ Schema Uyumluluk Doğrulaması

### Message Model (Prisma Schema)

```prisma
model Message {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  senderId  Int
  receiverId Int?                           // ✅ nullable
  isRead    Boolean  @default(false)
  type      String   @default("general")    // ✅ "order", "sample", "general"

  orderId   Int?                            // ✅ ayrı alan
  sampleId  Int?                            // ✅ ayrı alan

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sender    User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver  User?    @relation("ReceivedMessages", fields: [receiverId], references: [id])
  order     Order?   @relation(fields: [orderId], references: [id])
  sample    Sample?  @relation(fields: [sampleId], references: [id])
  company   Company? @relation(fields: [companyId], references: [id])
  companyId Int?
}
```

### Subscription Events - Schema Match

| Subscription          | Schema Fields                                  | ✅ Uyum |
| --------------------- | ---------------------------------------------- | ------- |
| MessageEvent          | type, orderId, sampleId, receiverId (nullable) | ✅ %100 |
| MessageReadEvent      | messageId, isRead, readAt                      | ✅ %100 |
| OrderStatusEvent      | orderId, orderNumber, status                   | ✅ %100 |
| SampleStatusEvent     | sampleId, sampleNumber, status                 | ✅ %100 |
| ProductionStatusEvent | productionId, status, currentStage             | ✅ %100 |
| NotificationEvent     | orderId, sampleId, productionTrackingId        | ✅ %100 |

---

## 📂 Değiştirilen Dosyalar

### Backend Files (8 dosya)

1. ✅ `backend/src/graphql/subscriptions/messageSubscriptions.ts` - Schema uyumlu hale getirildi
2. ✅ `backend/src/utils/pubsub.ts` - MessagePayload type güncellendi
3. ✅ `backend/src/utils/publishHelpers.ts` - Message helper'ları güncellendi
4. ✅ `backend/src/graphql/mutations/messageMutation.ts` - Pubsub publish çağrıları eklendi

### Schema Uyumluluğu Onaylandı (4 dosya)

5. ✅ `backend/src/graphql/subscriptions/orderSubscriptions.ts` - Zaten uyumlu
6. ✅ `backend/src/graphql/subscriptions/sampleSubscriptions.ts` - Zaten uyumlu
7. ✅ `backend/src/graphql/subscriptions/productionSubscriptions.ts` - Zaten uyumlu
8. ✅ `backend/src/graphql/subscriptions/notificationSubscriptions.ts` - Zaten uyumlu

---

## 🔍 Diğer Subscription'ların Durumu

### Order Subscriptions ✅

- Schema fields: `orderId`, `orderNumber`, `status`, `previousStatus`
- Subscription events: Tam uyumlu
- Kullanılmayan alan: Yok

### Sample Subscriptions ✅

- Schema fields: `sampleId`, `sampleNumber`, `status`, `previousStatus`
- Subscription events: Tam uyumlu
- Kullanılmayan alan: Yok

### Production Subscriptions ✅

- Schema fields: `productionId`, `status`, `currentStage`, `estimatedCompletion`
- Subscription events: Tam uyumlu
- Kullanılmayan alan: Yok
- Not: QualityControl model'i kaldırılmış, ilgili subscription da zaten yok

### Notification Subscriptions ✅

- Schema fields: `id`, `userId`, `title`, `message`, `type`, `orderId`, `sampleId`, `productionTrackingId`
- Subscription events: Tam uyumlu
- Kullanılmayan alan: Yok

---

## 🧪 Test Senaryoları

### 1. Message Subscription Test

```graphql
# Order bazlı mesajlaşma
subscription {
  newMessage(orderId: 123) {
    id
    content
    type
    orderId
    sampleId
    senderId
    receiverId
    createdAt
  }
}

# Sample bazlı mesajlaşma
subscription {
  newMessage(sampleId: 456) {
    id
    content
    type
    orderId
    sampleId
    senderId
    receiverId
    createdAt
  }
}

# Kullanıcının tüm mesajları
subscription {
  myMessages {
    id
    content
    type
    orderId
    sampleId
    senderId
    createdAt
  }
}
```

### 2. Message Read Subscription Test

```graphql
subscription {
  messageRead(orderId: 123) {
    messageId
    isRead
    readAt
  }
}

subscription {
  messageRead(sampleId: 456) {
    messageId
    isRead
    readAt
  }
}
```

---

## 🚀 Deployment Checklist

### Backend

- [x] Schema uyumluluk kontrolü yapıldı
- [x] TypeScript compile hataları yok
- [x] Pubsub type definitions güncellendi
- [x] Mutation'lara publish çağrıları eklendi
- [x] Tüm subscription'lar schema-compliant

### Frontend

- [ ] GraphQL Codegen çalıştırılmalı (`npm run codegen`)
- [ ] Frontend'de messageSubscriptions kullanımı güncellenmeli:
  - `productId` yerine `orderId` veya `sampleId` kullanılmalı
  - Subscription query'leri yeni argümanlarla çağrılmalı

---

## 📊 İstatistikler

- **Toplam Subscription Dosyası**: 5
- **Schema Uyumsuz Dosya**: 1 (messageSubscriptions - düzeltildi)
- **Gereksiz Alan**: 0
- **Eklenen Özellik**: Real-time message subscriptions (2 yeni publish çağrısı)
- **TypeScript Error**: 0

---

## 📝 Notlar

### productId → orderId/sampleId Dönüşümü

- Prisma schema'da `productId` diye bir alan hiç olmadığı için bu değişiklik zorunluydu
- Message model'i zaten `orderId` ve `sampleId` alanlarına sahipti
- Subscription'lar artık daha spesifik ve tip-güvenli

### Nullable Fields

- `receiverId` artık nullable (schema'da nullable)
- `orderId` ve `sampleId` nullable (mesaj türüne göre biri kullanılıyor)
- `type` alanı varsayılan "general", order/sample mesajlarında ilgili tip kullanılıyor

### Real-time Capabilities

- Her mesaj artık 2 kanal üzerinden yayınlanıyor:
  1. **Context channel**: Sipariş/numune ID'si ile (konuşma thread'i)
  2. **User channel**: Alıcı kullanıcı ID'si ile (kullanıcının tüm mesajları)
- Bu sayede hem konuşma bazlı hem de kullanıcı bazlı subscription'lar destekleniyor

---

## 🎉 Sonuç

Tüm subscription'lar **Prisma schema ile %100 uyumlu** hale getirildi. Gereksiz veya kullanılmayan alan bulunmamaktadır. Message system'i artık schema-compliant ve tip-güvenli bir şekilde çalışıyor.

**Deployment öncesi yapılacaklar:**

1. Backend'i test et
2. Frontend'de GraphQL Codegen çalıştır
3. Frontend'deki message subscription kullanımlarını güncelle
4. End-to-end test yap

---

**Hazırlayan**: GitHub Copilot  
**Tarih**: 19 Ocak 2025
