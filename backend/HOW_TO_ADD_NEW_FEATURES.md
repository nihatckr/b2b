# 🚀 Yeni Model, Query ve Mutation Ekleme Rehberi

**Backend Tech Stack**: GraphQL Yoga v5 + Pothos + Prisma + TypeScript
**Son Güncelleme**: 18 Ekim 2025

---

## 📋 İçindekiler

1. [Yeni Model Ekleme](#1-yeni-model-ekleme)
2. [GraphQL Type Tanımlama](#2-graphql-type-tanımlama)
3. [Query Oluşturma](#3-query-oluşturma)
4. [Mutation Oluşturma](#4-mutation-oluşturma)
5. [Authorization Ekleme](#5-authorization-ekleme)
6. [Best Practices](#6-best-practices)

---

## 1. Yeni Model Ekleme

### Adım 1.1: Prisma Schema Güncelle

**Dosya**: `prisma/schema.prisma`

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Float
  stock       Int      @default(0)
  isActive    Boolean  @default(true)

  // Relations
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id])
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id])

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([companyId])
  @@index([isActive])
}
```

### Adım 1.2: Migration Oluştur

```bash
cd backend
npx prisma migrate dev --name add_product_model
npx prisma generate
```

**Önemli**: `prisma generate` sonrası TypeScript tipleri otomatik güncellenir.

### Adım 1.3: Type Safety Kontrolü

```bash
npx tsc --noEmit
```

---

## 2. GraphQL Type Tanımlama

### Adım 2.1: Pothos Type Oluştur

**Dosya**: `src/graphql/types/index.ts`

#### Basit Object Type (Küçük ilişkiler için)

```typescript
// Basit model - prismaObject kullan
builder.prismaObject("Product", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    price: t.exposeFloat("price"),
    stock: t.exposeInt("stock"),
    isActive: t.exposeBoolean("isActive"),

    // Relations
    category: t.relation("category"),
    company: t.relation("company"),

    // Timestamps
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
```

#### Relay Node (Global ID + Cache Normalization)

```typescript
// Büyük/önemli model - prismaNode kullan (Frontend cache için)
builder.prismaNode("Product", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),

    // Sensitive field - requires auth
    price: t.exposeFloat("price", {
      authScopes: { user: true }, // Sadece authenticated users
    }),

    stock: t.exposeInt("stock", {
      authScopes: { employee: true }, // Sadece çalışanlar görebilir
    }),

    isActive: t.exposeBoolean("isActive"),

    // Relations
    category: t.relation("category"),
    company: t.relation("company"),

    // Relay Connection (büyük listeler için)
    ordersConnection: t.relatedConnection("orders", {
      cursor: "id",
      totalCount: true,
    }),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
```

### Adım 2.2: Enum Tanımlama (Gerekirse)

**Dosya**: `src/graphql/enums/index.ts`

```typescript
builder.enumType("ProductStatus", {
  values: ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"] as const,
});
```

---

## 3. Query Oluşturma

### Adım 3.1: Query Dosyası Oluştur

**Dosya**: `src/graphql/queries/productQuery.ts`

```typescript
import builder from "../builder";

// ========================================
// SINGLE PRODUCT QUERY
// ========================================

builder.queryField("product", (t) =>
  t.prismaField({
    type: "Product",
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true }, // Herkes erişebilir
    resolve: async (query, root, args, context) => {
      return context.prisma.product.findUnique({
        ...query, // ✅ Pothos otomatik optimize eder
        where: { id: args.id },
      });
    },
  })
);

// ========================================
// LIST PRODUCTS QUERY (Pagination ile)
// ========================================

builder.queryField("products", (t) =>
  t.prismaField({
    type: ["Product"],
    args: {
      categoryId: t.arg.int({ required: false }),
      isActive: t.arg.boolean({ required: false }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
    },
    authScopes: { user: true }, // Authenticated users only
    resolve: async (query, root, args, context) => {
      const { categoryId, isActive, skip = 0, take = 20 } = args;

      return context.prisma.product.findMany({
        ...query,
        where: {
          ...(categoryId && { categoryId }),
          ...(isActive !== undefined && { isActive }),
          // Sadece kendi şirketinin ürünlerini göster
          companyId: context.user?.companyId,
        },
        skip,
        take: Math.min(take, 100), // Max 100
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// ========================================
// CONNECTION QUERY (Relay Pagination)
// ========================================

builder.queryField("productsConnection", (t) =>
  t.prismaConnection({
    type: "Product",
    cursor: "id",
    args: {
      categoryId: t.arg.int({ required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, root, args, context) => {
      return context.prisma.product.findMany({
        ...query,
        where: {
          ...(args.categoryId && { categoryId: args.categoryId }),
          companyId: context.user?.companyId,
        },
        orderBy: { createdAt: "desc" },
      });
    },
    totalCount: async (connection, args, context) => {
      return context.prisma.product.count({
        where: {
          ...(args.categoryId && { categoryId: args.categoryId }),
          companyId: context.user?.companyId,
        },
      });
    },
  })
);
```

### Adım 3.2: Query'i Export Et

**Dosya**: `src/graphql/queries/index.ts`

```typescript
import "./productQuery";
// ... diğer queries
```

---

## 4. Mutation Oluşturma

### Adım 4.1: Mutation Dosyası Oluştur

**Dosya**: `src/graphql/mutations/productMutation.ts`

```typescript
import builder from "../builder";

// ========================================
// CREATE PRODUCT
// ========================================

builder.mutationField("createProduct", (t) =>
  t.prismaField({
    type: "Product",
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      price: t.arg.float({ required: true }),
      stock: t.arg.int({ required: true }),
      categoryId: t.arg.int({ required: true }),
    },
    authScopes: { employee: true }, // Sadece çalışanlar
    resolve: async (query, root, args, context) => {
      // Context'ten user bilgisi al
      const userId = context.user!.id;
      const companyId = context.user!.companyId!;

      // Validation
      if (args.price < 0) {
        throw new Error("Price cannot be negative");
      }

      // Create product
      return context.prisma.product.create({
        ...query,
        data: {
          name: args.name,
          description: args.description,
          price: args.price,
          stock: args.stock,
          categoryId: args.categoryId,
          companyId,
        },
      });
    },
  })
);

// ========================================
// UPDATE PRODUCT
// ========================================

builder.mutationField("updateProduct", (t) =>
  t.prismaField({
    type: "Product",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string({ required: false }),
      description: t.arg.string({ required: false }),
      price: t.arg.float({ required: false }),
      stock: t.arg.int({ required: false }),
      isActive: t.arg.boolean({ required: false }),
    },
    authScopes: { employee: true },
    resolve: async (query, root, args, context) => {
      const { id, ...updateData } = args;
      const companyId = context.user!.companyId!;

      // Check ownership
      const product = await context.prisma.product.findUnique({
        where: { id },
        select: { companyId: true },
      });

      if (!product || product.companyId !== companyId) {
        throw new Error("Product not found or unauthorized");
      }

      // Update
      return context.prisma.product.update({
        ...query,
        where: { id },
        data: updateData,
      });
    },
  })
);

// ========================================
// DELETE PRODUCT
// ========================================

builder.mutationField("deleteProduct", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { companyOwner: true }, // Sadece company owner
    resolve: async (root, args, context) => {
      const companyId = context.user!.companyId!;

      // Soft delete (isActive = false)
      await context.prisma.product.updateMany({
        where: {
          id: args.id,
          companyId, // Güvenlik: kendi şirketinin ürünü
        },
        data: { isActive: false },
      });

      return true;
    },
  })
);
```

### Adım 4.2: Input Type Kullanma (Complex Args)

```typescript
// Input type tanımla
const ProductInput = builder.inputType("ProductInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    price: t.float({ required: true }),
    stock: t.int({ required: true }),
    categoryId: t.int({ required: true }),
  }),
});

// Mutation'da kullan
builder.mutationField("createProductBulk", (t) =>
  t.prismaField({
    type: ["Product"],
    args: {
      products: t.arg({ type: [ProductInput], required: true }),
    },
    authScopes: { employee: true },
    resolve: async (query, root, args, context) => {
      const companyId = context.user!.companyId!;

      return context.prisma.$transaction(
        args.products.map((product) =>
          context.prisma.product.create({
            data: { ...product, companyId },
          })
        )
      );
    },
  })
);
```

### Adım 4.3: Mutation'ı Export Et

**Dosya**: `src/graphql/mutations/index.ts`

```typescript
import "./productMutation";
// ... diğer mutations
```

---

## 5. Authorization Ekleme

### 5.1: Auth Scope'lar

**Mevcut Scope'lar** (`src/graphql/builder.ts`):

```typescript
authScopes: async (context: Context) => ({
  public: true,                              // Herkes
  user: !!context.user,                      // Authenticated user
  admin: context.user?.role === "ADMIN",     // Admin
  companyOwner: context.user?.role === "COMPANY_OWNER",
  employee: context.user?.role === "COMPANY_EMPLOYEE",
})
```

### 5.2: Field-Level Authorization

```typescript
builder.prismaNode("Product", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name"), // Public

    // Sadece authenticated users
    price: t.exposeFloat("price", {
      authScopes: { user: true },
    }),

    // Sadece company owner
    costPrice: t.exposeFloat("costPrice", {
      authScopes: { companyOwner: true },
    }),
  }),
});
```

### 5.3: Query/Mutation Authorization

```typescript
builder.queryField("product", (t) =>
  t.prismaField({
    type: "Product",
    authScopes: { user: true }, // ✅ Query level authorization
    resolve: async (query, root, args, context) => {
      // Context'te user otomatik kontrol edilir
      return context.prisma.product.findUnique({...});
    },
  })
);
```

### 5.4: Custom Authorization Logic

```typescript
builder.mutationField("deleteProduct", (t) =>
  t.field({
    type: "Boolean",
    args: { id: t.arg.int({ required: true }) },
    authScopes: { employee: true },
    resolve: async (root, args, context) => {
      // Extra auth check
      const product = await context.prisma.product.findUnique({
        where: { id: args.id },
        select: { companyId: true, createdById: true },
      });

      // Sadece kendi şirketinin ürününü silebilir
      if (product?.companyId !== context.user?.companyId) {
        throw new Error("Unauthorized");
      }

      // Ya da sadece oluşturan kişi silebilir
      if (product?.createdById !== context.user?.id) {
        throw new Error("Only creator can delete");
      }

      await context.prisma.product.delete({ where: { id: args.id } });
      return true;
    },
  })
);
```

---

## 6. Best Practices

### ✅ DO - Yapılması Gerekenler

#### 1. **Her Zaman `...query` Kullan**
```typescript
// ✅ DOĞRU
resolve: async (query, root, args, context) => {
  return context.prisma.product.findMany({
    ...query, // Pothos otomatik optimize eder
    where: { ... },
  });
}
```

#### 2. **Authorization Scope Kullan**
```typescript
// ✅ DOĞRU - Declarative
builder.queryField("products", (t) =>
  t.prismaField({
    type: ["Product"],
    authScopes: { user: true }, // ✅
    resolve: async (...) => { ... },
  })
);

// ❌ YANLIŞ - Manual check
resolve: async (..., context) => {
  if (!context.user) throw new Error("Unauthorized");
  // ...
}
```

#### 3. **Relay Connection Kullan (Büyük Listeler)**
```typescript
// ✅ 1000+ kayıt için
builder.queryField("productsConnection", (t) =>
  t.prismaConnection({
    type: "Product",
    cursor: "id",
    totalCount: true,
  })
);
```

#### 4. **Input Type Kullan (3+ Args)**
```typescript
// ✅ DOĞRU - Clean
const ProductInput = builder.inputType("ProductInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    price: t.float({ required: true }),
    stock: t.int({ required: true }),
  }),
});

// ❌ YANLIŞ - Too many args
builder.mutationField("createProduct", (t) =>
  t.field({
    args: {
      name: t.arg.string({ required: true }),
      price: t.arg.float({ required: true }),
      stock: t.arg.int({ required: true }),
      description: t.arg.string(),
      // 10+ daha fazla arg...
    },
  })
);
```

#### 5. **Transaction Kullan (Multiple Operations)**
```typescript
// ✅ DOĞRU
return context.prisma.$transaction(async (tx) => {
  const product = await tx.product.create({ ... });
  await tx.inventory.update({ ... });
  return product;
});
```

#### 6. **Error Handling**
```typescript
// ✅ DOĞRU - GraphQL Error
import { GraphQLError } from "graphql";

if (!product) {
  throw new GraphQLError("Product not found", {
    extensions: {
      code: "NOT_FOUND",
      productId: args.id,
    },
  });
}
```

### ❌ DON'T - Yapılmaması Gerekenler

#### 1. **`...query` Kullanmamak**
```typescript
// ❌ YANLIŞ - N+1 queries!
return context.prisma.product.findMany({
  where: { ... },
  // ...query yok = optimization yok
});
```

#### 2. **Manuel Authorization**
```typescript
// ❌ YANLIŞ
resolve: async (root, args, context) => {
  if (!context.user) throw new Error("Unauthorized");
  if (context.user.role !== "ADMIN") throw new Error("Forbidden");
  // ...
}

// ✅ DOĞRU
authScopes: { admin: true },
```

#### 3. **Sensitive Data Leak**
```typescript
// ❌ YANLIŞ - Password exposed!
builder.prismaObject("User", {
  fields: (t) => ({
    password: t.exposeString("password"), // ❌
  }),
});
```

#### 4. **SQL Injection Risk**
```typescript
// ❌ YANLIŞ - Raw SQL
await context.prisma.$queryRaw`
  SELECT * FROM products WHERE name = ${args.name}
`;

// ✅ DOĞRU - Prisma client
await context.prisma.product.findMany({
  where: { name: args.name },
});
```

---

## 7. Testing

### Test Query (GraphiQL)

```graphql
# Create
mutation CreateProduct {
  createProduct(
    name: "Laptop"
    price: 999.99
    stock: 10
    categoryId: 1
  ) {
    id
    name
    price
  }
}

# Read
query GetProducts {
  products(take: 10) {
    id
    name
    price
    category {
      name
    }
  }
}

# Update
mutation UpdateProduct {
  updateProduct(
    id: 1
    price: 899.99
    stock: 5
  ) {
    id
    name
    price
    stock
  }
}

# Delete
mutation DeleteProduct {
  deleteProduct(id: 1)
}
```

---

## 8. Checklist

Yeni feature eklerken:

- [ ] Prisma schema güncellendi
- [ ] Migration çalıştırıldı (`npx prisma migrate dev`)
- [ ] Prisma generate yapıldı (`npx prisma generate`)
- [ ] GraphQL type oluşturuldu (`src/graphql/types/index.ts`)
- [ ] Query eklendi (`src/graphql/queries/*.ts`)
- [ ] Mutation eklendi (`src/graphql/mutations/*.ts`)
- [ ] Authorization scope'lar eklendi
- [ ] Export edildi (`index.ts` dosyalarında)
- [ ] TypeScript kontrolü yapıldı (`npx tsc --noEmit`)
- [ ] Backend başlatıldı (`npm run dev`)
- [ ] GraphiQL'de test edildi (`http://localhost:4001/graphql`)

---

## 9. Hızlı Başlangıç Template

### Minimal Query Template

```typescript
// src/graphql/queries/myQuery.ts
import builder from "../builder";

builder.queryField("myEntity", (t) =>
  t.prismaField({
    type: "MyEntity",
    args: { id: t.arg.int({ required: true }) },
    authScopes: { user: true },
    resolve: async (query, root, args, context) => {
      return context.prisma.myEntity.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);
```

### Minimal Mutation Template

```typescript
// src/graphql/mutations/myMutation.ts
import builder from "../builder";

builder.mutationField("createMyEntity", (t) =>
  t.prismaField({
    type: "MyEntity",
    args: {
      name: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, root, args, context) => {
      return context.prisma.myEntity.create({
        ...query,
        data: {
          name: args.name,
          companyId: context.user!.companyId!,
        },
      });
    },
  })
);
```

---

## 📚 Ek Kaynaklar

- **Pothos Docs**: https://pothos-graphql.dev/
- **Prisma Docs**: https://www.prisma.io/docs
- **GraphQL Yoga**: https://the-guild.dev/graphql/yoga-server

---

**Backend'e yeni özellik eklerken bu rehberi takip edin!** 🚀
