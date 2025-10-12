# 🔄 Sistem İş Akışı ve Süreçler - Güncel Sistem (Ekim 2025)

## 🚀 Sistem Mimarisi Özeti

### ✅ Aktif Sistem Bileşenleri

- **GraphQL API**: Apollo Server + Nexus (Modüler)
- **Database**: MySQL + Prisma ORM (11 model)
- **Authentication**: JWT Bearer Token + Permissions
- **Real-time**: Message system (Subscription ready)
- **Production**: 7-stage tracking system
- **Quality**: Automated QC system
- **Workshop**: Assignment and management

### 🏗️ Modüler GraphQL Yapısı

```
/server/src/graphql/
├── schema.ts          # Ana schema assembly
├── enums/             # Business, Production, Textile, Common enums
├── types/             # Core, Business, Production, Communication types
├── resolvers/         # Mutations & Queries
├── inputs/            # Input type definitions
└── generated/         # Auto-generated Nexus types
```

---

## 1. 🔐 Authentication & Authorization Flow

### JWT Token System (✅ AKTIF)

```mermaid
sequenceDiagram
    Client->>API: signup/login mutation
    API->>Database: User validation
    Database->>API: User data
    API->>JWT: Generate token
    JWT->>API: Signed token
    API->>Client: { token, user }
    Client->>API: Request with Bearer token
    API->>Middleware: Token verification
    Middleware->>API: User context
    API->>Client: Authorized response
```

### Permission Levels

- **PUBLIC**: signup, login
- **AUTHENTICATED**: Basic user operations
- **ADMIN**: allUsers, system management
- **MANUFACTURE**: Production updates, workshop management
- **CUSTOMER**: Sample requests, order creation

---

## 2. 💬 Messaging System Flow (✅ AKTIF)

### Context-Based Communication

```mermaid
graph TD
    A[User] --> B[Send Message]
    B --> C{Context Type}
    C -->|General| D[General Message]
    C -->|Sample| E[Sample Message]
    C -->|Order| F[Order Message]

    E --> G[Sample Thread]
    F --> H[Order Thread]
    D --> I[General Thread]

    G --> J[Production Updates]
    H --> K[Order Updates]

    J --> L[Auto Notifications]
    K --> L
```

### Message Flow Process

```
1. sendMessage Mutation
   ├── Receiver validation
   ├── Context assignment (sample/order)
   ├── Message type validation
   └── Database insertion

2. Message Delivery
   ├── Real-time notification (subscription)
   ├── Unread count increment
   └── Context linking

3. Message Reading
   ├── markMessageAsRead mutation
   ├── Timestamp recording
   └── Unread count decrement
```

### Supported Message Types

- **TEXT**: Standard communication
- **IMAGE**: Visual references, progress photos
- **DOCUMENT**: Technical specs, contracts
- **VOICE_NOTE**: Audio messages (planned)

---

## 3. 🧪 Sample Management Flow

### Complete Sample Lifecycle (Database Ready)

```mermaid
stateDiagram-v2
    [*] --> REQUESTED : Customer creates sample request
    REQUESTED --> RECEIVED : Manufacturer acknowledges
    RECEIVED --> IN_DESIGN : Design process starts
    IN_DESIGN --> PATTERN_READY : Pattern completed
    PATTERN_READY --> IN_PRODUCTION : Production starts
    IN_PRODUCTION --> QUALITY_CHECK : QC testing
    QUALITY_CHECK --> COMPLETED : QC passed
    QUALITY_CHECK --> IN_PRODUCTION : QC failed/revision
    COMPLETED --> SHIPPED : Shipping arranged
    SHIPPED --> [*] : Customer receives

    RECEIVED --> REJECTED : Manufacturer rejects
    REJECTED --> [*] : Process ends
```

### Sample-Production Integration

```
Sample Request → ProductionTracking Creation
ProductionTracking → 7 Stage Updates
Each Stage → ProductionStageUpdate records
Quality Stage → QualityControl records
Issues → ProductionRevision records
```

### Sample Messaging Flow

```
Sample Creation → Context-based message thread
Status Changes → Auto-notification messages
Customer Questions → Sample-linked messages
Production Updates → Progress messages
Quality Results → QC report messages
```

---

## 4. 🛍️ Order Management Flow

### Complete Order Lifecycle (Database Ready)

```mermaid
stateDiagram-v2
    [*] --> PENDING : Customer creates order
    PENDING --> REVIEWED : Manufacturer reviews
    REVIEWED --> QUOTE_SENT : Price quote sent
    QUOTE_SENT --> CONFIRMED : Customer accepts
    QUOTE_SENT --> REJECTED : Customer/Manufacturer rejects
    CONFIRMED --> IN_PRODUCTION : Production starts
    IN_PRODUCTION --> PRODUCTION_COMPLETE : Production finished
    PRODUCTION_COMPLETE --> QUALITY_CHECK : Final QC
    QUALITY_CHECK --> SHIPPED : QC passed
    QUALITY_CHECK --> IN_PRODUCTION : QC failed
    SHIPPED --> DELIVERED : Customer receives
    DELIVERED --> [*] : Order completed

    PENDING --> CANCELLED : Order cancelled
    REVIEWED --> CANCELLED : Cancelled during review
    REJECTED --> [*] : Process ends
    CANCELLED --> [*] : Process ends
```

### Order-Production Integration

```
Order Confirmation → ProductionTracking Creation
Production Stages → Real-time order updates
Quality Control → Order quality validation
Shipping Stage → Delivery coordination
Completion → Order status finalization
```

---

## 5. 🏭 Production Tracking System (✅ AKTIF)

### 7-Stage Production Flow

```mermaid
graph LR
    A[PLANNING] --> B[FABRIC]
    B --> C[CUTTING]
    C --> D[SEWING]
    D --> E[QUALITY]
    E --> F[PACKAGING]
    F --> G[SHIPPING]

    A --> A1[Resource Planning<br/>5 days default]
    B --> B1[Material Sourcing<br/>2 days default]
    C --> C1[Cutting Process<br/>5 days default]
    D --> D1[Workshop Assignment<br/>Variable days]
    E --> E1[Quality Testing<br/>Variable days]
    F --> F1[Workshop Assignment<br/>Variable days]
    G --> G1[Shipping Prep<br/>Variable days]
```

### Production Stage Update Process

```
1. updateProductionStage Mutation
   ├── Stage validation
   ├── Status update (NOT_STARTED/IN_PROGRESS/ON_HOLD/COMPLETED/REQUIRES_REVISION)
   ├── Timeline adjustment
   ├── Photo/notes addition
   └── Auto-notification trigger

2. Workshop Assignment
   ├── SEWING stage → Workshop selection
   ├── PACKAGING stage → Workshop selection
   ├── Capacity validation
   └── Assignment recording

3. Quality Integration
   ├── QUALITY stage → QualityControl creation
   ├── Test execution
   ├── Result recording
   └── Pass/fail workflow
```

### Stage Status Management

- **NOT_STARTED**: Aşama henüz başlanmadı
- **IN_PROGRESS**: Aktif çalışma durumda
- **ON_HOLD**: Geçici durdurulmuş
- **COMPLETED**: Başarıyla tamamlandı
- **REQUIRES_REVISION**: Revizyon gerekiyor

### Overall Production Status

- **IN_PROGRESS**: Normal ilerleme
- **WAITING**: Bekleme durumunda
- **BLOCKED**: Engellenmiş
- **COMPLETED**: Tamamen tamamlandı
- **CANCELLED**: İptal edildi

---

## 6. 🔍 Quality Control System (✅ AKTIF)

### Quality Control Workflow

```mermaid
graph TD
    A[Production QUALITY Stage] --> B[QualityControl Creation]
    B --> C[Inspector Assignment]
    C --> D[Quality Testing]
    D --> E{Test Results}

    E -->|Pass| F[PASSED Status]
    E -->|Fail| G[FAILED Status]
    E -->|Conditional| H[CONDITIONAL_PASS Status]

    F --> I[Production Continues]
    G --> J[Revision Required]
    H --> K[Customer Decision]

    J --> L[ProductionRevision Creation]
    K --> I
    K --> J
```

### Quality Check Categories

1. **Fabric Defects**: Kumaş kalite kontrolü
2. **Sewing Defects**: Dikiş kalite kontrolü
3. **Measure Defects**: Ölçü doğruluk kontrolü
4. **Finishing Defects**: Finishing kalite kontrolü

### Quality Scoring System

- **Score Range**: 1-100 puan sistemi
- **Photo Documentation**: Hata görüntüleri (JSON array)
- **Inspector Notes**: Detaylı açıklamalar
- **Result Determination**: Otomatik karar mekanizması

---

## 7. 🏗️ Workshop Management System (✅ AKTIF)

### Workshop Assignment Flow

```mermaid
graph TD
    A[Production Stage] --> B{Stage Type}
    B -->|SEWING| C[Sewing Workshop Required]
    B -->|PACKAGING| D[Packaging Workshop Required]
    B -->|Other| E[No Workshop Assignment]

    C --> F[Available Sewing Workshops]
    D --> G[Available Packaging Workshops]

    F --> H[Capacity Check]
    G --> I[Capacity Check]

    H --> J[Workshop Assignment]
    I --> J

    J --> K[Production Tracking Update]
```

### Workshop Types & Capabilities

- **SEWING**: Dikim işlemleri
- **PACKAGING**: Paketleme işlemleri
- **QUALITY_CONTROL**: Kalite kontrol
- **GENERAL**: Genel işlemler

### Workshop Capacity Management

- **Daily Capacity**: Günlük işlem kapasitesi
- **Current Load**: Mevcut iş yükü
- **Assignment Logic**: Otomatik atama algoritması
- **Performance Tracking**: Performans metrikleri

---

## 8. 🔄 Revision Management System (✅ AKTIF)

### Revision Workflow

```mermaid
graph TD
    A[Production Issue] --> B[Revision Request]
    B --> C[Impact Analysis]
    C --> D[Cost Calculation]
    C --> E[Time Calculation]

    D --> F[Revision Record]
    E --> F

    F --> G{Approval Required?}
    G -->|Yes| H[Approval Process]
    G -->|No| I[Auto-Approve]

    H --> J{Approved?}
    J -->|Yes| K[Timeline Update]
    J -->|No| L[Revision Rejected]
    I --> K

    K --> M[Customer Notification]
    L --> N[Issue Resolution Required]
```

### Revision Types & Causes

- **Material Delay**: Hammadde gecikmesi
- **Capacity Issue**: Kapasite problemi
- **Quality Problem**: Kalite sorunu
- **Customer Request**: Müşteri değişiklik talebi
- **Technical Issue**: Teknik problem

### Impact Calculation

- **Extra Days**: Ek süre hesaplama
- **Extra Cost**: Ek maliyet hesaplama
- **Timeline Adjustment**: Tüm tarihlerin güncellenmesi
- **Stakeholder Notification**: Otomatik bildirimler

---

## 9. 🔔 Notification & Communication Flow

### Automated Notifications (Planned)

```mermaid
graph TD
    A[System Event] --> B{Event Type}

    B -->|Stage Complete| C[Stage Completion Notification]
    B -->|Quality Result| D[Quality Result Notification]
    B -->|Revision Created| E[Revision Alert]
    B -->|Message Received| F[Message Notification]
    B -->|Order Status| G[Order Update Notification]

    C --> H[Real-time Subscription]
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I[Client Update]
```

### Notification Channels (Planned)

- **In-App**: Real-time dashboard updates
- **Email**: Important status changes
- **SMS**: Critical alerts
- **Push**: Mobile notifications

---

## 10. 📊 Data Flow & Relationships

### Core Entity Relationships

```mermaid
erDiagram
    User ||--o{ Collection : creates
    User ||--o{ Sample : requests
    User ||--o{ Order : places
    User ||--o{ Message : sends
    User ||--o{ Workshop : owns

    Collection ||--o{ Sample : belongs_to
    Sample ||--o{ ProductionTracking : has
    Order ||--o{ ProductionTracking : has

    ProductionTracking ||--o{ ProductionStageUpdate : has
    ProductionTracking ||--o{ ProductionRevision : has
    ProductionTracking ||--o{ QualityControl : has
    ProductionTracking }o--|| Workshop : assigned_to_sewing
    ProductionTracking }o--|| Workshop : assigned_to_packaging

    Sample ||--o{ Message : related_to
    Order ||--o{ Message : related_to
```

### API Data Flow

```
Frontend Request → GraphQL Resolver → Prisma Client → MySQL Database
Database Response → Prisma Client → Resolver Logic → GraphQL Response
Real-time Events → Subscription System → Client Updates
```

---

## 11. 🎯 System Integration Points

### Current Active Integrations

- **Prisma ORM**: Database abstraction layer
- **GraphQL Nexus**: Schema generation and type safety
- **JWT Authentication**: Secure token-based auth
- **Permission System**: Role-based access control

### Planned Integrations

- **File Upload**: AWS S3 / Local storage
- **Email Service**: SMTP / SendGrid integration
- **SMS Service**: Twilio integration
- **Push Notifications**: Firebase / OneSignal
- **Real-time Updates**: GraphQL Subscriptions

---

## 12. 📈 Performance & Scalability

### Current Performance Metrics

- **Database**: Optimized Prisma queries
- **API**: GraphQL query optimization
- **Authentication**: JWT token validation
- **Real-time**: Message delivery system

### Scalability Considerations

- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching Strategy**: Redis integration (planned)
- **Load Balancing**: Horizontal scaling (planned)

---

## 🎯 System Development Status

### ✅ Completed Systems

- **Authentication Flow**: JWT + permissions
- **Messaging System**: Context-based communication
- **Production Tracking**: 7-stage system
- **Quality Control**: Automated QC process
- **Workshop Management**: Assignment system
- **Revision Tracking**: Impact analysis
- **Database Schema**: 11 models operational

### ⏳ In Development

- **CRUD APIs**: Collection, Sample, Order management
- **File Upload**: Media handling system
- **Frontend Integration**: React.js interface
- **Real-time Subscriptions**: Live updates

### 🔮 Planned Features

- **Advanced Analytics**: Performance metrics
- **AI Integration**: Predictive scheduling
- **Mobile App**: Native/PWA application
- **Third-party Integrations**: ERP/CRM systems

Bu dokümantasyon **mevcut aktif sistem**in complete workflow'unu tanımlamakta ve tüm süreçler test edilebilir durumdadır. 🚀
