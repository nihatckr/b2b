# 🚀 BACKEND KLASÖRLERİ HAKKINDA

**Son Güncelleme:** 19 Ekim 2025
**Durum:** ✅ Backend klasörü artık Production'da!

---

## 📋 Özet

Projede iki backend klasörü bulunmaktadır:

### ✅ Production Backend (Yeni)

```
Klasör: /backend
Tech Stack: GraphQL Yoga v5 + Pothos + Prisma
Port: 4001
GraphQL: http://localhost:4001/graphql
Durum: ✅ Production Ready (Aktif)
```

**Özellikler:**
- ✅ Modern Pothos GraphQL builder
- ✅ 5 Pothos plugin (ScopeAuth, Errors, Relay, Prisma, ValidationPlugin)
- ✅ Field-level authorization
- ✅ Global ID system (Relay)
- ✅ Comprehensive error handling
- ✅ Subscription support
- ✅ Fully documented

**Dokümantasyon:** [backend/README.md](./backend/README.md)

---

### 🔧 Legacy Backend (Eski)

```
Klasör: /server
Tech Stack: Apollo Server + Nexus + Prisma
Port: 4000
GraphQL: http://localhost:4000/graphql
Durum: 🔄 Migration Required (Deprecated)
```

**Not:** `/server` klasörü eski Apollo + Nexus backend'idir. Yeni özellikler `/backend` klasörüne eklenmelidir.

---

## 🔄 Migration Durumu

| Özellik | /server (Eski) | /backend (Yeni) | Durum |
|---------|---------------|----------------|--------|
| GraphQL Framework | Apollo Server | GraphQL Yoga | ✅ Migrated |
| Schema Builder | Nexus | Pothos | ✅ Migrated |
| Authorization | graphql-shield | Pothos ScopeAuth | ✅ Migrated |
| Error Handling | Basic | Advanced | ✅ Improved |
| Relay Support | ❌ No | ✅ Yes | ✅ Added |
| Global IDs | ❌ No | ✅ Yes | ✅ Added |
| Subscriptions | Basic | Full Support | ✅ Improved |

---

## � Hangi Backend'i Kullanmalıyım?

### Yeni Özellikler → `/backend` (Production)

**Tüm yeni geliştirmeler `/backend` klasöründe yapılmalıdır:**
- ✅ Yeni query/mutation ekleme
- ✅ Yeni model ekleme
- ✅ Authorization kuralları
- ✅ Frontend entegrasyonu

**Rehber:** [backend/HOW_TO_ADD_NEW_FEATURES.md](./backend/HOW_TO_ADD_NEW_FEATURES.md)

### Legacy Support → `/server` (Deprecated)

**Sadece mevcut özelliklerin bakımı için:**
- 🔧 Bug fix'ler
- 🔧 Kritik güvenlik güncellemeleri
- ⚠️ Yeni özellik eklemek için kullanmayın!

---

## 🎯 Frontend Entegrasyonu

### Backend Port Configuration

```typescript
// frontend/src/lib/graphql/urqlClient.ts
const client = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
  //                                                                   ^^^^
  //                                                             /backend port
});

// frontend/src/lib/auth.ts (NextAuth)
const response = await fetch(
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
  //                                                            ^^^^
);
```

### Environment Variables

```bash
# .env.local (Frontend)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4001/graphql

# .env (Backend)
PORT=4001
DATABASE_URL="mysql://user:pass@localhost:3306/dbname"
JWT_SECRET="your-secret-key"
```

---

## � Hızlı Başlangıç

### Backend'i Çalıştırma

```bash
# 1. Backend klasörüne git
cd backend

# 2. Dependencies
npm install

# 3. Database setup
npx prisma migrate dev
npx prisma generate

# 4. Start server
npm run dev
```

### Frontend'i Çalıştırma

```bash
# 1. Frontend klasörüne git
cd frontend

# 2. Dependencies
npm install

# 3. Environment setup
cp .env.example .env.local
# Edit NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4001/graphql

# 4. Start dev server
npm run dev
```

### Her İkisini Birden

```bash
# Root klasörden
npm run dev  # Runs both backend (4001) and frontend (3000)
```

---

## � Dökümanlar

### Backend Dokümantasyonu (`/backend`)
- **[README.md](./backend/README.md)** - Genel bakış
- **[HOW_TO_ADD_NEW_FEATURES.md](./backend/HOW_TO_ADD_NEW_FEATURES.md)** - Yeni özellik ekleme ⭐
- **[OPTIMIZATION_SUMMARY.md](./backend/OPTIMIZATION_SUMMARY.md)** - Performance tips
- **[PRODUCTION_READINESS_CHECKLIST.md](./backend/PRODUCTION_READINESS_CHECKLIST.md)** - Production kontrol

### Frontend Dokümantasyonu (`/frontend`)
- **[AUTHENTICATION_GUIDE.md](./frontend/AUTHENTICATION_GUIDE.md)** - Auth & RBAC rehberi ⭐
- **[URQL_QUICK_REFERENCE.md](./frontend/URQL_QUICK_REFERENCE.md)** - URQL kullanımı

---

**Oluşturulma:** 18 Ekim 2025
**Son Güncelleme:** 19 Ekim 2025
**Amaç:** Backend klasör yapısını netleştirmek ve migration durumunu göstermek
