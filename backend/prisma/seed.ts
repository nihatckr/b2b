import * as bcrypt from 'bcryptjs'
import { CategoryLevel, CategoryType, CompanyType, LibraryCategory, LibraryScope, PrismaClient, Role } from '../lib/generated'

const prisma = new PrismaClient()

// Unsplash API helper
const UNSPLASH_API_URL = process.env.UNSPLASH_API_URL || 'https://api.unsplash.com'
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || ''

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

async function main() {
  console.log('🌱 Starting seed with updated schema...')

  // ========================================
  // 1. COMPANIES
  // ========================================
  console.log('📦 Creating companies...')

  const defacto = await prisma.company.upsert({
    where: { email: 'info@defacto.com.tr' },
    update: {},
    create: {
      name: 'DeFacto',
      email: 'info@defacto.com.tr',
      phone: '+90 212 555 0001',
      address: 'Maslak, Sarıyer, İstanbul',
      location: 'İstanbul',
      website: 'https://www.defacto.com.tr',
      type: CompanyType.MANUFACTURER,
      description: 'Türkiye\'nin önde gelen tekstil üreticilerinden. Kadın, erkek ve çocuk giyim kategorilerinde uzmanız.',
      isActive: true,
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
      subscriptionStartedAt: new Date('2020-01-01'),
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2025-01-01'),
      billingCycle: 'YEARLY',
      billingEmail: 'finance@defacto.com.tr',
      maxUsers: 100,
      maxSamples: 1000,
      maxOrders: 500,
      maxCollections: 200,
      maxStorageGB: 500,
      currentUsers: 0,
      currentSamples: 0,
      currentOrders: 0,
      currentCollections: 0,
      currentStorageGB: 0,
      logo: '/uploads/logos/defacto-logo.png',
      brandColors: JSON.stringify({
        primary: '#E31E24',
        secondary: '#1a1a1a',
        accent: '#ffd700'
      }),
      profileSlug: 'defacto',
      isPublicProfile: true,
    },
  })

  const lcWaikiki = await prisma.company.upsert({
    where: { email: 'siparis@lcwaikiki.com' },
    update: {},
    create: {
      name: 'LC Waikiki',
      email: 'siparis@lcwaikiki.com',
      phone: '+90 212 555 0002',
      address: 'Levent, Beşiktaş, İstanbul',
      location: 'İstanbul',
      website: 'https://www.lcwaikiki.com',
      type: CompanyType.BUYER,
      description: 'Türkiye ve dünya genelinde giyim perakendeciliği.',
      isActive: true,
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionStatus: 'ACTIVE',
      subscriptionStartedAt: new Date('2021-01-01'),
      currentPeriodStart: new Date('2024-10-01'),
      currentPeriodEnd: new Date('2025-10-01'),
      billingCycle: 'MONTHLY',
      billingEmail: 'accounting@lcwaikiki.com',
      maxUsers: 50,
      maxSamples: 500,
      maxOrders: 200,
      maxCollections: 100,
      maxStorageGB: 100,
      currentUsers: 0,
      currentSamples: 0,
      currentOrders: 0,
      currentCollections: 0,
      currentStorageGB: 0,
      logo: '/uploads/logos/lcwaikiki-logo.png',
      brandColors: JSON.stringify({
        primary: '#0066CC',
        secondary: '#FF6600',
        accent: '#00CC66'
      }),
      profileSlug: 'lcwaikiki',
      isPublicProfile: true,
    },
  })

  const koton = await prisma.company.upsert({
    where: { email: 'info@koton.com' },
    update: {},
    create: {
      name: 'Koton',
      email: 'info@koton.com',
      phone: '+90 212 555 0003',
      address: 'Mecidiyeköy, Şişli, İstanbul',
      location: 'İstanbul',
      website: 'https://www.koton.com',
      type: CompanyType.BOTH,
      description: 'Hem üretim hem alım yapan entegre tekstil şirketi.',
      isActive: true,
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionStatus: 'ACTIVE',
      subscriptionStartedAt: new Date('2020-06-01'),
      currentPeriodStart: new Date('2024-06-01'),
      currentPeriodEnd: new Date('2025-06-01'),
      billingCycle: 'YEARLY',
      billingEmail: 'finance@koton.com',
      maxUsers: 50,
      maxSamples: 500,
      maxOrders: 200,
      maxCollections: 100,
      maxStorageGB: 100,
      currentUsers: 0,
      currentSamples: 0,
      currentOrders: 0,
      currentCollections: 0,
      currentStorageGB: 0,
      logo: '/uploads/logos/koton-logo.png',
      brandColors: JSON.stringify({
        primary: '#000000',
        secondary: '#E5E5E5',
        accent: '#FFD700'
      }),
      profileSlug: 'koton',
      isPublicProfile: true,
    },
  })

  console.log('✅ Companies created!')

  // ========================================
  // 2. USERS
  // ========================================
  console.log('👥 Creating users...')

  const password = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@system.com' },
    update: {},
    create: {
      email: 'admin@system.com',
      password,
      name: 'System Admin',
      username: 'admin',
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
      avatar: await getUnsplashImage('professional business person', 0),
      bio: 'Platform yöneticisi',
      language: 'tr',
      timezone: 'Europe/Istanbul',
    },
  })

  const defactoOwner = await prisma.user.upsert({
    where: { email: 'mehmet.yilmaz@defacto.com.tr' },
    update: {},
    create: {
      email: 'mehmet.yilmaz@defacto.com.tr',
      password,
      name: 'Mehmet Yılmaz',
      username: 'mehmet.yilmaz',
      firstName: 'Mehmet',
      lastName: 'Yılmaz',
      phone: '+90 532 123 4567',
      companyId: defacto.id,
      role: Role.COMPANY_OWNER,
      isCompanyOwner: true,
      department: 'MANAGEMENT',
      jobTitle: 'Genel Müdür',
      isActive: true,
      avatar: await getUnsplashImage('turkish business man', 0),
      bio: 'DeFacto Genel Müdürü',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailNotifications: true,
      pushNotifications: true,
    },
  })

  await prisma.company.update({
    where: { id: defacto.id },
    data: { ownerId: defactoOwner.id },
  })

  const defactoDesigner = await prisma.user.upsert({
    where: { email: 'zeynep.demir@defacto.com.tr' },
    update: {},
    create: {
      email: 'zeynep.demir@defacto.com.tr',
      password,
      name: 'Zeynep Demir',
      username: 'zeynep.demir',
      firstName: 'Zeynep',
      lastName: 'Demir',
      phone: '+90 532 345 6789',
      companyId: defacto.id,
      role: Role.COMPANY_EMPLOYEE,
      department: 'DESIGN',
      jobTitle: 'Baş Tasarımcı',
      isActive: true,
      avatar: '/uploads/avatars/zeynep.jpg',
      bio: 'Fashion designer with 10+ years experience',
      language: 'tr',
      timezone: 'Europe/Istanbul',
    },
  })

  const lcWaikikiOwner = await prisma.user.upsert({
    where: { email: 'ali.ozturk@lcwaikiki.com' },
    update: {},
    create: {
      email: 'ali.ozturk@lcwaikiki.com',
      password,
      name: 'Ali Öztürk',
      username: 'ali.ozturk',
      firstName: 'Ali',
      lastName: 'Öztürk',
      phone: '+90 532 456 7890',
      companyId: lcWaikiki.id,
      role: Role.COMPANY_OWNER,
      isCompanyOwner: true,
      department: 'MANAGEMENT',
      jobTitle: 'CEO',
      isActive: true,
      avatar: '/uploads/avatars/ali.jpg',
      language: 'tr',
      timezone: 'Europe/Istanbul',
    },
  })

  await prisma.company.update({
    where: { id: lcWaikiki.id },
    data: { ownerId: lcWaikikiOwner.id },
  })

  console.log('✅ Users created!')

  // ========================================
  // 3. STANDARD CATEGORIES (Platform-wide)
  // ========================================
  console.log('📂 Creating standard categories...')

  // ROOT Level Categories
  const textileRoot = await prisma.standardCategory.create({
    data: {
      code: 'TEX-ROOT',
      name: 'Textile & Apparel',
      description: 'Root category for textile and apparel products',
      level: CategoryLevel.ROOT,
      order: 1,
      icon: '👕',
      isActive: true,
      isPublic: true,
      keywords: JSON.stringify(['textile', 'apparel', 'fashion', 'clothing']),
      tags: '#textile #apparel #fashion',
      createdById: admin.id,
    },
  })

  // MAIN Level Categories
  const menswearMain = await prisma.standardCategory.create({
    data: {
      code: 'TEX-MEN',
      name: 'Menswear',
      description: 'Men\'s clothing and accessories',
      level: CategoryLevel.MAIN,
      order: 1,
      icon: '👔',
      parentId: textileRoot.id,
      isActive: true,
      isPublic: true,
      keywords: JSON.stringify(['men', 'menswear', 'male', 'erkek']),
      tags: '#menswear #men #male',
      createdById: admin.id,
    },
  })

  const womenswearMain = await prisma.standardCategory.create({
    data: {
      code: 'TEX-WOMEN',
      name: 'Womenswear',
      description: 'Women\'s clothing and accessories',
      level: CategoryLevel.MAIN,
      order: 2,
      icon: '👗',
      parentId: textileRoot.id,
      isActive: true,
      isPublic: true,
      keywords: JSON.stringify(['women', 'womenswear', 'female', 'kadın']),
      tags: '#womenswear #women #female',
      createdById: admin.id,
    },
  })

  // SUB Level Categories (Menswear)
  const mensShirtsSub = await prisma.standardCategory.create({
    data: {
      code: 'TEX-MEN-SHIRTS',
      name: 'Shirts',
      description: 'Men\'s shirts - formal and casual',
      level: CategoryLevel.SUB,
      order: 1,
      icon: '👔',
      parentId: menswearMain.id,
      isActive: true,
      isPublic: true,
      keywords: JSON.stringify(['shirt', 'formal', 'casual', 'gömlek', 'dress shirt']),
      tags: '#shirt #formal #casual',
      createdById: admin.id,
    },
  })

  const mensPantsSub = await prisma.standardCategory.create({
    data: {
      code: 'TEX-MEN-PANTS',
      name: 'Pants',
      description: 'Men\'s pants and trousers',
      level: CategoryLevel.SUB,
      order: 2,
      icon: '👖',
      parentId: menswearMain.id,
      isActive: true,
      isPublic: true,
      keywords: JSON.stringify(['pants', 'trousers', 'pantolon', 'jeans', 'chinos']),
      tags: '#pants #trousers #jeans',
      createdById: admin.id,
    },
  })

  // DETAIL Level Categories
  const formalShirtsDetail = await prisma.standardCategory.create({
    data: {
      code: 'TEX-MEN-SHIRTS-FORMAL',
      name: 'Formal Shirts',
      description: 'Dress shirts for formal occasions',
      level: CategoryLevel.DETAIL,
      order: 1,
      parentId: mensShirtsSub.id,
      isActive: true,
      isPublic: true,
      keywords: JSON.stringify(['formal', 'dress shirt', 'business', 'office']),
      tags: '#formal #dress #business',
      createdById: admin.id,
    },
  })

  const casualShirtsDetail = await prisma.standardCategory.create({
    data: {
      code: 'TEX-MEN-SHIRTS-CASUAL',
      name: 'Casual Shirts',
      description: 'Casual shirts for everyday wear',
      level: CategoryLevel.DETAIL,
      order: 2,
      parentId: mensShirtsSub.id,
      isActive: true,
      isPublic: true,
      keywords: JSON.stringify(['casual', 'everyday', 'weekend', 'leisure']),
      tags: '#casual #everyday #weekend',
      createdById: admin.id,
    },
  })

  console.log('✅ Standard categories created!')

  // ========================================
  // 4. COMPANY CATEGORIES (Company-specific)
  // ========================================
  console.log('🏢 Creating company categories...')

  // DeFacto extends standard categories
  await prisma.companyCategory.create({
    data: {
      name: 'DeFacto Signature Shirts',
      description: 'Our premium shirt collection',
      type: CategoryType.COMPANY_CUSTOM, // Fixed: CUSTOM -> COMPANY_CUSTOM
      companyId: defacto.id,
      standardCategoryId: mensShirtsSub.id,
      internalCode: 'DF-SHIRTS-001',
      order: 1,
      isActive: true,
      customFields: JSON.stringify({
        targetAge: '25-45',
        priceRange: 'mid',
        seasonality: 'all-season'
      }),
      authorId: defactoOwner.id,
    },
  })

  // LC Waikiki uses standard categories
  await prisma.companyCategory.create({
    data: {
      name: 'Budget Menswear',
      description: 'Affordable men\'s clothing line',
      type: CategoryType.GLOBAL_STANDARD, // Fixed: STANDARD -> GLOBAL_STANDARD
      companyId: lcWaikiki.id,
      standardCategoryId: menswearMain.id,
      order: 1,
      isActive: true,
      customFields: JSON.stringify({
        targetAge: '18-60',
        priceRange: 'budget',
        focus: 'value-for-money'
      }),
      authorId: lcWaikikiOwner.id,
    },
  })

  console.log('✅ Company categories created!')

  // ========================================
  // 5. LIBRARY ITEMS - PLATFORM STANDARDS
  // ========================================
  console.log('📚 Creating platform standard library items...')

  // COLORS (Platform Standards)
  const standardWhite = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-CLR-WHITE',
      name: 'Bright White',
      description: 'Standard bright white color',
      data: JSON.stringify({
        hex: '#FFFFFF',
        pantone: 'PANTONE 11-0601 TCX',
        rgb: { r: 255, g: 255, b: 255 },
        cmyk: { c: 0, m: 0, y: 0, k: 0 }
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  const standardBlack = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-CLR-BLACK',
      name: 'Jet Black',
      description: 'Standard jet black color',
      data: JSON.stringify({
        hex: '#000000',
        pantone: 'PANTONE 19-0303 TCX',
        rgb: { r: 0, g: 0, b: 0 },
        cmyk: { c: 0, m: 0, y: 0, k: 100 }
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  const standardNavy = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-CLR-NAVY',
      name: 'Navy Blue',
      description: 'Standard navy blue color',
      data: JSON.stringify({
        hex: '#001F3F',
        pantone: 'PANTONE 19-4024 TCX',
        rgb: { r: 0, g: 31, b: 63 },
        cmyk: { c: 100, m: 75, y: 0, k: 75 }
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  // FABRICS (Platform Standards)
  const standardCotton = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-FAB-COTTON',
      name: 'Premium Cotton',
      description: '100% premium cotton fabric',
      data: JSON.stringify({
        composition: '100% Cotton',
        weight: 180,
        weightUnit: 'gsm',
        width: 150,
        widthUnit: 'cm',
        finish: 'Soft',
        care: 'Machine wash cold'
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  const standardDenim = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-FAB-DENIM',
      name: 'Stretch Denim',
      description: 'Denim with stretch for comfort',
      data: JSON.stringify({
        composition: '98% Cotton, 2% Elastane',
        weight: 320,
        weightUnit: 'gsm',
        width: 160,
        widthUnit: 'cm',
        finish: 'Stone washed',
        care: 'Machine wash inside out'
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  // SIZE GROUPS (Platform Standards)
  const standardMensSizes = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.SIZE_GROUP,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-SIZE-MEN',
      name: 'Men\'s Standard Sizes',
      description: 'Standard men\'s clothing sizes',
      data: JSON.stringify({
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        measurements: {
          XS: { chest: '86-91', waist: '71-76', hips: '86-91' },
          S: { chest: '91-96', waist: '76-81', hips: '91-96' },
          M: { chest: '96-101', waist: '81-86', hips: '96-101' },
          L: { chest: '101-106', waist: '86-91', hips: '101-106' },
          XL: { chest: '106-111', waist: '91-96', hips: '106-111' },
          XXL: { chest: '111-116', waist: '96-101', hips: '111-116' },
          XXXL: { chest: '116-121', waist: '101-106', hips: '116-121' }
        },
        unit: 'cm'
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  // SEASONS (Platform Standards)
  const standardSS25 = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.SEASON,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-SEASON-SS25',
      name: 'Spring/Summer 2025',
      description: 'Spring Summer season 2025',
      data: JSON.stringify({
        shortName: 'SS25',
        year: 2025,
        type: 'SS',
        startDate: '2025-02-01',
        endDate: '2025-07-31'
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  // FIT TYPES (Platform Standards)
  const standardSlimFit = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.FIT,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-FIT-SLIM',
      name: 'Slim Fit',
      description: 'Body-fitting cut',
      data: JSON.stringify({
        fitType: 'SLIM',
        targetGender: 'UNISEX',
        description: 'Fitted through the body with tapered sleeves and waist'
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  const standardRegularFit = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.FIT,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-FIT-REGULAR',
      name: 'Regular Fit',
      description: 'Standard comfortable fit',
      data: JSON.stringify({
        fitType: 'REGULAR',
        targetGender: 'UNISEX',
        description: 'Classic fit with room for movement'
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  // CERTIFICATIONS (Platform Standards)
  const standardGOTS = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.CERTIFICATION,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: 'STD-CERT-GOTS',
      name: 'GOTS Certified',
      description: 'Global Organic Textile Standard',
      data: JSON.stringify({
        fullName: 'Global Organic Textile Standard',
        issuingBody: 'GOTS',
        website: 'https://www.global-standard.org',
        validityPeriod: '1 year',
        requiresRenewal: true
      }),
      isActive: true,
      createdById: admin.id,
    },
  })

  console.log('✅ Platform standard library items created!')

  // ========================================
  // 6. LIBRARY ITEMS - COMPANY CUSTOM
  // ========================================
  console.log('🏢 Creating company custom library items...')

  // DeFacto Custom Colors
  const defactoRed = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: 'DF-CLR-RED',
      name: 'DeFacto Signature Red',
      description: 'DeFacto brand red color',
      data: JSON.stringify({
        hex: '#E31E24',
        pantone: 'PANTONE 185 C',
        rgb: { r: 227, g: 30, b: 36 },
        cmyk: { c: 0, m: 100, y: 95, k: 0 },
        brandColor: true
      }),
      isActive: true,
      companyId: defacto.id,
      standardItemId: standardWhite.id, // Reference to base color standard
      createdById: defactoDesigner.id,
    },
  })

  // DeFacto Custom Fabric
  const defactoFabric = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: 'DF-FAB-001',
      name: 'DeFacto Premium Stretch',
      description: 'Our signature comfortable fabric',
      data: JSON.stringify({
        composition: '95% Cotton, 5% Elastane',
        weight: 200,
        weightUnit: 'gsm',
        width: 150,
        widthUnit: 'cm',
        finish: 'Soft touch',
        supplier: 'Tekstil A.Ş.',
        price: 28.50,
        currency: 'TRY',
        minOrder: 100,
        leadTime: 14
      }),
      isActive: true,
      companyId: defacto.id,
      standardItemId: standardCotton.id,
      createdById: defactoOwner.id,
    },
  })

  // DeFacto Custom Material (Button)
  const defactoButton = await prisma.libraryItem.create({
    data: {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: 'DF-MAT-BTN-001',
      name: 'Gold Metal Button 15mm',
      description: 'Premium gold buttons for shirts',
      data: JSON.stringify({
        type: 'BUTTON',
        material: 'Metal',
        color: 'Gold',
        size: '15mm',
        finish: 'Brushed gold',
        supplier: 'Aksesuar Ltd.',
        price: 0.35,
        currency: 'TRY',
        minOrder: 1000
      }),
      isActive: true,
      companyId: defacto.id,
      createdById: defactoDesigner.id,
    },
  })

  console.log('✅ Company custom library items created!')

  // ========================================
  // 7. COLLECTIONS
  // ========================================
  console.log('📦 Creating collections...')

  const defactoSS25 = await prisma.collection.create({
    data: {
      name: 'DeFacto SS25 Men\'s Collection',
      modelCode: 'DF-SS25-MEN', // Fixed: code -> modelCode
      description: 'Spring Summer 2025 men\'s collection',
      season: 'SS25',
      // year field doesn't exist in Collection model - removed
      gender: 'MEN',
      companyId: defacto.id,
      authorId: defactoOwner.id,
      // status field doesn't exist - removed
      // isActive field doesn't exist - removed
      // tags field doesn't exist - removed
    },
  })

  console.log('✅ Collections created!')

  // ========================================
  // 8. FINAL SUMMARY
  // ========================================
  console.log('\n✅ Seed completed successfully!')
  console.log('📊 Summary:')
  console.log('  • 3 Companies created (DeFacto, LC Waikiki, Koton)')
  console.log('  • 4 Users created (1 Admin, 3 Company owners)')
  console.log('  • 8 Standard Categories (ROOT → MAIN → SUB → DETAIL)')
  console.log('  • 2 Company Categories')
  console.log('  • 13 Platform Standard Library Items:')
  console.log('    - 3 Colors (White, Black, Navy)')
  console.log('    - 2 Fabrics (Cotton, Denim)')
  console.log('    - 1 Size Group (Men\'s Standard)')
  console.log('    - 1 Season (SS25)')
  console.log('    - 2 Fit Types (Slim, Regular)')
  console.log('    - 1 Certification (GOTS)')
  console.log('  • 3 Company Custom Library Items (DeFacto):')
  console.log('    - 1 Custom Color')
  console.log('    - 1 Custom Fabric')
  console.log('    - 1 Custom Material (Button)')
  console.log('  • 1 Collection')
  console.log('\n🔐 Login credentials:')
  console.log('  Admin: admin@system.com / password123')
  console.log('  DeFacto: mehmet.yilmaz@defacto.com.tr / password123')
  console.log('  LC Waikiki: ali.ozturk@lcwaikiki.com / password123')
}

main()
  .then(async () => {
    console.log('\n🎉 Disconnecting from database...')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
