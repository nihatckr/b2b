# Internationalization (i18n) Strategy

## Overview
This document outlines the i18n strategy for the textile production SaaS platform, where **backend stores canonical data** and **frontend handles all translations**.

## Architecture Decision

### Previous Approach (Removed)
- ❌ Backend stored multiple language fields: `nameTr`, `nameEn`, `nameEs`, `nameDe`, `nameZh`
- ❌ Each model had 5+ extra fields for translations
- ❌ Database bloat and maintenance complexity
- ❌ Required database migrations for translation updates

### New Approach (Implemented)
- ✅ Backend stores single `name` field (i18n key or canonical name)
- ✅ Frontend uses i18n library (e.g., react-i18next) for translations
- ✅ Translation files in JSON format (easy to manage)
- ✅ No database changes needed for new languages or translation updates

## Models Updated

### 1. LibraryItem (Line 1070)
**Before:**
```prisma
model LibraryItem {
  name        String
  nameTr      String?
  nameEn      String?
  nameEs      String?
  nameDe      String?
  nameZh      String?
  description String? @db.Text
  // ...
  @@fulltext([name, nameTr, nameEn, description])
}
```

**After:**
```prisma
model LibraryItem {
  name        String // i18n key or direct name (frontend handles translations)
  description String? @db.Text // i18n key or direct description
  // ...
  @@fulltext([name, description])
  @@index([code])
}
```

**Benefits:**
- 5 fields removed per record
- Simplified fulltext search
- Added `code` index for better performance

### 2. StandardCategory (Line 425)
**Before:**
```prisma
model StandardCategory {
  name             String
  nameTr           String?
  nameEn           String?
  nameEs           String?
  nameDe           String?
  nameZh           String?
  description      String? @db.Text
  descriptionTr    String? @db.Text
  descriptionEn    String? @db.Text
  // ...
  @@fulltext([name, description, keywords])
}
```

**After:**
```prisma
model StandardCategory {
  name        String // i18n key or direct name (frontend handles translations)
  description String? @db.Text // i18n key or direct description
  // ...
  @@fulltext([name, description, keywords])
}
```

**Benefits:**
- 8 fields removed per record (5 name + 3 description fields)
- Cleaner schema
- Same fulltext search capabilities

## Frontend Implementation Guide

### 1. Install i18n Library
```bash
npm install react-i18next i18next i18next-http-backend i18next-browser-languagedetector
```

### 2. Translation File Structure
```
src/locales/
├── en/
│   ├── common.json
│   ├── categories.json
│   └── library.json
├── tr/
│   ├── common.json
│   ├── categories.json
│   └── library.json
├── es/
│   ├── common.json
│   ├── categories.json
│   └── library.json
└── ...
```

### 3. Translation Keys Format

#### Option A: i18n Keys in Database
Store keys in database, resolve in frontend:

**Database:**
```json
{
  "name": "categories.textile.menswear.shirt",
  "description": "categories.textile.menswear.shirt_desc"
}
```

**Translation File (en/categories.json):**
```json
{
  "categories": {
    "textile": {
      "menswear": {
        "shirt": "Men's Shirt",
        "shirt_desc": "Classic formal and casual shirts for men"
      }
    }
  }
}
```

**Translation File (tr/categories.json):**
```json
{
  "categories": {
    "textile": {
      "menswear": {
        "shirt": "Erkek Gömlek",
        "shirt_desc": "Erkekler için klasik resmi ve günlük gömlekler"
      }
    }
  }
}
```

**Frontend Usage:**
```tsx
import { useTranslation } from 'react-i18next';

function CategoryDisplay({ category }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3>{t(category.name)}</h3>
      <p>{t(category.description)}</p>
    </div>
  );
}
```

#### Option B: Canonical Names + Fallback
Store English names in database, use as fallback:

**Database:**
```json
{
  "name": "Men's Shirt",
  "description": "Classic formal and casual shirts for men"
}
```

**Translation File (tr/categories.json):**
```json
{
  "Men's Shirt": "Erkek Gömlek",
  "Classic formal and casual shirts for men": "Erkekler için klasik resmi ve günlük gömlekler"
}
```

**Frontend Usage:**
```tsx
import { useTranslation } from 'react-i18next';

function CategoryDisplay({ category }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3>{t(category.name, category.name)}</h3> {/* Fallback to original */}
      <p>{t(category.description, category.description)}</p>
    </div>
  );
}
```

### 4. i18n Configuration Example

```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Load translations from /locales
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to React
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    ns: ['common', 'categories', 'library', 'products'],
    defaultNS: 'common',
  });

export default i18n;
```

## Database Migration Strategy

### Current State
- Schema updated with language fields removed
- Prisma Client regenerated successfully

### Migration Steps

#### 1. Create Migration
```bash
cd backend
npx prisma migrate dev --name remove_i18n_fields_from_backend
```

This will:
- Drop columns: `nameTr`, `nameEn`, `nameEs`, `nameDe`, `nameZh`, `descriptionTr`, `descriptionEn`
- Remove fulltext indexes that referenced these columns
- Create new fulltext indexes with remaining fields
- Add `code` index to `LibraryItem` for better performance

#### 2. Data Migration (If Needed)
If you have existing data with translations in these fields, you need to:

**Option 1: Keep English as canonical**
```sql
-- Already in `name` field (was primary), no migration needed
-- Just drop the other language columns
```

**Option 2: Export translations to JSON**
```typescript
// migration-script.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportTranslations() {
  const categories = await prisma.standardCategory.findMany();

  const translations = {
    en: {},
    tr: {},
    es: {},
    de: {},
    zh: {},
  };

  categories.forEach(cat => {
    if (cat.nameEn) translations.en[cat.code] = cat.nameEn;
    if (cat.nameTr) translations.tr[cat.code] = cat.nameTr;
    if (cat.nameEs) translations.es[cat.code] = cat.nameEs;
    if (cat.nameDe) translations.de[cat.code] = cat.nameDe;
    if (cat.nameZh) translations.zh[cat.code] = cat.nameZh;
  });

  // Write to frontend translation files
  Object.entries(translations).forEach(([lang, data]) => {
    fs.writeFileSync(
      `../client/src/locales/${lang}/categories.json`,
      JSON.stringify({ categories: data }, null, 2)
    );
  });
}

exportTranslations();
```

## Benefits of This Approach

### 1. Database Performance
- **Before**: Each record had 5-8 extra string fields
- **After**: Single `name` field
- **Storage Savings**: ~60-70% reduction in text column storage for internationalized models
- **Index Performance**: Smaller indexes, faster fulltext searches

### 2. Development Workflow
- **Before**: Backend developer updates database for each translation change
- **After**: Translators/frontend devs update JSON files directly
- **No migrations needed** for translation updates
- **Version control friendly**: JSON translation files are easy to diff and review

### 3. Scalability
- **Easy to add new languages**: Just create new JSON files
- **No schema changes** required for new languages
- **Frontend can lazy-load** translations as needed
- **CDN-friendly**: Translation files can be cached and served from CDN

### 4. Professional i18n Features
Using libraries like `react-i18next` provides:
- Pluralization rules per language
- Date/time/number formatting per locale
- Interpolation and variable substitution
- Namespace organization
- Language switching without page reload
- Missing translation warnings in development

## Recommended Translation Key Patterns

### StandardCategory
```typescript
// Database
{
  code: "TEX-MENS-SHIRT-001",
  name: "categories.textile.menswear.shirt" // i18n key
}

// Frontend
t("categories.textile.menswear.shirt") // → "Men's Shirt" (en) / "Erkek Gömlek" (tr)
```

### LibraryItem
```typescript
// Database (COLOR)
{
  code: "CLR-WHT-001",
  category: "COLOR",
  name: "colors.white.bright" // i18n key
}

// Frontend
t("colors.white.bright") // → "Bright White" (en) / "Parlak Beyaz" (tr)

// Database (FABRIC)
{
  code: "FAB-COT-001",
  category: "FABRIC",
  name: "fabrics.cotton.premium" // i18n key
}

// Frontend
t("fabrics.cotton.premium") // → "Premium Cotton" (en) / "Premium Pamuk" (tr)
```

## Migration Checklist

- [x] Remove language fields from `LibraryItem` model
- [x] Remove language fields from `StandardCategory` model
- [x] Update fulltext indexes
- [x] Add performance indexes (`code` on `LibraryItem`)
- [x] Regenerate Prisma Client
- [ ] Run database migration
- [ ] Create initial translation JSON files
- [ ] Setup frontend i18n configuration
- [ ] Update GraphQL resolvers (no changes needed, just return `name`)
- [ ] Update frontend components to use i18n hooks
- [ ] Test with multiple languages
- [ ] Document translation key conventions for team

## Next Steps

1. **Review this strategy** with the team
2. **Create migration script** if you need to preserve existing translation data
3. **Run migration**: `npx prisma migrate dev --name remove_i18n_fields_from_backend`
4. **Setup frontend i18n** following the guide above
5. **Create initial translation files** for your supported languages
6. **Update components** to use `useTranslation()` hook

## Questions?

Common questions about this approach:

**Q: What about SEO with translated content?**
A: Use Next.js i18n routing with static generation. Each language gets its own URL path and pre-rendered content.

**Q: How to handle user-generated content translations?**
A: Store in original language in database. Use translation APIs (Google Translate, DeepL) on-demand in frontend, or let users provide translations through UI.

**Q: Performance impact of client-side translations?**
A: Minimal. Translation files are small JSON (~10-50KB), cached, and loaded once. i18next is highly optimized.

**Q: Can we still search in multiple languages?**
A: Yes. Fulltext search on `name` field still works. For multi-language search, you can:
  - Store keywords in multiple languages in `keywords` JSON field
  - Use Elasticsearch/MeiliSearch for advanced multi-language search
  - Implement search synonyms in frontend

**Q: What if we need some database queries to filter by translated names?**
A: Filter by `code` instead (unique identifier). Sorting/filtering by translated names happens in frontend after loading data.
