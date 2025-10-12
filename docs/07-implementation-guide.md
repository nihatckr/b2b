# Backend Odaklı Geliştirme Rehberi

## Proje Durumu

### ✅ Mevcut Backend
- **GraphQL API**: Apollo Server + Nexus
- **Database**: MySQL + Prisma
- **Authentication**: JWT token sistemi
- **Temel Models**: User, Collection, Sample, Order
- **Port**: 4000'de GraphQL endpoint

### 🚧 Genişletilecek Backend Features
- **4 Adımlı Koleksiyon Sistemi**
- **7 Aşamalı Üretim Takibi** 
- **Kalite Kontrol Sistemi**
- **PO (Purchase Order) Yönetimi**
- **Revizyon ve Atölye Sistemi**

---

## 🎯 BACKEND-FIRST Geliştirme Stratejisi

> **ÖNCELIK**: Backend API'lerini %100 tamamla, sonra frontend geliştir

### HAFTA 1: Mesajlaşma Sistemi Backend
**Hedef**: Tam fonksiyonel mesajlaşma API'si

#### Gün 1-2: Message Model & Error Handling Setup
```bash
# 1. Message modeli ekle
cd server
# Prisma schema.prisma güncelle
npx prisma migrate dev --name "add-message-system"
npx prisma generate

# 2. Error handling classes oluştur
# src/errors/index.ts - Custom error classes
# src/utils/errorHandling.ts - GraphQL error formatters
```

**Yapılacaklar:**
- Message model + MessageType enum
- User modelinde mesajlaşma relations
- Collection/Sample/Order'da message relations  
- Custom error classes (ValidationError, AuthorizationError, etc.)
- Error code constants
- GraphQL error formatter middleware

#### Gün 3-4: GraphQL Mesajlaşma Schema
```typescript
// 1. Nexus Types
- Message objectType
- MessageType enumType
- SendMessageInput inputObjectType
- GetConversationInput inputObjectType
- ConversationSummary objectType
- MarkAsReadResponse objectType

// 2. Mutations
- sendMessage: Yetki kontrolü + validation
- markMessagesAsRead: Toplu okundu işareti

// 3. Queries  
- conversation: İki kullanıcı arası mesajlar
- unreadMessages: Okunmamış mesajlar
- conversationsList: Aktif konuşmalar
```

#### Gün 5-7: Mesajlaşma Business Logic
```typescript
// 1. Permission System
- checkMessagingPermission(): Müşteri ↔ Üretici kontrolü
- validateMessageContext(): Sample/Order/Collection erişim kontrolü
- rateLimitCheck(): Dakikada max 10 mesaj kontrolü

// 2. Validation Layer
- validateMessageContent(): Max 5000 karakter, HTML clean
- validateFileAttachment(): Dosya türü ve boyut kontrolü
- validateReceiver(): Alıcı kullanıcı varlık kontrolü

// 3. Auto Message System
- sendProductionUpdateMessage(): Aşama değişimlerinde
- sendSystemNotification(): Önemli durumlar için
- markOldMessagesAsRead(): Toplu işlemler

// 4. Database Optimizations
- Message index'leri: senderId, receiverId, createdAt
- Conversation summary cache
- Pagination optimization
```

#### Hafta 3: Auth Integration
- [ ] **Login/Register Sayfaları**
  - Form validasyonu
  - API entegrasyonu
  - Token yönetimi
  - Protected routes

### HAFTA 2: Backend Mesajlaşma Testleri & Optimizasyon
**Hedef**: %100 Test Coverage + Performance Tuning

#### Gün 8-10: Comprehensive Testing
```typescript
// 1. Unit Tests
- Message model validation tests
- Permission system tests  
- Rate limiting tests
- Error handling tests

// 2. Integration Tests
- sendMessage mutation full flow
- conversation query with filters
- markAsRead bulk operations
- Auto message triggers

// 3. Security Tests
- Authorization bypass attempts
- SQL injection prevention
- XSS content filtering
- Rate limit enforcement
```

#### Gün 11-14: Performance & Monitoring
```typescript
// 1. Database Optimizations
- Query performance analysis
- Index optimization
- Connection pooling tuning
- Slow query monitoring

// 2. GraphQL Optimizations
- DataLoader implementation
- N+1 query prevention
- Response caching
- Query complexity analysis

// 3. Monitoring Setup
- Error tracking (Sentry)
- Performance metrics
- API response times
- Database query monitoring
```

### HAFTA 3: Production Integration & Auto-Messaging
**Hedef**: Mesajlaşma ile üretim süreçlerini entegre et

#### Gün 15-17: Sample & Order Message Integration
```typescript
// 1. Auto-Message Triggers
- onSampleStatusChange(): Numune durumu değişimlerinde
- onOrderStatusChange(): Sipariş durumu değişimlerinde  
- onProductionStageComplete(): Üretim aşaması tamamlandığında
- onQualityTestResult(): Kalite test sonucu geldiğinde

// 2. Context-Aware Messaging  
- Sample-based conversations: Numune özelinde mesajlaşma
- Order-based conversations: Sipariş özelinde mesajlaşma
- Collection-based conversations: Ürün özelinde mesajlaşma
- General conversations: Genel iş görüşmeleri

// 3. Smart Notifications
- Priority message detection
- Urgent status propagation  
- Email/SMS fallback (future)
- Push notification prep
```

#### Gün 18-21: Advanced Features & Documentation
```typescript
// 1. Advanced Messaging Features
- Message search functionality
- Conversation archiving
- Message templates for manufacturers
- Bulk message operations
- Message statistics and analytics

// 2. API Documentation Finalization
- Complete GraphQL schema docs
- Error code reference guide
- Rate limiting documentation
- Security best practices
- Integration examples

// 3. Deployment Preparation
- Environment configuration
- Database migration scripts
- Performance benchmarks
- Security audit checklist
```

### HAFTA 3+: Test + Optimizasyon (Opsiyonel)
**Hedef**: Backend test, performance, deploy

#### Gün 22-24: Backend Testing
- **Unit tests**: Prisma model testleri
- **Integration tests**: GraphQL resolver testleri  
- **Business logic tests**: Üretim aşama geçişleri, termin hesaplama
- **Error handling**: GraphQL error responses

#### Gün 25-28: Performance + Deploy
- **Database optimization**: Indexleme, query optimization
- **File upload**: AWS S3/Cloudinary entegrasyonu (resim, PDF)
- **Backend deploy**: Railway/Render ile MySQL
- **GraphQL Playground**: Production endpoint test

#### Hafta 8: Numune Takip
- [ ] **Takip Sistemi**
  - Durum timeline bileşeni
  - Real-time güncellemeler (opsiyonel)
  - Bildirim sistemi

---

### FAZE 4: Sipariş Yönetimi (3 hafta)

#### Hafta 9: PO Backend
- [ ] **Sipariş API'ları**
  - PO oluşturma (line items ile)
  - Otomatik PO numarası üretimi
  - Durum yönetimi
  - Toplam hesaplamaları

#### Hafta 10: PO Frontend
- [ ] **PO Oluşturma**
  - Çoklu adımlı PO formu
  - Ürün seçimi ve konfigürasyonu
  - Miktar ve fiyat hesaplamaları
  - Lojistik bilgileri formu

#### Hafta 11: PO Yönetimi
- [ ] **PO İşlem Sayfaları**
  - PO listesi (müşteri/üretici görünümü)
  - PO detay sayfası
  - Onay/red işlemleri
  - PDF export (opsiyonel)

---

### FAZE 5: Üretim Takibi (4 hafta)

#### Hafta 12: Üretim Backend
- [ ] **Üretim API'ları**
  - Production tracking oluşturma
  - 7 aşama yönetimi
  - Durum güncellemeleri
  - Tarih hesaplamaları

#### Hafta 13: Üretim Frontend - Üretici
- [ ] **Üretici Üretim Yönetimi**
  - Üretim başlatma sayfası
  - Aşama yönetim interface'i
  - Fotoğraf yükleme
  - Atölye seçimi

#### Hafta 14: Üretim Frontend - Müşteri
- [ ] **Müşteri Takip Dashboard'u**
  - Timeline görünümü
  - Progress bar'lar
  - Aşama detayları
  - Fotoğraf galerisi

#### Hafta 15: Üretim Optimizasyonu
- [ ] **Gelişmiş Özellikler**
  - Toplu aşama güncellemeleri
  - Gecikme uyarıları
  - Otomatik durum geçişleri

---

### FAZE 6: Kalite Kontrol (2 hafta)

#### Hafta 16: Kalite Backend + Frontend
- [ ] **Kalite Kontrol API'ları**
  - 7 test türü sistemi
  - Test sonucu hesaplamaları
  - Rapor oluşturma

- [ ] **Kalite Interface'i**
  - Test girişi formları
  - Sonuç görüntüleme
  - Rapor sayfaları
  - Müşteri onay sistemi (koşullu geçti için)

#### Hafta 17: Revizyon Sistemi
- [ ] **Revizyon Yönetimi**
  - Revizyon kaydı API'ları
  - Tarih güncellemeleri
  - Bildirim sistemi
  - Revizyon geçmişi

---

### FAZE 7: Optimizasyon ve Test (2 hafta)

#### Hafta 18: Test ve Debug
- [ ] **Sistem Testleri**
  - Unit testler (kritik fonksiyonlar)
  - Integration testler (API'lar)
  - E2E testler (ana akışlar)
  - Performance testleri

#### Hafta 19: Production Hazırlık
- [ ] **Deployment Hazırlıkları**
  - Environment konfigürasyonları
  - Database migration scriptleri
  - File storage kurulumu
  - SSL ve güvenlik

---

## 3. Günlük Geliştirme Rutini

### Daily Standups (15 dakika)
- Dün ne yaptım?
- Bugün ne yapacağım?
- Engel var mı?

### Code Review Process
- Her PR minimum 1 review
- Automated tests geçmeli
- Naming conventions kontrol
- Performance considerations

### Git Workflow
```bash
# Feature branch oluştur
git checkout -b feature/numune-talep-formu

# Commit message format
git commit -m "feat: numune talep formu eklendi"
git commit -m "fix: PO toplam hesaplama hatası"
git commit -m "refactor: kalite kontrol service'i yeniden yapılandırıldı"

# Pull request oluştur
gh pr create --title "Numune Talep Formu" --body "Closes #123"
```

---

## 4. Quality Assurance

### Code Standards
- **ESLint + Prettier**: Kod formatı standardizasyonu
- **TypeScript**: Tip güvenliği
- **Husky**: Pre-commit hooks
- **Jest**: Unit testing framework

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms

### Security Checklist
- [ ] SQL Injection koruması
- [ ] XSS koruması  
- [ ] CSRF token'ları
- [ ] Rate limiting
- [ ] Input validation
- [ ] File upload güvenliği

---

## 5. Deployment Stratejisi

### Staging Environment
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${STAGING_DB_URL}
    
  frontend:
    build: ./frontend
    environment:
      - REACT_APP_API_URL=${STAGING_API_URL}
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=tekstil_staging
```

### Production Deployment
- **Backend**: Railway, Heroku, veya VPS
- **Frontend**: Netlify, Vercel, veya CDN
- **Database**: PlanetScale, Supabase, veya managed PostgreSQL
- **File Storage**: AWS S3, Cloudinary

---

## 6. Maintenance ve Monitoring

### Monitoring Tools
- **Application**: New Relic, DataDog
- **Uptime**: Pingdom, UptimeRobot  
- **Errors**: Sentry
- **Analytics**: Google Analytics, Mixpanel

### Backup Strategy
- **Database**: Günlük otomatik backup
- **Files**: S3 versioning
- **Code**: Git repository backup

---

## 7. Launch Checklist

### Pre-Launch (1 hafta önce)
- [ ] Tüm testler geçiyor
- [ ] Performance targets karşılanıyor
- [ ] Security audit tamamlandı
- [ ] Documentation güncel
- [ ] Backup sistemleri aktif

### Launch Day
- [ ] Production deployment
- [ ] DNS ayarları
- [ ] SSL sertifikaları
- [ ] Monitoring aktif
- [ ] Support team hazır

### Post-Launch (1 hafta sonra)
- [ ] User feedback toplama
- [ ] Performance monitoring
- [ ] Bug fix priority

---

## 8. Mesajlaşma Sistemi Detaylı Implementation

### Backend Implementasyon Adımları

#### 1. Prisma Schema Güncellemeleri
```prisma
// Message modeli ve ilişkiler eklenir
model Message {
  id               Int          @id @default(autoincrement())
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  content          String       @db.Text
  isRead           Boolean      @default(false)
  messageType      MessageType  @default(TEXT)
  
  // İlişkili konular
  relatedSampleId     Int?
  relatedOrderId      Int?
  relatedCollectionId Int?
  
  // Mesaj sahipleri
  senderId         Int
  receiverId       Int
  
  // Relations
  sender           User         @relation("SentMessages", fields: [senderId], references: [id])
  receiver         User         @relation("ReceivedMessages", fields: [receiverId], references: [id])
  relatedSample    Sample?      @relation("SampleMessages", fields: [relatedSampleId], references: [id])
  relatedOrder     Order?       @relation("OrderMessages", fields: [relatedOrderId], references: [id])
  relatedCollection Collection? @relation("CollectionMessages", fields: [relatedCollectionId], references: [id])
}

enum MessageType {
  TEXT
  IMAGE
  DOCUMENT
  SYSTEM
}
```

#### 2. GraphQL Schema Tanımları
```typescript
// Nexus types
const MessageType = enumType({
  name: 'MessageType',
  members: ['TEXT', 'IMAGE', 'DOCUMENT', 'SYSTEM'],
})

const Message = objectType({
  name: 'Message',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.date('createdAt')
    t.nonNull.date('updatedAt')
    t.nonNull.string('content')
    t.nonNull.boolean('isRead')
    t.nonNull.field('messageType', { type: 'MessageType' })
    t.int('relatedSampleId')
    t.int('relatedOrderId')
    t.int('relatedCollectionId')
    t.nonNull.field('sender', { type: 'User' })
    t.nonNull.field('receiver', { type: 'User' })
    t.field('relatedSample', { type: 'Sample' })
    t.field('relatedOrder', { type: 'Order' })
    t.field('relatedCollection', { type: 'Collection' })
  },
})
```

#### 3. Mesaj Gönderme Mutation
```typescript
const sendMessage = mutationField('sendMessage', {
  type: 'Message',
  args: {
    input: nonNull(arg({ type: 'SendMessageInput' })),
  },
  resolve: async (_parent, args, context: Context) => {
    const userId = getUserId(context)
    const { content, messageType, receiverId, relatedSampleId, relatedOrderId, relatedCollectionId } = args.input
    
    // Yetki kontrolü: sadece müşteri-üretici arası mesajlaşma
    const sender = await context.prisma.user.findUnique({ where: { id: userId } })
    const receiver = await context.prisma.user.findUnique({ where: { id: receiverId } })
    
    if (!sender || !receiver) throw new Error('Kullanıcı bulunamadı')
    
    // Müşteri sadece üreticiyle, üretici sadece müşteriyle mesajlaşabilir
    if ((sender.role === 'CUSTOMER' && receiver.role !== 'MANUFACTURE') ||
        (sender.role === 'MANUFACTURE' && receiver.role !== 'CUSTOMER')) {
      throw new AuthorizationError('Bu kullanıcı ile mesajlaşma yetkiniz yok', 'UNAUTHORIZED_MESSAGING')
    }
    
    return context.prisma.message.create({
      data: {
        content,
        messageType: messageType || 'TEXT',
        senderId: userId,
        receiverId,
        relatedSampleId,
        relatedOrderId,
        relatedCollectionId,
      },
      include: {
        sender: true,
        receiver: true,
        relatedSample: true,
        relatedOrder: true,
        relatedCollection: true,
      },
    })
  },
})
```

#### 4. Konuşma Listeleme Query
```typescript
const conversation = queryField('conversation', {
  type: nonNull(list(nonNull('Message'))),
  args: {
    input: nonNull(arg({ type: 'GetConversationInput' })),
  },
  resolve: async (_parent, args, context: Context) => {
    const userId = getUserId(context)
    const { participantId, relatedSampleId, relatedOrderId, relatedCollectionId, skip, take } = args.input
    
    return context.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: participantId },
          { senderId: participantId, receiverId: userId },
        ],
        AND: {
          ...(relatedSampleId && { relatedSampleId }),
          ...(relatedOrderId && { relatedOrderId }),
          ...(relatedCollectionId && { relatedCollectionId }),
        },
      },
      orderBy: { createdAt: 'asc' },
      skip: skip || 0,
      take: take || 50,
      include: {
        sender: true,
        receiver: true,
        relatedSample: true,
        relatedOrder: true,
        relatedCollection: true,
      },
    })
  },
})
```

#### 5. Otomatik Sistem Mesajları
```typescript
// Üretim aşaması değiştiğinde otomatik mesaj
async function sendProductionUpdateMessage(
  sampleId: number, 
  newStatus: SampleStatus, 
  context: Context
) {
  const sample = await context.prisma.sample.findUnique({
    where: { id: sampleId },
    include: { customer: true, manufacture: true }
  })
  
  if (!sample) return
  
  const statusMessages = {
    IN_PRODUCTION: 'Numuneniz üretim aşamasına geçti',
    QUALITY_CHECK: 'Numune kalite kontrole alındı',
    SHIPPED: 'Numuneniz kargoya verildi',
    DELIVERED: 'Numuneniz teslim edildi',
  }
  
  const message = statusMessages[newStatus]
  if (message) {
    await context.prisma.message.create({
      data: {
        content: message,
        messageType: 'SYSTEM',
        senderId: sample.manufactureId,
        receiverId: sample.customerId,
        relatedSampleId: sampleId,
      }
    })
  }
}
```

### Güvenlik ve Yetkilendirme
- **Mesaj Gizliliği**: Sadece mesaj sahipleri görüntüleyebilir
- **Rol Kontrolü**: Müşteri ↔ Üretici arası mesajlaşma
- **Spam Koruması**: Rate limiting (dakikada max 10 mesaj)
- **İçerik Filtreleme**: Zararlı içerik kontrolü (opsiyonel)

## 🛡️ Backend Error Handling Strategy

### Error Class Hierarchy
```typescript
// Base error class
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public field?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Specific error classes
class ValidationError extends AppError {
  constructor(message: string, field?: string, details?: any) {
    super(message, 'BAD_USER_INPUT', 400, field, details)
  }
}

class AuthorizationError extends AppError {
  constructor(message: string, code = 'FORBIDDEN') {
    super(message, code, 403)
  }
}

class ResourceNotFoundError extends AppError {
  constructor(resource: string, id?: number) {
    super(`${resource} bulunamadı`, 'RESOURCE_NOT_FOUND', 404, undefined, { resourceType: resource, resourceId: id })
  }
}

class RateLimitError extends AppError {
  constructor(limit: number, retryAfter: number) {
    super('Rate limit aşıldı', 'RATE_LIMIT_EXCEEDED', 429, undefined, { limit, retryAfter })
  }
}
```

### GraphQL Error Formatter
```typescript
import { GraphQLError } from 'graphql'
import { AppError } from './errors'

export const formatError = (error: GraphQLError) => {
  // AppError instances
  if (error.originalError instanceof AppError) {
    return {
      message: error.message,
      extensions: {
        code: error.originalError.code,
        field: error.originalError.field,
        details: error.originalError.details,
      },
      path: error.path,
    }
  }

  // Prisma errors
  if (error.originalError?.constructor.name === 'PrismaClientKnownRequestError') {
    return handlePrismaError(error)
  }

  // Unexpected errors
  console.error('Unexpected error:', error)
  return {
    message: 'Beklenmeyen bir hata oluştu',
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  }
}

const handlePrismaError = (error: GraphQLError) => {
  const prismaError = error.originalError as any
  
  switch (prismaError.code) {
    case 'P2002':
      return {
        message: 'Bu kayıt zaten mevcut',
        extensions: {
          code: 'DUPLICATE_RESOURCE',
          field: prismaError.meta?.target?.[0],
        },
      }
    case 'P2025':
      return {
        message: 'Kayıt bulunamadı',
        extensions: { code: 'RESOURCE_NOT_FOUND' },
      }
    default:
      return {
        message: 'Veritabanı hatası',
        extensions: { code: 'DATABASE_ERROR' },
      }
  }
}
```

### Validation Middleware
```typescript
import { rule } from 'graphql-shield'
import { ValidationError } from '../errors'

export const validateMessageContent = rule()(
  async (parent, args, context) => {
    const { content } = args.input
    
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Mesaj içeriği boş olamaz', 'content')
    }
    
    if (content.length > 5000) {
      throw new ValidationError(
        'Mesaj 5000 karakteri geçemez',
        'content',
        { currentLength: content.length, maxLength: 5000 }
      )
    }
    
    // XSS koruması
    const cleanContent = sanitizeHtml(content, { allowedTags: [] })
    if (cleanContent !== content) {
      throw new ValidationError('Mesajda geçersiz içerik tespit edildi', 'content')
    }
    
    return true
  }
)

export const validateReceiver = rule()(
  async (parent, args, context) => {
    const { receiverId } = args.input
    const senderId = getUserId(context)
    
    if (receiverId === senderId) {
      throw new ValidationError('Kendinize mesaj gönderemezsiniz', 'receiverId')
    }
    
    const receiver = await context.prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true }
    })
    
    if (!receiver) {
      throw new ResourceNotFoundError('User', receiverId)
    }
    
    const sender = await context.prisma.user.findUnique({
      where: { id: senderId },
      select: { role: true }
    })
    
    // Müşteri sadece üreticiyle, üretici sadece müşteriyle mesajlaşabilir
    if (!canCommunicate(sender.role, receiver.role)) {
      throw new AuthorizationError(
        'Bu kullanıcı ile mesajlaşma yetkiniz bulunmuyor',
        'UNAUTHORIZED_MESSAGING'
      )
    }
    
    return true
  }
)
```

### Rate Limiting
```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible'

const messagingRateLimiter = new RateLimiterMemory({
  keyPrefix: 'messaging',
  points: 10, // 10 messages
  duration: 60, // per 1 minute
})

export const checkRateLimit = rule()(
  async (parent, args, context) => {
    const userId = getUserId(context)
    
    try {
      await messagingRateLimiter.consume(userId.toString())
      return true
    } catch (rateLimiterRes) {
      throw new RateLimitError(10, Math.round(rateLimiterRes.msBeforeNext / 1000))
    }
  }
)
```

### Performance Optimizasyonu
- **Database Index**: senderId, receiverId, createdAt, isRead üzerinde
- **Pagination**: Cursor-based pagination ile infinite scroll
- **Caching**: Redis ile conversation cache
- **Connection Pooling**: Prisma connection pool optimizasyonu
- **Query Optimization**: DataLoader ile N+1 problemi çözümü
- [ ] Feature prioritization

Bu plan, sistemi 19 haftada (yaklaşık 4.5 ay) tamamlamak için tasarlandı. Ekip büyüklüğü ve deneyim seviyesine göre süre ayarlanabilir.