/**
 * Comprehensive Seed Data Based on Current Database
 * 
 * This seed creates a complete dataset based on existing data
 * with additional realistic data for testing
 */

import bcrypt from "bcryptjs";
import prisma from "./lib/prisma.js";

async function main() {
  console.log("🌱 Starting comprehensive seed based on existing data...");

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🧹 Clearing existing data...");
    await prisma.userFavoriteCollection.deleteMany();
    await prisma.companyPartnership.deleteMany();
    await prisma.companyMetrics.deleteMany();
    await prisma.adminReport.deleteMany();
    await prisma.aIAnalysis.deleteMany();
    await prisma.billOfMaterial.deleteMany();
    await prisma.companyCategory.deleteMany();
    await prisma.file.deleteMany();
    await prisma.productionRevision.deleteMany();
    await prisma.sharedCategoryMapping.deleteMany();
    await prisma.workshop.deleteMany();
    await prisma.qualityControl.deleteMany();
    await prisma.revision.deleteMany();
    await prisma.orderNegotiation.deleteMany();
    await prisma.task.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.sample.deleteMany();
    await prisma.libraryItem.deleteMany();
    await prisma.productionStageUpdate.deleteMany();
    await prisma.productionTracking.deleteMany();
    await prisma.order.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.category.deleteMany();
    await prisma.standardCategory.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();

    // ==========================================
    // 1. ADMIN USER
    // ==========================================
    console.log("\n👤 Creating Admin User...");

    const adminPassword = await bcrypt.hash("Admin123!", 10);
    const admin = await prisma.user.create({
      data: {
        email: "admin@protexflow.com",
        name: "System Admin",
        firstName: "System",
        lastName: "Admin",
        password: adminPassword,
        role: "ADMIN",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: false,
      },
    });
    console.log("✅ Admin created:", admin.email);

    // ==========================================
    // 2. MANUFACTURER COMPANIES & USERS
    // ==========================================
    console.log("\n🏭 Creating Manufacturer Companies...");

    // Manufacturer 1: TextilePro
    const manufacturerOwner1Password = await bcrypt.hash("Owner123!", 10);
    const manufacturerOwner1 = await prisma.user.create({
      data: {
        email: "owner@textilepro.com",
        name: "Ahmet Yılmaz",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        password: manufacturerOwner1Password,
        role: "COMPANY_OWNER",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: true,
        department: "MANAGEMENT",
        jobTitle: "Genel Müdür",
      },
    });

    const manufacturerCompany1 = await prisma.company.create({
      data: {
        name: "TextilePro Manufacturing",
        email: "info@textilepro.com",
        phone: "+90 212 555 0101",
        address: "Sanayi Mahallesi, Fabrika Caddesi No:15",
        city: "İstanbul",
        country: "Turkey",
        website: "https://textilepro.com",
        type: "MANUFACTURER",
        description: "Premium kalitede tekstil üretimi yapan öncü firma. 25 yıllık deneyim ile müşterilerine en kaliteli hizmeti sunuyor.",
        ownerId: manufacturerOwner1.id,
        isActive: true,
        subscriptionPlan: "PROFESSIONAL",
        subscriptionStatus: "ACTIVE",
        maxUsers: 50,
        maxSamples: 500,
        maxOrders: 200,
        maxCollections: 100,
        maxStorageGB: 100.0,
        isPublicProfile: true,
        profileSlug: "textilepro",
      },
    });

    await prisma.user.update({
      where: { id: manufacturerOwner1.id },
      data: { companyId: manufacturerCompany1.id },
    });

    // Manufacturer 2: FashionWorks
    const manufacturerOwner2Password = await bcrypt.hash("Owner456!", 10);
    const manufacturerOwner2 = await prisma.user.create({
      data: {
        email: "owner@fashionworks.com",
        name: "Mehmet Demir",
        firstName: "Mehmet",
        lastName: "Demir",
        password: manufacturerOwner2Password,
        role: "COMPANY_OWNER",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: true,
        department: "MANAGEMENT",
        jobTitle: "CEO",
      },
    });

    const manufacturerCompany2 = await prisma.company.create({
      data: {
        name: "FashionWorks Textile",
        email: "info@fashionworks.com",
        phone: "+90 216 555 0202",
        address: "Organize Sanayi Bölgesi, 2. Kısım No:45",
        city: "Bursa",
        country: "Turkey",
        website: "https://fashionworks.com",
        type: "MANUFACTURER",
        description: "Modern teknoloji ile donatılmış tekstil üretim tesisi. Kalite ve hız odaklı yaklaşım.",
        ownerId: manufacturerOwner2.id,
        isActive: true,
        subscriptionPlan: "PROFESSIONAL",
        subscriptionStatus: "ACTIVE",
        maxUsers: 100,
        maxSamples: 1000,
        maxOrders: 500,
        maxCollections: 200,
        maxStorageGB: 200.0,
        isPublicProfile: true,
        profileSlug: "fashionworks",
      },
    });

    await prisma.user.update({
      where: { id: manufacturerOwner2.id },
      data: { companyId: manufacturerCompany2.id },
    });

    console.log("✅ Manufacturer companies created");

    // ==========================================
    // 3. BUYER COMPANIES & USERS
    // ==========================================
    console.log("\n🏢 Creating Buyer Companies...");

    // Buyer 1: Fashion Retail
    const buyerOwner1Password = await bcrypt.hash("Buyer123!", 10);
    const buyerOwner1 = await prisma.user.create({
      data: {
        email: "owner@fashionretail.com",
        name: "Elif Kaya",
        firstName: "Elif",
        lastName: "Kaya",
        password: buyerOwner1Password,
        role: "COMPANY_OWNER",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: true,
        department: "MANAGEMENT",
        jobTitle: "CEO",
      },
    });

    const buyerCompany1 = await prisma.company.create({
      data: {
        name: "Fashion Retail Co.",
        email: "info@fashionretail.com",
        phone: "+90 212 555 0303",
        address: "Merkez Mahallesi, Ticaret Sokak No:42",
        city: "İstanbul",
        country: "Turkey",
        website: "https://fashionretail.com",
        type: "BUYER",
        description: "Modern ve şık giyim ürünlerini müşterilerine ulaştıran perakende mağaza zinciri. Kaliteli ve uygun fiyatlı moda.",
        ownerId: buyerOwner1.id,
        isActive: true,
        subscriptionPlan: "STARTER",
        subscriptionStatus: "ACTIVE",
        maxUsers: 10,
        maxSamples: 100,
        maxOrders: 50,
        maxCollections: 20,
        maxStorageGB: 10.0,
        isPublicProfile: false,
      },
    });

    await prisma.user.update({
      where: { id: buyerOwner1.id },
      data: { companyId: buyerCompany1.id },
    });

    // Buyer 2: StyleHub
    const buyerOwner2Password = await bcrypt.hash("Buyer456!", 10);
    const buyerOwner2 = await prisma.user.create({
      data: {
        email: "owner@stylehub.com",
        name: "Zeynep Özkan",
        firstName: "Zeynep",
        lastName: "Özkan",
        password: buyerOwner2Password,
        role: "COMPANY_OWNER",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: true,
        department: "MANAGEMENT",
        jobTitle: "Creative Director",
      },
    });

    const buyerCompany2 = await prisma.company.create({
      data: {
        name: "StyleHub Fashion",
        email: "info@stylehub.com",
        phone: "+90 312 555 0404",
        address: "Çankaya Mahallesi, Moda Caddesi No:78",
        city: "Ankara",
        country: "Turkey",
        website: "https://stylehub.com",
        type: "BUYER",
        description: "Yaratıcı tasarımlar ve özgün koleksiyonlar sunan moda platformu. Genç ve dinamik ekibi ile trend belirleyici.",
        ownerId: buyerOwner2.id,
        isActive: true,
        subscriptionPlan: "PROFESSIONAL",
        subscriptionStatus: "ACTIVE",
        maxUsers: 25,
        maxSamples: 250,
        maxOrders: 100,
        maxCollections: 50,
        maxStorageGB: 25.0,
        isPublicProfile: true,
        profileSlug: "stylehub",
      },
    });

    await prisma.user.update({
      where: { id: buyerOwner2.id },
      data: { companyId: buyerCompany2.id },
    });

    console.log("✅ Buyer companies created");

    // ==========================================
    // 4. ADDITIONAL EMPLOYEES
    // ==========================================
    console.log("\n👥 Creating Additional Employees...");

    // TextilePro employees
    const textileProEmployee1 = await prisma.user.create({
      data: {
        email: "production@textilepro.com",
        name: "Fatma Şahin",
        firstName: "Fatma",
        lastName: "Şahin",
        password: await bcrypt.hash("Employee123!", 10),
        role: "COMPANY_EMPLOYEE",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: false,
        companyId: manufacturerCompany1.id,
        department: "PRODUCTION",
        jobTitle: "Üretim Müdürü",
      },
    });

    const textileProEmployee2 = await prisma.user.create({
      data: {
        email: "quality@textilepro.com",
        name: "Ali Veli",
        firstName: "Ali",
        lastName: "Veli",
        password: await bcrypt.hash("Employee123!", 10),
        role: "COMPANY_EMPLOYEE",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: false,
        companyId: manufacturerCompany1.id,
        department: "QUALITY",
        jobTitle: "Kalite Kontrol Uzmanı",
      },
    });

    // Fashion Retail employees
    const fashionRetailEmployee1 = await prisma.user.create({
      data: {
        email: "buyer@fashionretail.com",
        name: "Ayşe Yılmaz",
        firstName: "Ayşe",
        lastName: "Yılmaz",
        password: await bcrypt.hash("Employee123!", 10),
        role: "COMPANY_EMPLOYEE",
        isActive: true,
        emailVerified: true,
        emailNotifications: true,
        pushNotifications: true,
        language: "tr",
        timezone: "Europe/Istanbul",
        isCompanyOwner: false,
        companyId: buyerCompany1.id,
        department: "PURCHASING",
        jobTitle: "Satın Alma Uzmanı",
      },
    });

    console.log("✅ Additional employees created");

    // ==========================================
    // 5. STANDARD CATEGORIES
    // ==========================================
    console.log("\n📂 Creating Standard Categories...");

    const standardCategories = [
      {
        name: "Kadın Giyim",
        description: "Kadın giyim kategorisi",
        code: "WOMEN",
        level: "MAIN",
        icon: "👗",
        isActive: true,
        createdBy: admin.id,
      },
      {
        name: "Erkek Giyim",
        description: "Erkek giyim kategorisi",
        code: "MEN",
        level: "MAIN",
        icon: "👔",
        isActive: true,
        createdBy: admin.id,
      },
      {
        name: "Çocuk Giyim",
        description: "Çocuk giyim kategorisi",
        code: "KIDS",
        level: "MAIN",
        icon: "👶",
        isActive: true,
        createdBy: admin.id,
      },
      {
        name: "Aksesuar",
        description: "Giyim aksesuarları",
        code: "ACCESSORIES",
        level: "MAIN",
        icon: "👜",
        isActive: true,
        createdBy: admin.id,
      },
    ];

    for (const categoryData of standardCategories) {
      const { createdBy, ...data } = categoryData;
      await prisma.standardCategory.create({
        data: {
          ...data,
          createdBy: {
            connect: { id: createdBy }
          }
        },
      });
    }

    console.log("✅ Standard categories created");

    // ==========================================
    // 6. COMPANY CATEGORIES
    // ==========================================
    console.log("\n🏷️ Creating Company Categories...");

    const companyCategories = [
      {
        name: "Denim Koleksiyonu",
        description: "Denim ürünleri koleksiyonu",
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
      {
        name: "Yazlık Koleksiyon",
        description: "Yaz ayları için hafif kumaşlar",
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
      {
        name: "Kışlık Koleksiyon",
        description: "Kış ayları için kalın kumaşlar",
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
    ];

    for (const categoryData of companyCategories) {
      const { createdBy, companyId, ...data } = categoryData;
      await prisma.category.create({
        data: {
          ...data,
          author: {
            connect: { id: createdBy }
          },
          company: {
            connect: { id: companyId }
          }
        },
      });
    }

    console.log("✅ Company categories created");

    // ==========================================
    // 7. LIBRARY ITEMS
    // ==========================================
    console.log("\n📚 Creating Library Items...");

    const libraryItems = [
      {
        name: "Premium Cotton",
        category: "FABRIC",
        scope: "COMPANY_CUSTOM",
        description: "Yüksek kaliteli pamuk kumaş",
        data: {
          material: "100% Cotton",
          weight: "180 GSM",
          width: "150cm",
          color: "White",
        },
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
      {
        name: "Denim Blue",
        category: "FABRIC",
        scope: "COMPANY_CUSTOM",
        description: "Klasik mavi denim kumaş",
        data: {
          material: "98% Cotton, 2% Elastane",
          weight: "320 GSM",
          width: "150cm",
          color: "Blue",
        },
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
      {
        name: "Polyester Blend",
        category: "FABRIC",
        scope: "COMPANY_CUSTOM",
        description: "Dayanıklı polyester karışım kumaş",
        data: {
          material: "65% Polyester, 35% Cotton",
          weight: "200 GSM",
          width: "150cm",
          color: "Black",
        },
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
      {
        name: "Silk Satin",
        category: "FABRIC",
        scope: "COMPANY_CUSTOM",
        description: "Lüks ipek saten kumaş",
        data: {
          material: "100% Silk",
          weight: "120 GSM",
          width: "140cm",
          color: "Ivory",
        },
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
      {
        name: "Wool Blend",
        category: "FABRIC",
        scope: "COMPANY_CUSTOM",
        description: "Sıcak yün karışım kumaş",
        data: {
          material: "70% Wool, 30% Acrylic",
          weight: "280 GSM",
          width: "150cm",
          color: "Gray",
        },
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
      },
    ];

    for (const itemData of libraryItems) {
      const { createdBy, companyId, ...data } = itemData;
      await prisma.libraryItem.create({
        data: {
          ...data,
          createdBy: {
            connect: { id: createdBy }
          },
          company: {
            connect: { id: companyId }
          }
        },
      });
    }

    console.log("✅ Library items created");

    // ==========================================
    // 8. COLLECTIONS
    // ==========================================
    console.log("\n👗 Creating Collections...");

    const collections = [
      {
        name: "Barrel Jeans - Jazzie",
        description: "The Jazzie barrel-fit jeans present a mid-waist, comfortable fit with a relaxed silhouette. The cross-hatch surface of authentic black/black denim.",
        modelCode: "MODEL-1761215687761",
        season: "Spring/Summer 2025",
        gender: "WOMEN",
        isActive: true,
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
        images: JSON.stringify([
          "https://example.com/jeans1.jpg",
          "https://example.com/jeans2.jpg",
        ]),
      },
      {
        name: "Classic T-Shirt",
        description: "Temel beyaz pamuk t-shirt. Günlük kullanım için ideal.",
        modelCode: "MODEL-TSHIRT-001",
        season: "All Season",
        gender: "UNISEX",
        isActive: true,
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
        images: JSON.stringify([
          "https://example.com/tshirt1.jpg",
        ]),
      },
      {
        name: "Elegant Blouse",
        description: "Şık ve zarif bluz. İş ve sosyal ortamlar için uygun.",
        modelCode: "MODEL-BLOUSE-001",
        season: "Spring/Summer 2025",
        gender: "WOMEN",
        isActive: true,
        companyId: manufacturerCompany1.id,
        createdBy: manufacturerOwner1.id,
        images: JSON.stringify([
          "https://example.com/blouse1.jpg",
        ]),
      },
    ];

    for (const collectionData of collections) {
      const { createdBy, companyId, ...data } = collectionData;
      await prisma.collection.create({
        data: {
          ...data,
          author: {
            connect: { id: createdBy }
          },
          company: {
            connect: { id: companyId }
          }
        },
      });
    }

    console.log("✅ Collections created");

    // ==========================================
    // 9. ORDERS
    // ==========================================
    console.log("\n📦 Creating Orders...");

    // Get the first collection ID
    const firstCollection = await prisma.collection.findFirst({
      where: { companyId: manufacturerCompany1.id }
    });

    const orders = [
      {
        orderNumber: "ORD-1761215790427-1",
        quantity: 120,
        unitPrice: 20,
        totalPrice: 2400,
        currency: "USD",
        deadline: new Date("2025-11-19T21:00:00.000Z"),
        status: "QUOTE_SENT",
        productionDays: 19,
        customerId: buyerOwner1.id,
        manufactureId: manufacturerOwner1.id,
        collectionId: firstCollection?.id || 1,
        companyId: manufacturerCompany1.id,
        customerQuotedPrice: 20,
        customerQuoteSentAt: new Date("2025-10-23T10:36:30.428Z"),
        negotiationStatus: "OPEN",
      },
      {
        orderNumber: "ORD-1761215790427-2",
        quantity: 50,
        unitPrice: 15,
        totalPrice: 750,
        currency: "USD",
        deadline: new Date("2025-12-15T21:00:00.000Z"),
        status: "PENDING",
        productionDays: 14,
        customerId: buyerOwner2.id,
        manufactureId: manufacturerOwner1.id,
        collectionId: firstCollection?.id || 1,
        companyId: manufacturerCompany1.id,
        negotiationStatus: "OPEN",
      },
    ];

    for (const orderData of orders) {
      await prisma.order.create({
        data: orderData,
      });
    }

    console.log("✅ Orders created");

    // ==========================================
    // 10. PRODUCTION TRACKING
    // ==========================================
    console.log("\n🏭 Creating Production Tracking...");

    // Get the first order ID
    const firstOrder = await prisma.order.findFirst({
      where: { companyId: manufacturerCompany1.id }
    });

    const productionTracking = await prisma.productionTracking.create({
      data: {
        orderId: firstOrder?.id || 1,
        currentStage: "PLANNING",
        overallStatus: "BLOCKED",
        progress: 0,
        estimatedStartDate: new Date("2025-10-23T11:23:24.939Z"),
        estimatedEndDate: new Date("2025-11-11T11:23:24.939Z"),
        notes: "Güncellenen üretim planı - Toplam 19 gün",
        customerApprovalStatus: "REJECTED",
        customerNote: "Plan uygun değil, revizyon gerekiyor.",
        revisionCount: 5,
        companyId: manufacturerCompany1.id,
      },
    });

    // Production Stage Updates
    const stageUpdates = [
      {
        productionId: productionTracking.id,
        stage: "FABRIC",
        status: "NOT_STARTED",
        estimatedDays: 7,
        notes: "Kumaş tedarik aşaması",
      },
      {
        productionId: productionTracking.id,
        stage: "CUTTING",
        status: "NOT_STARTED",
        estimatedDays: 2,
        notes: "Kesim işlemleri",
      },
      {
        productionId: productionTracking.id,
        stage: "SEWING",
        status: "NOT_STARTED",
        estimatedDays: 5,
        notes: "Dikim işlemleri",
      },
      {
        productionId: productionTracking.id,
        stage: "PRESSING",
        status: "NOT_STARTED",
        estimatedDays: 1,
        notes: "Ütü ve pres işlemleri",
      },
      {
        productionId: productionTracking.id,
        stage: "QUALITY",
        status: "NOT_STARTED",
        estimatedDays: 1,
        notes: "Kalite kontrol",
      },
      {
        productionId: productionTracking.id,
        stage: "PACKAGING",
        status: "NOT_STARTED",
        estimatedDays: 1,
        notes: "Paketleme",
      },
      {
        productionId: productionTracking.id,
        stage: "SHIPPING",
        status: "NOT_STARTED",
        estimatedDays: 1,
        notes: "Sevkiyat hazırlık",
      },
    ];

    for (const stageData of stageUpdates) {
      await prisma.productionStageUpdate.create({
        data: stageData,
      });
    }

    console.log("✅ Production tracking created");

    // ==========================================
    // 11. TASKS
    // ==========================================
    console.log("\n✅ Creating Tasks...");

    const tasks = [
      {
        title: "Kumaş Tedarik Planlaması",
        description: "Gerekli kumaş miktarının hesaplanması ve tedarikçi ile görüşme",
        type: "PRODUCTION_STAGE",
        priority: "HIGH",
        status: "TODO",
        dueDate: new Date("2025-10-25T09:00:00.000Z"),
        userId: textileProEmployee1.id,
        orderId: firstOrder?.id || 1,
      },
      {
        title: "Kalite Kontrol Prosedürleri",
        description: "Üretim sürecinde kalite kontrol noktalarının belirlenmesi",
        type: "QUALITY_CHECK",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        dueDate: new Date("2025-10-30T17:00:00.000Z"),
        userId: textileProEmployee2.id,
        orderId: firstOrder?.id || 1,
      },
    ];

    for (const taskData of tasks) {
      await prisma.task.create({
        data: taskData,
      });
    }

    console.log("✅ Tasks created");

    // ==========================================
    // 12. NOTIFICATIONS
    // ==========================================
    console.log("\n🔔 Creating Notifications...");

    const notifications = [
      {
        title: "Yeni Sipariş",
        message: "Fashion Retail Co. tarafından yeni bir sipariş oluşturuldu.",
        type: "ORDER_CREATED",
        isRead: false,
        userId: manufacturerOwner1.id,
        companyId: manufacturerCompany1.id,
        orderId: 1,
      },
      {
        title: "Üretim Planı Reddedildi",
        message: "Üretim planınız müşteri tarafından reddedildi. Lütfen revize edin.",
        type: "PRODUCTION_REJECTED",
        isRead: false,
        userId: manufacturerOwner1.id,
        companyId: manufacturerCompany1.id,
        orderId: 1,
      },
    ];

    for (const notificationData of notifications) {
      await prisma.notification.create({
        data: notificationData,
      });
    }

    console.log("✅ Notifications created");

    // ==========================================
    // 13. ORDER NEGOTIATIONS
    // ==========================================
    console.log("\n💬 Creating Order Negotiations...");

    const orderNegotiation = await prisma.orderNegotiation.create({
      data: {
        orderId: 1,
        customerId: buyerOwner1.id,
        manufacturerId: manufacturerOwner1.id,
        type: "PRICE_NEGOTIATION",
        status: "ACTIVE",
        customerOffer: 18,
        manufacturerCounterOffer: 20,
        finalAgreedPrice: null,
        customerNote: "Fiyat biraz yüksek, indirim yapabilir misiniz?",
        manufacturerNote: "Kalite ve hız için bu fiyat uygun.",
        companyId: manufacturerCompany1.id,
      },
    });

    console.log("✅ Order negotiations created");

    console.log("\n🔐 Login Credentials:");
    console.log("\n👤 Admin:");
    console.log("   Email: admin@protexflow.com");
    console.log("   Password: Admin123!");
    console.log("\n🏭 Manufacturer (TextilePro):");
    console.log("   Owner: owner@textilepro.com / Owner123!");
    console.log("   Production: production@textilepro.com / Employee123!");
    console.log("   Quality: quality@textilepro.com / Employee123!");
    console.log("\n🏭 Manufacturer (FashionWorks):");
    console.log("   Owner: owner@fashionworks.com / Owner456!");
    console.log("\n🏢 Buyer (Fashion Retail):");
    console.log("   Owner: owner@fashionretail.com / Buyer123!");
    console.log("   Buyer: buyer@fashionretail.com / Employee123!");
    console.log("\n🏢 Buyer (StyleHub):");
    console.log("   Owner: owner@stylehub.com / Buyer456!");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n🎉 Comprehensive seed completed successfully!");
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
