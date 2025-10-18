# 🎯 Schema Update Summary - SaaS Ready (Senaryo 2)

## 📊 Güncelleme Özeti

**Tarih:** 18 Ekim 2025
**Senaryo:** Private SaaS (20-50 şirket, SMB + Bireysel müşteriler)
**Yaklaşım:** Option B (Balanced) - 1 haftalık implementasyon

---

## ✅ YAPILAN DEĞİŞİKLİKLER

### 1. 👥 Role System - Geliştirildi

#### Yeni Enum: `Department`
```prisma
enum Department {
  PURCHASING  // Satın Alma
  PRODUCTION  // Üretim
  QUALITY     // Kalite Kontrol
  DESIGN      // Tasarım
  SALES       // Satış
  MANAGEMENT  // Yönetim
}
```

#### Güncellenmiş: `Role` enum
```prisma
enum Role {
  ADMIN                // ✅ Platform admin
  COMPANY_OWNER        // ✅ Firma sahibi
  COMPANY_EMPLOYEE     // ✅ Firma çalışanı (department-based)
  INDIVIDUAL_CUSTOMER  // ✅ Bireysel müşteri

  // Deprecated (backward compatibility)
  MANUFACTURE
  CUSTOMER
}
```

**Değişiklik:**
- ❌ Eski: `department String?` (belirsiz)
- ✅ Yeni: `department Department?` (typed enum)

---

### 2. 💳 Subscription System - Eklendi

#### Yeni Enums:
```prisma
enum SubscriptionPlan {
  FREE         // Ücretsiz trial
  STARTER      // $29/ay
  PROFESSIONAL // $99/ay
  ENTERPRISE   // $299/ay
  CUSTOM       // Özel anlaşma
}

enum SubscriptionStatus {
  TRIAL      // 14 günlük deneme
  ACTIVE     // Aktif abonelik
  PAST_DUE   // Ödeme gecikmiş
  CANCELLED  // İptal edilmiş
  EXPIRED    // Süresi dolmuş
}

enum BillingCycle {
  MONTHLY  // Aylık
  YEARLY   // Yıllık (%20 indirim)
}
```

#### Company Model'e Eklenenler:
```prisma
model Company {
  // ... mevcut fields

  // SUBSCRIPTION & BILLING
  subscriptionPlan   SubscriptionPlan   @default(FREE)
  subscriptionStatus SubscriptionStatus @default(TRIAL)
  billingCycle       BillingCycle       @default(MONTHLY)

  // USAGE LIMITS
  maxUsers       Int   @default(3)
  maxSamples     Int   @default(10)
  maxOrders      Int   @default(5)
  maxCollections Int   @default(5)
  maxStorageGB   Float @default(1.0)

  // CURRENT USAGE
  currentUsers       Int   @default(0)
  currentSamples     Int   @default(0)
  currentOrders      Int   @default(0)
  currentCollections Int   @default(0)
  currentStorageGB   Float @default(0.0)

  // TRIAL
  trialStartedAt DateTime? @default(now())
  trialEndsAt    DateTime?

  // BILLING INFO
  billingEmail   String?
  taxId          String?
  billingAddress String? @db.Text

  // SUBSCRIPTION DATES
  subscriptionStartedAt DateTime?
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?

  // CANCELLATION
  cancelAtPeriodEnd Boolean @default(false)
  cancelledAt       DateTime?

  // BOTH TYPE İÇİN
  defaultView    String? // "MANUFACTURER" | "BUYER"
  enabledModules Json?   // { manufacturing: true, purchasing: true }
}
```

**Yeni Indexler:**
```prisma
@@index([subscriptionPlan])
@@index([subscriptionStatus])
@@index([trialEndsAt])
@@index([currentPeriodEnd])
```

---

### 3. 🔐 Permission System - Geliştirildi

#### User Model Güncellemesi:
```prisma
model User {
  // ... mevcut fields

  department Department? // ✅ Typed enum (eski: String?)

  // PERMISSIONS (Typed JSON)
  permissions Json? // UserPermissions type (see types/permissions.ts)
}
```

**Yeni Index:**
```prisma
@@index([companyId, department]) // Department-based queries
```

---

### 4. 📁 TypeScript Types - Oluşturuldu

**Yeni Dosya:** `backend/src/types/permissions.ts`

İçerik:
- ✅ `UserPermissions` type definition
- ✅ `ROLE_PERMISSIONS` defaults
- ✅ `DEPARTMENT_PERMISSIONS` modifiers
- ✅ `PlanFeatures` type definition
- ✅ `PLAN_FEATURES` configuration
- ✅ Helper functions (`getUserPermissions`, `hasPermission`)

---

## 📋 PLAN LIMITS

| Plan | Users | Samples | Orders | Collections | Storage |
|------|-------|---------|--------|-------------|---------|
| **FREE** | 3 | 10 | 5 | 5 | 1 GB |
| **STARTER** ($29/ay) | 10 | 100 | 50 | 20 | 10 GB |
| **PROFESSIONAL** ($99/ay) | 50 | 500 | 200 | 100 | 100 GB |
| **ENTERPRISE** ($299/ay) | ∞ | ∞ | ∞ | ∞ | 1 TB |
| **CUSTOM** | ∞ | ∞ | ∞ | ∞ | ∞ |

---

## 🚀 MIGRATION KOMUTU

```bash
# Backend klasörüne git
cd backend

# Prisma client'ı regenerate et
npx prisma generate

# Migration oluştur ve uygula
npx prisma migrate dev --name add_subscription_and_departments

# Migration başarılı olursa:
# ✅ Department enum oluşturuldu
# ✅ Subscription enums oluşturuldu
# ✅ Company model'e yeni alanlar eklendi
# ✅ User.department String? → Department? değişti
# ✅ Yeni indexler eklendi
```

---

## ⚠️ BREAKING CHANGES

### 1. User.department Type Değişti
**Eski:**
```typescript
user.department = "Satın Alma" // String
```

**Yeni:**
```typescript
import { Department } from '@prisma/client'
user.department = Department.PURCHASING // Enum
```

**Fix:**
```typescript
// Migration script gerekebilir:
// "Satın Alma" → Department.PURCHASING
// "Üretim" → Department.PRODUCTION
// "Kalite" → Department.QUALITY
// vs.
```

---

### 2. Company Model'de Yeni Required Fields Yok
- ✅ Tüm yeni alanlar optional veya default değerli
- ✅ Mevcut dataya migration script gerekmez
- ✅ Backward compatible

---

## 📝 YAPILACAKLAR (Post-Migration)

### 1. Backend Implementation (2-3 gün)

#### a. Permission Middleware
```typescript
// middleware/checkPermission.ts
export function checkPermission(
  category: keyof UserPermissions,
  action: string
) {
  return async (req, res, next) => {
    const user = req.user
    if (!hasPermission(user, category, action)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

// Usage:
router.post('/samples', checkPermission('samples', 'create'), createSample)
```

#### b. Usage Limit Middleware
```typescript
// middleware/checkUsageLimit.ts
export async function checkUsageLimit(
  companyId: number,
  resource: 'users' | 'samples' | 'orders' | 'collections'
) {
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  const currentCount = company[`current${resource.charAt(0).toUpperCase() + resource.slice(1)}`]
  const maxCount = company[`max${resource.charAt(0).toUpperCase() + resource.slice(1)}`]

  if (currentCount >= maxCount) {
    throw new Error(`Usage limit exceeded for ${resource}. Please upgrade your plan.`)
  }
}

// Usage:
router.post('/samples', async (req, res) => {
  await checkUsageLimit(req.user.companyId, 'samples')
  // ... create sample
})
```

#### c. Auto-Update Usage Counts
```typescript
// prisma/middleware/usageTracking.ts
export function setupUsageTracking(prisma: PrismaClient) {
  // After Sample create → increment currentSamples
  prisma.$use(async (params, next) => {
    if (params.model === 'Sample' && params.action === 'create') {
      const result = await next(params)
      await prisma.company.update({
        where: { id: result.companyId },
        data: { currentSamples: { increment: 1 } }
      })
      return result
    }
    return next(params)
  })

  // After Sample delete → decrement currentSamples
  // ... similar for Order, Collection, User
}
```

---

### 2. Frontend Implementation (3-4 gün)

#### a. Billing Page
```typescript
// pages/billing.tsx
<BillingPage>
  <CurrentPlan plan={company.subscriptionPlan} />
  <UsageChart
    current={company.currentSamples}
    max={company.maxSamples}
  />
  <UpgradeOptions plans={['STARTER', 'PROFESSIONAL', 'ENTERPRISE']} />
</BillingPage>
```

#### b. Permission-Based UI
```typescript
// components/SampleList.tsx
const canDelete = hasPermission(user, 'samples', 'delete')

<Button
  onClick={deleteSample}
  disabled={!canDelete}
>
  Delete
</Button>
```

#### c. Dashboard Switcher (BOTH type için)
```typescript
// components/DashboardSwitcher.tsx
if (company.type === 'BOTH') {
  return (
    <Tabs>
      <Tab value="MANUFACTURER">Üretici Görünümü</Tab>
      <Tab value="BUYER">Müşteri Görünümü</Tab>
    </Tabs>
  )
}
```

---

### 3. Admin Dashboard (2-3 gün)

```typescript
// Admin panel features:
- Company list with subscription status
- Trial expiry warnings
- Usage statistics
- Manual plan upgrades
- Subscription management
```

---

## 🧪 TESTING CHECKLIST

### Migration Testing
- [ ] Migration runs without errors
- [ ] Existing users preserved
- [ ] New enums created correctly
- [ ] Indexes created
- [ ] Default values applied

### Permission Testing
- [ ] ADMIN has full access
- [ ] COMPANY_OWNER has company-wide access
- [ ] COMPANY_EMPLOYEE limited by department
- [ ] INDIVIDUAL_CUSTOMER very limited access
- [ ] Permission overrides work

### Usage Limit Testing
- [ ] FREE plan: 3 users max
- [ ] Sample creation blocked at limit
- [ ] Upgrade enables more resources
- [ ] Current counts auto-update

### Subscription Testing
- [ ] New company defaults to TRIAL
- [ ] Trial expires after 14 days
- [ ] Plan upgrades work
- [ ] Billing cycle changes work
- [ ] Cancellation works

---

## 📈 EXPECTED IMPROVEMENTS

### Performance
- ✅ Department queries optimized (new index)
- ✅ Subscription queries optimized (new indexes)
- ✅ Plan-based filtering fast

### Security
- ✅ Typed permissions (no arbitrary strings)
- ✅ Usage limits enforced
- ✅ Department-based access control

### Business
- ✅ SaaS-ready schema
- ✅ Multiple pricing tiers
- ✅ Trial period support
- ✅ Usage tracking

---

## 🎯 NEXT STEPS

### Week 1: Backend (Bu Hafta)
1. ✅ Schema migration (DONE)
2. ⏳ Permission middleware
3. ⏳ Usage limit middleware
4. ⏳ Subscription logic

### Week 2: Frontend
1. ⏳ Billing page
2. ⏳ Permission-based UI
3. ⏳ Dashboard switcher (BOTH type)

### Week 3: Polish
1. ⏳ Admin dashboard
2. ⏳ Email notifications (trial expiry)
3. ⏳ Analytics

---

## 💰 PRICING STRATEGY

### Trial Period
- **Duration:** 14 days
- **Plan:** FREE tier features
- **No credit card:** Required only on upgrade

### Pricing
- **FREE:** $0 (Limited features for evaluation)
- **STARTER:** $29/month or $290/year (save $58)
- **PROFESSIONAL:** $99/month or $990/year (save $198)
- **ENTERPRISE:** $299/month or $2990/year (save $598)
- **CUSTOM:** Contact sales

### Upgrade Path
```
FREE (Trial) → STARTER → PROFESSIONAL → ENTERPRISE
```

---

## 📚 DOCUMENTATION

### For Developers
- ✅ `types/permissions.ts` - Full type definitions
- ✅ Schema comments - Inline documentation
- ✅ This file - Implementation guide

### For Users
- ⏳ Plan comparison page
- ⏳ Billing FAQ
- ⏳ Department permissions guide

---

## 🔗 RELATED FILES

- `backend/prisma/schema.prisma` - Updated schema
- `backend/src/types/permissions.ts` - Permission types
- `backend/SAAS_READINESS_ANALYSIS.md` - Full analysis

---

**Status:** ✅ Schema ready for migration
**Next:** Run migration command
**ETA:** 1 week to full implementation

---

**Updated by:** GitHub Copilot
**Date:** 18 Ekim 2025
