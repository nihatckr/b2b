# 🚀 Pothos GraphQL Backend Kurulum Rehberi

## 📦 Kurulu Paketler

✅ @pothos/core
✅ @pothos/plugin-prisma
✅ @pothos/plugin-relay
✅ @pothos/plugin-scope-auth
✅ @pothos/plugin-validation
✅ graphql-yoga
✅ @prisma/client

---

## 🏗️ Proje Yapısı

```
backend/src/
├── server.ts                   # Main server entry point
├── libs/
│   └── prisma.ts              # Prisma client singleton
└── graphql/
    ├── builder.ts             # Pothos Schema Builder
    ├── schema.ts              # Final GraphQL Schema
    ├── context.ts             # GraphQL Context
    ├── types/                 # Prisma model types
    │   ├── index.ts
    │   ├── user.ts
    │   ├── sample.ts
    │   └── ...
    ├── queries/               # Query resolvers
    │   ├── index.ts
    │   ├── users.ts
    │   ├── samples.ts
    │   └── ...
    └── mutations/             # Mutation resolvers
        ├── index.ts
        ├── users.ts
        └── ...
```

---

## 🔧 Adım Adım Kurulum

### 1. Prisma Generate
```bash
npx prisma generate
```
Bu command:
- Prisma Client'ı generate eder (`src/generated/prisma/`)
- Pothos types'ı generate eder (`lib/pothos-prisma-types.ts`)

### 2. Builder Oluştur
`src/graphql/builder.ts` - Tüm Pothos konfigürasyonu

### 3. Types Tanımla
`src/graphql/types/` klasöründe her Prisma model için type tanımla

### 4. Queries Yaz
`src/graphql/queries/` klasöründe GraphQL query'leri yaz

### 5. Mutations Yaz
`src/graphql/mutations/` klasöründe GraphQL mutation'ları yaz

### 6. Schema Build Et
`src/graphql/schema.ts` - Tüm parçaları import edip schema oluştur

### 7. Server Çalıştır
```bash
npm run dev
```

---

## 🎯 Örnek Kullanım

### Builder (Simplified)

```typescript
// src/graphql/builder.ts
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '../../lib/pothos-prisma-types';
import prisma from '../libs/prisma';

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
});

builder.queryType({});
builder.mutationType({});
```

### Type Tanımlama

```typescript
// src/graphql/types/user.ts
import { builder } from '../builder';

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
    // Relations
    company: t.relation('company', { nullable: true }),
  }),
});
```

### Query Ekleme

```typescript
// src/graphql/queries/users.ts
import { builder } from '../builder';
import prisma from '../../libs/prisma';

builder.queryField('users', (t) =>
  t.prismaField({
    type: ['User'],
    resolve: async (query) => {
      return prisma.user.findMany({ ...query });
    },
  })
);
```

### Schema Build

```typescript
// src/graphql/schema.ts
import { builder } from './builder';
import './types';
import './queries';
import './mutations';

export const schema = builder.toSchema();
```

---

## ⚠️ Şu Anki Durum

❌ Eski `shield` plugin kullanımı var
❌ Builder'da plugin conflict'leri var
❌ Type import path'leri hatalı

## ✅ Çözüm

1. Eski dosyaları temizle
2. Basit bir builder ile başla (sadece PrismaPlugin)
3. Tek tek type'ları ekle
4. Query'leri ekle
5. Auth için sonra `@pothos/plugin-scope-auth` ekle

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Clean start
cd backend

# 2. Generate Prisma
npx prisma generate

# 3. Test server
npm run dev

# 4. GraphQL Playground
# http://localhost:4000/graphql
```

---

## 📚 Kaynaklar

- [Pothos Docs](https://pothos-graphql.dev/)
- [Pothos Prisma Plugin](https://pothos-graphql.dev/docs/plugins/prisma)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)

---

**Hazırlayan:** Backend Refactoring Team
**Tarih:** 18 Ekim 2025
