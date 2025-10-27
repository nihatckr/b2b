# 🏭 ProtexFlow - B2B Textile Production Management System

> Modern, full-stack B2B textile production and order management platform built with Next.js 15, GraphQL, and Prisma.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black)](https://nextjs.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-Yoga-e535ab)](https://the-guild.dev/graphql/yoga-server)
[![Prisma](https://img.shields.io/badge/Prisma-6.2.1-2D3748)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)

[![Status](https://img.shields.io/badge/status-production--ready-success)](https://github.com/nihatckr/fullstack)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)

---

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black)](https://nextjs.org/)[![Status](https://img.shields.io/badge/status-production--ready-success)](https://github.com/nihatckr/fullstack)

## 📋 Table of Contents

## 🎯 Overview

- [Overview](#-overview)

- [Features](#-features)[![GraphQL](https://img.shields.io/badge/GraphQL-Yoga-e535ab)](https://the-guild.dev/graphql/yoga-server)[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)

- [Tech Stack](#-tech-stack)

- [Quick Start](#-quick-start)**ProtexFlow** connects textile manufacturers with customers, enabling seamless order management, production tracking, quality control, and real-time collaboration.

- [Project Structure](#-project-structure)

- [Documentation](#-documentation)[![Prisma](https://img.shields.io/badge/Prisma-6.2.1-2D3748)](https://www.prisma.io/)[![Apollo Server](https://img.shields.io/badge/Apollo%20Server-5.0.0-311C87)](https://www.apollographql.com/)

- [Development Workflow](#-development-workflow)

- [Contributing](#-contributing)### Key Features

---[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748)](https://www.prisma.io/)

## 🎯 Overview- 🔐 JWT Authentication with auto-refresh (7-day tokens, 12-hour rotation)

**ProtexFlow** connects textile manufacturers with customers, enabling seamless order management, production tracking, quality control, and real-time collaboration.- 👥 Role-Based Access Control (5 roles, 40+ permissions)[![License](https://img.shields.io/badge/license-Private-red)](LICENSE)

### Key Capabilities- 📦 Complete order lifecycle management

- 🔐 **Multi-Role System**: Admin, Company Owner, Employee, Customer roles with granular permissions- 🏭 7-stage production tracking with quality control---

- 🔔 **Real-Time Updates**: WebSocket-based notifications and subscriptions

- 🏭 **Production Management**: Complete 7-stage workflow from order to delivery- 🔔 Real-time WebSocket notifications

- ✅ **Quality Control**: Stage-by-stage quality checks with photo reporting

- 📦 **Order Management**: Digital order processing with sample approval- 💼 Company & employee management---

- 🎨 **Sample Library**: Digital catalog with AI-ready infrastructure

- 📊 **Dynamic Task System**: Automated task creation based on status changes- 📊 Dashboard analytics per role

- 🎯 **Reusable Architecture**: Custom hooks and utilities for rapid development

## 📋 Table of Contents

---

## 🚀 Quick Start

## ✨ Features

## 📋 İçindekiler

### 👔 Collection Management

### Prerequisites

- Multi-step product creation (category, season, fit, trends)

- Multiple color and size options- [Overview](#-overview)

- Tech pack and measurement chart uploads

- Category-based organization- Node.js 18+

### 🎨 Sample (Numune) Process- MySQL 8+- [Features](#-features)- [Genel Bakış](#-genel-bakış)

- Digital sample requests- npm

- Approval/rejection system

- 7-stage production tracking- [Tech Stack](#-tech-stack)- [Özellikler](#-temel-özellikler)

- Real-time status updates

- Revision management### Installation

### 📦 Order Management- [Getting Started](#-getting-started)- [Teknoloji Stack](#-teknoloji-stack)

- Sample approval → Order conversion```bash

- Price and quantity management

- Production planning# Clone repo- [Project Structure](#-project-structure)- [Dynamic Task System](#-dynamic-task-system-yeni)

- Delivery tracking

- Invoice and documentationgit clone https://github.com/nihatckr/fullstack.git

### 🏭 7-Stage Production Trackingcd fullstack- [Documentation](#-documentation)- [Kurulum](#-kurulum)

1. **Planning** - Production schema

2. **Fabric** - Sourcing and preparation

3. **Cutting** - Pattern and cutting# Backend setup- [Development Workflow](#-development-workflow)- [Kullanım](#-kullanım)

4. **Sewing** - Assembly

5. **Quality** - 7 test typescd backend

6. **Packaging** - Preparation

7. **Shipping** - Deliverynpm install- [Dökümantasyon](#-dökümantasyon)

### ✅ Quality Control Systemcp .env.example .env # Edit with your config

- 7 standard test typesnpx prisma generate---- [Proje Yapısı](#-proje-yapısı)

- Fabric, measurement, color, stitch controls

- Photo-based reportingnpx prisma migrate dev

- Pass/Fail system

- Revision trackingnpx prisma db seed

### 📚 Library Management

- Color library# Start backend (Terminal 1)## 🎯 Overview---

- Fabric database

- Size groupsnpm run dev # http://localhost:4001

- Season management

- Fit (pattern) definitions

- Certificates (GOTS, OEKO-TEX, etc.)

# Frontend setup (Terminal 2)

### 🎯 Dynamic Task System

cd ../frontend**ProtexFlow** is a comprehensive B2B platform that connects textile manufacturers with customers, enabling seamless order management, production tracking, quality control, and real-time collaboration.## 🎯 Genel Bakış

- **Status-based task creation** - Auto-create tasks on status changes

- **28 SampleStatus mappings** - Custom tasks for each statusnpm install

- **15 OrderStatus mappings** - Order workflow automation

- **7 Production stage tasks** - Production phase trackingcp .env.example .env.local # Edit with your config

- **Role-specific tasks** - Different tasks for customers and manufacturers

- **Auto-completion** - Auto-complete old TODO tasks

- **Deadline tracking** - Deadline warnings and priorities

# Start frontend### Key CapabilitiesBu sistem, tekstil üreticileri ve alıcıları arasında **tam döngülü üretim yönetimi** sağlayan modern bir B2B platformudur. Koleksiyon yönetiminden kalite kontrole kadar tüm üretim sürecini dijitalleştirir.

### 👥 Multi-User Management

npm run dev # http://localhost:3000

- 6 different user roles

- Company-based authorization```

- Department and position management

- Granular permission system### Test Accounts- 🔐 **Multi-Role System**: Admin, Company Owner, Company Employee, Individual Customer### Temel Kullanım Senaryoları

- Team collaboration

`````- 🔔 **Real-Time Updates**: WebSocket-based notifications and subscriptions

---

Admin:        admin@protexflow.com / Admin123!

## 🛠 Tech Stack

Manufacturer: owner@textile.com / Owner123!- 🏭 **Production Management**: Complete workflow from order to delivery with 7-stage tracking```

### Frontend

Customer:     owner@fashionretail.com / Customer123!

| Category          | Technology                   | Version |

| ----------------- | ---------------------------- | ------- |```- ✅ **Quality Control**: Stage-by-stage quality checks and approvalsÜretici → Koleksiyon Oluştur → Numune İsteği Al → Üretim → Kalite Kontrol → Teslimat

| **Framework**     | Next.js (App Router)         | 15.5.4  |

| **Language**      | TypeScript                   | 5.7.3   |

| **UI Library**    | React                        | 19.1.0  |

| **Styling**       | Tailwind CSS                 | 3.4.18  |## 📚 Documentation- 📦 **Order Management**: Digital order processing with sample approval flow                                       ↓

| **Components**    | Radix UI + Shadcn UI         | Latest  |

| **GraphQL Client**| URQL                         | 4.1.0   |

| **Code Generation**| GraphQL Codegen             | 5.0.0   |

| **Forms**         | React Hook Form + Zod        | Latest  |### Core Docs- 🎨 **Sample Library**: Digital sample catalog with AI-ready infrastructureMüşteri → Katalog Görüntüle → Numune Talep Et → Sipariş Ver → Takip Et

| **Auth**          | NextAuth.js                  | 4.24.11 |



### Backend

- **[ARCHITECTURE](./docs/ARCHITECTURE.md)** - System design & architecture- 🔒 **Granular Permissions**: 40+ individual permissions across 7 resource categories```

| Category          | Technology                   | Version |

| ----------------- | ---------------------------- | ------- |- **[API](./docs/API.md)** - GraphQL API reference

| **Runtime**       | Node.js                      | 18+     |

| **Framework**     | Express.js                   | 5.1.0   |- **[DATABASE](./docs/DATABASE.md)** - Database schema & ERD

| **GraphQL Server**| GraphQL Yoga                 | 5.10.6  |

| **Schema Builder**| Pothos GraphQL               | 4.3.0   |- **[AUTHENTICATION](./docs/AUTHENTICATION.md)** - Auth & security

| **Database**      | MySQL                        | 8.0+    |

| **ORM**           | Prisma                       | 6.17.1  |- **[RBAC](./docs/RBAC.md)** - Roles & permissions------

| **Authentication**| JWT                          | -       |

| **Authorization** | GraphQL Shield               | -       |

| **File Upload**   | Multer                       | 2.0.2   |

### Feature Guides

### Key Features



- **Relay Global IDs**: Pothos uses Base64 encoded Global Object Identification

- **Code-First GraphQL**: Type-safe schema with Pothos- **[Orders](./docs/FEATURES/ORDERS.md)** - Order management flow## ✨ Features## ✨ Temel Özellikler

- **Real-Time**: GraphQL Subscriptions via WebSockets

- **Type Safety**: End-to-end TypeScript with GraphQL Codegen- **[Production](./docs/FEATURES/PRODUCTION.md)** - Production tracking



---- **[Quality Control](./docs/FEATURES/QUALITY.md)** - QC process



## 🚀 Quick Start- **[Notifications](./docs/FEATURES/NOTIFICATIONS.md)** - Real-time system



### Prerequisites- **[Companies](./docs/FEATURES/COMPANIES.md)** - Company management### 🔐 Authentication & Authorization### 👔 Koleksiyon Yönetimi



- Node.js 18+

- MySQL 8+

- npm or yarn### Developer Guides- 4 adımlı detaylı ürün oluşturma



### 1. Clone Repository



```bash- **[Getting Started](./docs/GUIDES/GETTING_STARTED.md)** - Setup guide**JWT-Based Security (7-day tokens)**- Sezon, cinsiyet, fit, trend yönetimi

git clone https://github.com/nihatckr/fullstack.git

cd fullstack- **[Adding Features](./docs/GUIDES/NEW_FEATURES.md)** - Development workflow

```

- **[Best Practices](./docs/GUIDES/BEST_PRACTICES.md)** - Code standards- Automatic token refresh every 12 hours- Çoklu renk ve beden seçenekleri

### 2. Backend Setup

- **[Deployment](./docs/GUIDES/DEPLOYMENT.md)** - Production deployment

```bash

cd server- Session management with NextAuth.js v4- Tech pack ve ölçü tablosu yükleme



# Install dependencies## 🛠 Tech Stack

npm install

- 4-layer security architecture:- Kategori bazlı organizasyon

# Configure environment

cp .env.example .env**Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, URQL, NextAuth.js

# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

  1. **Middleware** - Route protection & role-based access

# Setup database

npx prisma generate**Backend**: Node.js, Express, GraphQL Yoga, Pothos, Prisma, MySQL, JWT

npx prisma migrate dev

npm run seed  2. **Component** - UI-level permission checks### 🎨 Sample (Numune) Süreci



# Start server**Real-Time**: WebSocket (graphql-ws), GraphQL Subscriptions

npm run dev

# Backend: http://localhost:4000  3. **GraphQL Shield** - API authorization layer- Dijital numune talebi

# GraphQL Playground: http://localhost:4000/graphql

```## 📁 Project Structure



### 3. Frontend Setup  4. **Resolver** - Business logic validation- Onay/red sistemi



```bash````

cd ../frontend

fullstack/- 7 aşamalı üretim takibi

# Install dependencies

npm install├── backend/ # GraphQL API server



# Configure environment│ ├── prisma/ # Database schema & migrations**Role-Based Access Control (RBAC)**- Real-time durum güncellemeleri

cp .env.example .env.local

# Edit .env.local with your settings│ ├── src/



# Start development server│ │ ├── graphql/ # Types, queries, mutations, subscriptions- 5 role types: `ADMIN`, `COMPANY_OWNER`, `COMPANY_EMPLOYEE`, `INDIVIDUAL_CUSTOMER`- Revizyon yönetimi

npm run dev

# Frontend: http://localhost:3000│ │ ├── permission/ # GraphQL Shield rules

```

│ │ └── server.ts- 6 department types: `PURCHASING`, `PRODUCTION`, `QUALITY`, `DESIGN`, `SALES`, `MANAGEMENT`

### 4. Demo Accounts

│ └── uploads/ # File storage

After running `npm run seed`:

│- 3 company types: `MANUFACTURER`, `BUYER`, `BOTH`### 📦 Sipariş Yönetimi

```typescript

// Admin (Full Access)├── frontend/ # Next.js app

Email: admin@demo.com

Password: demo123│ ├── src/- JSON-based granular permissions stored per user- Sample onayı sonrası sipariş



// Manufacturer│ │ ├── app/ # App router pages

Email: manufacturer@demo.com

Password: demo123│ │ ├── components/ # React components- Fiyat ve miktar yönetimi



// Customer│ │ ├── lib/ # Utils (auth, urql, dal)

Email: customer@demo.com

Password: demo123│ │ ├── hooks/ # Custom hooks### 📦 Order & Production Management- Üretim planlaması

```

│ │ ├── graphql/ # Operations

---

│ │ └── middleware.ts- Teslimat takibi

## 📁 Project Structure

│ └── public/

```

fullstack/│**7-Stage Production Workflow**- Fatura ve dökümantasyon

├── frontend/                    # Next.js Frontend

│   ├── src/└── docs/ # Documentation

│   │   ├── app/                # App Router pages

│   │   ├── components/         # React components    ├── FEATURES/   # Feature-specific guides1. **Planning** - Production planning and scheduling

│   │   ├── hooks/             # Custom hooks (useRelayIds, useOptimisticMutation)

│   │   ├── lib/               # Utilities (URQL, auth, user-utils)    └── GUIDES/     # Development guides

│   │   ├── graphql/           # GraphQL operations (.graphql files)

│   │   └── middleware.ts      # Route protection````2. **Fabric** - Material sourcing and preparation### 🏭 7 Aşamalı Üretim Takibi

│   └── codegen.ts             # GraphQL Codegen config

│

├── server/                      # Express + GraphQL Backend

│   ├── prisma/## 🔧 Development3. **Cutting** - Pattern and cutting operations1. **Planlama** - Üretim şeması

│   │   ├── schema.prisma      # Database schema

│   │   └── seed.ts           # Seed data

│   ├── src/

│   │   ├── graphql/          # Pothos schema, types, resolvers### Backend Commands4. **Sewing** - Assembly and manufacturing2. **Kumaş** - Tedarik ve hazırlık

│   │   ├── utils/            # Utilities (DynamicTaskHelper)

│   │   └── server.ts         # Server entry point

│   └── uploads/              # File storage

│```bash5. **Quality** - 7-point quality inspection3. **Kesim** - Kalıp ve kesim

├── docs/                       # Documentation

│   ├── ARCHITECTURE.mdnpm run dev           # Start dev server

│   ├── DATABASE.md

│   ├── FEATURES/npx prisma studio     # Open Prisma Studio6. **Packaging** - Preparation for delivery4. **Dikim** - Montaj

│   └── GUIDES/

│npx prisma generate   # Generate client

├── DEVELOPMENT_GUIDE.md        # Development workflow

├── BACKEND_DEVELOPMENT.md      # Backend guidenpx prisma migrate dev # Create migration7. **Shipping** - Logistics and delivery5. **Kalite** - 7 test türü

├── FRONTEND_DEVELOPMENT.md     # Frontend guide

└── README.md                   # This file````

```

6. **Paketleme** - Hazırlık

For detailed structure, see **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

### Frontend Commands

---

**Sample & Order Flow**7. **Kargo** - Teslimat

## 📚 Documentation

````bash

### 🚀 Start Here

npm run dev          # Start dev server```

| Document | Description |

|----------|-------------|npm run codegen      # Generate GraphQL types

| **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** | Complete development workflow |

| **[BACKEND_DEVELOPMENT.md](./BACKEND_DEVELOPMENT.md)** | Backend development with Pothos + Prisma |npm run lint         # Run linterCustomer Request → Sample Creation → Quote Sent → Approval → Order Placed → Production → Delivery### ✅ Kalite Kontrol Sistemi

| **[FRONTEND_DEVELOPMENT.md](./FRONTEND_DEVELOPMENT.md)** | Frontend development with Next.js + URQL |

| **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** | Detailed folder structure |````



### Architecture & Design````- 7 standart test türü



- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture### After Schema Changes

- **[docs/DATABASE.md](./docs/DATABASE.md)** - Database schema

- **[docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)** - Auth & JWT- Kumaş, ölçü, renk, dikiş kontrolleri

- **[docs/RBAC.md](./docs/RBAC.md)** - Permissions

```bash

### Features

# Backend**Quality Control System**- Fotoğraflı raporlama

- **[backend/USER_MANAGEMENT_API.md](./backend/USER_MANAGEMENT_API.md)** - User management

- **[DYNAMIC_TASK_SYSTEM_COMPLETED.md](./DYNAMIC_TASK_SYSTEM_COMPLETED.md)** - Dynamic taskscd backend

- **[docs/FEATURES/NOTIFICATIONS.md](./docs/FEATURES/NOTIFICATIONS.md)** - Real-time notifications

npx prisma generate- 7 standard test types- Pass/Fail sistemi

### Development

npx prisma migrate dev --name your_change

- **[docs/GUIDES/NEW_FEATURES.md](./docs/GUIDES/NEW_FEATURES.md)** - Add new features

- **[frontend/URQL_USAGE_GUIDE.md](./frontend/URQL_USAGE_GUIDE.md)** - URQL client- Fabric, measurement, color, and stitch controls- Revizyon takibi

- **[frontend/src/hooks/README.md](./frontend/src/hooks/README.md)** - Reusable hooks

# Frontend

---

cd frontend- Photo-based reporting

## 🔧 Development Workflow

npm run codegen

### Backend Flow

```- Pass/Fail system with revision tracking### 📚 Kütüphane Yönetimi

```

Prisma Schema → Generate → Migration → GraphQL Types → Resolvers → Test

```

## 🎯 System Status- Renk kütüphanesi

### Frontend Flow



```

GraphQL Operations (.graphql) → Codegen → Import Hooks → Build UI → Test### ✅ Production Ready### 🔔 Real-Time Notifications- Kumaş veritabanı

```



### After Schema Changes

- Authentication & Authorization (4-layer security)- Beden grupları

```bash

# Backend- User & Company Management

cd server

npx prisma generate- Order Management (full lifecycle)- WebSocket subscriptions for instant updates- Sezon yönetimi

npx prisma migrate dev

npm run dev- Production Tracking (7 stages)



# Frontend- Quality Control System- In-app notification center- Fit (kalıp) tanımları

cd frontend

npm run codegen- Real-Time Notifications

npm run dev

```- Image Upload System- Email notifications (configurable)- Sertifikalar (GOTS, OEKO-TEX, vb.)



See **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** for complete workflow.- Token Auto-Refresh



---- User preferences per notification type



## 📊 Project Stats### 🚧 In Progress



```- Auto-mark as read functionality### 🎯 Dynamic Task System (🆕)

✨ Features:           100+ features

📄 Pages:              30+ pages- Email Notifications (90%)

🔄 GraphQL Operations: 100+ queries/mutations/subscriptions

🎭 User Roles:         6 roles with granular permissions- Advanced Search & Filters- **Status-based task creation** - Sample/Order status değişikliklerinde otomatik görev oluşturma

🗄️ Database Models:    20+ models

🎨 UI Components:      150+ components- Export Features (PDF/Excel)

⚡ Dynamic Tasks:      700+ lines automation

```### 💼 Company Management- **28 SampleStatus mappings** - Her durum için özel görev tanımları



---### 📋 Planned



## 🎯 Completed Features- **15 OrderStatus mappings** - Sipariş workflow otomasyonu



- ✅ JWT Authentication with auto-refresh- Multi-language Support (i18n)

- ✅ Role-Based Access Control (RBAC)

- ✅ Order & Sample Management- AI Integration- Company profiles (Manufacturer/Buyer/Both types)- **7 Production stage tasks** - Üretim aşaması takibi

- ✅ 7-Stage Production Tracking

- ✅ Quality Control System- Mobile App (React Native)

- ✅ Real-Time Notifications

- ✅ Dynamic Task System- Admin Analytics Dashboard- Logo and cover image upload with optimization- **Role-specific tasks** - Müşteri ve üretici için ayrı görevler

- ✅ Admin User Management

- ✅ Reusable Hooks & Utilities

- ✅ Type-Safe End-to-End

## 📊 Stats- Employee management with role assignments- **Auto-completion** - Eski görevleri otomatik tamamlama

---



## 🔒 Security

- **50+** Features- Department structure- **Deadline tracking** - Son tarih uyarıları

- JWT tokens (7-day expiry, 12-hour refresh)

- Password hashing (bcryptjs)- **30+** Pages

- GraphQL Shield authorization

- Input validation (Zod)- **100+** GraphQL Operations- Permission management per employee- **Rich metadata** - JSON actionData ile detaylı bilgi

- SQL injection protection (Prisma)

- CORS configuration- **5** User Roles



---- **40+** Granular Permissions- **700+ lines DynamicTaskHelper** - Merkezi görev yönetimi



## 🚀 Deployment- **20+** Database Models



### Backend- **150+** React Components### 📊 Advanced Features



```bash

cd server

npm run build## 🔒 Security```typescript

npm start

```



### Frontend- JWT with 7-day expiry & 12-hour auto-refresh- **Image Upload System**: Optimized image storage with Sharp// Otomatik görev oluşturma örneği



```bash- Password hashing (bcryptjs)

cd frontend

npm run build- GraphQL Shield authorization- **Revision System**: Track design changes and revisionsconst dynamicTaskHelper = new DynamicTaskHelper(prisma);

npm start

```- Input validation (Zod)



### Database- SQL injection protection (Prisma)- **Message System**: Direct communication between partiesawait dynamicTaskHelper.createTasksForSampleStatus(



```bash- XSS protection (React)

cd server

npx prisma migrate deploy- CORS configuration- **Library Management**: Centralized color, fabric, size, and season libraries  sample.id,

```

- Rate limiting on login

---

- **Dashboard Analytics**: Role-based dashboard views  'QUOTE_SENT',  // Yeni status

## 🤝 Contributing

## 📄 License

1. Fork the repository

2. Create feature branch (`git checkout -b feature/AmazingFeature`)  customerId,

3. Read development guides

4. Commit changes (`git commit -m 'Add AmazingFeature'`)Proprietary software. All rights reserved.

5. Push to branch (`git push origin feature/AmazingFeature`)

6. Open Pull Request---  manufacturerId



---## 👤 Author



## 📄 License);



Proprietary software. All rights reserved.**Nihat Çakar** - [@nihatckr](https://github.com/nihatckr)



**Copyright © 2025 Nihat Çakar**## 🛠 Tech Stack// ✅ Müşteriye: "Teklif Geldi - İncele" görevi



------



## 👤 Author// ✅ Üreticiye: "Müşteri Yanıtı Bekleniyor" görevi



**Nihat Çakar****⭐ Star if you find this helpful!**

- GitHub: [@nihatckr](https://github.com/nihatckr)

### Frontend (`/frontend`)```

---

**Version**: 2.0.0 | **Updated**: October 20, 2025 | **Status**: Production Ready

## 🙏 Acknowledgments



- [Next.js](https://nextjs.org/)

- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)| Category | Technology | Version |📖 **Full Documentation**: See [DYNAMIC_TASK_SYSTEM_COMPLETED.md](./DYNAMIC_TASK_SYSTEM_COMPLETED.md)

- [Pothos GraphQL](https://pothos-graphql.dev/)

- [Prisma](https://www.prisma.io/)|----------|-----------|---------|

- [URQL](https://formidable.com/open-source/urql/)

- [Shadcn UI](https://ui.shadcn.com/)| **Framework** | Next.js (App Router) | 15.1.3 |### 📊 Reusable Data Table Component



---| **Language** | TypeScript | 5.7.3 |- **Generic TypeScript support** - Type-safe table for any data type



<div align="center">| **UI Library** | React | 19.0.0 |- **Sortable columns** - Automatic sorting for dates, numbers, and strings



**⭐ Star this repo if you find it helpful!**| **Styling** | TailwindCSS + shadcn/ui | 3.4.17 |- **Flexible column definitions** - Custom cell renderers and styling



**Version:** 3.0.0 | **Updated:** October 20, 2025 | **Status:** Production Ready| **GraphQL Client** | URQL | 4.1.0 |- **Performance optimized** - useMemo for efficient re-renders



[Documentation](./docs/) • [Issues](https://github.com/nihatckr/fullstack/issues)| **State Management** | URQL Cache + React Context | - |- **Clean API** - Simple props interface



</div>| **Forms** | React Hook Form + Zod | 7.54.2 |


| **Auth** | NextAuth.js | 4.24.11 |```typescript

| **Real-Time** | WebSocket Subscriptions | graphql-ws |// Simple usage example

<SimpleDataTable<Sample>

### Backend (`/backend`)  data={filteredSamples}

  columns={columns}

| Category | Technology | Version |  getRowKey={(sample) => sample.id}

|----------|-----------|---------|  defaultSortField="createdAt"

| **Runtime** | Node.js | 18+ |  defaultSortDirection="desc"

| **Server** | Express.js | 4.21.2 |/>

| **GraphQL** | GraphQL Yoga | 5.10.6 |```

| **Schema Builder** | Pothos GraphQL | 4.3.0 |

| **Database** | MySQL | 8.0+ |### 💬 İletişim & İşbirliği

| **ORM** | Prisma | 6.2.1 |- Mesajlaşma sistemi

| **Authentication** | JWT | jsonwebtoken |- Koleksiyon Q&A

| **Authorization** | GraphQL Shield | - |- Ürün değerlendirmeleri

| **File Upload** | Multer | 1.4.5 |- Bildirimler

| **Image Processing** | Sharp | 0.33.5 |- Favoriler



### Database Schema### 👥 Çok Kullanıcılı Yönetim

- 6 farklı kullanıcı rolü

**Core Models**: `User`, `Company`, `Category`, `Collection`, `Sample`, `Order`- Şirket bazlı yetkilendirme

- Departman ve pozisyon yönetimi

**Production**: `ProductionTracking`, `QualityControl`, `Task`, `ProductionStage`- Granular permission sistemi

- Team collaboration

**Communication**: `Message`, `Notification`, `SampleQuestion`, `CompanyReview`

---

**Library**: `Color`, `Fabric`, `SizeGroup`, `Season`, `Fit`, `Certificate`

## 🛠️ Teknoloji Stack

---

### Frontend

## 🚀 Getting Started```typescript

Framework       : Next.js 15.5.4 (App Router)

### PrerequisitesLanguage        : TypeScript

UI Library      : React 19.1.0

- **Node.js** 18+ (LTS recommended)Styling         : Tailwind CSS 3.4.18

- **MySQL** 8.0+Components      : Radix UI + Shadcn UI

- **npm** or **yarn**GraphQL Client  : URQL 4.1.0

Forms           : React Hook Form + Zod

### Installation StepsState           : Context API + URQL Cache

`````

#### 1. Clone Repository

### Backend

`bash`typescript

git clone https://github.com/nihatckr/fullstack.gitRuntime : Node.js

cd fullstackFramework : Express.js 5.1.0

````GraphQL : Nexus GraphQL (Code-first)

Schema Tools    : Nexus + graphql-scalars

#### 2. Backend SetupDatabase        : MySQL

ORM             : Prisma 6.17.1

```bashAuthentication  : JWT

cd backendFile Upload     : Multer 2.0.2

npm install```

````

### Database Models (20+)

Create `.env` file:```

Core: User, Company, Category, Collection, Sample, Order

```envProduction: ProductionTracking, QualityControl, Task

# DatabaseLibrary: Color, Fabric, SizeGroup, Season, Fit, Certificate

DATABASE_URL="mysql://username:password@localhost:3306/protexflow"Communication: Message, Notification, SampleQuestion

```

# JWT

JWT_SECRET="your-super-secret-jwt-key-min-32-characters"### Key Enums

````typescript

# ServerSampleStatus    : 28 values (PENDING → DELIVERED)

PORT=4001OrderStatus     : 15 values (PENDING → COMPLETED)

NODE_ENV=developmentTaskType        : 15 values (STATUS_CHANGE, QUOTATION, etc.)

ProductionStage : 7 values (PLANNING → SHIPPING)

# CORS```

CORS_ORIGIN="http://localhost:3000"

```---



Setup database:## 🎯 Dynamic Task System (Yeni)



```bash### Mimari Yapı

# Generate Prisma Client

npx prisma generate```typescript

// 700+ satırlık merkezi task yönetimi

# Run migrationsDynamicTaskHelper

npx prisma migrate dev├── SAMPLE_STATUS_TASK_MAP (28 status)

├── ORDER_STATUS_TASK_MAP (15 status)

# Seed database (optional - creates test users)└── PRODUCTION_STAGE_TASK_MAP (7 stage)

npx prisma db seed

```// Her status için otomatik görev oluşturma

Status Change → DynamicTaskHelper → Dual Task Creation

Start server:                                   ├── Customer Task

                                   └── Manufacturer Task

```bash```

npm run dev

# Backend: http://localhost:4001### Özellikler

# GraphQL Playground: http://localhost:4001/graphql

```**1. Status-Based Automation**

- Sample status değiştiğinde otomatik görev

#### 3. Frontend Setup- Order status değiştiğinde otomatik görev

- Production stage değiştiğinde otomatik görev

```bash

cd ../frontend**2. Role-Specific Tasks**

npm install- Müşteri görevleri (inceleme, onay, ödeme)

```- Üretici görevleri (teklif, üretim, teslimat)

- Öncelik ve deadline yönetimi

Create `.env.local` file:

**3. Task Metadata**

```env```typescript

# NextAuthTask {

NEXTAUTH_URL="http://localhost:3000"  relatedStatus   : "QUOTE_SENT"     // Tetikleyen status

NEXTAUTH_SECRET="your-nextauth-secret-min-32-characters"  targetStatus    : "QUOTE_APPROVED"  // Hedef status

  entityType      : "SAMPLE"          // Varlık tipi

# GraphQL API  productionStage : "FABRIC"          // Üretim aşaması

NEXT_PUBLIC_GRAPHQL_URL="http://localhost:4001/graphql"  actionData      : JSON              // Özel metadata

}

# GitHub OAuth (optional)```

GITHUB_ID="your-github-oauth-id"

GITHUB_SECRET="your-github-oauth-secret"**4. Auto-Completion**

```- Yeni görev oluşturulduğunda eski TODO görevleri otomatik tamamlanır

- Status geçişi otomatik doğrulama

Start development server:

**5. Deadline Management**

```bash- Her görev tipi için özel süre (3-14 gün)

npm run dev- Deadline Warning görevleri

# Frontend: http://localhost:3000- Öncelik bazlı sıralama (HIGH, MEDIUM, LOW)

````

### Kullanım Örnekleri

### Test Accounts

````typescript

After running `npx prisma db seed`:// Sample teklif gönderildiğinde

Status: QUOTE_SENT

```typescript→ Müşteri: "✅ Teklif Geldi - İncele ve Yanıtla" (3 gün)

// Admin (Full Access)→ Üretici: "⏳ Müşteri Yanıtı Bekleniyor" (5 gün)

Email: admin@protexflow.com

Password: Admin123!// Müşteri teklifi onayladığında

Status: QUOTE_APPROVED

// Manufacturer Owner→ Müşteri: "✅ Teklifin Onaylandı - Sipariş Aşamasına Geç"

Email: owner@textile.com→ Üretici: "🎉 Teklif Onaylandı - Sipariş Bekliyor"

Password: Owner123!

// Üretim başladığında

// Customer Owner  Stage: FABRIC

Email: owner@fashionretail.com→ Üretici: "🧵 Kumaş Aşaması - Tedarik ve Hazırlık"

Password: Customer123!→ Müşteri: "📢 Bilgilendirme: Kumaş aşamasında"

````

---📖 **Detaylı Döküman**: [DYNAMIC_TASK_SYSTEM_COMPLETED.md](./DYNAMIC_TASK_SYSTEM_COMPLETED.md)

## 📁 Project Structure---

````## 🚀 Kurulum

fullstack/

├── backend/                    # GraphQL API Server (ACTIVE)### Gereksinimler

│   ├── prisma/- Node.js 18+

│   │   ├── schema.prisma      # Database schema- MySQL 8.0+

│   │   ├── seed.ts            # Database seeding- npm veya yarn

│   │   └── migrations/        # Migration history

│   ├── src/### 1. Repository'yi Klonlayın

│   │   ├── graphql/```bash

│   │   │   ├── types/         # Pothos type definitionsgit clone https://github.com/nihatckr/fullstack.git

│   │   │   ├── queries/       # Query resolverscd fullstack

│   │   │   ├── mutations/     # Mutation resolvers```

│   │   │   └── subscriptions/ # Real-time subscriptions

│   │   ├── permission/        # GraphQL Shield rules### 2. Backend Kurulumu

│   │   ├── utils/             # Helper functions```bash

│   │   │   └── permissions.ts # Permission utilitiescd server

│   │   └── server.ts          # Server entry point

│   ├── uploads/               # File uploads storage# Bağımlılıkları yükle

│   └── package.jsonnpm install

│

├── frontend/                  # Next.js Application (ACTIVE)# Environment variables

│   ├── src/cp .env.example .env

│   │   ├── app/              # Next.js 15 App Router# .env dosyasını düzenleyin (DATABASE_URL, JWT_SECRET, vb.)

│   │   │   ├── (auth)/       # Authentication pages

│   │   │   │   ├── login/# Database migration

│   │   │   │   └── signup/npx prisma migrate dev

│   │   │   ├── (dashboard)/  # Protected routes

│   │   │   │   ├── dashboard/# Seed data (opsiyonel)

│   │   │   │   ├── collections/npm run seed

│   │   │   │   ├── samples/

│   │   │   │   ├── orders/# Sunucuyu başlat

│   │   │   │   ├── production/npm run dev

│   │   │   │   ├── quality-control/# Backend: http://localhost:4000

│   │   │   │   ├── messages/# GraphQL Playground: http://localhost:4000/graphql

│   │   │   │   ├── notifications/```

│   │   │   │   └── settings/

│   │   │   └── layout.tsx### 3. Frontend Kurulumu

│   │   ├── components/       # React components```bash

│   │   │   ├── ui/          # shadcn/ui base componentscd ../client

│   │   │   ├── providers/   # Context providers

│   │   │   ├── layout/      # Layout components# Bağımlılıkları yükle

│   │   │   └── ...npm install

│   │   ├── lib/             # Core utilities

│   │   │   ├── auth.ts      # NextAuth config# Environment variables

│   │   │   ├── urql-client.ts # GraphQL clientcp .env.example .env.local

│   │   │   ├── dal.ts       # Data Access Layer# NEXT_PUBLIC_GRAPHQL_ENDPOINT ayarını yapın

│   │   │   └── permissions.ts

│   │   ├── hooks/           # Custom React hooks# Development server

│   │   │   └── usePermissions.tsnpm run dev

│   │   ├── graphql/         # GraphQL operations# Frontend: http://localhost:3000

│   │   │   ├── auth.graphql```

│   │   │   ├── user.graphql

│   │   │   └── ...---

│   │   └── middleware.ts    # Route protection

│   ├── public/              # Static assets## 📱 Kullanım

│   └── package.json

│### Demo Hesapları

├── docs/                     # Documentation Hub

│   ├── ARCHITECTURE.md      # System architecture```typescript

│   ├── API.md               # GraphQL API reference// Admin

│   ├── DATABASE.md          # Database schemaEmail: admin@demo.com

│   ├── AUTHENTICATION.md    # Auth & securityPassword: demo123

│   ├── RBAC.md              # Role-based access

│   ├── FEATURES/            # Feature guides// Üretici (Manufacturer)

│   └── GUIDES/              # Development guidesEmail: manufacturer@demo.com

│Password: demo123

└── README.md                # This file

```// Müşteri (Customer)

Email: customer@demo.com

---Password: demo123

````

## 📚 Documentation

### Temel İş Akışı

### Essential Docs

1. **Üretici olarak login olun**

| Document | Description |2. Koleksiyon oluşturun (Collections → Add Collection)

|----------|-------------|3. Kategorileri ve library'yi doldurun

| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | System architecture, design patterns, and tech decisions |4. Numune isteklerini yönetin

| **[API.md](./docs/API.md)** | Complete GraphQL API reference with examples |

| **[DATABASE.md](./docs/DATABASE.md)** | Database schema, relationships, and ERD |5. **Müşteri olarak login olun**

| **[AUTHENTICATION.md](./docs/AUTHENTICATION.md)** | Auth flow, JWT tokens, and security layers |6. Koleksiyonları görüntüleyin

| **[RBAC.md](./docs/RBAC.md)** | Role-based access control and permissions |7. Numune talep edin

8. Onaylandıktan sonra sipariş verin

### Feature Guides9. Üretim sürecini takip edin

| Feature | Guide |---

|---------|-------|

| **Orders** | [FEATURES/ORDERS.md](./docs/FEATURES/ORDERS.md) |## 📚 Dökümantasyon

| **Production** | [FEATURES/PRODUCTION.md](./docs/FEATURES/PRODUCTION.md) |

| **Quality Control** | [FEATURES/QUALITY.md](./docs/FEATURES/QUALITY.md) |### Ana Dökümanlar

| **Notifications** | [FEATURES/NOTIFICATIONS.md](./docs/FEATURES/NOTIFICATIONS.md) |- **[PROJECT_CLEANUP_ANALYSIS.md](./PROJECT_CLEANUP_ANALYSIS.md)** - 🆕 Proje durum analizi ve temizlik raporu

| **Companies** | [FEATURES/COMPANIES.md](./docs/FEATURES/COMPANIES.md) |- **[DYNAMIC_TASK_SYSTEM_COMPLETED.md](./DYNAMIC_TASK_SYSTEM_COMPLETED.md)** - 🆕 Dynamic task system dökümantasyonu

- **[DATABASE_RESET_SOLUTION.md](./DATABASE_RESET_SOLUTION.md)** - Database reset sonrası çözüm rehberi

### Development Guides- **[DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)** - Database mimarisi ve şema

- **[PROJECT_SUMMARY_TASK_WORKFLOWS.md](./PROJECT_SUMMARY_TASK_WORKFLOWS.md)** - Task workflow özeti

| Guide | Purpose |

|-------|---------|### Döküman Klasörü (`/docs`)

| **[GETTING_STARTED.md](./docs/GUIDES/GETTING_STARTED.md)** | Step-by-step setup guide |- **[README.md](./docs/README.md)** - Proje özeti

| **[NEW_FEATURES.md](./docs/GUIDES/NEW_FEATURES.md)** | How to add new features |- **[QUICK-START.md](./docs/QUICK-START.md)** - Hızlı başlangıç rehberi

| **[BEST_PRACTICES.md](./docs/GUIDES/BEST_PRACTICES.md)** | Coding standards and patterns |- **[01-manufacturer-flow-UPDATED.md](./docs/01-manufacturer-flow-UPDATED.md)** - Üretici iş akışı

| **[DEPLOYMENT.md](./docs/GUIDES/DEPLOYMENT.md)** | Production deployment guide |- **[02-customer-flow-UPDATED.md](./docs/02-customer-flow-UPDATED.md)** - Müşteri iş akışı

| **[TESTING.md](./docs/GUIDES/TESTING.md)** | Testing strategies |- **[03-system-workflow-UPDATED.md](./docs/03-system-workflow-UPDATED.md)** - Sistem süreçleri

- **[04-database-schema-UPDATED.md](./docs/04-database-schema-UPDATED.md)** - Database yapısı

---- **[05-api-endpoints-UPDATED.md](./docs/05-api-endpoints-UPDATED.md)** - GraphQL API

- **[06-user-interface-UPDATED.md](./docs/06-user-interface-UPDATED.md)** - UI/UX

## 🔧 Development Workflow- **[07-implementation-guide-UPDATED.md](./docs/07-implementation-guide-UPDATED.md)** - Implementation

### Backend Commands---

````bash## 📁 Proje Yapısı

# Development

npm run dev              # Start dev server with hot reload```

fullstack/

# Database├── client/                    # Next.js Frontend

npx prisma studio        # Open Prisma Studio (visual DB editor)│   ├── src/

npx prisma generate      # Generate Prisma Client│   │   ├── app/              # Next.js App Router

npx prisma migrate dev   # Create new migration│   │   │   ├── (auth)/       # Auth pages (login, signup)

npx prisma migrate reset # Reset DB (DEV ONLY!)│   │   │   ├── (protected)/  # Protected pages

npx prisma db seed       # Seed test data│   │   │   │   ├── dashboard/

│   │   │   │   │   ├── page.tsx              # Dashboard

# Build│   │   │   │   │   ├── collections/          # Koleksiyonlar

npm run build            # Build for production│   │   │   │   │   ├── samples/              # Numuneler

npm start                # Start production server│   │   │   │   │   ├── orders/               # Siparişler

│   │   │   │   │   ├── production/           # Üretim takibi

# Testing│   │   │   │   │   ├── quality/              # Kalite kontrol

npm test                 # Run tests│   │   │   │   │   ├── categories/           # Kategoriler

npm run test:watch       # Watch mode│   │   │   │   │   ├── library/              # Kütüphane

```│   │   │   │   │   ├── messages/             # Mesajlar

│   │   │   │   │   └── settings/             # Ayarlar

### Frontend Commands│   │   │   │   └── admin/                    # Admin panel

│   │   │   └── layout.tsx

```bash│   │   ├── components/       # React Components

# Development│   │   │   ├── Auth/         # Authentication

npm run dev              # Start dev server│   │   │   ├── Collection/   # Koleksiyon components

│   │   │   ├── Dashboard/    # Dashboard components

# Code Generation│   │   │   ├── DataTable/    # 🆕 Reusable data table components

npm run codegen          # Generate GraphQL types from schema│   │   │   │   ├── SimpleDataTable.tsx  # Generic sortable table

│   │   │   │   ├── DataTable.tsx        # Complex table with DnD

# Build│   │   │   │   └── README.md            # Usage documentation

npm run build            # Build for production│   │   │   ├── Production/   # Production tracking

npm run start            # Start production server│   │   │   ├── QualityControl/

│   │   │   ├── Navigation/

# Code Quality│   │   │   └── ui/           # Shadcn UI components

npm run lint             # Run ESLint│   │   ├── lib/

npm run type-check       # TypeScript check│   │   │   └── graphql/      # GraphQL queries & mutations

```│   │   ├── context/          # React Context

│   │   ├── hooks/            # Custom hooks

### After Schema Changes│   │   └── types/            # TypeScript types

│   ├── public/               # Static files

When you modify the Prisma schema or GraphQL operations:│   └── package.json

│

```bash├── backend/                  # 🔧 Refactoring/Backup Area (NOT ACTIVE)

# 1. Backend - Generate Prisma Client│   ├── README.md             # Klasör amacı ve kullanım rehberi

cd backend│   ├── CHANGELOG.md          # Refactoring değişiklikleri

npx prisma generate│   ├── package.json          # Minimal dependencies

npx prisma migrate dev --name your_migration_name│   ├── .env.example          # Test environment variables

│   └── prisma/

# 2. Restart backend server│       └── schema.prisma     # Server schema backup/refactoring copy

npm run dev│

├── server/                   # ✅ Express + GraphQL Backend (ACTIVE)

# 3. Frontend - Generate GraphQL types│   ├── prisma/

cd ../frontend│   │   ├── schema.prisma     # Database schema

npm run codegen│   │   └── seed.ts           # Seed data

│   ├── src/

# 4. Restart frontend server│   │   ├── mutations/        # GraphQL Mutations

npm run dev│   │   │   ├── Mutation.ts   # Main mutations

```│   │   │   ├── userResolver.ts

│   │   │   ├── collectionResolver.ts

### Adding a New Feature│   │   │   ├── sampleResolver.ts

│   │   │   ├── orderResolver.ts

1. **Plan** - Read [docs/GUIDES/NEW_FEATURES.md](./docs/GUIDES/NEW_FEATURES.md)│   │   │   ├── productionResolver.ts

2. **Backend** - Add Prisma model → GraphQL types → Resolvers → Permissions│   │   │   └── ...

3. **Frontend** - Add GraphQL operations → Components → Pages → Routes│   │   ├── query/            # GraphQL Queries

4. **Test** - Test with different roles and permissions│   │   │   ├── Query.ts      # Main queries

5. **Document** - Update relevant docs│   │   │   └── ...

│   │   ├── types/            # Nexus Types

---│   │   ├── utils/            # Utilities

│   │   │   └── dynamicTaskHelper.ts  # 🆕 700+ lines task automation

## 🎯 System Status│   │   ├── context.ts        # GraphQL Context

│   │   ├── schema.ts         # Nexus Schema

### ✅ Completed Features (Production Ready)│   │   └── server.ts         # Express + Apollo Server

│   ├── uploads/              # File uploads

- [x] **Authentication System** - JWT with auto-refresh│   └── package.json

- [x] **Authorization System** - 4-layer RBAC│

- [x] **User Management** - Multi-role with permissions├── docs/                     # Documentation

- [x] **Company Management** - Profiles, employees, departments│   ├── README.md

- [x] **Order Management** - Full order lifecycle│   ├── QUICK-START.md

- [x] **Production Tracking** - 7-stage workflow│   └── 01-07-UPDATED.md files

- [x] **Quality Control** - 7-point inspection system│

- [x] **Notification System** - Real-time WebSocket├── PROJECT_CLEANUP_ANALYSIS.md       # 🆕 Proje analizi ve temizlik

- [x] **Image Upload** - Optimized with Sharp├── DYNAMIC_TASK_SYSTEM_COMPLETED.md  # 🆕 Dynamic task system

- [x] **Real-Time Updates** - GraphQL subscriptions├── DATABASE_RESET_SOLUTION.md        # Database reset rehberi

- [x] **Session Management** - Session-expired fix├── DATABASE_ARCHITECTURE.md          # Database mimarisi

- [x] **Token Refresh** - 12-hour automatic rotation├── PROJECT_SUMMARY_TASK_WORKFLOWS.md # Task workflow özeti

└── README.md                         # Bu dosya

### 🚧 In Progress```



- [ ] **Email Notifications** - Template system (90% complete)---

- [ ] **Advanced Search** - Multi-criteria filtering

- [ ] **Export Features** - PDF/Excel reports## 🎯 Kullanıcı Rolleri

- [ ] **Analytics Dashboard** - Charts and metrics

### 1. ADMIN (Platform Yöneticisi)

### 📋 Planned Features- Tüm sistem erişimi

- Kullanıcı ve şirket yönetimi

- [ ] **Multi-language Support** - i18n implementation- Global istatistikler

- [ ] **AI Integration** - Image recognition for samples- Sistem ayarları

- [ ] **Mobile App** - React Native version

- [ ] **API Documentation** - Interactive GraphQL docs### 2. COMPANY_OWNER (Şirket Sahibi)

- [ ] **Admin Analytics** - System-wide statistics- Şirket yönetimi

- Çalışan ekleme/çıkarma

---- Tüm koleksiyon işlemleri

- Üretim ve kalite yönetimi

## 🔒 Security

### 3. COMPANY_EMPLOYEE (Şirket Çalışanı)

### Implemented Security Measures- Atanan görevler

- Permission bazlı erişim

- ✅ JWT tokens with 7-day expiry- Departman özellikleri

- ✅ Automatic token refresh (12-hour rotation)

- ✅ Password hashing with bcryptjs### 4. MANUFACTURE (Üretici - Legacy)

- ✅ GraphQL Shield authorization layer- Koleksiyon oluşturma

- ✅ Input validation with Zod- Sample/Order yönetimi

- ✅ SQL injection protection (Prisma ORM)- Üretim takibi

- ✅ XSS protection (React auto-escaping)

- ✅ CORS configuration### 5. CUSTOMER / INDIVIDUAL_CUSTOMER (Müşteri)

- ✅ Rate limiting on login attempts- Katalog görüntüleme

- ✅ Session-expired redirect protection- Sample talebi

- Sipariş oluşturma

### Security Best Practices- Üretim takibi (read-only)



1. Never commit `.env` files---

2. Use strong JWT secrets (min 32 characters)

3. Always validate user input## 📊 İstatistikler

4. Check permissions on every resolver

5. Use HTTPS in production```

6. Keep dependencies updated✨ Özellikler          : 100+ feature

📄 Sayfalar            : 30+ pages

---🔄 GraphQL Operations  : 100+ query/mutation

� Dynamic Task System : 700+ lines automation

## 🚀 Deployment�🎭 Kullanıcı Rolü      : 6 roles

🏭 Üretim Aşaması      : 7 stages

### Production Checklist✅ Kalite Testi        : 7 test types

📊 Sample Status       : 28 states

- [ ] Set `NODE_ENV=production`📦 Order Status        : 15 states

- [ ] Use strong JWT_SECRET (min 32 chars)⚡ Task Types          : 15 types

- [ ] Set strong NEXTAUTH_SECRET🗄️ Database Modeli     : 20+ models

- [ ] Configure CORS_ORIGIN to your domain🎨 UI Components       : 150+ components

- [ ] Use HTTPS (SSL certificate)```

- [ ] Set secure database credentials

- [ ] Run `npx prisma migrate deploy`---

- [ ] Build frontend: `npm run build`

- [ ] Build backend: `npm run build`## 🔐 Güvenlik

- [ ] Set up reverse proxy (nginx)

- [ ] Configure file upload limits- JWT tabanlı authentication

- [ ] Set up monitoring and logging- Role-based authorization (graphql-shield)

- [ ] Configure backup strategy- Password hashing (bcrypt)

- Input validation (Zod)

See [docs/GUIDES/DEPLOYMENT.md](./docs/GUIDES/DEPLOYMENT.md) for detailed guide.- SQL injection koruması (Prisma)

- XSS koruması

---- CORS yapılandırması



## 🤝 Contributing---



We welcome contributions! Please follow these steps:## 🚀 Deployment



1. Fork the repository### Backend (Server)

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)```bash

3. Follow our [coding standards](./docs/GUIDES/BEST_PRACTICES.md)# Production build

4. Write tests for new featuresnpm run build

5. Commit your changes (`git commit -m 'Add AmazingFeature'`)

6. Push to the branch (`git push origin feature/AmazingFeature`)# Start production server

7. Open a Pull Requestnpm start



---# Environment variables

DATABASE_URL=mysql://...

## 📊 Project StatsJWT_SECRET=your-secret-key

PORT=4000

```NODE_ENV=production

✨ Features:          50+ features implemented```

📄 Pages:             30+ pages

🔄 GraphQL Ops:       100+ queries/mutations/subscriptions### Frontend (Client)

🎭 User Roles:        5 roles with granular permissions```bash

🏭 Production Stages: 7 stages with quality control# Production build

📊 Sample States:     28 status valuesnpm run build

📦 Order States:      15 status values

🗄️ Database Models:   20+ models with relationships# Start production

🎨 UI Components:     150+ React componentsnpm start

📱 Responsive:        100% mobile-friendly

```# Environment variables

NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.yourdomain.com/graphql

---```



## 📄 License### Database Migration

```bash

This project is proprietary software. All rights reserved.cd server

npx prisma migrate deploy

**Copyright © 2025 Nihat Çakar**```



------



## 👤 Author## 🧪 Testing



**Nihat Çakar**```bash

- GitHub: [@nihatckr](https://github.com/nihatckr)# Backend tests

- Project: [ProtexFlow](https://github.com/nihatckr/fullstack)cd server

npm test

---

# Frontend tests

## 🙏 Acknowledgmentscd client

npm test

Special thanks to the open-source community and these amazing projects:

# E2E tests

- [Next.js](https://nextjs.org/) - React frameworknpm run test:e2e

- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) - GraphQL server```

- [Prisma](https://www.prisma.io/) - Next-generation ORM

- [Pothos GraphQL](https://pothos-graphql.dev/) - Code-first GraphQL---

- [URQL](https://formidable.com/open-source/urql/) - GraphQL client

- [shadcn/ui](https://ui.shadcn.com/) - UI components## 📝 Lisans

- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS

Bu proje özel lisans altındadır. Tüm hakları saklıdır.

---

---

<div align="center">

## 👥 İletişim

**⭐ Star this repo if you find it helpful!**

**Proje Sahibi:** Nihat Çakır

**📦 Version:** 2.0.0 (Production Ready)  **Email:** nihat@example.com

**📅 Last Updated:** October 20, 2025  **GitHub:** [@nihatckr](https://github.com/nihatckr)

**🔥 Status:** Active Development

---

[Documentation](./docs/) • [Issues](https://github.com/nihatckr/fullstack/issues) • [Discussions](https://github.com/nihatckr/fullstack/discussions)

## 🙏 Teşekkürler

</div>

Bu projeyi geliştirmede kullanılan teknolojilere ve açık kaynak topluluğuna teşekkürler.

- [Next.js](https://nextjs.org/)
- [Apollo Server](https://www.apollographql.com/)
- [Prisma](https://www.prisma.io/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**⭐ Projeyi beğendiyseniz star vermeyi unutmayın!**

**Son Güncelleme:** 18 Ekim 2025
**Versiyon:** 2.0.0 (Production Ready + Dynamic Task System)
**Durum:** ✅ Aktif Geliştirme
````
# b2b
