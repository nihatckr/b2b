# 🚀 Backend Geliştirme Önerileri

> Kapsamlı geliştirme ve iyileştirme önerileri

**Tarih:** 18 Ekim 2025
**Versiyon:** 1.0.0
**Durum:** Planning Phase

---

## 📋 İçindekiler

1. [Database Schema İyileştirmeleri](#1-database-schema-iyileştirmeleri)
2. [Performance Optimizasyonları](#2-performance-optimizasyonları)
3. [Security Enhancements](#3-security-enhancements)
4. [Scalability Improvements](#4-scalability-improvements)
5. [Developer Experience](#5-developer-experience)
6. [Monitoring & Observability](#6-monitoring--observability)
7. [Testing Infrastructure](#7-testing-infrastructure)

---

## 1. 🗄️ Database Schema İyileştirmeleri

### 1.1 Index Optimizasyonları

#### Problem
Bazı frequently-queried fields'larda index eksikliği performans sorunlarına yol açabilir.

#### Çözüm
```prisma
model Sample {
  // Mevcut indexes
  @@index([sampleId])

  // 🆕 ÖNERİLEN INDEXES
  @@index([companyId, status])          // Company dashboard filtering
  @@index([manufactureId, status])      // Manufacturer dashboard
  @@index([customerId, status])         // Customer dashboard
  @@index([createdAt])                  // Date range queries
  @@index([status, createdAt])          // Combined status+date filtering
}

model Order {
  // 🆕 ÖNERİLEN INDEXES
  @@index([companyId, status])
  @@index([manufactureId, status])
  @@index([customerId, status])
  @@index([createdAt])
  @@index([status, estimatedProductionDate])  // Production planning
}

model Task {
  // Mevcut
  @@index([userId, status])
  @@index([userId, dueDate])

  // 🆕 ÖNERİLEN
  @@index([assignedToId, status])       // Assigned tasks filtering
  @@index([entityType, relatedStatus])  // Already exists ✅
  @@index([collectionId])               // Collection-based filtering
  @@index([priority, dueDate])          // Priority sorting
}
```

**Etki:** %30-50 query performance improvement

---

### 1.2 Cascade Delete Kuralları

#### Problem
Collection silindiğinde Sample/Order ne olmalı?

#### Öneriler
```prisma
model Sample {
  collection Collection? @relation(
    fields: [collectionId],
    references: [id],
    onDelete: Restrict  // 🆕 Collection silinemesin
  )
}

model Order {
  collection Collection @relation(
    fields: [collectionId],
    references: [id],
    onDelete: Restrict  // 🆕 Collection silinemesin
  )
}

// Alternatif: Soft Delete Pattern
model Collection {
  deletedAt DateTime?  // 🆕 Soft delete
  isDeleted Boolean @default(false)  // 🆕 Flag
}
```

**Karar:** Business logic'e göre belirlenecek

---

### 1.3 JSON Field Type Definitions

#### Problem
JSON fields için TypeScript type safety eksik

#### Çözüm
```typescript
// backend/types/schema.ts

// Collection.accessories
type CollectionAccessories = {
  buttons: 'metal' | 'plastic' | 'wood' | 'custom';
  zipper: 'YKK' | 'standard' | 'invisible' | 'custom';
  labels: 'woven' | 'printed' | 'embroidered';
  other?: string[];
};

// Collection.productionSchedule
type ProductionSchedule = {
  PLANNING: number;   // days
  FABRIC: number;
  CUTTING: number;
  SEWING: number;
  QUALITY: number;
  PACKAGING: number;
  SHIPPING: number;
};

// Task.actionData
type TaskActionData = {
  buttonText?: string;
  endpoint?: string;
  requiredFields?: string[];
  confirmationMessage?: string;
  metadata?: Record<string, any>;
};

// Sample.images
type SampleImages = string[];  // Array of URLs

// Collection.colors
type CollectionColors = string[];  // Array of color names
```

**Kullanım:**
```typescript
import { CollectionAccessories } from '@/types/schema';

const accessories: CollectionAccessories = JSON.parse(
  collection.accessories || '{}'
);
```

---

### 1.4 Full-Text Search Support

#### Problem
Sample/Collection description'larda text search yavaş

#### Çözüm (MySQL)
```prisma
model Sample {
  name         String?
  description  String? @db.Text

  // 🆕 Full-Text Index
  @@index([name, description], type: Fulltext)
}

model Collection {
  name         String
  description  String?

  @@index([name, description], type: Fulltext)
}
```

**Query:**
```typescript
// Prisma Raw Query
const results = await prisma.$queryRaw`
  SELECT * FROM samples
  WHERE MATCH(name, description) AGAINST(${searchTerm} IN BOOLEAN MODE)
  LIMIT 20
`;
```

**Alternatif:** Elasticsearch/Meilisearch entegrasyonu

---

## 2. ⚡ Performance Optimizasyonları

### 2.1 Query Optimization

#### N+1 Query Problem
```typescript
// ❌ BAD - N+1 problem
const samples = await prisma.sample.findMany();
for (const sample of samples) {
  const customer = await prisma.user.findUnique({
    where: { id: sample.customerId }
  });
}

// ✅ GOOD - Include relation
const samples = await prisma.sample.findMany({
  include: {
    customer: true,
    manufacture: true,
    collection: true
  }
});

// ✅ BETTER - Select only needed fields
const samples = await prisma.sample.findMany({
  select: {
    id: true,
    sampleNumber: true,
    status: true,
    customer: {
      select: { id: true, name: true, email: true }
    }
  }
});
```

---

### 2.2 Pagination Best Practices

```typescript
// ❌ BAD - Offset pagination (slow for large datasets)
const samples = await prisma.sample.findMany({
  skip: page * limit,
  take: limit
});

// ✅ GOOD - Cursor-based pagination
const samples = await prisma.sample.findMany({
  take: limit,
  cursor: lastSampleId ? { id: lastSampleId } : undefined,
  orderBy: { createdAt: 'desc' }
});
```

---

### 2.3 Batch Operations

```typescript
// ❌ BAD - Multiple individual queries
for (const taskData of tasksToCreate) {
  await prisma.task.create({ data: taskData });
}

// ✅ GOOD - Batch create
await prisma.task.createMany({
  data: tasksToCreate,
  skipDuplicates: true
});
```

---

### 2.4 Caching Strategy

```typescript
// Redis caching example
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedCollection(id: number) {
  const cacheKey = `collection:${id}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from DB
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { category: true, author: true }
  });

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(collection));

  return collection;
}
```

---

## 3. 🔒 Security Enhancements

### 3.1 Row-Level Security (RLS)

```typescript
// Prisma Middleware for company isolation
prisma.$use(async (params, next) => {
  if (params.model === 'Sample') {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        companyId: currentUser.companyId  // Auto-filter by company
      };
    }
  }
  return next(params);
});
```

---

### 3.2 Input Validation

```typescript
// Zod schema for Sample input
import { z } from 'zod';

const createSampleSchema = z.object({
  sampleType: z.enum(['STANDARD', 'REVISION', 'CUSTOM', 'DEVELOPMENT']),
  customerNote: z.string().max(5000).optional(),
  collectionId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  manufactureId: z.number().int().positive()
});

// Usage in resolver
const input = createSampleSchema.parse(rawInput);
```

---

### 3.3 Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/graphql', apiLimiter);
```

---

## 4. 📈 Scalability Improvements

### 4.1 Database Sharding Strategy

```typescript
// Company-based sharding
// Shard 1: companyId 1-1000
// Shard 2: companyId 1001-2000
// Shard 3: companyId 2001-3000

function getShardForCompany(companyId: number): string {
  const shardIndex = Math.floor(companyId / 1000);
  return `DATABASE_URL_SHARD_${shardIndex}`;
}
```

---

### 4.2 Read Replicas

```typescript
// Master for writes
const masterDb = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL_MASTER } }
});

// Replica for reads
const replicaDb = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL_REPLICA } }
});

// Usage
async function getSamples() {
  return replicaDb.sample.findMany();  // Read from replica
}

async function createSample(data) {
  return masterDb.sample.create({ data });  // Write to master
}
```

---

### 4.3 Event-Driven Architecture

```typescript
// Event emitter for async operations
import EventEmitter from 'events';

const eventBus = new EventEmitter();

// Emit event when sample status changes
eventBus.emit('sample.status.changed', {
  sampleId: sample.id,
  oldStatus: oldStatus,
  newStatus: newStatus
});

// Listeners
eventBus.on('sample.status.changed', async (data) => {
  await createNotification(data);
  await createTasks(data);
  await sendEmail(data);
});
```

---

## 5. 👨‍💻 Developer Experience

### 5.1 Type-Safe GraphQL

```typescript
// Codegen for type safety
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const GET_SAMPLE: TypedDocumentNode<GetSampleQuery, GetSampleQueryVariables> = gql`
  query GetSample($id: Int!) {
    sample(id: $id) {
      id
      sampleNumber
      status
    }
  }
`;
```

---

### 5.2 Auto-Generated Documentation

```typescript
// GraphQL schema with detailed descriptions
export const Sample = objectType({
  name: 'Sample',
  description: 'Numune talebi ve üretim takip modeli',
  definition(t) {
    t.int('id', { description: 'Unique identifier' });
    t.string('sampleNumber', {
      description: 'Numune takip numarası (format: SMP-YYYY-XXXXX)'
    });
    t.field('status', {
      type: 'SampleStatus',
      description: 'Numune durumu (28 farklı status)'
    });
  }
});
```

---

### 5.3 Development Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "db:reset": "prisma migrate reset --force",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "generate": "npm run generate:prisma && npm run generate:nexus",
    "test": "jest --watch",
    "test:e2e": "jest --config jest.e2e.config.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

---

## 6. 📊 Monitoring & Observability

### 6.1 Query Performance Monitoring

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' }
  ]
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {  // Log slow queries (>1s)
    console.warn(`Slow query detected: ${e.query} (${e.duration}ms)`);
  }
});
```

---

### 6.2 Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Usage in resolvers
try {
  await prisma.sample.create({ data });
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

---

## 7. 🧪 Testing Infrastructure

### 7.1 Unit Tests

```typescript
// sample.test.ts
import { prismaMock } from './singleton';
import { createSample } from './sampleService';

test('should create sample with correct data', async () => {
  const mockSample = { id: 1, sampleNumber: 'SMP-2025-00001' };

  prismaMock.sample.create.mockResolvedValue(mockSample);

  const result = await createSample({ /* ... */ });

  expect(result).toEqual(mockSample);
});
```

---

### 7.2 Integration Tests

```typescript
// sample.integration.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('should create and retrieve sample', async () => {
  const sample = await prisma.sample.create({
    data: { /* ... */ }
  });

  const retrieved = await prisma.sample.findUnique({
    where: { id: sample.id }
  });

  expect(retrieved).toBeDefined();
});
```

---

## 📚 Referanslar

### Prisma Best Practices
- [Performance & Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Testing](https://www.prisma.io/docs/guides/testing)
- [Deployment](https://www.prisma.io/docs/guides/deployment)

### GraphQL Best Practices
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Nexus Documentation](https://nexusjs.org/)

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GraphQL Security](https://graphql.org/learn/authorization/)

---

**Son Güncelleme:** 18 Ekim 2025
**Hazırlayan:** Backend Development Team
**Durum:** ✅ Planning Phase
