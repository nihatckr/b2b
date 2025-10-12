# GraphQL API Dokümantasyonu

## Teknoloji Stack
- **API Tipi**: GraphQL
- **Framework**: Apollo Server + Nexus
- **Authentication**: JWT Bearer Token
- **ORM**: Prisma
- **Database**: MySQL

## GraphQL Endpoint
```
Development: http://localhost:4000/graphql
Production: https://api.tekstil-platform.com/graphql
```

## Authentication

### Login Mutation
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

### Register Mutation
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

## Collection (Ürün) Operations

### 1. Get Collections
```graphql
query GetCollections($input: CollectionsInput) {
  collections(input: $input) {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    category {
      id
      name
    }
    author {
      id
      name
    }
  }
}
```

### 2. Create Collection (Üretici)
```graphql
mutation CreateCollection($input: CreateCollectionInput!) {
  createCollection(input: $input) {
    id
    name
    description
    price
    sku
    stock
    images
    category {
      id
      name
    }
  }
}
```

### 3. Update Collection (Üretici)
```graphql
mutation UpdateCollection($id: Int!, $input: UpdateCollectionInput!) {
  updateCollection(id: $id, input: $input) {
    id
    name
    description
    price
    sku
    stock
  }
}
```

## Sample (Numune) Operations

### 1. Get Sample Requests
```graphql
query GetSamples($input: SamplesInput) {
  samples(input: $input) {
    id
    sampleNumber
    sampleType
    status
    customerNote
    manufacturerResponse
    productionDays
    estimatedProductionDate
    actualProductionDate
    shippingDate
    deliveryAddress
    cargoTrackingNumber
    
    collection {
      id
      name
      price
    }
    customer {
      id
      name
    }
    manufacture {
      id
      name
    }
    productionHistory {
      id
      status
      note
      createdAt
    }
  }
}
```

### 2. Request Sample (Müşteri)
```graphql
mutation RequestSample($input: RequestSampleInput!) {
  requestSample(input: $input) {
    id
    sampleNumber
    status
    customerNote
    collection {
      id
      name
      price
    }
  }
}
```

### 3. Update Sample Status (Üretici)
```graphql
mutation UpdateSampleStatus($id: Int!, $input: UpdateSampleStatusInput!) {
  updateSampleStatus(id: $id, input: $input) {
    id
    status
    manufacturerResponse
    productionDays
    estimatedProductionDate
  }
}
```

## Order (Sipariş) Operations

### 1. Get Orders
```graphql
query GetOrders($input: OrdersInput) {
  orders(input: $input) {
    id
    orderNumber
    quantity
    unitPrice
    totalPrice
    status
    customerNote
    manufacturerResponse
    productionDays
    estimatedProductionDate
    actualProductionStart
    actualProductionEnd
    shippingDate
    deliveryAddress
    cargoTrackingNumber
    
    collection {
      id
      name
      price
    }
    customer {
      id
      name
    }
    manufacture {
      id
      name
    }
    productionHistory {
      id
      status
      note
      createdAt
    }
  }
}
```

### 2. Create Order (Müşteri)
```graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    quantity
    unitPrice
    totalPrice
    status
    collection {
      id
      name
      price
    }
  }
}
```

## Input Types

### RegisterInput
```graphql
input RegisterInput {
  email: String!
  password: String!
  name: String!
  role: Role!
}
```

### CreateCollectionInput (4 Adımlı)
```graphql
input CreateCollectionInput {
  # ADIM 1: Temel Bilgiler
  name: String!
  modelCode: String!        # THS-2024-001
  season: Season!           # SS25, FW25, SS26, FW26
  category: CollectionCategory! # SHIRT, PANTS, KNITWEAR
  gender: Gender!           # WOMEN, MEN, GIRLS, BOYS
  fit: Fit!                # REGULAR, SLIM, RELAXED
  
  # ADIM 2: Renkler ve Bedenler
  colors: String           # JSON: ["beyaz","siyah","yeşil"]
  sizeRange: String        # "S-XL" veya "6-16"
  sizeChartUrl: String     # PDF/Excel dosya URL'si
  
  # ADIM 3: Kumaş ve Teknik
  fabricComposition: String # "%100 Cotton"
  accessories: String      # JSON: ["düğme","fermuar"]
  images: String          # JSON: ["url1","url2"]
  techPackUrl: String     # PDF dosya URL'si
  
  # ADIM 4: Ticari Bilgiler  
  price: Float!
  moq: Int                # Minimum sipariş adedi
  targetPrice: Float      # Hedef fiyat
  leadTimeDays: Int       # Hedef termin (gün)
  notes: String           # Açıklama
  
  # Diğer
  sku: String!
  stock: Int
  description: String
}

enum Season { SS25 FW25 SS26 FW26 }
enum CollectionCategory { SHIRT PANTS KNITWEAR DRESS JACKET TSHIRT }
enum Gender { WOMEN MEN GIRLS BOYS }
enum Fit { REGULAR SLIM RELAXED OVERSIZED }
```

### RequestSampleInput (Gelişmiş)
```graphql
input RequestSampleInput {
  # Temel numune bilgileri
  collectionId: Int            # Mevcut koleksiyon için
  sampleType: SampleType!      # STANDARD, CUSTOM, CRITICAL_URGENT
  
  # Özel numune bilgileri (CUSTOM için)
  collectionName: String       # Koleksiyon adı
  fabric: String              # Kumaş türü
  fabricColor: String         # Kumaş rengi
  category: CollectionCategory # SHIRT, PANTS, etc.
  gender: Gender              # WOMEN, MEN, etc.
  accessories: String         # JSON: ["düğme","fermuar"]
  customDesignImages: String  # JSON: referans görseller
  
  # Beden ve kalıp
  sizeOrPattern: String       # Beden/kalıp bilgisi
  sizeChartUrl: String        # Ölçü tablosu PDF
  
  # Teslimat
  leadTimeDays: Int           # Hedef termin (gün)
  deliveryMethod: DeliveryMethod! # CARGO, SHOWROOM
  deliveryAddress: String!    # Teslimat adresi
  
  # Kritik talepler için
  priorityReason: String      # Öncelik nedeni
  contactEmail: String        # İletişim e-postası
  
  # Genel
  customerNote: String        # Açıklama
  revisionRequests: String    # JSON: revize istekleri
  originalCollectionId: Int   # Revize edilecek orijinal
}

enum SampleType { STANDARD CUSTOM CRITICAL_URGENT }
enum DeliveryMethod { CARGO SHOWROOM }
```

### CreateOrderInput (PO Sistemi)
```graphql
input CreateOrderInput {
  # PO Temel Bilgileri
  collectionId: Int!
  quantity: Int!            # 98 adet gibi
  unitPrice: Float!         # Birim fiyat teklifi: 127
  totalPrice: Float!        # Toplam fiyat
  currency: Currency!       # USD, EUR, TRY, GBP
  
  # Ticari Şartlar
  incoterm: Incoterm        # EXW, FOB, CIF, etc.
  leadTimeProposal: Int     # Hedef termin önerisi (gün)
  deliveryAddress: String!  # Müşteri adresi
  
  # Opsiyonel bilgiler
  customerNote: String      # Not
  attachments: String       # JSON: ["pdf","xlsx"] dosya URL'leri
}

enum Currency { USD EUR TRY GBP }
enum Incoterm { 
  EXW FCA CPT CIP DAP DPU DDP 
  FAS CFR CIF FOB 
}
```

## Production Tracking Operations

### 1. Create Production Tracking
```graphql
mutation CreateProductionTracking($input: CreateProductionTrackingInput!) {
  createProductionTracking(input: $input) {
    id
    startDate
    currentStage
    overallStatus
    planningDays
    fabricDays
    cuttingDays
    sewingDays
    qualityDays
    packagingDays
    shippingDays
  }
}
```

### 2. Update Production Stage
```graphql
mutation UpdateProductionStage($input: UpdateProductionStageInput!) {
  updateProductionStage(input: $input) {
    id
    stage
    status
    actualStartDate
    actualEndDate
    notes
    photos
    isRevision
    extraDays
  }
}
```

### 3. Add Production Revision
```graphql
mutation AddProductionRevision($input: AddProductionRevisionInput!) {
  addProductionRevision(input: $input) {
    id
    oldDeadline
    newDeadline
    revisionReason
    description
    actionTaken
    responsibleDept
    proofDocument
  }
}
```

## Quality Control Operations

### 1. Create Quality Control Test
```graphql
mutation CreateQualityTest($input: CreateQualityTestInput!) {
  createQualityTest(input: $input) {
    id
    testType
    errorRate
    testResult
    inspector
    testDate
    notes
    testReport
  }
}
```

### Production Tracking Input Types
```graphql
input CreateProductionTrackingInput {
  orderId: Int!
  collectionId: Int!
  startDate: DateTime!
  planningDays: Int!
  fabricDays: Int!
  cuttingDays: Int!
  sewingDays: Int!
  qualityDays: Int!
  packagingDays: Int!
  shippingDays: Int!
  sewingWorkshopId: Int
  packagingWorkshopId: Int
}

input UpdateProductionStageInput {
  productionId: Int!
  stage: ProductionStage!
  status: StageStatus!
  actualStartDate: DateTime
  actualEndDate: DateTime
  notes: String
  photos: String           # JSON: ["url1","url2"]
  isRevision: Boolean
  extraDays: Int
}

input AddProductionRevisionInput {
  productionId: Int!
  oldDeadline: DateTime!
  newDeadline: DateTime!
  revisionReason: RevisionReason!
  description: String
  actionTaken: String
  responsibleDept: ResponsibleDept!
  proofDocument: String    # PDF/JPG/PNG URL
}

input CreateQualityTestInput {
  productionId: Int!
  testType: QualityTestType!
  errorRate: Float!        # %5 gibi
  testResult: TestResult!  # PASSED, FAILED, CONDITIONAL_PASS
  inspector: String!       # Kalite uzmanı adı
  testDate: DateTime!
  notes: String
  testReport: String       # PDF/JPG/PNG URL
}

enum ProductionStage { PLANNING FABRIC CUTTING SEWING QUALITY PACKAGING SHIPPING }
enum StageStatus { WAITING IN_PROGRESS COMPLETED DELAYED }
enum RevisionReason { FABRIC_DELAY CAPACITY_ISSUE QUALITY_PROBLEM LOGISTICS_DELAY OTHER }
enum ResponsibleDept { SEWING_WORKSHOP FABRIC_WORKSHOP FABRIC_SUPPLY QUALITY_CONTROL LOGISTICS }
enum QualityTestType { 
  FABRIC_QUALITY SIZE_CHECK COLOR_MATCH SEWING_QUALITY 
  ACCESSORY_CHECK GENERAL_APPEARANCE PACKAGING_CHECK 
}
enum TestResult { PASSED FAILED CONDITIONAL_PASS }

## Product Message Operations

### 1. Send Message
```graphql
mutation SendProductMessage($input: SendProductMessageInput!) {
  sendProductMessage(input: $input) {
    id
    message
    messageType
    attachments
    isRead
    createdAt
    sender { id name }
    receiver { id name }
    collection { id name }
    sample { id sampleNumber }
    order { id orderNumber }
  }
}
```

### 2. Get Messages
```graphql
query GetProductMessages($input: GetProductMessagesInput!) {
  productMessages(input: $input) {
    id
    message
    messageType
    attachments
    isRead
    createdAt
    sender { id name role }
    receiver { id name role }
    collection { id name modelCode }
    sample { id sampleNumber }
    order { id orderNumber }
    parentMessage { id message }
    replies {
      id message createdAt
      sender { name }
    }
  }
}
```

### 3. Mark Messages as Read
```graphql
mutation MarkMessagesAsRead($messageIds: [Int!]!) {
  markMessagesAsRead(messageIds: $messageIds) {
    success
    updatedCount
  }
}
```

### 4. Get Conversation Thread
```graphql
query GetConversationThread($input: GetConversationThreadInput!) {
  conversationThread(input: $input) {
    id
    message
    messageType
    attachments
    createdAt
    sender { id name role }
    receiver { id name role }
    parentMessage { id }
    replies {
      id message createdAt attachments
      sender { name role }
    }
  }
}
```

### Message Input Types
```graphql
input SendProductMessageInput {
  message: String!
  messageType: MessageType!
  receiverId: Int!
  
  # Mesaj konusu (en az biri zorunlu)
  collectionId: Int
  sampleId: Int  
  orderId: Int
  
  # Opsiyonel
  attachments: String      # JSON: ["url1","url2"]
  parentMessageId: Int     # Yanıt için
}

input GetProductMessagesInput {
  # Filtreler (opsiyonel)
  collectionId: Int
  sampleId: Int
  orderId: Int
  senderId: Int
  receiverId: Int
  messageType: MessageType
  isRead: Boolean
  
  # Pagination
  skip: Int
  take: Int
}

input GetConversationThreadInput {
  collectionId: Int
  sampleId: Int
  orderId: Int
  participantIds: [Int!]!  # Konuşmacı ID'leri
}

enum MessageType {
  GENERAL_INQUIRY      # Genel ürün sorgusu
  SAMPLE_QUESTION      # Numune hakkında soru  
  ORDER_QUESTION       # Sipariş hakkında soru
  PRODUCTION_UPDATE    # Üretim güncellemesi
  QUALITY_CONCERN      # Kalite endişesi
  DELIVERY_INQUIRY     # Teslimat sorgusu
  PRICE_NEGOTIATION    # Fiyat müzakeresi
  REVISION_REQUEST     # Revizyon talebi
  URGENT_MESSAGE       # Acil mesaj
}
```
```

## Kapsamlı Error Handling

### GraphQL Error Yapısı
```json
{
  "errors": [
    {
      "message": "Hata açıklaması",
      "extensions": {
        "code": "ERROR_CODE",
        "field": "hatali_alan",
        "details": "Detaylı bilgi"
      },
      "path": ["mutation", "fieldName"]
    }
  ]
}
```

### Authentication & Authorization Errors
```typescript
// UNAUTHENTICATED - Token eksik veya geçersiz
{
  "message": "Giriş yapmalısınız",
  "extensions": { "code": "UNAUTHENTICATED" }
}

// FORBIDDEN - Yetki yok
{
  "message": "Bu işlem için yetkiniz bulunmuyor", 
  "extensions": { "code": "FORBIDDEN", "requiredRole": "MANUFACTURER" }
}

// TOKEN_EXPIRED - Token süresi dolmuş
{
  "message": "Oturum süreniz dolmuş, lütfen tekrar giriş yapın",
  "extensions": { "code": "TOKEN_EXPIRED" }
}
```

### Validation Errors
```typescript
// BAD_USER_INPUT - Geçersiz input
{
  "message": "Email formatı geçersiz",
  "extensions": { 
    "code": "BAD_USER_INPUT", 
    "field": "email",
    "inputValue": "invalid-email"
  }
}

// REQUIRED_FIELD - Zorunlu alan eksik
{
  "message": "Mesaj içeriği boş olamaz",
  "extensions": { 
    "code": "REQUIRED_FIELD", 
    "field": "content" 
  }
}

// INVALID_ENUM - Enum değeri geçersiz
{
  "message": "Geçersiz mesaj türü", 
  "extensions": { 
    "code": "INVALID_ENUM", 
    "field": "messageType",
    "allowedValues": ["TEXT", "IMAGE", "DOCUMENT", "SYSTEM"]
  }
}
```

### Business Logic Errors
```typescript
// UNAUTHORIZED_MESSAGING - Mesajlaşma yetkisi yok
{
  "message": "Bu kullanıcı ile mesajlaşma yetkiniz bulunmuyor",
  "extensions": { 
    "code": "UNAUTHORIZED_MESSAGING",
    "receiverId": 123,
    "reason": "Sadece müşteri-üretici arası mesajlaşma yapılabilir"
  }
}

// RESOURCE_NOT_FOUND - Kaynak bulunamadı
{
  "message": "Belirtilen kullanıcı bulunamadı",
  "extensions": { 
    "code": "RESOURCE_NOT_FOUND", 
    "resourceType": "User",
    "resourceId": 999
  }
}

// DUPLICATE_RESOURCE - Kaynak zaten mevcut
{
  "message": "Bu email adresi zaten kullanılıyor",
  "extensions": { 
    "code": "DUPLICATE_RESOURCE", 
    "field": "email",
    "conflictingValue": "test@example.com"
  }
}
```

### Mesajlaşma Özel Errors
```typescript
// MESSAGE_TOO_LONG - Mesaj çok uzun
{
  "message": "Mesaj 5000 karakteri geçemez",
  "extensions": { 
    "code": "MESSAGE_TOO_LONG", 
    "currentLength": 5200,
    "maxLength": 5000
  }
}

// RATE_LIMIT_EXCEEDED - Rate limit aşımı
{
  "message": "Çok fazla mesaj gönderiyorsunuz, lütfen bekleyin",
  "extensions": { 
    "code": "RATE_LIMIT_EXCEEDED", 
    "retryAfter": 60,
    "currentCount": 15,
    "maxPerMinute": 10
  }
}

// CONVERSATION_NOT_FOUND - Konuşma bulunamadı
{
  "message": "Bu kullanıcı ile henüz bir konuşmanız bulunmuyor",
  "extensions": { 
    "code": "CONVERSATION_NOT_FOUND", 
    "participantId": 456
  }
}

// INVALID_MESSAGE_CONTEXT - Geçersiz mesaj bağlamı
{
  "message": "Bu numune/sipariş size ait değil",
  "extensions": { 
    "code": "INVALID_MESSAGE_CONTEXT", 
    "contextType": "sample",
    "contextId": 123
  }
}
```

### Database & System Errors
```typescript
// DATABASE_ERROR - Veritabanı hatası
{
  "message": "Veritabanı bağlantı hatası",
  "extensions": { "code": "DATABASE_ERROR" }
}

// INTERNAL_SERVER_ERROR - Sunucu hatası
{
  "message": "Beklenmeyen bir hata oluştu",
  "extensions": { "code": "INTERNAL_SERVER_ERROR" }
}

// SERVICE_UNAVAILABLE - Servis kullanılamaz
{
  "message": "Mesajlaşma servisi geçici olarak kullanılamıyor",
  "extensions": { "code": "SERVICE_UNAVAILABLE" }
}
```

### File Upload Errors
```typescript
// FILE_TOO_LARGE - Dosya çok büyük
{
  "message": "Dosya boyutu 10MB'ı geçemez",
  "extensions": { 
    "code": "FILE_TOO_LARGE", 
    "fileSize": "15MB",
    "maxSize": "10MB"
  }
}

// UNSUPPORTED_FILE_TYPE - Desteklenmeyen dosya türü
{
  "message": "Sadece JPG, PNG, PDF dosyaları yüklenebilir",
  "extensions": { 
    "code": "UNSUPPORTED_FILE_TYPE", 
    "fileType": "exe",
    "allowedTypes": ["jpg", "png", "pdf"]
  }
}
```

---

## Mesajlaşma API'leri

### 1. Mesaj Gönder
```graphql
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    messageType
    isRead
    createdAt
    sender {
      id
      name
      role
    }
    receiver {
      id
      name
      role
    }
    relatedSampleId
    relatedOrderId
    relatedCollectionId
  }
}

input SendMessageInput {
  content: String!          # Max 5000 karakter
  messageType: MessageType = TEXT
  receiverId: Int!          # Alıcı kullanıcı ID'si
  relatedSampleId: Int     # Opsiyonel: Hangi numune hakkında
  relatedOrderId: Int      # Opsiyonel: Hangi sipariş hakkında
  relatedCollectionId: Int # Opsiyonel: Hangi ürün hakkında
}

enum MessageType {
  TEXT      # Düz metin mesajı
  IMAGE     # Görsel mesajı (URL content'te)
  DOCUMENT  # Belge eki (URL content'te)  
  SYSTEM    # Sistem mesajı (sadece backend)
}
```

**Olası Hatalar:**
- `UNAUTHENTICATED`: Token eksik/geçersiz
- `UNAUTHORIZED_MESSAGING`: Müşteri-üretici dışı mesajlaşma
- `RESOURCE_NOT_FOUND`: receiverId bulunamadı
- `INVALID_MESSAGE_CONTEXT`: relatedSample/Order size ait değil
- `MESSAGE_TOO_LONG`: content > 5000 karakter
- `RATE_LIMIT_EXCEEDED`: Dakikada 10+ mesaj
- `REQUIRED_FIELD`: content boş

### 2. Mesajları Listele (Konuşma)
```graphql
query GetConversation($input: GetConversationInput!) {
  conversation(input: $input) {
    id
    content
    messageType
    isRead
    createdAt
    sender {
      id
      name
      role
    }
    receiver {
      id
      name
      role
    }
    relatedSample {
      id
      sampleNumber
    }
    relatedOrder {
      id
      orderNumber
    }
    relatedCollection {
      id
      name
    }
  }
}

input GetConversationInput {
  participantId: Int!       # Konuştuğun kişinin ID'si
  relatedSampleId: Int     # Filtreleme: Belirli numune hakkında
  relatedOrderId: Int      # Filtreleme: Belirli sipariş hakkında  
  relatedCollectionId: Int # Filtreleme: Belirli ürün hakkında
  skip: Int = 0            # Pagination başlangıç
  take: Int = 50           # Pagination limit (max 100)
}
```

**Olası Hatalar:**
- `UNAUTHENTICATED`: Token eksik/geçersiz
- `RESOURCE_NOT_FOUND`: participantId bulunamadı
- `UNAUTHORIZED_MESSAGING`: Konuşma yetkisi yok
- `CONVERSATION_NOT_FOUND`: Bu kişiyle konuşma yok
- `BAD_USER_INPUT`: take > 100
- `INVALID_MESSAGE_CONTEXT`: Context item'a erişim yok

### 3. Okunmamış Mesajları Al
```graphql
query GetUnreadMessages($skip: Int, $take: Int) {
  unreadMessages(skip: $skip, take: $take) {
    id
    content
    messageType
    createdAt
    sender {
      id
      name
      role
    }
    relatedSample {
      id
      sampleNumber
    }
    relatedOrder {
      id
      orderNumber
    }
    relatedCollection {
      id
      name
    }
  }
}
```

**Query Parametreleri:**
- `skip`: Pagination başlangıç (default: 0)
- `take`: Limit (default: 50, max: 100)

**Olası Hatalar:**
- `UNAUTHENTICATED`: Token eksik/geçersiz
- `BAD_USER_INPUT`: take > 100 veya skip < 0

### 4. Mesajları Okundu Olarak İşaretle
```graphql
mutation MarkMessagesAsRead($messageIds: [Int!]!) {
  markMessagesAsRead(messageIds: $messageIds) {
    success
    updatedCount
    errors {
      messageId
      error
    }
  }
}

type MarkAsReadResponse {
  success: Boolean!
  updatedCount: Int!
  errors: [MarkAsReadError!]!
}

type MarkAsReadError {
  messageId: Int!
  error: String!
}
```

**Olası Hatalar:**
- `UNAUTHENTICATED`: Token eksik/geçersiz
- `BAD_USER_INPUT`: messageIds boş array
- `FORBIDDEN`: Mesaj size ait değil (receiver değilsiniz)
- `RESOURCE_NOT_FOUND`: Bazı mesaj ID'leri bulunamadı

### 5. Konuşma Listesi (Hangi kişilerle mesajlaşıyor)
```graphql
query GetConversationsList($skip: Int, $take: Int) {
  conversationsList(skip: $skip, take: $take) {
    participant {
      id
      name
      role
    }
    lastMessage {
      id
      content
      messageType
      isRead
      createdAt
    }
    unreadCount
    totalMessageCount
    contexts {
      sampleId
      sampleNumber
      orderId  
      orderNumber
      collectionId
      collectionName
    }
  }
}

type ConversationSummary {
  participant: User!
  lastMessage: Message
  unreadCount: Int!
  totalMessageCount: Int!
  contexts: [MessageContext!]!
}

type MessageContext {
  sampleId: Int
  sampleNumber: String
  orderId: Int
  orderNumber: String
  collectionId: Int
  collectionName: String
}
```

**Olası Hatalar:**
- `UNAUTHENTICATED`: Token eksik/geçersiz
- `BAD_USER_INPUT`: take > 100 veya skip < 0

### Mesajlaşma Kuralları
- **Müşteri**: Sadece üreticilerle mesajlaşabilir
- **Üretici**: Sadece müşterilerle mesajlaşabilir
- **Konuya özel mesajlaşma**: Mesajlar belirli ürün, numune veya sipariş ile ilişkilendirilebilir
- **Otomatik bildirimler**: Sistem önemli durumları otomatik mesaj olarak gönderir
- **Dosya ekleri**: IMAGE ve DOCUMENT tipli mesajlarda dosya URL'leri content alanında saklanır

---

## Authorization Header
```
Authorization: Bearer YOUR_JWT_TOKEN
```