# 🎨 Tekstil Üretim Yönetim Sistemi - Frontend

**Framework:** Next.js 15.5.4
**Durum:** ✅ %98 Tamamlandı
**Son Güncelleme:** 15 Ekim 2025

---

## 🚀 Hızlı Başlangıç

### Prerequisites
```bash
Node.js 18+
npm veya yarn
Backend server çalışır durumda (http://localhost:4000)
```

### Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Browser'da aç: http://localhost:3000
```

### Build ve Production

```bash
# Production build
npm run build

# Production server
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🏗️ Teknoloji Stack

### Core Framework
- **Next.js** 15.5.4 (App Router + Server Actions)
- **React** 19.1.0
- **TypeScript** 5.x

### GraphQL & State Management
- **URQL** 4.1.0 (GraphQL Client)
- **GraphQL Code Generator** (Type-safe queries)
- **Context API** (Global state)

### UI & Styling
- **Tailwind CSS** 3.4.18
- **Shadcn UI** (Component library)
- **Radix UI** (Primitives)
- **Lucide Icons** 0.469.0

### Form & Validation
- **React Hook Form** 7.65.0
- **Zod** 4.1.12 (Schema validation)

### Utilities
- **date-fns** (Date formatting)
- **clsx** + **tailwind-merge** (Class utilities)

---

## 📁 Proje Yapısı

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth layout group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (protected)/       # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── collections/
│   │   │   ├── samples/
│   │   │   ├── orders/
│   │   │   ├── production/
│   │   │   ├── messages/
│   │   │   └── ...
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   ├── Auth/              # Authentication components
│   │   ├── Collection/        # Collection management
│   │   ├── Dashboard/         # Dashboard widgets
│   │   ├── Layout/            # Layout components
│   │   ├── Navigation/        # Navigation components
│   │   ├── Order/             # Order management
│   │   ├── Production/        # Production tracking
│   │   ├── QA/                # Q&A components
│   │   ├── Reviews/           # Review components
│   │   ├── ui/                # Shadcn UI components
│   │   └── ...
│   │
│   ├── context/
│   │   ├── AuthProvider.tsx   # Auth context
│   │   └── ToastProvider.tsx  # Toast notifications
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts      # Responsive hook
│   │   └── usePermissions.ts  # Permission check hook
│   │
│   ├── lib/
│   │   ├── graphql/           # GraphQL setup
│   │   │   ├── client.ts      # URQL client
│   │   │   ├── queries/       # GraphQL queries
│   │   │   └── mutations/     # GraphQL mutations
│   │   ├── utils.ts           # Utility functions
│   │   └── toast.ts           # Toast utilities
│   │
│   ├── types/
│   │   └── global.d.ts        # Global TypeScript types
│   │
│   └── __generated__/
│       └── graphql.ts         # Auto-generated GraphQL types
│
├── public/                     # Static assets
├── codegen.ts                  # GraphQL codegen config
├── components.json             # Shadcn UI config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json              # TypeScript config
```

---

## 🎯 Ana Özellikler

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (6 roller)
- Protected routes
- Session management

### 📊 Dashboard
- Role-specific widgets
- Real-time statistics
- Quick actions
- Recent activities

### 👔 Koleksiyon Yönetimi
- 4-step detailed form
- Multi-image upload
- Color & size variations
- Tech pack management
- Category organization

### 🎨 Sample (Numune) Yönetimi
- Digital request system
- Approval workflow
- Production tracking
- Revision management
- Status timeline

### 📦 Sipariş Yönetimi
- Sample-to-order conversion
- Price & quantity management
- Production planning
- Delivery tracking
- Order history

### 🏭 Üretim Takibi
- 7-stage production flow
- Real-time status updates
- Stage completion tracking
- Delay management
- Visual timeline

### ✅ Kalite Kontrol
- 7 test types
- Pass/fail tracking
- Defect reporting
- QC timeline
- Photo documentation

### 📚 Kütüphane Yönetimi
- Colors, fabrics, sizes
- Seasons & fit definitions
- Certifications
- Reusable data

### 💬 İletişim
- Real-time messaging
- Q&A system
- Reviews & ratings
- Notifications
- File sharing

---

## 🔧 Geliştirme Araçları

### GraphQL Code Generation

```bash
# GraphQL types'ları generate et
npm run codegen

# Watch mode
npm run codegen:watch
```

### Shadcn UI Component Ekleme

```bash
# Yeni component ekle
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

### Type Checking

```bash
# TypeScript kontrol
npm run type-check

# Build ile birlikte
npm run build
```

---

## 🎨 UI Component Sistemi

### Shadcn UI Components (30+)

```typescript
// Button example
import { Button } from "@/components/ui/button"

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
```

### Form Components

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const form = useForm({
  resolver: zodResolver(formSchema),
})
```

### Custom Hooks

```typescript
// Responsive hook
import { useMobile } from "@/hooks/use-mobile"

const isMobile = useMobile()

// Permission check
import { usePermissions } from "@/hooks/usePermissions"

const { canEdit, canDelete } = usePermissions()
```

---

## 🔌 GraphQL Integration

### URQL Client Setup

```typescript
// lib/graphql/client.ts
import { Client, cacheExchange, fetchExchange } from 'urql';

const client = new Client({
  url: 'http://localhost:4000/graphql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem('token');
    return {
      headers: { authorization: token ? `Bearer ${token}` : '' },
    };
  },
});
```

### Query Usage

```typescript
import { useQuery } from 'urql';
import { GetCollectionsDocument } from '@/__generated__/graphql';

const CollectionList = () => {
  const [result] = useQuery({
    query: GetCollectionsDocument,
  });

  if (result.fetching) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return (
    <div>
      {result.data?.collections.map(collection => (
        <div key={collection.id}>{collection.name}</div>
      ))}
    </div>
  );
};
```

### Mutation Usage

```typescript
import { useMutation } from 'urql';
import { CreateCollectionDocument } from '@/__generated__/graphql';

const [result, executeMutation] = useMutation(CreateCollectionDocument);

const handleCreate = async (data) => {
  const result = await executeMutation({ input: data });
  if (result.error) {
    console.error(result.error);
  } else {
    console.log('Created:', result.data);
  }
};
```

---

## 🎭 Kullanıcı Rolleri ve Sayfalar

### ADMIN
- `/dashboard` - Full system overview
- `/users` - User management
- `/companies` - Company management
- `/settings` - System settings

### COMPANY_OWNER / MANUFACTURE
- `/dashboard` - Business overview
- `/collections` - Manage collections
- `/samples` - Sample requests
- `/orders` - Order management
- `/production` - Production tracking
- `/quality-control` - QC management
- `/library` - Library management

### CUSTOMER / COMPANY_EMPLOYEE
- `/dashboard` - Personal dashboard
- `/catalog` - Browse collections
- `/samples` - My samples
- `/orders` - My orders
- `/production` - Track production
- `/messages` - Communication
- `/reviews` - Product reviews

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-First Approach

```tsx
// Mobile-first utility
const isMobile = useMobile();

return (
  <div className="p-4 md:p-6 lg:p-8">
    {isMobile ? (
      <MobileView />
    ) : (
      <DesktopView />
    )}
  </div>
);
```

---

## 🔒 Güvenlik

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Protected Routes

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## 📊 Performance

### Optimizations
- ✅ Image optimization (next/image)
- ✅ Code splitting (dynamic imports)
- ✅ Font optimization (next/font)
- ✅ Static generation where possible
- ✅ Lazy loading components
- ✅ Memoization (React.memo, useMemo)

### Bundle Analysis

```bash
npm run build
# Check .next/analyze for bundle size
```

---

## 🧪 Testing

```bash
# Unit tests (yapılandırılacak)
npm test

# E2E tests (yapılandırılacak)
npm run test:e2e
```

---

## 📚 Dökümantasyon

### Ana Dökümanlar
- [Ana README](../README.md) - Proje genel bakış
- [docs/README.md](../docs/README.md) - Tüm dökümanlar
- [CURRENT_FEATURES_REPORT.md](../CURRENT_FEATURES_REPORT.md) - Özellik listesi

### Öğrenme Kaynakları
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [URQL Documentation](https://formidable.com/open-source/urql/docs/)

---

## 🐛 Troubleshooting

### GraphQL Connection Issues

```bash
# Backend çalışıyor mu kontrol et
curl http://localhost:4000/graphql

# CORS hatası varsa backend'de CORS ayarlarını kontrol et
```

### Type Generation Issues

```bash
# Cache temizle ve yeniden generate et
rm -rf src/__generated__
npm run codegen
```

### Build Errors

```bash
# node_modules ve .next temizle
rm -rf node_modules .next
npm install
npm run build
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Vercel CLI ile deploy
npx vercel

# Production deploy
npx vercel --prod
```

### Environment Variables (Production)

```
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 📞 Destek

**Issues:** [GitHub Issues](https://github.com/nihatckr/fullstack/issues)
**Email:** nihat@example.com
**Docs:** [docs/README.md](../docs/README.md)

---

**Frontend Versiyonu:** 2.0
**Son Güncelleme:** 15 Ekim 2025
**Durum:** ✅ Production Ready (%98)
