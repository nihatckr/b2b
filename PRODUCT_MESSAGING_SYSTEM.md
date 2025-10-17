# Ürün Bazlı Mesajlaşma Sistemi

## Özet

Üreticiler ve müşteriler arasında ürün bazlı (Order ve Sample bazlı) mesajlaşma sistemi oluşturuldu.

## Yapılan Değişiklikler

### 1. Database Schema Güncellemeleri (Prisma)

**Message Model Güncellemeleri:**
```prisma
model Message {
  id         Int      @id @default(autoincrement())
  content    String   @db.Text
  senderId   Int
  receiverId Int?     // Alıcı kullanıcı ID (artık User ID)
  isRead     Boolean  @default(false)
  type       String   @default("general") // "order", "sample", "general"

  // Ürün bazlı mesajlaşma
  orderId    Int?
  sampleId   Int?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  sender    User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver  User?    @relation("ReceivedMessages", fields: [receiverId], references: [id])
  order     Order?   @relation(fields: [orderId], references: [id])
  sample    Sample?  @relation(fields: [sampleId], references: [id])
  company   Company? @relation(fields: [companyId], references: [id])
  companyId Int?
}
```

**İlişkiler Eklendi:**
- `User` modeline `receivedMessages` ilişkisi eklendi
- `Order` modeline `messages` ilişkisi eklendi
- `Sample` modeline `messages` ilişkisi eklendi

**Migration:**
- `20251016221028_add_product_based_messaging` migration'ı oluşturuldu

### 2. Backend GraphQL API

**Type Güncellemeleri** (`server/src/types/Message.ts`):
```typescript
// Message type'ına yeni alanlar eklendi:
- receiverId: Int
- orderId: Int
- sampleId: Int
- receiver: User
- order: Order
- sample: Sample
```

**Input Type Güncellemeleri:**
```typescript
CreateMessageInput {
  content: String!
  receiverId: Int
  type: String // "order", "sample", "general"
  orderId: Int
  sampleId: Int
  companyId: Int
}

MessageFilterInput {
  unreadOnly: Boolean
  type: String
  orderId: Int
  sampleId: Int
  companyId: Int
}
```

**Mutations** (`server/src/mutations/messageResolver.ts`):
- `sendMessage`: Ürün bazlı mesaj gönderme, yetkilendirme kontrolleri
- `markMessageAsRead`: Okundu olarak işaretle
- `deleteMessage`: Mesaj silme

**Queries** (`server/src/query/messageQuery.ts`):
- `myMessages`: Kullanıcının tüm mesajları (filtrelenebilir)
- `productMessages`: Belirli bir order veya sample için mesajlar
- `companyMessages`: Firma mesajları
- `unreadMessageCount`: Okunmamış mesaj sayısı

### 3. Frontend

**GraphQL Operations** (`client/src/lib/graphql/message-operations.ts`):
- Tüm query ve mutation'lar güncellendi
- Yeni `PRODUCT_MESSAGES_QUERY` eklendi
- Receiver artık `receiverId` (Int) olarak değiştirildi

**Mesajlaşma Sayfası** (`client/src/app/(protected)/dashboard/messages/page.tsx`):
- Tamamen yeniden tasarlandı
- Konuşma bazlı arayüz (WhatsApp/Telegram benzeri)
- Mesajlar order/sample/user bazında gruplandırılıyor
- Sol panel: Konuşma listesi
- Sağ panel: Seçilen konuşmanın mesajları
- Tab'ler: Tümü, Siparişler, Numuneler, Okunmamış
- İstatistikler: Toplam konuşma, okunmamış, toplam mesaj
- Real-time güncelleme ve okundu işaretleme

### 4. Özellikler

✅ **Ürün Bazlı Mesajlaşma:**
- Siparişlere özel mesajlaşma (Order)
- Numunelere özel mesajlaşma (Sample)
- Doğrudan kullanıcı mesajlaşması

✅ **Yetkilendirme:**
- Sadece sipariş/numune ile ilgili taraflar mesaj gönderebilir
- Müşteri ↔ Üretici iletişimi
- Admin tüm mesajları görebilir

✅ **Konuşma Yönetimi:**
- Mesajlar otomatik olarak konuşmalara gruplandırılır
- Her konuşma için okunmamış sayacı
- Son mesaj zamanına göre sıralama
- Konuşma başlığı ve alt başlığı (ürün bilgisi)

✅ **Mesaj Özellikleri:**
- Okundu/okunmadı durumu
- Gönderen bilgisi
- Zaman damgası (relative time)
- Enter ile gönderme
- Scroll edilebilir mesaj geçmişi

✅ **Filtreleme:**
- Tüm mesajlar
- Sadece sipariş mesajları
- Sadece numune mesajları
- Sadece okunmamış mesajlar

## Kullanım Senaryoları

### 1. Sipariş Üzerine Mesajlaşma
```typescript
// Müşteri siparişle ilgili soru sorar
sendMessage({
  input: {
    content: "Üretim ne zaman tamamlanacak?",
    receiverId: manufacturerId,
    type: "order",
    orderId: 123
  }
})

// Üretici yanıtlar
sendMessage({
  input: {
    content: "Üretim bu hafta tamamlanacak",
    receiverId: customerId,
    type: "order",
    orderId: 123
  }
})
```

### 2. Numune Üzerine Mesajlaşma
```typescript
sendMessage({
  input: {
    content: "Numune onaylandı, üretime geçebilirsiniz",
    receiverId: manufacturerId,
    type: "sample",
    sampleId: 456
  }
})
```

### 3. Mesaj Geçmişini Görüntüleme
```typescript
// Belirli bir sipariş için tüm mesajları al
productMessages(orderId: 123) {
  id
  content
  sender { firstName, lastName }
  createdAt
}
```

## Veritabanı Değişiklikleri

**Eski Yapı:**
- `receiver: String?` (user ID string veya "all")
- Ürün ilişkisi yok

**Yeni Yapı:**
- `receiverId: Int?` (proper foreign key)
- `receiver: User?` (relation)
- `orderId: Int?` + `order: Order?`
- `sampleId: Int?` + `sample: Sample?`
- Index'ler eklendi (performans için)

## Test Edilmesi Gerekenler

- [ ] Sipariş sayfasından mesajlaşma başlatma
- [ ] Numune sayfasından mesajlaşma başlatma
- [ ] Mesajlaşma sayfasından konuşma seçme
- [ ] Mesaj gönderme ve alma
- [ ] Okundu işaretleme
- [ ] Filtreleme (siparişler, numuneler, okunmamış)
- [ ] Yetkilendirme kontrolleri
- [ ] Real-time güncelleme

## Gelecek İyileştirmeler

1. **Real-time Updates**: WebSocket/subscription desteği
2. **Dosya Gönderme**: Mesajlara fotoğraf/belge ekleme
3. **Bildirimler**: Yeni mesaj bildirimleri
4. **Arama**: Mesaj içeriğinde arama
5. **Görüldü**: Double-check sistemi
6. **Typing Indicator**: "... yazıyor" göstergesi
7. **Mesaj Yanıtlama**: Reply özelliği
8. **Silme/Düzenleme**: Mesaj düzenleme ve silme

## Dosya Yapısı

```
server/
  ├── prisma/
  │   ├── schema.prisma (Message model updated)
  │   ├── seed.ts (receiver → receiverId)
  │   └── migrations/
  │       └── 20251016221028_add_product_based_messaging/
  ├── src/
  │   ├── types/
  │   │   └── Message.ts (updated with new fields)
  │   ├── mutations/
  │   │   └── messageResolver.ts (updated with product authorization)
  │   └── query/
  │       └── messageQuery.ts (updated + productMessages query)

client/
  ├── src/
  │   ├── lib/
  │   │   └── graphql/
  │   │       └── message-operations.ts (updated queries/mutations)
  │   └── app/
  │       └── (protected)/
  │           └── dashboard/
  │               └── messages/
  │                   ├── page.tsx (completely redesigned)
  │                   └── page.tsx.backup (old version)
```

## API Endpoint Örnekleri

### Query: Mesajlarımı Al
```graphql
query MyMessages {
  myMessages(filter: { type: "order", unreadOnly: true }) {
    id
    content
    type
    isRead
    orderId
    sampleId
    sender {
      firstName
      lastName
      company { name }
    }
    order {
      orderNumber
      collection { name }
    }
  }
}
```

### Mutation: Mesaj Gönder
```graphql
mutation SendOrderMessage {
  sendMessage(input: {
    content: "Merhaba, sipariş durumu nedir?"
    receiverId: 5
    type: "order"
    orderId: 10
  }) {
    id
    content
    createdAt
  }
}
```

### Query: Ürün Mesajlarını Al
```graphql
query GetOrderMessages {
  productMessages(orderId: 10) {
    id
    content
    sender { firstName, lastName }
    createdAt
    isRead
  }
}
```
