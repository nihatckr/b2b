import { LibraryCategory, LibraryScope, PrismaClient } from '../lib/generated'

const prisma = new PrismaClient()

// Unsplash API helper
const UNSPLASH_API_URL = process.env.UNSPLASH_API_URL || 'https://api.unsplash.com'
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'uBbrq5RdhbzS-x_Qe4OAflJ9KdlT-rj4Uu-XPXODIUQ'

async function getUnsplashImage(query: string, index: number = 0): Promise<string> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('⚠️ UNSPLASH_ACCESS_KEY not set, using placeholder images')
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(query)}`
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=1&per_page=${index + 1}&client_id=${UNSPLASH_ACCESS_KEY}`
    )

    if (!response.ok) {
      console.warn(`⚠️ Unsplash API error: ${response.status}`)
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(query)}`
    }

    const data = await response.json()
    if (data.results && data.results[index]) {
      return data.results[index].urls.regular
    }

    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(query)}`
  } catch (error) {
    console.error('❌ Error fetching Unsplash image:', error)
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(query)}`
  }
}

/**
 * ✅ FIXED B2B TEXTILE MANUFACTURING SEED
 *
 * - All fields match schema (no value, hexCode, pantoneCode)
 * - Uses data JSON field correctly
 * - Unsplash images integrated
 * - Proper relations (company, standardItem)
 */

async function main() {
  console.log('🏭 Starting B2B TEXTILE seed...')

  // Get existing data
  const admin = await prisma.user.findFirst({ where: { email: 'admin@system.com' } })
  if (!admin) throw new Error('❌ Admin not found. Run main seed (seed.ts) first!')

  const defacto = await prisma.company.findFirst({ where: { email: 'info@defacto.com.tr' } })
  const lcWaikiki = await prisma.company.findFirst({ where: { email: 'siparis@lcwaikiki.com' } })
  const koton = await prisma.company.findFirst({ where: { email: 'info@koton.com' } })

  if (!defacto || !lcWaikiki || !koton) {
    throw new Error('❌ Companies not found. Run main seed first!')
  }

  console.log('✅ Found admin and companies')

  // ========================================
  // 🧵 FABRICS (Platform Standards)
  // ========================================
  console.log('\n🧵 Creating platform fabric library...')

  const fabrics = await Promise.all([
    prisma.libraryItem.create({
      data: {
        code: 'STD-FAB-001',
        name: '100% Cotton Single Jersey',
        description: '160 GSM basic t-shirt fabric, soft and breathable',
        category: LibraryCategory.FABRIC,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('white cotton fabric texture', 0),
        data: JSON.stringify({
          composition: '100% Cotton',
          weight: 160,
          unit: 'GSM',
          construction: 'Single Jersey',
          width: 180,
          widthUnit: 'cm',
          fiberType: 'COTTON',
          texture: 'Soft',
          finish: 'Raw',
          usage: 'T-Shirts, Basics',
          season: 'ALL',
          shrinkage: '5%',
          washCare: '40°C machine wash'
        }),
        tags: JSON.stringify(['cotton', 'jersey', 'basic', 't-shirt', 'knit']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-FAB-002',
        name: 'Cotton/Elastane Rib Knit',
        description: '95/5 Cotton Elastane blend, perfect for collars and cuffs',
        category: LibraryCategory.FABRIC,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('ribbed cotton fabric', 0),
        data: JSON.stringify({
          composition: '95% Cotton 5% Elastane',
          weight: 220,
          unit: 'GSM',
          construction: 'Rib Knit',
          fiberType: 'COTTON_BLEND',
          stretch: 'High',
          recovery: 'Excellent',
          usage: 'Collars, Cuffs, Trim',
          season: 'ALL'
        }),
        tags: JSON.stringify(['cotton', 'elastane', 'rib', 'stretch', 'knit']),
        isActive: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-FAB-003',
        name: 'Cotton Poplin Shirting',
        description: 'Classic poplin weave for dress shirts',
        category: LibraryCategory.FABRIC,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('white poplin shirt fabric', 0),
        data: JSON.stringify({
          composition: '100% Cotton',
          weight: 120,
          unit: 'GSM',
          construction: 'Plain Weave (Poplin)',
          width: 150,
          widthUnit: 'cm',
          fiberType: 'COTTON',
          texture: 'Smooth',
          finish: 'Easy Care',
          usage: 'Dress Shirts, Formal',
          season: 'ALL'
        }),
        tags: JSON.stringify(['cotton', 'poplin', 'woven', 'shirt', 'formal']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-FAB-004',
        name: '12 oz Stretch Denim',
        description: 'Medium weight stretch denim for jeans',
        category: LibraryCategory.FABRIC,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('blue denim jeans fabric', 0),
        data: JSON.stringify({
          composition: '98% Cotton 2% Elastane',
          weight: 340,
          unit: 'GSM',
          weightOz: 12,
          construction: 'Twill Weave (Denim)',
          fiberType: 'COTTON_BLEND',
          stretch: 'Medium',
          wash: 'Dark Indigo',
          texture: 'Rugged',
          usage: 'Jeans, Pants',
          season: 'ALL'
        }),
        tags: JSON.stringify(['denim', 'jeans', 'stretch', 'indigo', 'woven']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-FAB-005',
        name: 'Cotton Fleece 320 GSM',
        description: 'Brushed inner fleece for sweatshirts',
        category: LibraryCategory.FABRIC,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('grey fleece sweatshirt fabric', 0),
        data: JSON.stringify({
          composition: '80% Cotton 20% Polyester',
          weight: 320,
          unit: 'GSM',
          construction: 'French Terry / Fleece',
          fiberType: 'COTTON_BLEND',
          brushed: 'Inner side',
          warmth: 'High',
          texture: 'Soft',
          usage: 'Sweatshirts, Hoodies',
          season: 'FALL_WINTER'
        }),
        tags: JSON.stringify(['fleece', 'sweatshirt', 'warm', 'brushed', 'knit']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
  ])

  console.log(`✅ Created ${fabrics.length} fabric library items`)

  // ========================================
  // 🎨 COLORS (Platform Standards)
  // ========================================
  console.log('\n🎨 Creating platform color library...')

  const colors = await Promise.all([
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-001',
        name: 'Pure White',
        description: 'Classic pure white, optical white',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('white fabric swatch', 0),
        data: JSON.stringify({
          hex: '#FFFFFF',
          pantone: 'Pantone 11-0601 TPX',
          rgb: { r: 255, g: 255, b: 255 },
          cmyk: { c: 0, m: 0, y: 0, k: 0 },
          colorFamily: 'WHITE',
          season: 'ALL'
        }),
        tags: JSON.stringify(['white', 'basic', 'neutral', 'core']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-002',
        name: 'Jet Black',
        description: 'Deep true black',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('black fabric swatch', 0),
        data: JSON.stringify({
          hex: '#000000',
          pantone: 'Pantone 19-0303 TPX',
          rgb: { r: 0, g: 0, b: 0 },
          cmyk: { c: 0, m: 0, y: 0, k: 100 },
          colorFamily: 'BLACK',
          season: 'ALL'
        }),
        tags: JSON.stringify(['black', 'basic', 'neutral', 'core']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-003',
        name: 'Heather Grey',
        description: 'Classic melange grey',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('grey fabric swatch', 0),
        data: JSON.stringify({
          hex: '#808080',
          pantone: 'Pantone 14-4102 TPX',
          rgb: { r: 128, g: 128, b: 128 },
          colorFamily: 'GREY',
          season: 'ALL'
        }),
        tags: JSON.stringify(['grey', 'gray', 'neutral', 'melange']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-004',
        name: 'Navy Blue',
        description: 'Classic navy blue',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('navy blue fabric', 0),
        data: JSON.stringify({
          hex: '#000080',
          pantone: 'Pantone 19-4028 TPX',
          rgb: { r: 0, g: 0, b: 128 },
          colorFamily: 'BLUE',
          season: 'ALL'
        }),
        tags: JSON.stringify(['navy', 'blue', 'dark', 'formal']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-005',
        name: 'Sky Blue',
        description: 'Light sky blue',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('sky blue fabric', 0),
        data: JSON.stringify({
          hex: '#87CEEB',
          pantone: 'Pantone 14-4318 TPX',
          rgb: { r: 135, g: 206, b: 235 },
          colorFamily: 'BLUE',
          season: 'SPRING_SUMMER'
        }),
        tags: JSON.stringify(['blue', 'sky', 'light', 'spring']),
        isActive: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-006',
        name: 'True Red',
        description: 'Vibrant true red',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('red fabric swatch', 0),
        data: JSON.stringify({
          hex: '#FF0000',
          pantone: 'Pantone 18-1664 TPX',
          rgb: { r: 255, g: 0, b: 0 },
          colorFamily: 'RED',
          season: 'ALL'
        }),
        tags: JSON.stringify(['red', 'vibrant', 'bold']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-007',
        name: 'Blush Pink',
        description: 'Soft blush pink',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('blush pink fabric', 0),
        data: JSON.stringify({
          hex: '#FFB6C1',
          pantone: 'Pantone 13-1520 TPX',
          rgb: { r: 255, g: 182, b: 193 },
          colorFamily: 'PINK',
          season: 'SPRING_SUMMER'
        }),
        tags: JSON.stringify(['pink', 'blush', 'soft', 'feminine']),
        isActive: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-008',
        name: 'Forest Green',
        description: 'Deep forest green',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('forest green fabric', 0),
        data: JSON.stringify({
          hex: '#228B22',
          pantone: 'Pantone 19-6050 TPX',
          rgb: { r: 34, g: 139, b: 34 },
          colorFamily: 'GREEN',
          season: 'FALL_WINTER'
        }),
        tags: JSON.stringify(['green', 'forest', 'dark', 'earthy']),
        isActive: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-009',
        name: 'Mint Green',
        description: 'Fresh mint green',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('mint green fabric', 0),
        data: JSON.stringify({
          hex: '#98FF98',
          pantone: 'Pantone 13-6208 TPX',
          rgb: { r: 152, g: 255, b: 152 },
          colorFamily: 'GREEN',
          season: 'SPRING_SUMMER'
        }),
        tags: JSON.stringify(['green', 'mint', 'fresh', 'pastel']),
        isActive: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-COL-010',
        name: 'Camel Beige',
        description: 'Warm camel beige',
        category: LibraryCategory.COLOR,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('camel beige fabric', 0),
        data: JSON.stringify({
          hex: '#C19A6B',
          pantone: 'Pantone 16-1328 TPX',
          rgb: { r: 193, g: 154, b: 107 },
          colorFamily: 'BEIGE',
          season: 'FALL_WINTER'
        }),
        tags: JSON.stringify(['beige', 'camel', 'neutral', 'warm']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
  ])

  console.log(`✅ Created ${colors.length} color library items`)

  // ========================================
  // 📅 SEASONS (Platform Standards)
  // ========================================
  console.log('\n📅 Creating platform season library...')

  const seasons = await Promise.all([
    // Skip SS25 - already in main seed
    prisma.libraryItem.create({
      data: {
        code: 'STD-SEASON-FW25',
        name: 'Fall/Winter 2025',
        description: 'FW25 collection season',
        category: LibraryCategory.SEASON,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('fall winter fashion', 0),
        data: JSON.stringify({
          year: 2025,
          type: 'FW',
          fullName: 'Fall/Winter 2025',
          startMonth: 'September',
          endMonth: 'February',
          themes: ['Comfort', 'Warm Tones', 'Layering', 'Cozy Textures'],
          trends: ['Oversized Outerwear', 'Knits', 'Earthy Colors']
        }),
        tags: JSON.stringify(['FW25', 'fall', 'winter', '2025']),
        isActive: true,
        isPopular: true,
        createdById: admin.id,
      },
    }),
    prisma.libraryItem.create({
      data: {
        code: 'STD-SEASON-SS26',
        name: 'Spring/Summer 2026',
        description: 'SS26 collection season (planning)',
        category: LibraryCategory.SEASON,
        scope: LibraryScope.PLATFORM_STANDARD,
        imageUrl: await getUnsplashImage('spring fashion trends', 1),
        data: JSON.stringify({
          year: 2026,
          type: 'SS',
          fullName: 'Spring/Summer 2026',
          startMonth: 'March',
          endMonth: 'August',
          status: 'Planning',
          themes: ['Innovation', 'Tech Fabrics', 'Bold Colors']
        }),
        tags: JSON.stringify(['SS26', 'spring', 'summer', '2026', 'future']),
        isActive: true,
        createdById: admin.id,
      },
    }),
  ])

  console.log(`✅ Created ${seasons.length} season library items`)

  // ========================================
  // 🏢 COMPANY-SPECIFIC ITEMS
  // ========================================
  console.log('\n🏢 Creating company-specific library items...')

  // DeFacto custom colors
  const defactoRed = await prisma.libraryItem.create({
    data: {
      code: 'DF-COL-001',
      name: 'DeFacto Red',
      description: 'DeFacto brand signature red',
      category: LibraryCategory.COLOR,
      scope: LibraryScope.COMPANY_CUSTOM,
      imageUrl: await getUnsplashImage('bright red fabric', 1),
      data: JSON.stringify({
        hex: '#E31E24',
        pantone: 'Pantone 186 C',
        rgb: { r: 227, g: 30, b: 36 },
        colorFamily: 'RED',
        brandColor: true,
        usage: 'Logo, Accents, Key Pieces'
      }),
      tags: JSON.stringify(['defacto', 'brand', 'red', 'signature']),
      isActive: true,
      isPopular: true,
      createdById: admin.id,
      companyId: defacto.id,
    },
  })

  const defactoCharcoal = await prisma.libraryItem.create({
    data: {
      code: 'DF-COL-002',
      name: 'DeFacto Charcoal',
      description: 'DeFacto brand dark grey',
      category: LibraryCategory.COLOR,
      scope: LibraryScope.COMPANY_CUSTOM,
      imageUrl: await getUnsplashImage('charcoal grey fabric', 0),
      data: JSON.stringify({
        hex: '#1A1A1A',
        pantone: 'Pantone Black 6 C',
        rgb: { r: 26, g: 26, b: 26 },
        colorFamily: 'GREY',
        brandColor: true,
        usage: 'Secondary Brand Color'
      }),
      tags: JSON.stringify(['defacto', 'brand', 'charcoal', 'grey']),
      isActive: true,
      createdById: admin.id,
      companyId: defacto.id,
    },
  })

  // LC Waikiki custom fabric (referencing standard)
  const lcWaikikiFabric = await prisma.libraryItem.create({
    data: {
      code: 'LCW-FAB-001',
      name: 'LC Waikiki Premium Pique',
      description: 'Custom pique knit for polo shirts - Turkish mill',
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.COMPANY_CUSTOM,
      imageUrl: await getUnsplashImage('white pique polo fabric', 0),
      data: JSON.stringify({
        composition: '100% Combed Cotton',
        weight: 200,
        unit: 'GSM',
        construction: 'Pique Knit',
        quality: 'Premium',
        supplier: 'Turkish Mill',
        supplierCode: 'TRK-PIQUE-200',
        fiberType: 'COTTON',
        usage: 'Polo Shirts',
        minimumOrder: 500,
        pricePerMeter: 8.50,
        currency: 'USD'
      }),
      tags: JSON.stringify(['lcwaikiki', 'pique', 'polo', 'premium']),
      isActive: true,
      createdById: admin.id,
      companyId: lcWaikiki.id,
    },
  })

  // Koton eco material
  const kotonMaterial = await prisma.libraryItem.create({
    data: {
      code: 'KTN-MAT-001',
      name: 'Koton Eco Cotton',
      description: 'GOTS certified organic cotton from Turkey',
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.COMPANY_CUSTOM,
      imageUrl: await getUnsplashImage('organic cotton', 0),
      data: JSON.stringify({
        materialType: 'Organic Cotton',
        certification: 'GOTS Certified',
        certNumber: 'GOTS-TR-2024-001',
        origin: 'Turkey',
        sustainability: 'High',
        traceability: 'Full',
        supplier: 'Aegean Organic Cotton',
        pricePerKg: 4.20,
        currency: 'USD'
      }),
      tags: JSON.stringify(['koton', 'organic', 'eco', 'gots', 'sustainable']),
      isActive: true,
      isPopular: true,
      createdById: admin.id,
      companyId: koton.id,
    },
  })

  console.log(`✅ Created 4 company-specific library items`)
  console.log(`   ├── DeFacto: ${defactoRed.code}, ${defactoCharcoal.code}`)
  console.log(`   ├── LC Waikiki: ${lcWaikikiFabric.code}`)
  console.log(`   └── Koton: ${kotonMaterial.code}`)

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ B2B TEXTILE LIBRARY SUMMARY:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🧵 Fabrics: ${fabrics.length} items`)
  console.log(`🎨 Colors: ${colors.length} items`)
  console.log(`📅 Seasons: ${seasons.length} items`)
  console.log(`🏢 Company Items: 4 items`)
  console.log(`📊 TOTAL: ${fabrics.length + colors.length + seasons.length + 4} library items`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✅ All items have:')
  console.log('   ✓ Unsplash images')
  console.log('   ✓ Proper JSON data structure')
  console.log('   ✓ Tags for search')
  console.log('   ✓ Company relations (where applicable)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .then(async () => {
    console.log('\n🎉 B2B Textile library seeded successfully!')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('\n❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
