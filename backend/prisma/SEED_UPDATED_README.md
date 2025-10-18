# Updated Seed File - Usage Guide

## Overview
This seed file (`seed-updated.ts`) is designed for the new schema with:
- ✅ **LibraryItem** unified model (replaces Color, Fabric, Material, SizeGroup, Season, Fit, Certification)
- ✅ **StandardCategory** and **CompanyCategory** (hierarchical category system)
- ✅ **No multi-language fields** (i18n moved to frontend)

## Changes from Original seed.ts

### 1. Library Items
**Before:**
```typescript
await prisma.color.create({ name: 'Beyaz', hexCode: '#FFFFFF' })
await prisma.fabric.create({ name: 'Cotton', composition: '100% Cotton' })
await prisma.sizeGroup.create({ name: 'Men Standard', sizes: [...] })
```

**After:**
```typescript
await prisma.libraryItem.create({
  category: LibraryCategory.COLOR,
  scope: LibraryScope.PLATFORM_STANDARD,
  code: 'STD-CLR-WHITE',
  name: 'Bright White',
  data: JSON.stringify({ hex: '#FFFFFF', pantone: '...' })
})
```

### 2. Categories
**Before:**
```typescript
await prisma.category.create({
  name: 'Erkek Giyim',
  companyId: defacto.id
})
```

**After:**
```typescript
// Platform Standard Categories
await prisma.standardCategory.create({
  code: 'TEX-MEN',
  name: 'Menswear',
  level: CategoryLevel.MAIN,
  parentId: textileRoot.id
})

// Company Specific Categories
await prisma.companyCategory.create({
  name: 'DeFacto Signature Shirts',
  type: CategoryType.COMPANY_CUSTOM,
  companyId: defacto.id,
  standardCategoryId: mensShirtsSub.id
})
```

### 3. Multi-language Fields Removed
**Before:**
```typescript
name: 'Men\'s Shirt',
nameTr: 'Erkek Gömlek',
nameEn: 'Men\'s Shirt',
nameEs: 'Camisa de Hombre'
```

**After:**
```typescript
name: 'Men\'s Shirt' // Frontend handles translations via i18n
```

## Seed Data Created

### Companies (3)
1. **DeFacto** (MANUFACTURER, ENTERPRISE plan)
2. **LC Waikiki** (BUYER, PROFESSIONAL plan)
3. **Koton** (BOTH, PROFESSIONAL plan)

### Users (4)
1. **Admin** - `admin@system.com` / `password123` (ADMIN)
2. **Mehmet Yılmaz** - `mehmet.yilmaz@defacto.com.tr` / `password123` (DeFacto Owner)
3. **Zeynep Demir** - `zeynep.demir@defacto.com.tr` / `password123` (DeFacto Designer)
4. **Ali Öztürk** - `ali.ozturk@lcwaikiki.com` / `password123` (LC Waikiki Owner)

### Standard Categories (8)
- **ROOT**: Textile & Apparel
  - **MAIN**: Menswear
    - **SUB**: Shirts
      - **DETAIL**: Formal Shirts
      - **DETAIL**: Casual Shirts
    - **SUB**: Pants
  - **MAIN**: Womenswear

### Company Categories (2)
1. DeFacto: "DeFacto Signature Shirts" (COMPANY_CUSTOM)
2. LC Waikiki: "Budget Menswear" (GLOBAL_STANDARD)

### Platform Standard Library Items (10)
#### Colors (3)
- Bright White (`STD-CLR-WHITE`)
- Jet Black (`STD-CLR-BLACK`)
- Navy Blue (`STD-CLR-NAVY`)

#### Fabrics (2)
- Premium Cotton (`STD-FAB-COTTON`)
- Stretch Denim (`STD-FAB-DENIM`)

#### Size Groups (1)
- Men's Standard Sizes (`STD-SIZE-MEN`)

#### Seasons (1)
- Spring/Summer 2025 (`STD-SEASON-SS25`)

#### Fit Types (2)
- Slim Fit (`STD-FIT-SLIM`)
- Regular Fit (`STD-FIT-REGULAR`)

#### Certifications (1)
- GOTS Certified (`STD-CERT-GOTS`)

### Company Custom Library Items (3)
All for DeFacto:
1. **Color**: DeFacto Signature Red (`DF-CLR-RED`)
2. **Fabric**: DeFacto Premium Stretch (`DF-FAB-001`)
3. **Material**: Gold Metal Button 15mm (`DF-MAT-BTN-001`)

### Collections (1)
- DeFacto SS25 Men's Collection (`DF-SS25-MEN`)

## How to Run

### Option 1: Replace existing seed.ts
```bash
# Backup original
mv prisma/seed.ts prisma/seed-backup.ts

# Use new seed
mv prisma/seed-updated.ts prisma/seed.ts

# Run migration and seed
cd backend
npx prisma migrate dev --name add_library_and_categories
npx prisma db seed
```

### Option 2: Run directly (without replacing)
```bash
cd backend
npx tsx prisma/seed-updated.ts
```

### Option 3: Clean database and seed
```bash
cd backend

# Drop and recreate database
npx prisma migrate reset --force

# This will automatically run seed after migration
```

## Testing the Seed

After running, verify data:

```bash
# Check companies
npx prisma studio
# Navigate to Company table - should see 3 companies

# Check categories
# Navigate to StandardCategory - should see 8 categories (hierarchical)
# Navigate to CompanyCategory - should see 2 company-specific categories

# Check library items
# Navigate to LibraryItem - should see 13 items
# Filter by scope = PLATFORM_STANDARD (10 items)
# Filter by scope = COMPANY_CUSTOM (3 items)
```

Or use GraphQL queries:

```graphql
# Get all platform standard colors
query {
  libraryItems(where: {
    category: { equals: COLOR }
    scope: { equals: PLATFORM_STANDARD }
  }) {
    id
    code
    name
    data
  }
}

# Get category tree
query {
  standardCategories(where: {
    level: { equals: ROOT }
  }) {
    id
    code
    name
    subCategories {
      id
      code
      name
      subCategories {
        id
        code
        name
      }
    }
  }
}

# Get company's custom library items
query {
  libraryItems(where: {
    companyId: { equals: 1 }
    scope: { equals: COMPANY_CUSTOM }
  }) {
    id
    code
    name
    category
    data
  }
}
```

## Important Notes

### 1. Unsplash API (Optional)
The seed uses Unsplash for images. Set env variable:
```env
UNSPLASH_ACCESS_KEY=your_key_here
```

If not set, it uses placeholder images automatically.

### 2. JSON Data Structure
LibraryItem `data` field contains category-specific properties:

```typescript
// COLOR
{ hex: '#FFFFFF', pantone: 'PANTONE 11-0601 TCX', rgb: {...}, cmyk: {...} }

// FABRIC
{ composition: '100% Cotton', weight: 180, weightUnit: 'gsm', width: 150, ... }

// MATERIAL
{ type: 'BUTTON', material: 'Metal', size: '15mm', price: 0.35, ... }

// SIZE_GROUP
{ sizes: ['XS', 'S', 'M', ...], measurements: { S: { chest: '91-96', ... } } }

// SEASON
{ shortName: 'SS25', year: 2025, type: 'SS', startDate: '2025-02-01' }

// FIT
{ fitType: 'SLIM', targetGender: 'UNISEX', description: '...' }

// CERTIFICATION
{ fullName: 'Global Organic...', issuingBody: 'GOTS', website: '...' }
```

### 3. Category Hierarchy
Standard categories use 4-level hierarchy:
- **ROOT** → Textile & Apparel
- **MAIN** → Menswear, Womenswear
- **SUB** → Shirts, Pants, Dresses
- **DETAIL** → Formal Shirts, Casual Shirts

### 4. Scope System
- **PLATFORM_STANDARD**: Admin-created, available to all companies
- **COMPANY_CUSTOM**: Company-created, private to that company

### 5. Password
All users have password: `password123` (bcrypt hashed)

## Troubleshooting

### Error: "Cannot find module './lib/generated'"
```bash
# Generate Prisma client first
cd backend
npx prisma generate
```

### Error: "Cannot find module 'bcrypt'"
```bash
# Install dependencies
cd backend
npm install
```

### Error: "Unique constraint failed"
If running seed multiple times:
```bash
# Clean database first
npx prisma migrate reset --force
```

### Error: "Foreign key constraint"
Ensure proper order:
1. Companies
2. Users
3. Standard Categories (ROOT → MAIN → SUB → DETAIL)
4. Company Categories
5. Library Items (Platform Standards first, then Company Custom)
6. Collections

## Next Steps

After seeding:
1. ✅ Verify data in Prisma Studio
2. ✅ Test GraphQL queries
3. ✅ Create frontend i18n translation files
4. ✅ Build GraphQL resolvers for new models
5. ✅ Update frontend components

## Additional Resources
- [I18N_STRATEGY.md](../I18N_STRATEGY.md) - Frontend i18n implementation guide
- [LIBRARY_UNIFICATION.md](../LIBRARY_UNIFICATION.md) - Unified library system guide
- [ADVANCED_FEATURES.md](../ADVANCED_FEATURES.md) - Category and partnership features
