# 🗄️ Schema Improvements Guide

> Prisma schema iyileştirme önerileri ve best practices

**Tarih:** 18 Ekim 2025
**Versiyon:** 1.0.0

---

## 📋 İçindekiler

1. [Cascade Rules İyileştirmeleri](#1-cascade-rules-iyileştirmeleri)
2. [Soft Delete Pattern](#2-soft-delete-pattern)
3. [Audit Log System](#3-audit-log-system)
4. [Computed Fields](#4-computed-fields)
5. [JSON Schema Definitions](#5-json-schema-definitions)
6. [Full-Text Search](#6-full-text-search)

---

## 1. 🔗 Cascade Rules İyileştirmeleri

### Current State Analysis

```prisma
// Mevcut durum - Collection silindiğinde ne olur?
model Sample {
  collection Collection? @relation(
    fields: [collectionId],
    references: [id]
    // ❌ onDelete belirtilmemiş - default: SetNull
  )
}

model Order {
  collection Collection @relation(
    fields: [collectionId],
    references: [id]
    // ❌ onDelete belirtilmemiş - default: Restrict
  )
}
```

### 🆕 Recommended Cascade Rules

#### Option 1: Strict Protection (Recommended)

```prisma
model Sample {
  collection Collection? @relation(
    "SampleCollection",
    fields: [collectionId],
    references: [id],
    onDelete: Restrict  // ✅ Collection silinmeden önce samples temizlenmeli
  )
}

model Order {
  collection Collection @relation(
    fields: [collectionId],
    references: [id],
    onDelete: Restrict  // ✅ Collection silinmeden önce orders temizlenmeli
  )
}

// Business Rule: Collection ancak ilişkili sample/order yoksa silinebilir
```

#### Option 2: Soft Delete (Production Grade)

```prisma
model Collection {
  // ... existing fields

  // Soft delete fields
  deletedAt DateTime?  // 🆕
  isDeleted Boolean @default(false)  // 🆕

  @@index([isDeleted])  // 🆕 Performance
}

// Usage in resolvers
async function deleteCollection(id: number) {
  // Soft delete instead of hard delete
  return prisma.collection.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
}

// Queries automatically filter deleted items
async function getCollections(companyId: number) {
  return prisma.collection.findMany({
    where: {
      companyId,
      isDeleted: false  // Filter soft-deleted items
    }
  });
}
```

#### Option 3: Cascade with Archive

```prisma
model Collection {
  deletedAt DateTime?

  samples Sample[] @relation("SampleCollection")
  orders Order[]
}

model Sample {
  collection Collection? @relation(
    "SampleCollection",
    fields: [collectionId],
    references: [id],
    onDelete: SetNull  // ✅ Collection silinince collectionId = null
  )

  archivedCollectionData Json?  // 🆕 Collection data backup
}

// Before delete, archive collection data
async function deleteCollectionWithArchive(id: number) {
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { samples: true, orders: true }
  });

  // Archive collection data in samples/orders
  await prisma.sample.updateMany({
    where: { collectionId: id },
    data: {
      archivedCollectionData: {
        name: collection.name,
        modelCode: collection.modelCode,
        // ... other important fields
      }
    }
  });

  // Now safe to delete
  await prisma.collection.delete({ where: { id } });
}
```

---

### Cascade Rules Summary Table

| Relation | onDelete | Effect | Recommendation |
|----------|----------|--------|----------------|
| Sample → Collection | `Restrict` | Cannot delete collection if samples exist | ✅ Safe |
| Order → Collection | `Restrict` | Cannot delete collection if orders exist | ✅ Safe |
| Message → Sample | `Cascade` | Delete messages when sample deleted | ✅ OK (messages are contextual) |
| Message → Order | `Cascade` | Delete messages when order deleted | ✅ OK |
| Task → Sample | `SetNull` | Keep task but remove sample reference | ⚠️ Consider Cascade |
| Notification → Sample | `Cascade` | Delete notifications when sample deleted | ✅ OK |
| ProductionTracking → Sample | `Cascade` | Delete tracking when sample deleted | ⚠️ Consider archive first |

---

## 2. 🗑️ Soft Delete Pattern

### Implementation

```prisma
// Base model with soft delete
model Collection {
  id          Int       @id @default(autoincrement())
  // ... existing fields ...

  // Soft delete fields
  deletedAt   DateTime?
  deletedBy   Int?
  isDeleted   Boolean   @default(false)

  deletedByUser User? @relation("CollectionDeletedBy", fields: [deletedBy], references: [id])

  @@index([isDeleted])
  @@index([deletedAt])
}

// Extend to other critical models
model Sample {
  // ... fields ...
  deletedAt DateTime?
  deletedBy Int?
  isDeleted Boolean @default(false)
}

model Order {
  // ... fields ...
  deletedAt DateTime?
  deletedBy Int?
  isDeleted Boolean @default(false)
}
```

### Prisma Middleware for Auto-Filtering

```typescript
// src/middleware/softDelete.ts
export function softDeleteMiddleware() {
  return async (params: any, next: any) => {
    const modelsWithSoftDelete = ['collection', 'sample', 'order'];

    if (!modelsWithSoftDelete.includes(params.model?.toLowerCase())) {
      return next(params);
    }

    // Auto-filter deleted items on findMany
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        isDeleted: false
      };
    }

    // Convert delete to update (soft delete)
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = {
        isDeleted: true,
        deletedAt: new Date()
      };
    }

    // Convert deleteMany to updateMany
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      params.args.data = {
        isDeleted: true,
        deletedAt: new Date()
      };
    }

    return next(params);
  };
}

// Apply middleware
prisma.$use(softDeleteMiddleware());
```

### Benefits
- ✅ Data recovery possible
- ✅ Audit trail maintained
- ✅ Safer than hard delete
- ⚠️ Requires periodic cleanup
- ⚠️ Slightly more complex queries

---

## 3. 📜 Audit Log System

### Schema Design

```prisma
model AuditLog {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())

  // What changed
  entityType  String   // "Sample", "Order", "Collection"
  entityId    Int      // ID of changed entity
  action      String   // "CREATE", "UPDATE", "DELETE"

  // Who changed it
  userId      Int
  user        User     @relation(fields: [userId], references: [id])

  // Changes details
  oldValues   Json?    // Before state
  newValues   Json?    // After state
  changedFields String[] // List of changed field names

  // Context
  ipAddress   String?
  userAgent   String?
  metadata    Json?

  @@index([entityType, entityId])
  @@index([userId, createdAt])
  @@index([action])
  @@map("audit_logs")
}
```

### Prisma Middleware Implementation

```typescript
// src/middleware/auditLog.ts
export function auditLogMiddleware(userId?: number, ipAddress?: string) {
  return async (params: any, next: any) => {
    const auditedModels = ['sample', 'order', 'collection'];

    if (!auditedModels.includes(params.model?.toLowerCase())) {
      return next(params);
    }

    // For updates, get old values first
    let oldValues: any = null;
    if (params.action === 'update' || params.action === 'delete') {
      oldValues = await prisma[params.model].findUnique({
        where: params.args.where
      });
    }

    // Execute the operation
    const result = await next(params);

    // Log the change
    if (userId) {
      await prisma.auditLog.create({
        data: {
          entityType: params.model,
          entityId: result.id,
          action: params.action.toUpperCase(),
          userId,
          oldValues,
          newValues: result,
          changedFields: getChangedFields(oldValues, result),
          ipAddress,
          metadata: { timestamp: new Date() }
        }
      });
    }

    return result;
  };
}

function getChangedFields(oldData: any, newData: any): string[] {
  if (!oldData) return Object.keys(newData);

  return Object.keys(newData).filter(
    key => JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
  );
}
```

### Usage

```typescript
// In GraphQL context
const prisma = new PrismaClient();
prisma.$use(auditLogMiddleware(context.userId, context.ipAddress));

// Query audit logs
const history = await prisma.auditLog.findMany({
  where: {
    entityType: 'Sample',
    entityId: sampleId
  },
  orderBy: { createdAt: 'desc' },
  include: { user: true }
});
```

---

## 4. 🧮 Computed Fields

### Virtual Fields (Application Level)

```prisma
// Add to Nexus types
export const Sample = objectType({
  name: 'Sample',
  definition(t) {
    // ... existing fields

    // 🆕 Computed fields
    t.field('totalCost', {
      type: 'Float',
      resolve: (sample) => {
        if (!sample.unitPrice || !sample.quantity) return 0;
        return sample.unitPrice * sample.quantity;
      }
    });

    t.field('daysUntilDeadline', {
      type: 'Int',
      resolve: (sample) => {
        if (!sample.estimatedProductionDate) return null;
        const now = new Date();
        const deadline = new Date(sample.estimatedProductionDate);
        const diffTime = deadline.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    });

    t.field('isOverdue', {
      type: 'Boolean',
      resolve: (sample) => {
        if (!sample.estimatedProductionDate) return false;
        return new Date() > new Date(sample.estimatedProductionDate);
      }
    });
  }
});
```

### Database-Level Computed Columns (MySQL)

```sql
-- Add generated column to Collection
ALTER TABLE collections
ADD COLUMN full_model_name VARCHAR(255)
GENERATED ALWAYS AS (
  CONCAT(name, ' - ', modelCode, ' (', season, ')')
) STORED;

-- Add generated column to Sample
ALTER TABLE samples
ADD COLUMN days_since_created INT
GENERATED ALWAYS AS (
  DATEDIFF(CURRENT_DATE, created_at)
) VIRTUAL;

-- Add index on generated column
CREATE INDEX idx_collections_full_model_name ON collections(full_model_name);
```

---

## 5. 📝 JSON Schema Definitions

### TypeScript Types for JSON Fields

```typescript
// backend/types/schema-json.ts

// Collection.accessories
export interface CollectionAccessories {
  buttons: 'metal' | 'plastic' | 'wood' | 'pearl' | 'custom';
  buttonColor?: string;
  zipper: 'YKK' | 'standard' | 'invisible' | 'none';
  zipperColor?: string;
  labels: 'woven' | 'printed' | 'embroidered' | 'none';
  labelText?: string;
  other?: {
    item: string;
    description: string;
  }[];
}

// Collection.productionSchedule
export interface ProductionSchedule {
  PLANNING: number;    // days
  FABRIC: number;
  CUTTING: number;
  SEWING: number;
  QUALITY: number;
  PACKAGING: number;
  SHIPPING: number;
  total?: number;  // Auto-calculated
}

// Task.actionData
export interface TaskActionData {
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline';
  confirmationRequired?: boolean;
  confirmationMessage?: string;
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiredFields?: string[];
  successMessage?: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

// Sample.revisionRequests
export interface RevisionRequest {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: number;
}

// User.permissions
export interface UserPermissions {
  collections: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  samples: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
  orders: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
  production: {
    view: boolean;
    update: boolean;
    qualityControl: boolean;
  };
  library: {
    manage: boolean;
  };
  users: {
    manage: boolean;
  };
}
```

### Validation with Zod

```typescript
import { z } from 'zod';

export const CollectionAccessoriesSchema = z.object({
  buttons: z.enum(['metal', 'plastic', 'wood', 'pearl', 'custom']),
  buttonColor: z.string().optional(),
  zipper: z.enum(['YKK', 'standard', 'invisible', 'none']),
  zipperColor: z.string().optional(),
  labels: z.enum(['woven', 'printed', 'embroidered', 'none']),
  labelText: z.string().max(100).optional(),
  other: z.array(z.object({
    item: z.string(),
    description: z.string()
  })).optional()
});

// Usage in mutation
const accessories = CollectionAccessoriesSchema.parse(
  JSON.parse(input.accessories || '{}')
);
```

---

## 6. 🔍 Full-Text Search

### MySQL Full-Text Index

```prisma
model Sample {
  name        String?
  description String? @db.Text

  // 🆕 Full-text index
  @@index([name, description], type: Fulltext, map: "sample_fulltext_idx")
}

model Collection {
  name        String
  description String?

  @@index([name, description], type: Fulltext, map: "collection_fulltext_idx")
}

model Company {
  name        String
  description String? @db.Text

  @@index([name, description], type: Fulltext, map: "company_fulltext_idx")
}
```

### Usage with Raw SQL

```typescript
// Search samples
async function searchSamples(searchTerm: string, companyId: number) {
  return prisma.$queryRaw`
    SELECT
      id, sampleNumber, name, status,
      MATCH(name, description) AGAINST(${searchTerm} IN BOOLEAN MODE) as relevance
    FROM samples
    WHERE companyId = ${companyId}
      AND MATCH(name, description) AGAINST(${searchTerm} IN BOOLEAN MODE)
    ORDER BY relevance DESC
    LIMIT 20
  `;
}

// Boolean operators
const results = await searchSamples('+cotton -polyester', 1);  // Must have cotton, must not have polyester
```

### Alternative: Elasticsearch Integration

```typescript
// For production-grade search
import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL
});

// Index sample on create/update
async function indexSample(sample: Sample) {
  await esClient.index({
    index: 'samples',
    id: sample.id.toString(),
    document: {
      sampleNumber: sample.sampleNumber,
      name: sample.name,
      description: sample.description,
      status: sample.status,
      companyId: sample.companyId,
      createdAt: sample.createdAt
    }
  });
}

// Search
async function elasticSearch(query: string, companyId: number) {
  const { hits } = await esClient.search({
    index: 'samples',
    body: {
      query: {
        bool: {
          must: [
            { match: { companyId } },
            { multi_match: {
              query,
              fields: ['name^2', 'description', 'sampleNumber^3']
            }}
          ]
        }
      }
    }
  });

  return hits.hits.map(hit => hit._source);
}
```

---

## 📊 Migration Checklist

### Before Production Deployment

- [ ] Test all cascade rules with sample data
- [ ] Implement soft delete on critical models
- [ ] Set up audit logging
- [ ] Add computed fields where needed
- [ ] Define JSON schemas and validators
- [ ] Test full-text search performance
- [ ] Benchmark query performance
- [ ] Document all schema changes

---

**Son Güncelleme:** 18 Ekim 2025
**Test Ortamı:** backend/
**Doküman Durumu:** ✅ Ready for Review
