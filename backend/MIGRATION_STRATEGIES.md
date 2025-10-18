# 🔄 Migration Strategies

> Güvenli ve kesintisiz database migration stratejileri

**Tarih:** 18 Ekim 2025
**Versiyon:** 1.0.0

---

## 📋 İçindekiler

1. [Migration Best Practices](#1-migration-best-practices)
2. [Zero-Downtime Migrations](#2-zero-downtime-migrations)
3. [Data Migration Patterns](#3-data-migration-patterns)
4. [Rollback Strategies](#4-rollback-strategies)
5. [Testing Migrations](#5-testing-migrations)

---

## 1. 📘 Migration Best Practices

### 1.1 Development Workflow

```bash
# 1. Schema değişikliği yap (backend/prisma/schema.prisma)

# 2. Migration oluştur (create-only mode)
npx prisma migrate dev --create-only --name add_soft_delete_fields

# 3. Migration SQL'ini incele ve düzenle
code prisma/migrations/XXXXXX_add_soft_delete_fields/migration.sql

# 4. Migration'ı test et
npx prisma migrate dev

# 5. Test DB'de verify et
npx prisma studio

# 6. Başarılıysa production'a uygula
```

---

### 1.2 Migration Naming Convention

```
Good Names:
✅ add_soft_delete_to_collections
✅ create_audit_log_table
✅ add_indexes_for_performance
✅ update_cascade_rules_samples
✅ add_fulltext_search_indexes

Bad Names:
❌ update_schema
❌ fix_bug
❌ changes
❌ new_migration
```

---

### 1.3 Migration File Structure

```sql
-- Migration: add_soft_delete_to_collections
-- Date: 2025-10-18
-- Author: Backend Team
-- Description: Add soft delete support to Collection model

-- ========================================
-- FORWARD MIGRATION
-- ========================================

-- Add new columns
ALTER TABLE `collections`
  ADD COLUMN `deleted_at` DATETIME(3) NULL,
  ADD COLUMN `deleted_by` INTEGER NULL,
  ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for performance
CREATE INDEX `collections_is_deleted_idx` ON `collections`(`is_deleted`);
CREATE INDEX `collections_deleted_at_idx` ON `collections`(`deleted_at`);

-- Add foreign key
ALTER TABLE `collections`
  ADD CONSTRAINT `collections_deleted_by_fkey`
  FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
  ON DELETE SET NULL;

-- ========================================
-- DATA MIGRATION (if needed)
-- ========================================

-- Set is_deleted=false for existing records (already default, but explicit)
UPDATE `collections` SET `is_deleted` = false WHERE `is_deleted` IS NULL;

-- ========================================
-- ROLLBACK INSTRUCTIONS
-- ========================================
-- ALTER TABLE `collections` DROP FOREIGN KEY `collections_deleted_by_fkey`;
-- DROP INDEX `collections_is_deleted_idx` ON `collections`;
-- DROP INDEX `collections_deleted_at_idx` ON `collections`;
-- ALTER TABLE `collections` DROP COLUMN `deleted_at`;
-- ALTER TABLE `collections` DROP COLUMN `deleted_by`;
-- ALTER TABLE `collections` DROP COLUMN `is_deleted`;
```

---

## 2. 🚀 Zero-Downtime Migrations

### 2.1 Adding Non-Nullable Column (Multi-Step Process)

#### ❌ Wrong Way (Causes Downtime)
```sql
-- This will fail if table has existing data!
ALTER TABLE `samples`
  ADD COLUMN `priority` VARCHAR(10) NOT NULL DEFAULT 'MEDIUM';
```

#### ✅ Correct Way (Zero-Downtime)

**Step 1:** Add nullable column with default
```sql
-- Migration 1: add_priority_column_nullable
ALTER TABLE `samples`
  ADD COLUMN `priority` VARCHAR(10) NULL DEFAULT 'MEDIUM';
```

**Step 2:** Backfill existing data
```sql
-- Migration 2: backfill_priority_values
UPDATE `samples` SET `priority` = 'MEDIUM' WHERE `priority` IS NULL;
UPDATE `samples` SET `priority` = 'HIGH' WHERE `status` = 'URGENT';
```

**Step 3:** Make column NOT NULL
```sql
-- Migration 3: make_priority_not_null
ALTER TABLE `samples`
  MODIFY COLUMN `priority` VARCHAR(10) NOT NULL DEFAULT 'MEDIUM';
```

---

### 2.2 Renaming Column (Blue-Green Strategy)

#### Phase 1: Add New Column
```sql
-- Migration 1: add_new_column_name
ALTER TABLE `samples`
  ADD COLUMN `customer_note_new` TEXT NULL;

-- Copy data
UPDATE `samples`
  SET `customer_note_new` = `customerNote`;
```

#### Phase 2: Update Application Code
```typescript
// Deploy code that reads from BOTH columns
const note = sample.customer_note_new || sample.customerNote;
```

#### Phase 3: Switch Application to New Column
```typescript
// Deploy code that uses only new column
const note = sample.customer_note_new;
```

#### Phase 4: Drop Old Column
```sql
-- Migration 2: drop_old_column_name
ALTER TABLE `samples`
  DROP COLUMN `customerNote`;
```

---

### 2.3 Changing Enum Values

#### Problem: Adding/Removing Enum Values

**Current:**
```prisma
enum SampleStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**Want to add:**
```prisma
enum SampleStatus {
  PENDING
  APPROVED
  REJECTED
  ON_HOLD  // NEW
}
```

#### Solution: MySQL Enum Limitation Workaround

```sql
-- Step 1: Create temporary column
ALTER TABLE `samples`
  ADD COLUMN `status_new` ENUM(
    'PENDING', 'APPROVED', 'REJECTED', 'ON_HOLD'
  ) NULL;

-- Step 2: Copy data
UPDATE `samples` SET `status_new` = `status`;

-- Step 3: Drop old column
ALTER TABLE `samples` DROP COLUMN `status`;

-- Step 4: Rename new column
ALTER TABLE `samples`
  CHANGE COLUMN `status_new` `status`
  ENUM('PENDING', 'APPROVED', 'REJECTED', 'ON_HOLD')
  NOT NULL DEFAULT 'PENDING';
```

**Better Alternative:** Use VARCHAR instead of ENUM

```prisma
model Sample {
  status String @default("PENDING")  // More flexible
}

// Validate in application layer
const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'ON_HOLD'];

if (!VALID_STATUSES.includes(input.status)) {
  throw new Error('Invalid status');
}
```

---

## 3. 📦 Data Migration Patterns

### 3.1 Complex Data Transformation

```typescript
// prisma/migrations/XXXXXX_transform_data/script.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  // Get all samples that need transformation
  const samples = await prisma.sample.findMany({
    where: {
      // Your condition
    }
  });

  console.log(`Found ${samples.length} samples to migrate`);

  // Process in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < samples.length; i += batchSize) {
    const batch = samples.slice(i, i + batchSize);

    await prisma.$transaction(
      batch.map(sample =>
        prisma.sample.update({
          where: { id: sample.id },
          data: {
            // Your transformation
            newField: transformOldData(sample.oldField)
          }
        })
      )
    );

    console.log(`Migrated ${Math.min(i + batchSize, samples.length)}/${samples.length}`);
  }

  console.log('Migration completed!');
}

migrateData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run migration:**
```bash
ts-node prisma/migrations/XXXXXX_transform_data/script.ts
```

---

### 3.2 JSON Data Migration

```typescript
// Migrate old JSON structure to new structure
async function migrateAccessoriesFormat() {
  const collections = await prisma.collection.findMany({
    select: { id: true, accessories: true }
  });

  for (const collection of collections) {
    if (!collection.accessories) continue;

    const oldFormat = JSON.parse(collection.accessories);

    // Transform to new format
    const newFormat = {
      buttons: oldFormat.button_type || 'standard',
      buttonColor: oldFormat.button_color,
      zipper: oldFormat.zipper_type || 'standard',
      labels: oldFormat.label_type || 'printed',
      other: oldFormat.accessories?.map((item: any) => ({
        item: item.name,
        description: item.desc
      }))
    };

    await prisma.collection.update({
      where: { id: collection.id },
      data: {
        accessories: JSON.stringify(newFormat)
      }
    });
  }
}
```

---

## 4. ⏮️ Rollback Strategies

### 4.1 Migration Rollback

```bash
# Check migration history
npx prisma migrate status

# Rollback last migration (dangerous!)
npx prisma migrate resolve --rolled-back 20251018_migration_name

# Better: Create reverse migration
npx prisma migrate dev --name rollback_previous_change
```

---

### 4.2 Manual Rollback Script

```sql
-- migrations/XXXXXX_rollback_add_soft_delete/migration.sql

-- Remove foreign key first
ALTER TABLE `collections`
  DROP FOREIGN KEY `collections_deleted_by_fkey`;

-- Remove indexes
DROP INDEX `collections_is_deleted_idx` ON `collections`;
DROP INDEX `collections_deleted_at_idx` ON `collections`;

-- Remove columns
ALTER TABLE `collections`
  DROP COLUMN `deleted_at`,
  DROP COLUMN `deleted_by`,
  DROP COLUMN `is_deleted`;
```

---

### 4.3 Feature Flag for Gradual Rollout

```typescript
// Enable new feature gradually
const SOFT_DELETE_ENABLED = process.env.FEATURE_SOFT_DELETE === 'true';

async function deleteCollection(id: number) {
  if (SOFT_DELETE_ENABLED) {
    // Soft delete
    return prisma.collection.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  } else {
    // Hard delete (old behavior)
    return prisma.collection.delete({ where: { id } });
  }
}
```

---

## 5. 🧪 Testing Migrations

### 5.1 Test Database Setup

```bash
# Create separate test database
mysql -u root -p -e "CREATE DATABASE textile_test_db;"

# Set test environment
export DATABASE_URL="mysql://user:pass@localhost:3306/textile_test_db"

# Run migrations on test DB
npx prisma migrate deploy

# Test with sample data
npx prisma db seed
```

---

### 5.2 Migration Test Script

```typescript
// tests/migration.test.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

describe('Migration Tests', () => {
  beforeAll(async () => {
    // Reset test database
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
    });
  });

  test('should add soft delete fields to collections', async () => {
    // Run migration
    execSync('npx prisma migrate deploy');

    // Verify schema
    const result = await prisma.$queryRaw`
      SHOW COLUMNS FROM collections LIKE 'is_deleted'
    `;

    expect(result).toHaveLength(1);
  });

  test('should preserve existing data after migration', async () => {
    // Create test data before migration
    const collection = await prisma.collection.create({
      data: { name: 'Test Collection', modelCode: 'TEST-001' }
    });

    // Run migration
    execSync('npx prisma migrate deploy');

    // Verify data still exists
    const found = await prisma.collection.findUnique({
      where: { id: collection.id }
    });

    expect(found).toBeDefined();
    expect(found?.name).toBe('Test Collection');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
```

---

### 5.3 Production Migration Checklist

```markdown
## Pre-Migration Checklist

- [ ] Backup production database
- [ ] Test migration on staging database
- [ ] Review migration SQL manually
- [ ] Estimate migration time (for large tables)
- [ ] Plan maintenance window if needed
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Test rollback on staging

## During Migration

- [ ] Enable maintenance mode if needed
- [ ] Run migration with monitoring
- [ ] Verify no errors in logs
- [ ] Check data integrity

## Post-Migration

- [ ] Verify application works correctly
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Verify data migration correctness
- [ ] Update documentation
- [ ] Notify stakeholders of completion
```

---

## 📊 Migration Timeline Example

### Large-Scale Migration (Adding Soft Delete)

```
Day 1-2: Development
├── Write migration scripts
├── Test on dev database
└── Code review

Day 3-4: Staging
├── Deploy to staging
├── Run migration on staging DB
├── Integration testing
└── Performance testing

Day 5: Pre-Production
├── Create database backup
├── Dry-run on production replica
├── Measure migration time
└── Final review

Day 6: Production
├── Maintenance window: 2:00 AM - 4:00 AM
├── 2:00 AM: Database backup
├── 2:15 AM: Deploy new code (backward compatible)
├── 2:30 AM: Run migration
├── 2:45 AM: Verification
├── 3:00 AM: Monitor for 1 hour
└── 4:00 AM: Maintenance window ends

Day 7: Post-Migration
├── Monitor performance
├── Check error logs
└── Update documentation
```

---

## 🎯 Common Migration Scenarios

### Scenario 1: Adding Index

```sql
-- Simple, usually safe
CREATE INDEX `samples_company_status_idx`
  ON `samples`(`companyId`, `status`);

-- Time estimate: O(n) where n = table size
-- For 100K rows: ~10-30 seconds
-- For 1M rows: ~2-5 minutes
```

### Scenario 2: Adding Column

```sql
-- Fast operation (metadata only)
ALTER TABLE `samples`
  ADD COLUMN `priority` VARCHAR(10) NULL DEFAULT 'MEDIUM';

-- Time estimate: <1 second (any table size)
```

### Scenario 3: Changing Column Type

```sql
-- Slow! Rewrites entire table
ALTER TABLE `samples`
  MODIFY COLUMN `description` TEXT;

-- Time estimate: O(n)
-- Requires table copy
-- Plan maintenance window for large tables
```

---

## 📚 Resources

- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [MySQL ALTER TABLE Performance](https://dev.mysql.com/doc/refman/8.0/en/alter-table.html)
- [Zero-Downtime Deployments](https://stripe.com/blog/online-migrations)

---

**Son Güncelleme:** 18 Ekim 2025
**Test Environment:** backend/
**Status:** ✅ Ready for Implementation
