# 🏭 Tekstil Üretim Yönetim Sistemi

> **B2B Tekstil Üretim ve Sipariş Yönetim Platformu**

[![Status](https://img.shields.io/badge/status-production--ready-success)](https://github.com/nihatckr/fullstack)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![Apollo Server](https://img.shields.io/badge/Apollo%20Server-5.0.0-311C87)](https://www.apollographql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-Private-red)](LICENSE)

---

## 📋 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Özellikler](#-temel-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Dökümantasyon](#-dökümantasyon)
- [Proje Yapısı](#-proje-yapısı)

---

## 🎯 Genel Bakış

Bu sistem, tekstil üreticileri ve alıcıları arasında **tam döngülü üretim yönetimi** sağlayan modern bir B2B platformudur. Koleksiyon yönetiminden kalite kontrole kadar tüm üretim sürecini dijitalleştirir.

### Temel Kullanım Senaryoları

```
Üretici → Koleksiyon Oluştur → Numune İsteği Al → Üretim → Kalite Kontrol → Teslimat
                                       ↓
Müşteri → Katalog Görüntüle → Numune Talep Et → Sipariş Ver → Takip Et
```

---

## ✨ Temel Özellikler

### 👔 Koleksiyon Yönetimi
- 4 adımlı detaylı ürün oluşturma
- Sezon, cinsiyet, fit, trend yönetimi
- Çoklu renk ve beden seçenekleri
- Tech pack ve ölçü tablosu yükleme
- Kategori bazlı organizasyon

### 🎨 Sample (Numune) Süreci
- Dijital numune talebi
- Onay/red sistemi
- 7 aşamalı üretim takibi
- Real-time durum güncellemeleri
- Revizyon yönetimi

### 📦 Sipariş Yönetimi
- Sample onayı sonrası sipariş
- Fiyat ve miktar yönetimi
- Üretim planlaması
- Teslimat takibi
- Fatura ve dökümantasyon

### 🏭 7 Aşamalı Üretim Takibi
1. **Planlama** - Üretim şeması
2. **Kumaş** - Tedarik ve hazırlık
3. **Kesim** - Kalıp ve kesim
4. **Dikim** - Montaj
5. **Kalite** - 7 test türü
6. **Paketleme** - Hazırlık
7. **Kargo** - Teslimat

### ✅ Kalite Kontrol Sistemi
- 7 standart test türü
- Kumaş, ölçü, renk, dikiş kontrolleri
- Fotoğraflı raporlama
- Pass/Fail sistemi
- Revizyon takibi

### 📚 Kütüphane Yönetimi
- Renk kütüphanesi
- Kumaş veritabanı
- Beden grupları
- Sezon yönetimi
- Fit (kalıp) tanımları
- Sertifikalar (GOTS, OEKO-TEX, vb.)

### 📊 Reusable Data Table Component (🆕)
- **Generic TypeScript support** - Type-safe table for any data type
- **Sortable columns** - Automatic sorting for dates, numbers, and strings
- **Flexible column definitions** - Custom cell renderers and styling
- **Performance optimized** - useMemo for efficient re-renders
- **Clean API** - Simple props interface
- **Documentation included** - Full usage guide and examples
- **Multiple use cases** - Samples, orders, collections, production tracking

```typescript
// Simple usage example
<SimpleDataTable<Sample>
  data={filteredSamples}
  columns={columns}
  getRowKey={(sample) => sample.id}
  defaultSortField="createdAt"
  defaultSortDirection="desc"
/>
```
📖 **Usage Guide**: See [SIMPLE_DATATABLE_USAGE.md](./SIMPLE_DATATABLE_USAGE.md)

### 💬 İletişim & İşbirliği
- Mesajlaşma sistemi
- Koleksiyon Q&A
- Ürün değerlendirmeleri
- Bildirimler
- Favoriler

### 👥 Çok Kullanıcılı Yönetim
- 6 farklı kullanıcı rolü
- Şirket bazlı yetkilendirme
- Departman ve pozisyon yönetimi
- Granular permission sistemi
- Team collaboration

---

## 🛠️ Teknoloji Stack

### Frontend
```typescript
Framework       : Next.js 15.5.4 (App Router)
Language        : TypeScript
UI Library      : React 19.1.0
Styling         : Tailwind CSS 3.4.18
Components      : Radix UI + Shadcn UI
GraphQL Client  : URQL 4.1.0
Forms           : React Hook Form + Zod
State           : Context API + URQL Cache
```

### Backend
```typescript
Runtime         : Node.js
Framework       : Express.js 5.1.0
GraphQL         : Apollo Server 5.0.0
Schema          : Nexus (Code-first)
Database        : MySQL
ORM             : Prisma 6.17.1
Authentication  : JWT
Authorization   : graphql-shield 7.6.5
File Upload     : Multer 2.0.2
```

### Database Models (11)
```
User, Company, Category, Collection, Sample, Order,
ProductionTracking, QualityControl, Message,
+ Library Models (Color, Fabric, SizeGroup, etc.)
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8.0+
- npm veya yarn

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/nihatckr/fullstack.git
cd fullstack
```

### 2. Backend Kurulumu
```bash
cd server

# Bağımlılıkları yükle
npm install

# Environment variables
cp .env.example .env
# .env dosyasını düzenleyin (DATABASE_URL, JWT_SECRET, vb.)

# Database migration
npx prisma migrate dev

# Seed data (opsiyonel)
npm run seed

# Sunucuyu başlat
npm run dev
# Backend: http://localhost:4000
# GraphQL Playground: http://localhost:4000/graphql
```

### 3. Frontend Kurulumu
```bash
cd ../client

# Bağımlılıkları yükle
npm install

# Environment variables
cp .env.example .env.local
# NEXT_PUBLIC_GRAPHQL_ENDPOINT ayarını yapın

# Development server
npm run dev
# Frontend: http://localhost:3000
```

---

## 📱 Kullanım

### Demo Hesapları

```typescript
// Admin
Email: admin@demo.com
Password: demo123

// Üretici (Manufacturer)
Email: manufacturer@demo.com
Password: demo123

// Müşteri (Customer)
Email: customer@demo.com
Password: demo123
```

### Temel İş Akışı

1. **Üretici olarak login olun**
2. Koleksiyon oluşturun (Collections → Add Collection)
3. Kategorileri ve library'yi doldurun
4. Numune isteklerini yönetin

5. **Müşteri olarak login olun**
6. Koleksiyonları görüntüleyin
7. Numune talep edin
8. Onaylandıktan sonra sipariş verin
9. Üretim sürecini takip edin

---

## 📚 Dökümantasyon

### Ana Dökümanlar
- **[CURRENT_FEATURES_REPORT.md](./CURRENT_FEATURES_REPORT.md)** - Tüm özellikler detaylı liste
- **[DETAILED_PROJECT_ANALYSIS.md](./DETAILED_PROJECT_ANALYSIS.md)** - Proje mimarisi ve analiz
- **[FINAL_CLEANUP_REPORT.md](./FINAL_CLEANUP_REPORT.md)** - Code cleanup raporu
- **[UNUSED_FILES_REPORT.md](./UNUSED_FILES_REPORT.md)** - Kullanılmayan dosyalar
- **[SIMPLE_DATATABLE_USAGE.md](./SIMPLE_DATATABLE_USAGE.md)** - 🆕 SimpleDataTable kullanım rehberi

### Component Dökümanları
- **[DataTable/README.md](./client/src/components/DataTable/README.md)** - 🆕 SimpleDataTable API referansı

### Döküman Klasörü (`/docs`)
- **[README.md](./docs/README.md)** - Proje özeti
- **[QUICK-START.md](./docs/QUICK-START.md)** - Hızlı başlangıç rehberi
- **[01-manufacturer-flow-UPDATED.md](./docs/01-manufacturer-flow-UPDATED.md)** - Üretici iş akışı
- **[02-customer-flow-UPDATED.md](./docs/02-customer-flow-UPDATED.md)** - Müşteri iş akışı
- **[03-system-workflow-UPDATED.md](./docs/03-system-workflow-UPDATED.md)** - Sistem süreçleri
- **[04-database-schema-UPDATED.md](./docs/04-database-schema-UPDATED.md)** - Database yapısı
- **[05-api-endpoints-UPDATED.md](./docs/05-api-endpoints-UPDATED.md)** - GraphQL API
- **[06-user-interface-UPDATED.md](./docs/06-user-interface-UPDATED.md)** - UI/UX
- **[07-implementation-guide-UPDATED.md](./docs/07-implementation-guide-UPDATED.md)** - Implementation

---

## 📁 Proje Yapısı

```
fullstack/
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── (auth)/       # Auth pages (login, signup)
│   │   │   ├── (protected)/  # Protected pages
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx              # Dashboard
│   │   │   │   │   ├── collections/          # Koleksiyonlar
│   │   │   │   │   ├── samples/              # Numuneler
│   │   │   │   │   ├── orders/               # Siparişler
│   │   │   │   │   ├── production/           # Üretim takibi
│   │   │   │   │   ├── quality/              # Kalite kontrol
│   │   │   │   │   ├── categories/           # Kategoriler
│   │   │   │   │   ├── library/              # Kütüphane
│   │   │   │   │   ├── messages/             # Mesajlar
│   │   │   │   │   └── settings/             # Ayarlar
│   │   │   │   └── admin/                    # Admin panel
│   │   │   └── layout.tsx
│   │   ├── components/       # React Components
│   │   │   ├── Auth/         # Authentication
│   │   │   ├── Collection/   # Koleksiyon components
│   │   │   ├── Dashboard/    # Dashboard components
│   │   │   ├── DataTable/    # 🆕 Reusable data table components
│   │   │   │   ├── SimpleDataTable.tsx  # Generic sortable table
│   │   │   │   ├── DataTable.tsx        # Complex table with DnD
│   │   │   │   └── README.md            # Usage documentation
│   │   │   ├── Production/   # Production tracking
│   │   │   ├── QualityControl/
│   │   │   ├── Navigation/
│   │   │   └── ui/           # Shadcn UI components
│   │   ├── lib/
│   │   │   └── graphql/      # GraphQL queries & mutations
│   │   ├── context/          # React Context
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   ├── public/               # Static files
│   └── package.json
│
├── server/                   # Express + GraphQL Backend
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   ├── src/
│   │   ├── mutations/        # GraphQL Mutations
│   │   │   ├── Mutation.ts   # Main mutations
│   │   │   ├── userResolver.ts
│   │   │   ├── collectionResolver.ts
│   │   │   ├── sampleResolver.ts
│   │   │   ├── orderResolver.ts
│   │   │   ├── productionResolver.ts
│   │   │   └── ...
│   │   ├── query/            # GraphQL Queries
│   │   │   ├── Query.ts      # Main queries
│   │   │   └── ...
│   │   ├── types/            # Nexus Types
│   │   ├── permission/       # Authorization
│   │   ├── utils/            # Utilities
│   │   ├── context.ts        # GraphQL Context
│   │   ├── schema.ts         # Nexus Schema
│   │   └── server.ts         # Express + Apollo Server
│   ├── uploads/              # File uploads
│   └── package.json
│
├── docs/                     # Documentation
│   ├── README.md
│   ├── QUICK-START.md
│   └── 01-07-UPDATED.md files
│
├── CURRENT_FEATURES_REPORT.md    # Tüm özellikler listesi
├── DETAILED_PROJECT_ANALYSIS.md  # Proje analizi
├── FINAL_CLEANUP_REPORT.md       # Cleanup raporu
├── UNUSED_FILES_REPORT.md        # Unused files
└── README.md                      # Bu dosya
```

---

## 🎯 Kullanıcı Rolleri

### 1. ADMIN (Platform Yöneticisi)
- Tüm sistem erişimi
- Kullanıcı ve şirket yönetimi
- Global istatistikler
- Sistem ayarları

### 2. COMPANY_OWNER (Şirket Sahibi)
- Şirket yönetimi
- Çalışan ekleme/çıkarma
- Tüm koleksiyon işlemleri
- Üretim ve kalite yönetimi

### 3. COMPANY_EMPLOYEE (Şirket Çalışanı)
- Atanan görevler
- Permission bazlı erişim
- Departman özellikleri

### 4. MANUFACTURE (Üretici - Legacy)
- Koleksiyon oluşturma
- Sample/Order yönetimi
- Üretim takibi

### 5. CUSTOMER / INDIVIDUAL_CUSTOMER (Müşteri)
- Katalog görüntüleme
- Sample talebi
- Sipariş oluşturma
- Üretim takibi (read-only)

---

## 📊 İstatistikler

```
✨ Özellikler          : 100+ feature
📄 Sayfalar            : 30+ pages
🔄 GraphQL Operations  : 100+ query/mutation
🎭 Kullanıcı Rolü      : 6 roles
🏭 Üretim Aşaması      : 7 stages
✅ Kalite Testi        : 7 test types
📦 Database Modeli     : 11 models
🎨 UI Components       : 150+ components
```

---

## 🔐 Güvenlik

- JWT tabanlı authentication
- Role-based authorization (graphql-shield)
- Password hashing (bcrypt)
- Input validation (Zod)
- SQL injection koruması (Prisma)
- XSS koruması
- CORS yapılandırması

---

## 🚀 Deployment

### Backend (Server)
```bash
# Production build
npm run build

# Start production server
npm start

# Environment variables
DATABASE_URL=mysql://...
JWT_SECRET=your-secret-key
PORT=4000
NODE_ENV=production
```

### Frontend (Client)
```bash
# Production build
npm run build

# Start production
npm start

# Environment variables
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.yourdomain.com/graphql
```

### Database Migration
```bash
cd server
npx prisma migrate deploy
```

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# E2E tests
npm run test:e2e
```

---

## 📝 Lisans

Bu proje özel lisans altındadır. Tüm hakları saklıdır.

---

## 👥 İletişim

**Proje Sahibi:** Nihat Çakır
**Email:** nihat@example.com
**GitHub:** [@nihatckr](https://github.com/nihatckr)

---

## 🙏 Teşekkürler

Bu projeyi geliştirmede kullanılan teknolojilere ve açık kaynak topluluğuna teşekkürler.

- [Next.js](https://nextjs.org/)
- [Apollo Server](https://www.apollographql.com/)
- [Prisma](https://www.prisma.io/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**⭐ Projeyi beğendiyseniz star vermeyi unutmayın!**

**Son Güncelleme:** 15 Ekim 2025
**Versiyon:** 1.0.0 (Production Ready)
**Durum:** ✅ Aktif Geliştirme
